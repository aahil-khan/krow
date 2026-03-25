import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { Router, Request, Response } from "express";

import { generateCbom } from "../services/cbom.service";

const router = Router();

function getScanId(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param;
}

// GET /api/scans/:id/cbom — JSON
router.get("/:id/cbom", async (req: Request, res: Response) => {
  try {
    const scanId = getScanId(req.params.id);
    const cbom = await generateCbom(scanId);
    res.json(cbom);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate CBOM";
    const status = message === "Scan not found" ? 404 : 400;
    res.status(status).json({ error: message });
  }
});

// GET /api/scans/:id/cbom/pdf — PDF export
router.get("/:id/cbom/pdf", async (req: Request, res: Response) => {
  try {
    const scanId = getScanId(req.params.id);
    const cbom = await generateCbom(scanId);
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=cbom-${scanId}.pdf`);
    doc.pipe(res);

    // Title
    doc.fontSize(20).font("Helvetica-Bold").text("Cryptographic Bill of Materials (CBOM)", { align: "center" });
    doc.moveDown();
    doc.fontSize(10).font("Helvetica").text(`Generated: ${new Date().toISOString()}`, { align: "center" });
    doc.text(`Format: CycloneDX ${(cbom as any).specVersion}`, { align: "center" });
    doc.moveDown(2);

    // Components table
    doc.fontSize(14).font("Helvetica-Bold").text("Cryptographic Components");
    doc.moveDown();

    const components = (cbom as any).components as Array<any>;
    for (const component of components || []) {
      doc.fontSize(10).font("Helvetica-Bold").text(component.name);
      doc.font("Helvetica").text(`Type: ${component.cryptoProperties?.assetType || "N/A"}`);
      if (component.version) doc.text(`Version: ${component.version}`);
      doc.text(`BOM Ref: ${component["bom-ref"]}`);
      doc.moveDown(0.5);
    }

    doc.end();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate CBOM PDF";
    res.status(400).json({ error: message });
  }
});

// GET /api/scans/:id/cbom/excel — Excel export
router.get("/:id/cbom/excel", async (req: Request, res: Response) => {
  try {
    const scanId = getScanId(req.params.id);
    const cbom = await generateCbom(scanId);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("CBOM Components");

    sheet.columns = [
      { header: "Name", key: "name", width: 40 },
      { header: "Type", key: "type", width: 15 },
      { header: "Asset Type", key: "assetType", width: 15 },
      { header: "Version", key: "version", width: 12 },
      { header: "BOM Reference", key: "bomRef", width: 30 },
    ];

    sheet.getRow(1).font = { bold: true };

    const components = (cbom as any).components as Array<any>;
    for (const component of components || []) {
      sheet.addRow({
        name: component.name,
        type: component.type,
        assetType: component.cryptoProperties?.assetType || "N/A",
        version: component.version || "—",
        bomRef: component["bom-ref"],
      });
    }

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=cbom-${scanId}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate CBOM Excel";
    res.status(400).json({ error: message });
  }
});

export default router;

