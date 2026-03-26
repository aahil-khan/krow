import type { RiskClassification, ScanStatus } from "@/types";

export function formatScore(score: number): string {
  return `${Math.round(score * 10) / 10}`;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
    case "FULLY_QUANTUM_SAFE": return "text-green-500";
    case "PQC_READY": return "text-blue-500";
    case "PARTIALLY_SAFE": return "text-amber-500";
    case "VULNERABLE": return "text-red-500";
  }
}

export function classificationBgColor(c: RiskClassification): string {
  switch (c) {
    case "FULLY_QUANTUM_SAFE": return "bg-green-500";
    case "PQC_READY": return "bg-blue-500";
    case "PARTIALLY_SAFE": return "bg-amber-500";
    case "VULNERABLE": return "bg-red-500";
  }
}

export function scanStatusLabel(s: ScanStatus): string {
  switch (s) {
    case "PENDING": return "Pending";
    case "DISCOVERING": return "Discovering Assets";
    case "SCANNING": return "Scanning TLS";
    case "ANALYZING": return "Analyzing";
    case "GENERATING_REPORTS": return "Generating Reports";
    case "COMPLETED": return "Completed";
    case "FAILED": return "Failed";
  }
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function truncateHostname(hostname: string, maxLength: number = 30): string {
  if (hostname.length <= maxLength) return hostname;
  return hostname.slice(0, maxLength - 3) + "...";
}

export function riskLevelDescription(classification: RiskClassification): string {
  switch (classification) {
    case "FULLY_QUANTUM_SAFE":
      return "This asset uses quantum-safe cryptographic algorithms. No immediate action needed.";
    case "PQC_READY":
      return "This asset is well-prepared for the post-quantum transition. Minor improvements recommended.";
    case "PARTIALLY_SAFE":
      return "This asset uses some vulnerable cryptographic primitives. Migration guidance available.";
    case "VULNERABLE":
      return "This asset is vulnerable to quantum attacks. Urgent remediation recommended — HNDL risk active.";
    default:
      return "Risk level unknown.";
  }
}
