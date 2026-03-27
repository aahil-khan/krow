import { Router } from "express";
import { executeScan } from "../services/scanner.service";
import prisma from "../utils/prisma";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain || typeof domain !== "string") {
      return res.status(400).json({ error: "domain is required" });
    }

    const cleaned = domain.replace(/^https?:\/\//, "").replace(/\/+$/, "").toLowerCase();

    const scan = await prisma.scan.create({
      data: {
        domain: cleaned,
        status: "PENDING",
      },
    });

    executeScan(scan.id).catch((err) => {
      console.error(`Scan ${scan.id} failed:`, err);
    });

    return res.status(201).json(scan);
  } catch (error) {
    console.error("Error creating scan:", error);
    return res.status(500).json({ error: "Failed to create scan" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const scans = await prisma.scan.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { assets: true } } },
    });
    return res.json(scans);
  } catch (error) {
    console.error("Error listing scans:", error);
    return res.status(500).json({ error: "Failed to list scans" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const scan = await prisma.scan.findUnique({
      where: { id: req.params.id },
      include: {
        assets: { include: { riskScore: true } },
        _count: { select: { assets: true, badges: true } },
      },
    });
    if (!scan) {
      return res.status(404).json({ error: "Scan not found" });
    }

    const assetsWithScores = scan.assets.filter((a) => a.riskScore);
    const avgScore =
      assetsWithScores.length > 0
        ? assetsWithScores.reduce((sum, a) => sum + (a.riskScore?.totalScore || 0), 0) /
          assetsWithScores.length
        : 0;
    const vulnerableCount = assetsWithScores.filter(
      (a) => a.riskScore?.classification === "VULNERABLE",
    ).length;

    return res.json({
      ...scan,
      summary: {
        averageScore: Math.round(avgScore * 10) / 10,
        vulnerableCount,
        scannedCount: assetsWithScores.length,
      },
    });
  } catch (error) {
    console.error("Error getting scan:", error);
    return res.status(500).json({ error: "Failed to get scan" });
  }
});

export default router;
