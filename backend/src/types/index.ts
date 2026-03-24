// ============================================
// Scan types
// ============================================

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
export type ScanMethod = "DIRECT" | "CRT_SH" | "CENSYS" | "SSL_LABS";
export type BadgeType = "FULLY_QUANTUM_SAFE" | "PQC_READY";

// ============================================
// Risk scoring
// ============================================

export interface RiskComponentScores {
  tlsVersionScore: number;      // 0-100, weight: 15%
  certSigAlgoScore: number;     // 0-100, weight: 10%
  keyExchangeScore: number;     // 0-100, weight: 40%
  jwksAlgoScore: number;        // 0-100, weight: 10%
  cipherStrengthScore: number;  // 0-100, weight: 10%
}

export interface RiskScoreResult {
  totalScore: number;           // 0-100 (normalized)
  classification: RiskClassification;
  components: RiskComponentScores;
}

// ============================================
// Certificate chain
// ============================================

export interface CertInfo {
  subject: string;
  issuer: string;
  serialNumber: string;
  signatureAlgorithm: string;
  publicKeyAlgorithm: string;
  publicKeySize: number;
  notBefore: string;
  notAfter: string;
  isCA: boolean;
}

// ============================================
// TLS scan result (per asset)
// ============================================

export interface TlsScanResult {
  hostname: string;
  port: number;
  isAlive: boolean;
  tlsVersion: string | null;
  cipherSuites: string[];
  preferredCipher: string | null;
  keyExchange: string | null;
  certChain: CertInfo[];
  certExpiry: string | null;
  certIssuer: string | null;
  certSubject: string | null;
  certSigAlgo: string | null;
  certKeySize: number | null;
  certSerialNumber: string | null;
  jwksAlgorithm: string | null;
  jwksEndpoint: string | null;
  scanMethod: ScanMethod;
  error: string | null;
}

// ============================================
// Badge payload (what gets signed)
// ============================================

export interface BadgePayload {
  badgeId: string;
  assetHostname: string;
  scanDomain: string;
  scanId: string;
  score: number;
  classification: RiskClassification;
  issuedAt: string;   // ISO 8601
  expiresAt: string;   // ISO 8601
  issuer: "Krow Quantum-Safe Scanner v1.0";
}

// ============================================
// AI recommendation
// ============================================

export interface MigrationRecommendation {
  assetHostname: string;
  currentState: {
    tlsVersion: string | null;
    keyExchange: string | null;
    certSigAlgo: string | null;
    cipherSuites: string[];
    jwksAlgorithm: string | null;
  };
  riskScore: number;
  classification: RiskClassification;
  recommendations: string;  // Full AI-generated text
  isFallback: boolean;
}

// ============================================
// CBOM types (CycloneDX 1.6)
// ============================================

export interface CbomAlgorithm {
  name: string;
  assetType: "algorithm";
  primitive: "signature" | "encryption" | "key-exchange" | "hash";
  mode: string | null;
  classicalSecurityLevel: number | null;
  oid: string | null;
}

export interface CbomKey {
  name: string;
  assetType: "key";
  id: string;
  state: "active" | "revoked" | "expired";
  size: number;
  creationDate: string | null;
}

export interface CbomProtocol {
  name: string;
  assetType: "protocol";
  version: string;
  cipherSuites: string[];
}

export interface CbomCertificate {
  name: string;
  assetType: "certificate";
  subjectName: string;
  issuerName: string;
  notValidBefore: string;
  notValidAfter: string;
  signatureAlgorithm: string;
  subjectPublicKeyAlgorithm: string;
  certificateFormat: "X.509";
}

// ============================================
// Dashboard API response types
// ============================================

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
  tlsVersion: string | null;
  keyExchange: string | null;
}

export interface HeatmapResponse {
  assets: HeatmapEntry[];
}

// ============================================
// Drift detection
// ============================================

export interface DriftResult {
  baselineScanId: string;
  currentScanId: string;
  regressions: DriftEntry[];
  improvements: DriftEntry[];
  newAssets: string[];
  removedAssets: string[];
}

export interface DriftEntry {
  hostname: string;
  field: string;
  baselineValue: string;
  currentValue: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
}
