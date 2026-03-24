export type ScanStatus =
  | "PENDING"
  | "DISCOVERING"
  | "SCANNING"
  | "ANALYZING"
  | "GENERATING_REPORTS"
  | "COMPLETED"
  | "FAILED";

export type RiskClassification =
  | "FULLY_QUANTUM_SAFE"
  | "PQC_READY"
  | "PARTIALLY_SAFE"
  | "VULNERABLE";

export type AssetType = "SUBDOMAIN" | "API" | "VPN" | "MAIL";

export interface Scan {
  id: string;
  domain: string;
  status: ScanStatus;
  isBaseline: boolean;
  totalAssets: number;
  scannedAssets: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  assets?: Asset[];
}

export interface Asset {
  id: string;
  scanId: string;
  hostname: string;
  assetType: AssetType;
  port: number;
  isAlive: boolean;
  tlsVersion: string | null;
  cipherSuites: string[] | null;
  preferredCipher: string | null;
  keyExchange: string | null;
  certExpiry: string | null;
  certIssuer: string | null;
  certSubject: string | null;
  certSigAlgo: string | null;
  certKeySize: number | null;
  jwksAlgorithm: string | null;
  riskScore: RiskScore | null;
  badge: Badge | null;
}

export interface RiskScore {
  id: string;
  assetId: string;
  totalScore: number;
  classification: RiskClassification;
  tlsVersionScore: number;
  certSigAlgoScore: number;
  keyExchangeScore: number;
  jwksAlgoScore: number;
  cipherStrengthScore: number;
}

export interface Badge {
  id: string;
  assetId: string;
  badgeType: "FULLY_QUANTUM_SAFE" | "PQC_READY";
  score: number;
  signature: string;
  qrCodeData: string;
  issuedAt: string;
  expiresAt: string;
  revokedAt: string | null;
}

export interface DashboardSummary {
  totalAssets: number;
  averageScore: number;
  classificationBreakdown: Record<RiskClassification, number>;
  lastScanDate: string | null;
}

export interface HeatmapEntry {
  hostname: string;
  score: number;
  classification: RiskClassification;
}
