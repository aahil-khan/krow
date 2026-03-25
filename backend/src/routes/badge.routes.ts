import { Router, Request, Response } from "express";

import prisma from "../utils/prisma";
import { verifyBadge } from "../services/badge.service";

const router = Router();

function getId(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param;
}

// GET /api/badges/verify/:id — Verify badge signature and status
router.get("/verify/:id", async (req: Request, res: Response) => {
  try {
    const badgeId = getId(req.params.id);
    const result = await verifyBadge(badgeId);
    if (!result.valid && "error" in result) {
      res.status(404).json(result);
      return;
    }
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to verify badge";
    res.status(500).json({ error: message });
  }
});

// GET /api/badges/:id — Get badge details
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const badgeId = getId(req.params.id);
    const badge = await prisma.badge.findUnique({
      where: { id: badgeId },
      include: {
        asset: { select: { hostname: true, port: true } },
      },
    });

    if (!badge) {
      res.status(404).json({ error: "Badge not found" });
      return;
    }

    res.json(badge);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch badge";
    res.status(500).json({ error: message });
  }
});

export default router;

