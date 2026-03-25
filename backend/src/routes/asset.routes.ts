import { Router } from "express";
import prisma from "../utils/prisma";
import { generateRecommendation } from "../services/ai.service";

const router = Router();

// GET /api/scans/:scanId/assets — List all assets for a scan
router.get("/scans/:scanId/assets", async (req, res) => {
  try {
    const { scanId } = req.params;

    const scan = await prisma.scan.findUnique({ where: { id: scanId } });
    if (!scan) {
      return res.status(404).json({ error: "Scan not found" });
    }

    const assets = await prisma.asset.findMany({
      where: { scanId },
      include: {
        riskScore: true,
        badge: true,
      },
      orderBy: { hostname: "asc" },
    });

    res.json(assets);
  } catch (error) {
    console.error("Error listing assets:", error);
    res.status(500).json({ error: "Failed to list assets" });
  }
});

// GET /api/assets/:id — Get a single asset with all details
router.get("/assets/:id", async (req, res) => {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id: req.params.id },
      include: {
        riskScore: true,
        badge: true,
        aiRecommendation: true,
        scan: {
          select: { id: true, domain: true, status: true, createdAt: true },
        },
      },
    });

    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    res.json(asset);
  } catch (error) {
    console.error("Error getting asset:", error);
    res.status(500).json({ error: "Failed to get asset" });
  }
});

// GET /api/assets/:id/recommendation
router.get("/assets/:id/recommendation", async (req, res) => {
  try {
    const recommendation = await generateRecommendation(req.params.id);
    res.json(recommendation);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate recommendation";
    const status = message === "Asset not found" ? 404 : 500;
    res.status(status).json({ error: message });
  }
});

export default router;
