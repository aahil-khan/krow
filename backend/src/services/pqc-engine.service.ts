import {
  CIPHER_STRENGTH_SCORES,
  CLASSIFICATION_THRESHOLDS,
  JWKS_ALGO_SCORES,
  KEY_EXCHANGE_SCORES,
  RISK_WEIGHTS,
  SIGNATURE_ALGO_SCORES,
  TLS_VERSION_SCORES,
  UNKNOWN_ALGORITHM_SCORE,
  WEIGHT_SUM,
} from "../utils/constants";
import type {
  RiskComponentScores,
  RiskClassification,
  RiskScoreResult,
} from "../types";

function normalizeAlgo(algo: string): string {
  return algo.toUpperCase().trim().replace(/-/g, "_");
}

function lookupScore(algo: string | null, table: Record<string, number>): number {
  if (!algo) return UNKNOWN_ALGORITHM_SCORE;

  const normalized = normalizeAlgo(algo);

  // Exact match first
  for (const [key, score] of Object.entries(table)) {
    if (normalizeAlgo(key) === normalized) return score;
  }

  // Substring match (robust to prefixes/suffixes)
  for (const [key, score] of Object.entries(table)) {
    const keyNorm = normalizeAlgo(key);
    if (normalized.includes(keyNorm) || keyNorm.includes(normalized)) return score;
  }

  return UNKNOWN_ALGORITHM_SCORE;
}

export function computeRiskScore(params: {
  tlsVersion: string | null;
  certSigAlgo: string | null;
  keyExchange: string | null;
  jwksAlgo: string | null;
  preferredCipher: string | null;
}): RiskScoreResult {
  const components: RiskComponentScores = {
    tlsVersionScore: lookupScore(params.tlsVersion, TLS_VERSION_SCORES),
    certSigAlgoScore: lookupScore(params.certSigAlgo, SIGNATURE_ALGO_SCORES),
    keyExchangeScore: lookupScore(params.keyExchange, KEY_EXCHANGE_SCORES) * 4, // normalize to 0-100
    jwksAlgoScore: lookupScore(params.jwksAlgo, JWKS_ALGO_SCORES),
    cipherStrengthScore: lookupScore(params.preferredCipher, CIPHER_STRENGTH_SCORES),
  };

  // Cap each component at 100
  components.keyExchangeScore = Math.min(components.keyExchangeScore, 100);

  const weightedSum =
    components.tlsVersionScore * RISK_WEIGHTS.tlsVersion +
    components.certSigAlgoScore * RISK_WEIGHTS.certSigAlgo +
    components.keyExchangeScore * RISK_WEIGHTS.keyExchange +
    components.jwksAlgoScore * RISK_WEIGHTS.jwksAlgo +
    components.cipherStrengthScore * RISK_WEIGHTS.cipherStrength;

  // Normalize to 0-100 (weights sum to WEIGHT_SUM, currently 0.85)
  const totalScore = Math.min(Math.round((weightedSum / WEIGHT_SUM) * 10) / 10, 100);

  let classification: RiskClassification;
  if (totalScore <= CLASSIFICATION_THRESHOLDS.FULLY_QUANTUM_SAFE) classification = "FULLY_QUANTUM_SAFE";
  else if (totalScore <= CLASSIFICATION_THRESHOLDS.PQC_READY) classification = "PQC_READY";
  else if (totalScore <= CLASSIFICATION_THRESHOLDS.PARTIALLY_SAFE) classification = "PARTIALLY_SAFE";
  else classification = "VULNERABLE";

  return {
    totalScore,
    classification,
    components,
  };
}

