import { Router } from "express";
import prisma from "../utils/prisma";

const router = Router();

// GET /api/dashboard/summary — Portfolio overview
router.get("/summary", async (_req, res) => {
  try {
    // Find the most recent completed scan
    const latestScan = await prisma.scan.findFirst({
      where: { status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
    });

    if (!latestScan) {
      return res.json({
        totalAssets: 0,
        averageScore: 0,
        classificationBreakdown: {
          FULLY_QUANTUM_SAFE: 0,
          PQC_READY: 0,
          PARTIALLY_SAFE: 0,
          VULNERABLE: 0,
        },
        lastScanDate: null,
        lastScanDomain: null,
      });
    }

    // Get all risk scores for assets in the latest scan
    const riskScores = await prisma.riskScore.findMany({
      where: { asset: { scanId: latestScan.id } },
    });

    const totalAssets = riskScores.length;
    const averageScore =
      totalAssets > 0
        ? riskScores.reduce((sum, rs) => sum + rs.totalScore, 0) / totalAssets
        : 0;

    const classificationBreakdown = {
      FULLY_QUANTUM_SAFE: 0,
      PQC_READY: 0,
      PARTIALLY_SAFE: 0,
      VULNERABLE: 0,
    };

    for (const rs of riskScores) {
      classificationBreakdown[rs.classification]++;
    }

    res.json({
      totalAssets,
      averageScore: Math.round(averageScore * 10) / 10,
      classificationBreakdown,
      lastScanDate: latestScan.completedAt,
      lastScanDomain: latestScan.domain,
    });
  } catch (error) {
    console.error("Error getting dashboard summary:", error);
    res.status(500).json({ error: "Failed to get dashboard summary" });
  }
});

// GET /api/dashboard/heatmap — Asset risk heatmap data
router.get("/heatmap", async (_req, res) => {
  try {
    const latestScan = await prisma.scan.findFirst({
      where: { status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
    });

    if (!latestScan) {
      return res.json({ assets: [] });
    }

    const assets = await prisma.asset.findMany({
      where: { scanId: latestScan.id },
      include: { riskScore: true },
      orderBy: { hostname: "asc" },
    });

    const heatmapData = assets
      .filter((a) => a.riskScore)
      .map((a) => ({
        id: a.id,
        hostname: a.hostname,
        score: a.riskScore!.totalScore,
        classification: a.riskScore!.classification,
        tlsVersion: a.tlsVersion,
        keyExchange: a.keyExchange,
      }));

    res.json({ assets: heatmapData });
  } catch (error) {
    console.error("Error getting heatmap data:", error);
    res.status(500).json({ error: "Failed to get heatmap data" });
  }
});

export default router;
