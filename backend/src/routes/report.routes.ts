import { Router, Request, Response } from "express";

import { detectDrift } from "../services/drift.service";
import { generateComplianceReport } from "../services/report.service";

const router = Router();

function getId(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param;
}

// GET /api/scans/:id/report — Compliance Gap Report PDF
router.get("/:id/report", async (req: Request, res: Response) => {
  try {
    const scanId = getId(req.params.id);
    const doc = await generateComplianceReport(scanId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=compliance-report-${scanId}.pdf`,
    );

    doc.pipe(res);
    doc.end();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate report";
    const status = message === "Scan not found" ? 404 : 400;
    res.status(status).json({ error: message });
  }
});

// GET /api/scans/:id/drift — Drift detection vs baseline
router.get("/:id/drift", async (req: Request, res: Response) => {
  try {
    const scanId = getId(req.params.id);
    const drift = await detectDrift(scanId);
    res.json(drift);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to detect drift";
    const status = message === "Scan not found" ? 404 : 500;
    res.status(status).json({ error: message });
  }
});

export default router;

