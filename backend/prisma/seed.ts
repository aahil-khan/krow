/// <reference types="node" />

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.aiRecommendation.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.riskScore.deleteMany();
  await prisma.cbomRecord.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.scan.deleteMany();

  // Create a completed scan
  const scan = await prisma.scan.create({
    data: {
      domain: "example-bank.co.in",
      status: "COMPLETED",
      isBaseline: true,
      totalAssets: 8,
      scannedAssets: 8,
      startedAt: new Date("2026-03-24T10:00:00Z"),
      completedAt: new Date("2026-03-24T10:05:00Z"),
    },
  });

  console.log("Created scan:", scan.id);

  // Asset definitions with realistic TLS data
  const assetDefs = [
    {
      hostname: "www.example-bank.co.in",
      tlsVersion: "TLSv1.3",
      cipherSuites: ["TLS_AES_256_GCM_SHA384", "TLS_AES_128_GCM_SHA256", "TLS_CHACHA20_POLY1305_SHA256"],
      preferredCipher: "TLS_AES_256_GCM_SHA384",
      keyExchange: "X25519",
      certSigAlgo: "SHA256withRSA",
      certKeySize: 2048,
      certIssuer: "CN=DigiCert Global G2 TLS RSA SHA256 2020 CA1, O=DigiCert Inc, C=US",
      certSubject: "CN=www.example-bank.co.in",
      jwksAlgorithm: null,
      // Risk: TLS 1.3 good, but RSA cert sig and X25519 key exchange are quantum-vulnerable
      riskScores: { tls: 0, cert: 60, kex: 80, jwks: 70, cipher: 0 },
      classification: "PARTIALLY_SAFE" as const,
    },
    {
      hostname: "netbanking.example-bank.co.in",
      tlsVersion: "TLSv1.2",
      cipherSuites: ["TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256", "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384"],
      preferredCipher: "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
      keyExchange: "ECDHE-P256",
      certSigAlgo: "SHA256withRSA",
      certKeySize: 2048,
      certIssuer: "CN=Entrust Certification Authority - L1K, O=Entrust, C=US",
      certSubject: "CN=netbanking.example-bank.co.in",
      jwksAlgorithm: "RS256",
      riskScores: { tls: 50, cert: 60, kex: 80, jwks: 100, cipher: 30 },
      classification: "VULNERABLE" as const,
    },
    {
      hostname: "api.example-bank.co.in",
      tlsVersion: "TLSv1.3",
      cipherSuites: ["TLS_AES_256_GCM_SHA384", "TLS_AES_128_GCM_SHA256"],
      preferredCipher: "TLS_AES_256_GCM_SHA384",
      keyExchange: "X25519",
      certSigAlgo: "SHA256withECDSA",
      certKeySize: 256,
      certIssuer: "CN=Amazon RSA 2048 M02, O=Amazon, C=US",
      certSubject: "CN=api.example-bank.co.in",
      jwksAlgorithm: "ES256",
      riskScores: { tls: 0, cert: 30, kex: 80, jwks: 70, cipher: 0 },
      classification: "PARTIALLY_SAFE" as const,
    },
    {
      hostname: "mail.example-bank.co.in",
      tlsVersion: "TLSv1.2",
      cipherSuites: ["TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256", "TLS_RSA_WITH_AES_128_GCM_SHA256"],
      preferredCipher: "TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256",
      keyExchange: "ECDHE-P256",
      certSigAlgo: "SHA256withRSA",
      certKeySize: 2048,
      certIssuer: "CN=DigiCert SHA2 Extended Validation Server CA, O=DigiCert Inc, C=US",
      certSubject: "CN=mail.example-bank.co.in",
      jwksAlgorithm: null,
      riskScores: { tls: 50, cert: 60, kex: 80, jwks: 70, cipher: 70 },
      classification: "VULNERABLE" as const,
    },
    {
      hostname: "vpn.example-bank.co.in",
      tlsVersion: "TLSv1.2",
      cipherSuites: ["TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384"],
      preferredCipher: "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384",
      keyExchange: "ECDHE-P384",
      certSigAlgo: "SHA256withRSA",
      certKeySize: 4096,
      certIssuer: "CN=GlobalSign RSA OV SSL CA 2018, O=GlobalSign, C=BE",
      certSubject: "CN=vpn.example-bank.co.in",
      jwksAlgorithm: null,
      riskScores: { tls: 50, cert: 60, kex: 60, jwks: 70, cipher: 0 },
      classification: "PARTIALLY_SAFE" as const,
    },
    {
      hostname: "cdn.example-bank.co.in",
      tlsVersion: "TLSv1.3",
      cipherSuites: ["TLS_AES_128_GCM_SHA256", "TLS_AES_256_GCM_SHA384", "TLS_CHACHA20_POLY1305_SHA256"],
      preferredCipher: "TLS_AES_128_GCM_SHA256",
      keyExchange: "X25519",
      certSigAlgo: "SHA256withECDSA",
      certKeySize: 256,
      certIssuer: "CN=Cloudflare Inc ECC CA-3, O=Cloudflare Inc, C=US",
      certSubject: "CN=cdn.example-bank.co.in",
      jwksAlgorithm: null,
      riskScores: { tls: 0, cert: 30, kex: 80, jwks: 70, cipher: 30 },
      classification: "PARTIALLY_SAFE" as const,
    },
    {
      hostname: "developer.example-bank.co.in",
      tlsVersion: "TLSv1.3",
      cipherSuites: ["TLS_AES_256_GCM_SHA384"],
      preferredCipher: "TLS_AES_256_GCM_SHA384",
      keyExchange: "X25519",
      certSigAlgo: "SHA256withECDSA",
      certKeySize: 256,
      certIssuer: "CN=Let's Encrypt Authority X3, O=Let's Encrypt, C=US",
      certSubject: "CN=developer.example-bank.co.in",
      jwksAlgorithm: "ES256",
      riskScores: { tls: 0, cert: 30, kex: 80, jwks: 70, cipher: 0 },
      classification: "PARTIALLY_SAFE" as const,
    },
    {
      hostname: "legacy.example-bank.co.in",
      tlsVersion: "TLSv1.1",
      cipherSuites: ["TLS_RSA_WITH_AES_128_CBC_SHA", "TLS_RSA_WITH_3DES_EDE_CBC_SHA"],
      preferredCipher: "TLS_RSA_WITH_AES_128_CBC_SHA",
      keyExchange: "RSA",
      certSigAlgo: "SHA1withRSA",
      certKeySize: 1024,
      certIssuer: "CN=VeriSign Class 3 Secure Server CA - G3, O=VeriSign Inc, C=US",
      certSubject: "CN=legacy.example-bank.co.in",
      jwksAlgorithm: null,
      riskScores: { tls: 100, cert: 100, kex: 100, jwks: 70, cipher: 100 },
      classification: "VULNERABLE" as const,
    },
  ];

  for (const def of assetDefs) {
    const asset = await prisma.asset.create({
      data: {
        scanId: scan.id,
        hostname: def.hostname,
        assetType: def.hostname.includes("vpn") ? "VPN" : def.hostname.includes("api") ? "API" : def.hostname.includes("mail") ? "MAIL" : "SUBDOMAIN",
        port: 443,
        tlsVersion: def.tlsVersion,
        cipherSuites: def.cipherSuites,
        preferredCipher: def.preferredCipher,
        keyExchange: def.keyExchange,
        certSigAlgo: def.certSigAlgo,
        certKeySize: def.certKeySize,
        certIssuer: def.certIssuer,
        certSubject: def.certSubject,
        jwksEndpoint: def.jwksAlgorithm ? `https://${def.hostname}/.well-known/jwks.json` : null,
        jwksAlgorithm: def.jwksAlgorithm,
        firstSeenAt: new Date("2025-01-15T00:00:00Z"),
      },
    });

    // Compute weighted total score
    const weights = { tls: 0.15, cert: 0.10, kex: 0.40, jwks: 0.10, cipher: 0.10 };
    const rawTotal =
      def.riskScores.tls * weights.tls +
      def.riskScores.cert * weights.cert +
      def.riskScores.kex * weights.kex +
      def.riskScores.jwks * weights.jwks +
      def.riskScores.cipher * weights.cipher;
    const normalizedTotal = Math.min(100, Math.round((rawTotal / 0.85) * 10) / 10);

    await prisma.riskScore.create({
      data: {
        assetId: asset.id,
        classification: def.classification,
        totalScore: normalizedTotal,
        tlsVersionScore: def.riskScores.tls,
        certSigAlgoScore: def.riskScores.cert,
        keyExchangeScore: def.riskScores.kex,
        jwksAlgoScore: def.riskScores.jwks,
        cipherStrengthScore: def.riskScores.cipher,
      },
    });
    console.log(`  Created asset: ${def.hostname} (score: ${normalizedTotal}, ${def.classification})`);
  }

  // Create audit log entries
  await prisma.auditLog.create({
    data: {
      eventType: "SCAN_COMPLETED",
      details: { message: `Scan completed for domain: ${scan.domain}` },
    },
  });

  await prisma.auditLog.create({
    data: {
      eventType: "BASELINE_SET",
      details: { message: `Scan ${scan.id} was set as the new baseline.` },
    },
  });

  console.log(`\nSeed data created successfully!`);
  console.log(`Scan ID: ${scan.id}`);
  console.log("Use this ID to test API routes.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
