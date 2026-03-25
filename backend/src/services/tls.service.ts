import tls from "tls";

import type { CertInfo, TlsScanResult } from "../types";
import { ASSET_TIMEOUT_MS } from "../utils/constants";

function toX509Name(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    // Common fields from Node's certificate object.
    const cn =
      (typeof obj.CN === "string" ? obj.CN : undefined) ||
      (typeof obj.commonName === "string" ? obj.commonName : undefined);
    const o = typeof obj.O === "string" ? obj.O : undefined;
    const c = typeof obj.C === "string" ? obj.C : undefined;
    if (cn || o || c) {
      return [cn && `CN=${cn}`, o && `O=${o}`, c && `C=${c}`].filter(Boolean).join(", ");
    }
    return JSON.stringify(obj);
  }
  return String(value);
}

function safeString(value: unknown): string {
  if (value === undefined || value === null) return "";
  return typeof value === "string" ? value : String(value);
}

function makeCertInfo(cert: Record<string, unknown>): CertInfo {
  // Node's certificate object shape varies by Node/OpenSSL versions.
  // We use best-effort extraction and default placeholders for missing fields.
  const subject = toX509Name(cert.subject);
  const issuer = toX509Name(cert.issuer);
  const serialNumber = safeString(cert.serialNumber);

  // Best-effort signature algorithm
  const sigAlgo =
    safeString((cert as any).sigalg) ||
    safeString((cert as any).signatureAlgorithm) ||
    "unknown";

  // Best-effort public key info
  const publicKeySize =
    typeof (cert as any).bits === "number"
      ? (cert as any).bits
      : typeof (cert as any).publicKeySize === "number"
        ? (cert as any).publicKeySize
        : 0;

  const publicKeyAlgorithm =
    safeString((cert as any).publicKeyAlgorithm) ||
    safeString((cert as any).pubkey?.algorithm) ||
    "unknown";

  const notBefore = safeString(cert.valid_from);
  const notAfter = safeString(cert.valid_to);

  return {
    subject,
    issuer,
    serialNumber,
    signatureAlgorithm: sigAlgo,
    publicKeyAlgorithm,
    publicKeySize,
    notBefore,
    notAfter,
    isCA: Boolean((cert as any).ca ?? false),
  };
}

export async function probeTls(hostname: string, port: number = 443): Promise<TlsScanResult> {
  return new Promise((resolve) => {
    const result: TlsScanResult = {
      hostname,
      port,
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
      jwksEndpoint: null,
      jwksAlgorithm: null,
      scanMethod: "DIRECT",
      error: null,
    };

    let settled = false;
    const settle = (r: TlsScanResult) => {
      if (settled) return;
      settled = true;
      resolve(r);
    };

    const socket = tls.connect(
      {
        host: hostname,
        port,
        servername: hostname,
        rejectUnauthorized: false, // inspect invalid certs too
        timeout: ASSET_TIMEOUT_MS,
      },
      () => {
        result.isAlive = true;

        const protocol = socket.getProtocol();
        if (protocol) {
          // Node returns "TLSv1.3" etc already.
          result.tlsVersion = protocol;
        }

        const cipher = socket.getCipher();
        if (cipher?.name) {
          result.preferredCipher = cipher.name;
          // We only get one negotiated cipher from Node. Still useful for scoring.
          result.cipherSuites = [cipher.name];
        }

        const cert =
          (socket.getPeerCertificate(true) as unknown as Record<string, unknown> | null) ?? null;
        if (cert && Object.keys(cert).length > 0) {
          const certInfo = makeCertInfo(cert);
          result.certChain = [certInfo];

          result.certExpiry = (cert.valid_to as string | undefined) ?? null;
          result.certIssuer = certInfo.issuer || null;
          result.certSubject = certInfo.subject || null;
          result.certSigAlgo = certInfo.signatureAlgorithm ? certInfo.signatureAlgorithm : null;
          result.certKeySize =
            certInfo.publicKeySize && Number.isFinite(certInfo.publicKeySize)
              ? certInfo.publicKeySize
              : null;
          result.certSerialNumber = certInfo.serialNumber || null;
        }

        socket.end();
      },
    );

    socket.on("error", (err) => {
      result.error = err instanceof Error ? err.message : String(err);
      settle(result);
    });

    socket.on("timeout", () => {
      result.error = "Connection timed out";
      socket.destroy();
      settle(result);
    });

    socket.on("close", () => {
      // If handshake callback didn't run, we still return whatever we have.
      settle(result);
    });

    // Safety timeout: avoid hanging forever if events don't fire.
    setTimeout(() => {
      if (!settled) {
        result.error = result.error ?? "Hard timeout exceeded";
        try {
          socket.destroy();
        } catch {
          // ignore
        }
        settle(result);
      }
    }, ASSET_TIMEOUT_MS + 3000);
  });
}

