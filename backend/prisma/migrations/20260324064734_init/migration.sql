-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('PENDING', 'DISCOVERING', 'SCANNING', 'ANALYZING', 'GENERATING_REPORTS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('SUBDOMAIN', 'API', 'VPN', 'MAIL');

-- CreateEnum
CREATE TYPE "ScanMethod" AS ENUM ('DIRECT', 'CRT_SH', 'CENSYS', 'SSL_LABS');

-- CreateEnum
CREATE TYPE "RiskClassification" AS ENUM ('FULLY_QUANTUM_SAFE', 'PQC_READY', 'PARTIALLY_SAFE', 'VULNERABLE');

-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('FULLY_QUANTUM_SAFE', 'PQC_READY');

-- CreateTable
CREATE TABLE "Scan" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "status" "ScanStatus" NOT NULL DEFAULT 'PENDING',
    "isBaseline" BOOLEAN NOT NULL DEFAULT false,
    "totalAssets" INTEGER NOT NULL DEFAULT 0,
    "scannedAssets" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "assetType" "AssetType" NOT NULL DEFAULT 'SUBDOMAIN',
    "port" INTEGER NOT NULL DEFAULT 443,
    "isAlive" BOOLEAN NOT NULL DEFAULT false,
    "firstSeenAt" TIMESTAMP(3),
    "tlsVersion" TEXT,
    "cipherSuites" JSONB,
    "preferredCipher" TEXT,
    "keyExchange" TEXT,
    "certChain" JSONB,
    "certExpiry" TIMESTAMP(3),
    "certIssuer" TEXT,
    "certSubject" TEXT,
    "certSigAlgo" TEXT,
    "certKeySize" INTEGER,
    "certSerialNumber" TEXT,
    "jwksAlgorithm" TEXT,
    "jwksEndpoint" TEXT,
    "scanMethod" "ScanMethod" NOT NULL DEFAULT 'DIRECT',
    "rawScanJson" JSONB,
    "scannedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskScore" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "classification" "RiskClassification" NOT NULL,
    "tlsVersionScore" DOUBLE PRECISION NOT NULL,
    "certSigAlgoScore" DOUBLE PRECISION NOT NULL,
    "keyExchangeScore" DOUBLE PRECISION NOT NULL,
    "jwksAlgoScore" DOUBLE PRECISION NOT NULL,
    "cipherStrengthScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CbomRecord" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "cbomJson" JSONB NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.6',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CbomRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "badgeType" "BadgeType" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "signatureAlgo" TEXT NOT NULL DEFAULT 'HMAC-SHA256',
    "signature" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "qrCodeData" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "revokeReason" TEXT,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiRecommendation" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'anthropic',
    "model" TEXT NOT NULL DEFAULT 'claude-sonnet-4-20250514',
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "isFallback" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "userId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Scan_domain_idx" ON "Scan"("domain");

-- CreateIndex
CREATE INDEX "Asset_scanId_idx" ON "Asset"("scanId");

-- CreateIndex
CREATE INDEX "Asset_hostname_idx" ON "Asset"("hostname");

-- CreateIndex
CREATE UNIQUE INDEX "RiskScore_assetId_key" ON "RiskScore"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "CbomRecord_scanId_key" ON "CbomRecord"("scanId");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_assetId_key" ON "Badge"("assetId");

-- CreateIndex
CREATE INDEX "Badge_scanId_idx" ON "Badge"("scanId");

-- CreateIndex
CREATE UNIQUE INDEX "AiRecommendation_assetId_key" ON "AiRecommendation"("assetId");

-- CreateIndex
CREATE INDEX "AuditLog_eventType_idx" ON "AuditLog"("eventType");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskScore" ADD CONSTRAINT "RiskScore_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CbomRecord" ADD CONSTRAINT "CbomRecord_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiRecommendation" ADD CONSTRAINT "AiRecommendation_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
