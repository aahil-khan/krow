import pLimit from "p-limit";

import prisma from "../utils/prisma";
import { MAX_CONCURRENT_SCANS, PROBE_DELAY_MS } from "../utils/constants";
import { emitScanProgress } from "./scan-events";
import { discoverSubdomains } from "./discovery.service";
import { probeJwks } from "./jwks.service";
import { probeTls } from "./tls.service";
import { computeRiskScore } from "./pqc-engine.service";
import { extractKeyExchange } from "../utils/formatters";
import { issueBadge } from "./badge.service";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function executeScan(
  scanId: string,
  options?: { maxAssets?: number },
): Promise<void> {
  try {
    const scan = await prisma.scan.findUnique({ where: { id: scanId } });
    if (!scan) throw new Error(`Scan ${scanId} not found`);

    emitScanProgress({
      scanId,
      event: "discovery_start",
      data: { domain: scan.domain },
    });

    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "DISCOVERING", startedAt: new Date() },
    });

    // ---- Stage 1: Discovery
    let discovered = await discoverSubdomains(scan.domain);

    if (discovered.length === 1 && discovered[0]?.hostname === scan.domain.toLowerCase()) {
      await prisma.auditLog.create({
        data: {
          eventType: "DISCOVERY_FALLBACK_USED",
          details: {
            scanId,
            domain: scan.domain,
            provider: "crt.sh",
            fallback: "root-domain-only",
          },
        },
      });
    }

    // For demo seeding: cap number of assets so runtime stays reasonable.
    if (options?.maxAssets && discovered.length > options.maxAssets) {
      const root = scan.domain.toLowerCase();
      const rootAsset =
        discovered.find((d) => d.hostname === root) ?? { hostname: root, firstSeenAt: null };

      const withoutRoot = discovered.filter((d) => d.hostname !== root);
      discovered = [rootAsset, ...withoutRoot].slice(0, options.maxAssets);
    }

    emitScanProgress({
      scanId,
      event: "discovery_complete",
      data: { assetsFound: discovered.length },
    });

    // ---- Stage 2: Create asset records
    const assets = await Promise.all(
      discovered.map((d) =>
        prisma.asset.create({
          data: {
            scanId,
            hostname: d.hostname,
            assetType: "SUBDOMAIN",
            firstSeenAt: d.firstSeenAt ? new Date(d.firstSeenAt) : null,
          },
        }),
      ),
    );

    await prisma.scan.update({
      where: { id: scanId },
      data: { totalAssets: assets.length, status: "SCANNING", scannedAssets: 0 },
    });

    // ---- Stage 3: TLS probe + JWKS + persist TLS data
    const limit = pLimit(MAX_CONCURRENT_SCANS);
    let scannedCount = 0;

    await Promise.all(
      assets.map((asset) =>
        limit(async () => {
          await delay(PROBE_DELAY_MS);

          try {
            const tlsResult = await probeTls(asset.hostname);

            const certExpiry = tlsResult.certExpiry ? new Date(tlsResult.certExpiry) : null;

            await prisma.asset.update({
              where: { id: asset.id },
              data: {
                isAlive: tlsResult.isAlive,
                tlsVersion: tlsResult.tlsVersion,
                cipherSuites: tlsResult.cipherSuites,
                preferredCipher: tlsResult.preferredCipher,
                keyExchange: extractKeyExchange(tlsResult.preferredCipher || ""),
                certChain: tlsResult.certChain as any,
                certExpiry,
                certIssuer: tlsResult.certIssuer,
                certSubject: tlsResult.certSubject,
                certSigAlgo: tlsResult.certSigAlgo,
                certKeySize: tlsResult.certKeySize,
                certSerialNumber: tlsResult.certSerialNumber,
                scanMethod: tlsResult.scanMethod,
                scannedAt: new Date(),
                errorMessage: tlsResult.error,
              },
            });

            const jwksAlgo = await probeJwks(asset.hostname).catch(() => null);
            if (jwksAlgo) {
              await prisma.asset.update({
                where: { id: asset.id },
                data: { jwksAlgorithm: jwksAlgo },
              });
            }

            scannedCount++;
            await prisma.scan.update({
              where: { id: scanId },
              data: { scannedAssets: scannedCount },
            });

            emitScanProgress({
              scanId,
              event: "asset_scanned",
              data: {
                hostname: asset.hostname,
                isAlive: tlsResult.isAlive,
                scannedCount,
                totalAssets: assets.length,
              },
            });
          } catch (err) {
            const message = err instanceof Error ? err.message : "TLS/JWKS probe failed";

            scannedCount++;
            await prisma.scan.update({
              where: { id: scanId },
              data: { scannedAssets: scannedCount },
            });

            await prisma.asset.update({
              where: { id: asset.id },
              data: {
                isAlive: false,
                tlsVersion: null,
                cipherSuites: [],
                preferredCipher: null,
                keyExchange: null,
                certChain: [],
                certExpiry: null,
                certIssuer: null,
                certSubject: null,
                certSigAlgo: null,
                certKeySize: null,
                certSerialNumber: null,
                jwksAlgorithm: null,
                scanMethod: "DIRECT",
                scannedAt: new Date(),
                errorMessage: message,
              },
            });

            emitScanProgress({
              scanId,
              event: "asset_scanned",
              data: {
                hostname: asset.hostname,
                isAlive: false,
                scannedCount,
                totalAssets: assets.length,
                error: message,
              },
            });
          }
        }),
      ),
    );

    // ---- Stage 4: Risk scoring
    emitScanProgress({
      scanId,
      event: "scoring_complete",
      data: { message: "Starting risk scoring" },
    });

    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "ANALYZING" },
    });

    const assetsForScoring = await prisma.asset.findMany({ where: { scanId } });

    for (const asset of assetsForScoring) {
      const result = computeRiskScore({
        tlsVersion: asset.tlsVersion,
        certSigAlgo: asset.certSigAlgo,
        keyExchange: asset.keyExchange,
        jwksAlgo: asset.jwksAlgorithm,
        preferredCipher: asset.preferredCipher,
      });

      await prisma.riskScore.upsert({
        where: { assetId: asset.id },
        create: {
          assetId: asset.id,
          totalScore: result.totalScore,
          classification: result.classification,
          tlsVersionScore: result.components.tlsVersionScore,
          certSigAlgoScore: result.components.certSigAlgoScore,
          keyExchangeScore: result.components.keyExchangeScore,
          jwksAlgoScore: result.components.jwksAlgoScore,
          cipherStrengthScore: result.components.cipherStrengthScore,
        },
        update: {
          totalScore: result.totalScore,
          classification: result.classification,
          tlsVersionScore: result.components.tlsVersionScore,
          certSigAlgoScore: result.components.certSigAlgoScore,
          keyExchangeScore: result.components.keyExchangeScore,
          jwksAlgoScore: result.components.jwksAlgoScore,
          cipherStrengthScore: result.components.cipherStrengthScore,
        },
      });

      // Issue signed HMAC-SHA256 badges for qualifying quantum safety scores.
      // This is best-effort: badge failures should not fail the whole scan.
      if (
        result.totalScore <= 40 &&
        (result.classification === "FULLY_QUANTUM_SAFE" || result.classification === "PQC_READY")
      ) {
        try {
          await issueBadge({
            assetId: asset.id,
            scanId,
            hostname: asset.hostname,
            score: result.totalScore,
            classification: result.classification as "FULLY_QUANTUM_SAFE" | "PQC_READY",
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Badge issuance failed";
          await prisma.auditLog.create({
            data: {
              eventType: "BADGE_ISSUANCE_FAILED",
              details: { scanId, assetId: asset.id, message },
            },
          });
        }
      }
    }

    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "COMPLETED", scannedAssets: assets.length, completedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        eventType: "SCAN_COMPLETED",
        details: {
          scanId,
          domain: scan.domain,
          totalAssets: assets.length,
          scannedAssets: scannedCount,
        },
      },
    });

    emitScanProgress({
      scanId,
      event: "scan_complete",
      data: { totalAssets: assets.length, scannedAssets: scannedCount },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown scan execution error";
    console.error(`executeScan failed for ${scanId}:`, error);

    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "FAILED", completedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        eventType: "SCAN_FAILED",
        details: { scanId, message },
      },
    });

    emitScanProgress({
      scanId,
      event: "scan_failed",
      data: { message },
    });
  }
}
