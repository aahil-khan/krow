"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { classificationBgColor, classificationLabel } from "@/lib/formatters";
import { getHeatmapData } from "@/services/api";
import type { HeatmapEntry, RiskClassification } from "@/types";

const CLASS_ORDER: RiskClassification[] = [
  "FULLY_QUANTUM_SAFE",
  "PQC_READY",
  "PARTIALLY_SAFE",
  "VULNERABLE",
];

function tierLabel(c: RiskClassification): string {
  switch (c) {
    case "FULLY_QUANTUM_SAFE":
      return "Elite";
    case "PQC_READY":
      return "Advanced";
    case "PARTIALLY_SAFE":
      return "Standard";
    case "VULNERABLE":
      return "Critical";
  }
}

function actionHint(c: RiskClassification): string {
  switch (c) {
    case "FULLY_QUANTUM_SAFE":
      return "Maintain posture and monitor for configuration drift.";
    case "PQC_READY":
      return "Prioritize full migration to standardized PQC key exchange/signatures.";
    case "PARTIALLY_SAFE":
      return "Upgrade key exchange and certificate algorithms to reduce HNDL risk.";
    case "VULNERABLE":
      return "Immediate remediation required: retire legacy crypto and weak protocols.";
  }
}

export default function PqcPosturePage() {
  const [assets, setAssets] = useState<HeatmapEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHeatmapData()
      .then((data) => setAssets((data.assets ?? []) as HeatmapEntry[]))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load PQC posture"),
      )
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const init = {
      FULLY_QUANTUM_SAFE: [] as HeatmapEntry[],
      PQC_READY: [] as HeatmapEntry[],
      PARTIALLY_SAFE: [] as HeatmapEntry[],
      VULNERABLE: [] as HeatmapEntry[],
    };
    for (const asset of assets) {
      init[asset.classification].push(asset);
    }
    return init;
  }, [assets]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-destructive" />
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <ShieldCheck className="h-6 w-6" />
          PQC Readiness Posture
        </h1>
        <p className="text-sm text-muted-foreground">
          Classification of assets by post-quantum cryptography migration readiness.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {CLASS_ORDER.map((cls) => (
          <Card key={cls}>
            <CardHeader>
              <CardTitle className="text-sm">{tierLabel(cls)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{grouped[cls].length}</div>
              <p className="text-xs text-muted-foreground">{classificationLabel(cls)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {CLASS_ORDER.map((cls) => (
          <Card key={cls}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>{tierLabel(cls)} · {classificationLabel(cls)}</span>
                <span className={`rounded-full px-2 py-1 text-xs ${classificationBgColor(cls)}`}>
                  {grouped[cls].length} assets
                </span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{actionHint(cls)}</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {grouped[cls].slice(0, 30).map((asset) => (
                <div key={asset.id} className="grid grid-cols-1 gap-2 rounded-lg border border-border p-3 text-sm md:grid-cols-4">
                  <div className="font-mono text-xs md:col-span-2">{asset.hostname}</div>
                  <div>Risk: <span className="font-medium">{Math.round(asset.score * 10) / 10}</span></div>
                  <div className="text-muted-foreground">{asset.tlsVersion ?? "Unknown TLS"} · {asset.keyExchange ?? "Unknown KEX"}</div>
                </div>
              ))}
              {grouped[cls].length === 0 && (
                <p className="text-sm text-muted-foreground">No assets in this tier.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

