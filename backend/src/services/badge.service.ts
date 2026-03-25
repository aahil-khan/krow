import crypto from "crypto";

import QRCode from "qrcode";
import { Badge, RiskScore } from "@prisma/client";

import prisma from "../utils/prisma";

const SIGNING_SECRET =
  process.env.BADGE_SIGNING_SECRET || "krow-default-signing-secret-change-in-production";

export interface BadgePayload {
  badgeId: string;
  assetHostname: string;
  scanId: string;
  score: number;
  classification: string;
  issuedAt: string;
  expiresAt: string;
}

function signPayload(payload: BadgePayload): string {
  const data = JSON.stringify(payload);
  return crypto.createHmac("sha256", SIGNING_SECRET).update(data).digest("hex");
}

export function verifySignature(payload: BadgePayload, signature: string): boolean {
  const expected = signPayload(payload);
  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(signature);

  // timingSafeEqual throws if buffer lengths differ.
  if (expectedBuf.length !== providedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, providedBuf);
}

export async function issueBadge(params: {
  assetId: string;
  scanId: string;
  hostname: string;
  score: number;
  classification: "FULLY_QUANTUM_SAFE" | "PQC_READY";
}): Promise<{ badge: Badge; qrCodeData: string } | null> {
  const { assetId, scanId, hostname, score, classification } = params;

  // Qualifying only.
  if (classification !== "FULLY_QUANTUM_SAFE" && classification !== "PQC_READY") return null;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days

  // Create first to get badge id for the payload.
  const badge = await prisma.badge.create({
    data: {
      assetId,
      scanId,
      badgeType: classification,
      score,
      signatureAlgo: "HMAC-SHA256",
      signature: "",
      payload: {} as any,
      qrCodeData: "",
      issuedAt: now,
      expiresAt,
      revokeReason: null,
      revokedAt: null,
    },
  });

  const payload: BadgePayload = {
    badgeId: badge.id,
    assetHostname: hostname,
    scanId,
    score,
    classification,
    issuedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  const signature = signPayload(payload);

  // Frontend verify page path is expected at /badges/verify?id=...
  const verifyBaseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const verifyUrl = `${verifyBaseUrl}/badges/verify?id=${badge.id}`;

  const qrCodeData = await QRCode.toDataURL(verifyUrl, {
    width: 300,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });

  const updated = await prisma.badge.update({
    where: { id: badge.id },
    data: {
      signature,
      payload: payload as any,
      qrCodeData,
    },
  });

  return { badge: updated, qrCodeData };
}

export async function verifyBadge(badgeId: string): Promise<
  | {
      valid: boolean;
      badge: {
        id: string;
        badgeType: string;
        score: number;
        hostname: string;
        issuedAt: string;
        expiresAt: string;
        signatureAlgo: string;
      };
      currentScore: number | null;
      expired: boolean;
      revoked: boolean;
      signatureValid: boolean;
    }
  | { valid: false; error: string }
> {
  const badge = await prisma.badge.findUnique({
    where: { id: badgeId },
    include: {
      asset: {
        include: { riskScore: true },
      },
    },
  });

  if (!badge) return { valid: false, error: "Badge not found" };

  const payload = badge.payload as unknown as BadgePayload;
  const signatureValid = verifySignature(payload, badge.signature);

  const now = new Date();
  const expired = now > badge.expiresAt;
  const revoked = badge.revokedAt !== null;

  return {
    valid: signatureValid && !expired && !revoked,
    badge: {
      id: badge.id,
      badgeType: badge.badgeType,
      score: badge.score,
      hostname: badge.asset.hostname,
      issuedAt: badge.issuedAt.toISOString(),
      expiresAt: badge.expiresAt.toISOString(),
      signatureAlgo: badge.signatureAlgo,
    },
    currentScore: (badge.asset.riskScore as RiskScore | null)?.totalScore ?? null,
    expired,
    revoked,
    signatureValid,
  };
}

