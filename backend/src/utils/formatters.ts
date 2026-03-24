import type { RiskClassification } from "../types";
import { CLASSIFICATION_THRESHOLDS } from "./constants";

export function classifyRiskScore(score: number): RiskClassification {
  if (score <= CLASSIFICATION_THRESHOLDS.FULLY_QUANTUM_SAFE) return "FULLY_QUANTUM_SAFE";
  if (score <= CLASSIFICATION_THRESHOLDS.PQC_READY) return "PQC_READY";
  if (score <= CLASSIFICATION_THRESHOLDS.PARTIALLY_SAFE) return "PARTIALLY_SAFE";
  return "VULNERABLE";
}

export function formatScore(score: number): string {
  return `${Math.round(score * 10) / 10}/100`;
}

export function classificationLabel(c: RiskClassification): string {
  switch (c) {
    case "FULLY_QUANTUM_SAFE": return "Fully Quantum Safe";
    case "PQC_READY": return "PQC Ready";
    case "PARTIALLY_SAFE": return "Partially Safe";
    case "VULNERABLE": return "Vulnerable";
  }
}

export function classificationColor(c: RiskClassification): string {
  switch (c) {
    case "FULLY_QUANTUM_SAFE": return "#22c55e"; // green-500
    case "PQC_READY": return "#3b82f6";          // blue-500
    case "PARTIALLY_SAFE": return "#f59e0b";     // amber-500
    case "VULNERABLE": return "#ef4444";          // red-500
  }
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function extractCipherName(fullCipherSuite: string): string {
  // TLS_AES_256_GCM_SHA384 -> AES_256_GCM
  // TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 -> AES_128_GCM
  const match = fullCipherSuite.match(/(AES[_-]\d+[_-]\w+|CHACHA20[_-]POLY1305|3DES[_-]\w+|RC4|DES[_-]?\w*)/i);
  return match ? match[1].toUpperCase().replace(/-/g, "_") : fullCipherSuite;
}

export function extractKeyExchange(fullCipherSuite: string): string | null {
  if (fullCipherSuite.startsWith("TLS_") && !fullCipherSuite.includes("WITH")) {
    return null; // TLS 1.3 cipher suites don't include key exchange
  }
  if (fullCipherSuite.includes("ECDHE")) return "ECDHE";
  if (fullCipherSuite.includes("DHE")) return "DHE";
  if (fullCipherSuite.includes("RSA")) return "RSA";
  return null;
}
