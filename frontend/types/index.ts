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
  averageScore?: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  assets?: Asset[];
}

export interface DriftItem {
  hostname: string;
  assetType: string;
  previousScore: number | null;
  currentScore: number | null;
  previousClassification: string | null;
  currentClassification: string | null;
  changeType: "regression" | "improvement" | "new" | "removed";
}

export interface DriftResult {
  baselineScanId: string;
  currentScanId: string;
  baselineDomain: string;
  regressions: DriftItem[];
  improvements: DriftItem[];
  newAssets: DriftItem[];
  removedAssets: DriftItem[];
  summary: {
    totalChanged: number;
    avgScoreChange: number;
    previousAvgScore: number;
    currentAvgScore: number;
  };
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
  lastScanDomain: string | null;
}

export interface HeatmapEntry {
  id: string;
  hostname: string;
  score: number;
  classification: RiskClassification;
  tlsVersion?: string | null;
  keyExchange?: string | null;
}
