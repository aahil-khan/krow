import prisma from "../utils/prisma";
import { discoverSubdomains } from "./discovery.service";

export async function executeScan(scanId: string): Promise<void> {
  try {
    const scan = await prisma.scan.findUnique({ where: { id: scanId } });
    if (!scan) {
      throw new Error(`Scan ${scanId} not found`);
    }

    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: "DISCOVERING",
        startedAt: new Date(),
      },
    });

    const discovered = await discoverSubdomains(scan.domain);
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
      data: {
        totalAssets: assets.length,
        status: "SCANNING",
      },
    });

    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: "COMPLETED",
        scannedAssets: assets.length,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown scan execution error";
    console.error(`executeScan failed for ${scanId}:`, error);

    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: "FAILED",
        completedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        eventType: "SCAN_FAILED",
        details: {
          scanId,
          message,
        },
      },
    });
  }
}
