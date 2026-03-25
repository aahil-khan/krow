import axios from "axios";

import { Prisma, RiskClassification } from "@prisma/client";
import prisma from "../utils/prisma";

type MigrationRecommendationPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface MigrationRecommendation {
  summary: string;
  currentState: {
    tlsVersion: string | null;
    keyExchange: string | null;
    certSignature: string | null;
    cipherSuites: string[];
  };
  recommendations: {
    priority: MigrationRecommendationPriority;
    component: string;
    currentValue: string;
    targetValue: string;
    action: string;
    rationale: string;
  }[];
  migrationTimeline: string;
  complianceNotes: string;
  isFallback: boolean;
}

function buildPrompt(asset: {
  hostname: string;
  port: number;
  tlsVersion: string | null;
  keyExchange: string | null;
  certSigAlgo: string | null;
  cipherSuites: Prisma.JsonValue;
  jwksAlgorithm: string | null;
  certKeySize: number | null;
}, riskScore: { totalScore: number; classification: RiskClassification } | null): string {
  return `You are a post-quantum cryptography migration expert. Analyze this asset and provide specific migration recommendations.

Asset: ${asset.hostname}:${asset.port}
TLS Version: ${asset.tlsVersion || "Unknown"}
Key Exchange: ${asset.keyExchange || "Unknown"}
Cipher Suites: ${(asset.cipherSuites as string[])?.join(", ") || "None detected"}
Certificate Signature: ${asset.certSigAlgo || "Unknown"}
Certificate Key Size: ${asset.certKeySize || "Unknown"}
JWKS Algorithm: ${asset.jwksAlgorithm || "Not detected"}
Risk Score: ${riskScore?.totalScore ?? "N/A"}/100
Classification: ${riskScore?.classification ?? "Unknown"}

Provide a JSON response with:
1. "summary": One-paragraph overview of the asset's quantum readiness
2. "recommendations": Array of specific migration steps, each with priority (CRITICAL/HIGH/MEDIUM/LOW), component, currentValue, targetValue, action, and rationale
3. "migrationTimeline": Estimated timeline for full PQC migration
4. "complianceNotes": Relevant NIST FIPS 203/204/205 and CERT-In compliance notes

Keep recommendations actionable and specific to banking infrastructure.`;
}

function generateRuleBasedRecommendation(asset: {
  tlsVersion: string | null;
  keyExchange: string | null;
  certSigAlgo: string | null;
  cipherSuites: Prisma.JsonValue;
  jwksAlgorithm: string | null;
  hostname: string;
  port: number;
}, riskScore: { totalScore: number; classification: RiskClassification } | null): MigrationRecommendation {
  const recommendations: MigrationRecommendation["recommendations"] = [];
  const cipherSuites = (asset.cipherSuites as string[]) || [];

  if (asset.tlsVersion && asset.tlsVersion !== "TLSv1.3") {
    recommendations.push({
      priority: asset.tlsVersion.includes("1.1") || asset.tlsVersion.includes("1.0") ? "CRITICAL" : "HIGH",
      component: "TLS Version",
      currentValue: asset.tlsVersion,
      targetValue: "TLS 1.3",
      action: "Upgrade TLS configuration to support TLS 1.3 with post-quantum key exchange",
      rationale: "TLS 1.3 improves handshake security/performance and is required for hybrid PQ/classical exchanges.",
    });
  }

  const kex = asset.keyExchange || "";
  const hasKyber = kex.includes("KYBER") || kex.includes("ML-KEM");
  if (!hasKyber) {
    const isHybrid = kex.includes("X25519Kyber") || kex.includes("X25519MLKEM");
    if (!isHybrid) {
      recommendations.push({
        priority: "CRITICAL",
        component: "Key Exchange",
        currentValue: kex || "Unknown",
        targetValue: "X25519Kyber768 (hybrid) or ML-KEM-768",
        action: "Configure servers to support hybrid key exchange (X25519Kyber768Draft00) with classical fallback.",
        rationale: "Classical key exchange is exposed to harvest-now-decrypt-later; FIPS 203 guides ML-KEM adoption.",
      });
    }
  }

  const certSig = asset.certSigAlgo || "";
  if (!certSig.includes("ML-DSA") && !certSig.includes("SLH-DSA")) {
    recommendations.push({
      priority: certSig.toLowerCase().includes("sha1") ? "CRITICAL" : "MEDIUM",
      component: "Certificate Signature",
      currentValue: certSig || "Unknown",
      targetValue: "ML-DSA-65 (NIST FIPS 204)",
      action: "Plan migration to ML-DSA signed certificates; use ECDSA-P384 as interim where needed.",
      rationale: "RSA/ECDSA signatures are vulnerable to quantum factoring; FIPS 204 specifies ML-DSA for digital signatures.",
    });
  }

  const hasWeakCipher = cipherSuites.some(
    (c) =>
      c.includes("CBC") ||
      c.includes("3DES") ||
      c.includes("RC4") ||
      c.includes("DES") ||
      c.includes("SHA1"),
  );
  if (hasWeakCipher) {
    recommendations.push({
      priority: "HIGH",
      component: "Cipher Suites",
      currentValue: cipherSuites.filter((c) => c.includes("CBC") || c.includes("3DES")).join(", "),
      targetValue: "AES-256-GCM, ChaCha20-Poly1305",
      action: "Disable CBC-mode and legacy ciphers; prefer AEAD suites such as AES-256-GCM.",
      rationale: "Legacy modes can be more exposed to cryptanalytic and implementation attacks; AEAD improves security properties.",
    });
  }

  const jwks = asset.jwksAlgorithm || "";
  if (jwks && (jwks.includes("RS256") || jwks.includes("RS384") || jwks.includes("RS512"))) {
    recommendations.push({
      priority: "HIGH",
      component: "JWKS Signing",
      currentValue: jwks,
      targetValue: "ML-DSA-65 or EdDSA (interim)",
      action: "Migrate JWT signing from RSA to EdDSA now; plan ML-DSA when signing/verification is supported.",
      rationale: "RSA-based JWT signatures are exposed to quantum forgery; EdDSA is a safer interim step.",
    });
  }

  return {
    summary: `${asset.hostname} has a quantum risk score of ${riskScore?.totalScore ?? "N/A"}/100 (${
      riskScore?.classification ?? "Unknown"
    }). ${recommendations.length} migration actions identified.`,
    currentState: {
      tlsVersion: asset.tlsVersion,
      keyExchange: asset.keyExchange,
      certSignature: asset.certSigAlgo,
      cipherSuites,
    },
    recommendations,
    migrationTimeline:
      recommendations.some((r) => r.priority === "CRITICAL")
        ? "Immediate action required — begin migration within 30 days"
        : "Standard timeline — plan migration within 6–12 months",
    complianceNotes:
      "Refer to NIST FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), and FIPS 205 (SLH-DSA) for PQC transition guidelines. CERT-In advisory mandates cryptographic inventory (CBOM).",
    isFallback: true,
  };
}

async function callAnthropic(input: {
  prompt: string;
}): Promise<MigrationRecommendation> {
  const response = await axios.post(
    "https://api.anthropic.com/v1/messages",
    {
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: input.prompt }],
    },
    {
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      timeout: 30000,
    },
  );

  const text = response.data?.content?.[0]?.text || "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in Anthropic response");

  const parsed = JSON.parse(jsonMatch[0]) as MigrationRecommendation;

  // Ensure isFallback false for successful provider calls.
  return {
    ...parsed,
    isFallback: false,
  };
}

export async function generateRecommendation(assetId: string): Promise<MigrationRecommendation> {
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: { riskScore: true },
  });

  if (!asset) throw new Error("Asset not found");

  const riskScore = asset.riskScore
    ? { totalScore: asset.riskScore.totalScore, classification: asset.riskScore.classification }
    : null;

  const prompt = buildPrompt(
    {
      hostname: asset.hostname,
      port: asset.port,
      tlsVersion: asset.tlsVersion ?? null,
      keyExchange: asset.keyExchange ?? null,
      certSigAlgo: asset.certSigAlgo ?? null,
      cipherSuites: asset.cipherSuites ?? null,
      jwksAlgorithm: asset.jwksAlgorithm ?? null,
      certKeySize: asset.certKeySize ?? null,
    },
    riskScore,
  );

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    try {
      const result = await callAnthropic({ prompt });

      await prisma.aiRecommendation.upsert({
        where: { assetId },
        update: {
          provider: "anthropic",
          model: "claude-sonnet-4-20250514",
          prompt,
          response: JSON.stringify(result),
          isFallback: false,
        },
        create: {
          assetId,
          provider: "anthropic",
          model: "claude-sonnet-4-20250514",
          prompt,
          response: JSON.stringify(result),
          isFallback: false,
        },
      });

      return result;
    } catch (err) {
      console.error("Anthropic API failed, falling back to rules:", err);
    }
  }

  const fallback = generateRuleBasedRecommendation(
    {
      tlsVersion: asset.tlsVersion ?? null,
      keyExchange: asset.keyExchange ?? null,
      certSigAlgo: asset.certSigAlgo ?? null,
      cipherSuites: asset.cipherSuites ?? null,
      jwksAlgorithm: asset.jwksAlgorithm ?? null,
      hostname: asset.hostname,
      port: asset.port,
    },
    riskScore,
  );

  await prisma.aiRecommendation.upsert({
    where: { assetId },
    update: {
      provider: "rule-based",
      model: "v1",
      prompt: "",
      response: JSON.stringify(fallback),
      isFallback: true,
    },
    create: {
      assetId,
      provider: "rule-based",
      model: "v1",
      prompt: "",
      response: JSON.stringify(fallback),
      isFallback: true,
    },
  });

  return fallback;
}

