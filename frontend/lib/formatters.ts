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
      return "This asset uses post-quantum cryptographic algorithms and is protected against quantum computing threats.";
    case "PQC_READY":
      return "This asset is mostly quantum-safe with minor improvements recommended.";
    case "PARTIALLY_SAFE":
      return "This asset has some quantum-vulnerable components that should be migrated.";
    case "VULNERABLE":
      return "This asset uses cryptography that is vulnerable to quantum computing attacks. Urgent remediation required.";
    default:
      return "Risk level unknown.";
  }
}

export function priorityColor(priority: string): string {
  switch (priority) {
    case "CRITICAL":
      return "bg-red-500/10 text-red-500";
    case "HIGH":
      return "bg-amber-500/10 text-amber-500";
    case "MEDIUM":
      return "bg-blue-500/10 text-blue-500";
    case "LOW":
      return "bg-green-500/10 text-green-500";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
}
