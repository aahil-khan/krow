// ============================================
// NIST PQC Algorithm Classifications
// ============================================

export const KEY_EXCHANGE_SCORES: Record<string, number> = {
  // Quantum-safe
  "ML-KEM-512": 0,
  "ML-KEM-768": 0,
  "ML-KEM-1024": 0,
  "KYBER512": 0,
  "KYBER768": 0,
  "KYBER1024": 0,

  // Hybrid (quantum-safe + classical)
  "X25519Kyber768": 5,
  "X25519MLKEM768": 5,

  // Classical (quantum-vulnerable)
  "ECDHE-P384": 15,
  "ECDHE-P256": 20,
  "X25519": 20,
  "DHE-2048": 22,
  "DHE-1024": 25,
  "RSA": 25,
};

export const SIGNATURE_ALGO_SCORES: Record<string, number> = {
  // Quantum-safe
  "ML-DSA-44": 0,
  "ML-DSA-65": 0,
  "ML-DSA-87": 0,
  "SLH-DSA-SHA2-128s": 0,
  "SLH-DSA-SHA2-128f": 0,
  "SLH-DSA-SHAKE-128s": 0,

  // Classical (quantum-vulnerable)
  "SHA256withECDSA": 30,
  "SHA384withECDSA": 25,
  "ECDSA-P256": 30,
  "ECDSA-P384": 25,
  "SHA256withRSA": 60,
  "SHA384withRSA": 55,
  "SHA512withRSA": 50,
  "SHA1withRSA": 100,
  "MD5withRSA": 100,
};

export const TLS_VERSION_SCORES: Record<string, number> = {
  "TLSv1.3": 0,
  "TLSv1.2": 50,
  "TLSv1.1": 100,
  "TLSv1.0": 100,
  "SSLv3": 100,
  "SSLv2": 100,
};

export const CIPHER_STRENGTH_SCORES: Record<string, number> = {
  "AES-256-GCM": 0,
  "AES_256_GCM": 0,
  "AES-128-GCM": 30,
  "AES_128_GCM": 30,
  "CHACHA20-POLY1305": 30,
  "CHACHA20_POLY1305": 30,
  "AES-256-CBC": 50,
  "AES_256_CBC": 50,
  "AES-128-CBC": 70,
  "AES_128_CBC": 70,
  "3DES-EDE-CBC": 100,
  "3DES": 100,
  "RC4": 100,
  "DES": 100,
  "DES-CBC": 100,
};

export const JWKS_ALGO_SCORES: Record<string, number> = {
  "ML-DSA-65": 0,
  "ML-DSA-87": 0,
  "EdDSA": 30,
  "Ed25519": 30,
  "ES256": 70,
  "ES384": 60,
  "ES512": 50,
  "RS256": 100,
  "RS384": 90,
  "RS512": 80,
  "PS256": 95,
};

// Default score for unknown algorithms (assumed vulnerable)
export const UNKNOWN_ALGORITHM_SCORE = 75;

// Risk scoring weights
export const RISK_WEIGHTS = {
  tlsVersion: 0.15,
  certSigAlgo: 0.10,
  keyExchange: 0.40,
  jwksAlgo: 0.10,
  cipherStrength: 0.10,
} as const;

// Normalization factor (weights sum to 0.85)
export const WEIGHT_SUM = Object.values(RISK_WEIGHTS).reduce((a, b) => a + b, 0);

// Classification thresholds
export const CLASSIFICATION_THRESHOLDS = {
  FULLY_QUANTUM_SAFE: 15,
  PQC_READY: 40,
  PARTIALLY_SAFE: 70,
  // Everything above 70 is VULNERABLE
} as const;

// Badge configuration
export const BADGE_EXPIRY_DAYS = 90;
export const BADGE_QUALIFYING_MAX_SCORE = 40; // Score must be <= 40 to get a badge

// Scan configuration
export const MAX_CONCURRENT_SCANS = 10;
export const PROBE_DELAY_MS = 300;
export const ASSET_TIMEOUT_MS = 8000;
export const MAX_DOMAINS_PER_BATCH = 200;
