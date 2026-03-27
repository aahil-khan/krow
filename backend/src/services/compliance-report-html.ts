import { escapeHtml } from "../utils/escape-html";

export type ComplianceReportViewModel = {
  domain: string;
  generatedAt: string;
  totalAssets: number;
  avgScore: number;
  vulnerableCount: number;
  safeCount: number;
  vulnerablePct: number;
  safePct: number;
  hasVulnerable: boolean;
  hndlAssets: Array<{ hostname: string; keyExchange: string; keyExchangeScore: number }>;
  inventoryRows: Array<{ hostname: string; score: string; classification: string; tls: string }>;
  nistRows: Array<{ id: string; name: string; status: string }>;
  industryAvg: number;
  benchmarkDeltaText: string;
  benchmarkPositive: boolean;
  roadmap: Array<{ phase: string; action: string }>;
};

function classificationClass(c: string): string {
  switch (c) {
    case "FULLY_QUANTUM_SAFE":
      return "pill pill--safe";
    case "PQC_READY":
      return "pill pill--ready";
    case "PARTIALLY_SAFE":
      return "pill pill--partial";
    case "VULNERABLE":
      return "pill pill--bad";
    default:
      return "pill pill--muted";
  }
}

/** Styled HTML document for Chromium PDF export. */
export function buildComplianceReportHtml(vm: ComplianceReportViewModel): string {
  const hndlRows = vm.hndlAssets
    .slice(0, 12)
    .map(
      (a) => `
      <tr>
        <td>${escapeHtml(a.hostname)}</td>
        <td>${escapeHtml(a.keyExchange)}</td>
        <td class="num">${escapeHtml(a.keyExchangeScore)}</td>
      </tr>`,
    )
    .join("");

  const invRows = vm.inventoryRows
    .map(
      (r) => `
      <tr>
        <td class="hostname">${escapeHtml(r.hostname)}</td>
        <td class="num">${escapeHtml(r.score)}</td>
        <td><span class="${classificationClass(r.classification)}">${escapeHtml(r.classification)}</span></td>
        <td>${escapeHtml(r.tls)}</td>
      </tr>`,
    )
    .join("");

  const nistRows = vm.nistRows
    .map(
      (n) => `
      <div class="nist-card">
        <div class="nist-card__id">${escapeHtml(n.id)}</div>
        <div class="nist-card__name">${escapeHtml(n.name)}</div>
        <div class="nist-card__status">${escapeHtml(n.status)}</div>
      </div>`,
    )
    .join("");

  const roadmap = vm.roadmap
    .map(
      (r) => `
      <div class="roadmap-item">
        <div class="roadmap-item__phase">${escapeHtml(r.phase)}</div>
        <div class="roadmap-item__action">${escapeHtml(r.action)}</div>
      </div>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Quantum Readiness — ${escapeHtml(vm.domain)}</title>
  <style>
    /* System fonts only — avoids network fetch during headless PDF (faster, works offline). */
    :root {
      --bg: #0f1419;
      --surface: #1a2332;
      --surface2: #243044;
      --border: rgba(255,255,255,0.08);
      --text: #e8eef7;
      --muted: #8b9cb3;
      --accent: #38bdf8;
      --accent2: #818cf8;
      --good: #34d399;
      --warn: #fbbf24;
      --bad: #f87171;
    }
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: var(--text);
      background: linear-gradient(165deg, #0c1220 0%, #0f172a 40%, #111827 100%);
      margin: 0;
      padding: 0;
      font-size: 10.5pt;
      line-height: 1.45;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      padding: 0;
    }
    .hero {
      background: linear-gradient(120deg, var(--surface) 0%, #1e293b 50%, #172554 100%);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 22px 26px;
      margin-bottom: 18px;
      position: relative;
      overflow: hidden;
    }
    .hero::after {
      content: '';
      position: absolute;
      top: -40%;
      right: -10%;
      width: 45%;
      height: 180%;
      background: radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero__brand {
      font-size: 9pt;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--accent);
      font-weight: 700;
      margin-bottom: 6px;
    }
    .hero h1 {
      margin: 0 0 8px;
      font-size: 20pt;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .hero__meta {
      display: flex;
      flex-wrap: wrap;
      gap: 16px 28px;
      color: var(--muted);
      font-size: 9.5pt;
    }
    .hero__meta strong { color: var(--text); font-weight: 600; }
    .kpis {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 18px;
    }
    @media print {
      .kpis { grid-template-columns: repeat(4, 1fr); }
    }
    .kpi {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 14px;
    }
    .kpi__label { font-size: 8.5pt; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }
    .kpi__value { font-size: 18pt; font-weight: 700; margin-top: 4px; letter-spacing: -0.02em; }
    .kpi__sub { font-size: 8.5pt; color: var(--muted); margin-top: 4px; }
    .section {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px 18px;
      margin-bottom: 14px;
      break-inside: avoid;
    }
    .section h2 {
      margin: 0 0 12px;
      font-size: 12.5pt;
      font-weight: 700;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section h2 .num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 6px;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      color: #0f172a;
      font-size: 9pt;
      font-weight: 800;
    }
    .alert {
      border-radius: 10px;
      padding: 12px 14px;
      margin-bottom: 12px;
      font-size: 9.5pt;
      border: 1px solid transparent;
    }
    .alert--bad {
      background: rgba(248,113,113,0.12);
      border-color: rgba(248,113,113,0.35);
      color: #fecaca;
    }
    .alert--ok {
      background: rgba(52,211,153,0.1);
      border-color: rgba(52,211,153,0.3);
      color: #a7f3d0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
    }
    th {
      text-align: left;
      padding: 8px 10px;
      background: var(--surface2);
      color: var(--muted);
      font-weight: 600;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--border);
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
    }
    tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
    .hostname { word-break: break-all; max-width: 220px; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    .pill {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 7.5pt;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    .pill--safe { background: rgba(52,211,153,0.2); color: #6ee7b7; }
    .pill--ready { background: rgba(56,189,248,0.2); color: #7dd3fc; }
    .pill--partial { background: rgba(251,191,36,0.15); color: #fcd34d; }
    .pill--bad { background: rgba(248,113,113,0.2); color: #fca5a5; }
    .pill--muted { background: rgba(139,156,179,0.15); color: var(--muted); }
    .nist-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .nist-card {
      background: var(--surface2);
      border-radius: 10px;
      padding: 12px;
      border: 1px solid var(--border);
    }
    .nist-card__id { font-size: 8pt; color: var(--accent); font-weight: 700; }
    .nist-card__name { font-size: 9.5pt; margin: 4px 0 8px; font-weight: 600; }
    .nist-card__status { font-size: 9pt; color: var(--muted); }
    .benchmark {
      font-size: 11pt;
      padding: 14px;
      border-radius: 10px;
      background: linear-gradient(90deg, rgba(56,189,248,0.08), rgba(129,140,248,0.08));
      border: 1px solid var(--border);
    }
    .benchmark.positive { border-left: 4px solid var(--good); }
    .benchmark.negative { border-left: 4px solid var(--bad); }
    .roadmap-item {
      display: grid;
      grid-template-columns: 160px 1fr;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid var(--border);
    }
    .roadmap-item:last-child { border-bottom: none; }
    .roadmap-item__phase {
      font-weight: 700;
      font-size: 9pt;
      color: var(--accent);
    }
    .roadmap-item__action { color: var(--muted); font-size: 9.5pt; }
    .footer {
      text-align: center;
      font-size: 8pt;
      color: var(--muted);
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid var(--border);
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="hero">
      <div class="hero__brand">Krow · Quantum readiness</div>
      <h1>Compliance gap report</h1>
      <div class="hero__meta">
        <span><strong>Domain</strong> ${escapeHtml(vm.domain)}</span>
        <span><strong>Generated</strong> ${escapeHtml(vm.generatedAt)}</span>
        <span><strong>Industry benchmark</strong> ${escapeHtml(vm.industryAvg)}/100</span>
      </div>
    </div>

    <div class="kpis">
      <div class="kpi">
        <div class="kpi__label">Assets scanned</div>
        <div class="kpi__value">${escapeHtml(vm.totalAssets)}</div>
      </div>
      <div class="kpi">
        <div class="kpi__label">Avg risk score</div>
        <div class="kpi__value">${escapeHtml(vm.avgScore)}<span style="font-size:12pt;font-weight:600;color:var(--muted)">/100</span></div>
      </div>
      <div class="kpi">
        <div class="kpi__label">Quantum-safe</div>
        <div class="kpi__value" style="color:var(--good)">${escapeHtml(vm.safeCount)}</div>
        <div class="kpi__sub">${escapeHtml(vm.safePct)}% of fleet</div>
      </div>
      <div class="kpi">
        <div class="kpi__label">Vulnerable</div>
        <div class="kpi__value" style="color:${vm.vulnerableCount > 0 ? "var(--bad)" : "var(--good)"}">${escapeHtml(vm.vulnerableCount)}</div>
        <div class="kpi__sub">${escapeHtml(vm.vulnerablePct)}% of fleet</div>
      </div>
    </div>

    <div class="section">
      <h2><span class="num">1</span> Executive summary</h2>
      ${
        vm.hasVulnerable
          ? `<div class="alert alert--bad"><strong>HNDL alert.</strong> ${escapeHtml(
              vm.vulnerableCount,
            )} asset(s) are classified as <strong>VULNERABLE</strong> and may be exposed to harvest-now, decrypt-later risk.</div>`
          : `<div class="alert alert--ok">No vulnerable-classified assets in this scan. Continue monitoring drift and certificate lifecycles.</div>`
      }
    </div>

    <div class="section">
      <h2><span class="num">2</span> HNDL exposure (key exchange)</h2>
      <p style="color:var(--muted);margin:0 0 10px;font-size:9.5pt">Assets with elevated key-exchange component scores (&gt;50).</p>
      ${
        vm.hndlAssets.length === 0
          ? `<p style="color:var(--muted)">No high key-exchange scores flagged.</p>`
          : `<table>
        <thead><tr><th>Hostname</th><th>Key exchange</th><th class="num">KEX score</th></tr></thead>
        <tbody>${hndlRows}</tbody>
      </table>`
      }
    </div>

    <div class="section">
      <h2><span class="num">3</span> Cryptographic asset inventory</h2>
      <table>
        <thead>
          <tr>
            <th>Hostname</th>
            <th class="num">Score</th>
            <th>Classification</th>
            <th>TLS</th>
          </tr>
        </thead>
        <tbody>${invRows}</tbody>
      </table>
    </div>

    <div class="section">
      <h2><span class="num">4</span> NIST PQC compliance tracker</h2>
      <div class="nist-grid">${nistRows}</div>
    </div>

    <div class="section">
      <h2><span class="num">5</span> Peer benchmark</h2>
      <div class="benchmark ${vm.benchmarkPositive ? "positive" : "negative"}">
        ${escapeHtml(vm.benchmarkDeltaText)}
      </div>
    </div>

    <div class="section">
      <h2><span class="num">6</span> Migration roadmap</h2>
      ${roadmap}
    </div>

    <div class="footer">
      Generated by Krow Quantum-Safe Scanner · PSB Hackathon 2026 · Confidential
    </div>
  </div>
</body>
</html>`;
}
