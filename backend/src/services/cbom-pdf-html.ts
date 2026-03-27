import { escapeHtml } from "../utils/escape-html";

/** CycloneDX-shaped object from `generateCbom` (loosely typed). */
export function buildCbomPdfHtml(cbom: Record<string, unknown>, scanId: string): string {
  const spec = escapeHtml(String(cbom.specVersion ?? "1.6"));
  const meta = cbom.metadata as { timestamp?: string } | undefined;
  const ts = escapeHtml(meta?.timestamp ?? new Date().toISOString());
  const components = (Array.isArray(cbom.components) ? cbom.components : []) as Array<{
    name?: string;
    type?: string;
    version?: string;
    "bom-ref"?: string;
    cryptoProperties?: { assetType?: string };
  }>;

  const rows = components
    .map((c) => {
      const name = escapeHtml(c.name ?? "—");
      const type = escapeHtml(c.type ?? "—");
      const asset = escapeHtml(c.cryptoProperties?.assetType ?? "—");
      const ver = escapeHtml(c.version ?? "—");
      const ref = escapeHtml(c["bom-ref"] ?? "—");
      return `<tr>
        <td class="name">${name}</td>
        <td>${type}</td>
        <td><span class="tag">${asset}</span></td>
        <td>${ver}</td>
        <td class="mono">${ref}</td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>CBOM · CycloneDX ${spec}</title>
  <style>
    :root {
      --bg: #0b1120;
      --card: #111827;
      --border: rgba(255,255,255,0.08);
      --text: #f1f5f9;
      --muted: #94a3b8;
      --accent: #22d3ee;
      --accent2: #a78bfa;
    }
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      color: var(--text);
      background: linear-gradient(180deg, #020617 0%, #0f172a 100%);
      font-size: 8.5pt;
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .wrap { padding: 0; }
    .hero {
      padding: 18px 20px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: linear-gradient(125deg, #1e293b 0%, #0f172a 60%, #1e1b4b 100%);
      margin-bottom: 14px;
    }
    .hero__eyebrow {
      font-size: 8pt;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--accent);
      font-weight: 700;
    }
    h1 { margin: 6px 0 4px; font-size: 16pt; letter-spacing: -0.02em; }
    .meta { color: var(--muted); font-size: 9pt; }
    .meta code { color: var(--accent2); font-size: 8.5pt; }
    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left;
      padding: 7px 8px;
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--muted);
      background: rgba(15,23,42,0.9);
      border-bottom: 1px solid var(--border);
    }
    td {
      padding: 6px 8px;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
    }
    tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
    .name { font-weight: 600; max-width: 200px; word-break: break-word; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 7.5pt; color: #cbd5e1; }
    .tag {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 999px;
      background: rgba(34,211,238,0.12);
      color: #67e8f9;
      font-size: 7.5pt;
      font-weight: 600;
    }
    .footer {
      margin-top: 12px;
      text-align: center;
      font-size: 7.5pt;
      color: var(--muted);
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hero">
      <div class="hero__eyebrow">Cryptographic Bill of Materials</div>
      <h1>CycloneDX export</h1>
      <div class="meta">
        Format <strong>${spec}</strong> · Generated <strong>${ts}</strong><br/>
        Scan <code>${escapeHtml(scanId)}</code> · <strong>${escapeHtml(components.length)}</strong> components
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Asset type</th>
          <th>Version</th>
          <th>BOM ref</th>
        </tr>
      </thead>
      <tbody>${rows || `<tr><td colspan="5" style="color:var(--muted);text-align:center;padding:16px">No components</td></tr>`}</tbody>
    </table>
    <div class="footer">Krow · PSB Hackathon 2026</div>
  </div>
</body>
</html>`;
}
