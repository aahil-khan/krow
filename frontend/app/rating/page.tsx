"use client";

import { useEffect, useState } from "react";
import { getDashboardSummary, getHeatmapData } from "@/services/api";
import { DashboardSummary, HeatmapEntry } from "@/types";
import CyberScoreGauge from "@/components/charts/CyberScoreGauge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle } from "lucide-react";

const BANKING_AVERAGE = 620; // benchmark reference

interface ComponentScore {
  label: string;
  value: number;
  max: number;
}

export default function RatingPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [, setHeatmap] = useState<HeatmapEntry[]>([]);
  const [componentScores, setComponentScores] = useState<ComponentScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryData, heatmapData] = await Promise.all([
          getDashboardSummary(),
          getHeatmapData(),
        ]);
        setSummary(summaryData);
        const assets = heatmapData.assets || [];
        setHeatmap(assets);

        // Use componentAverages from backend if available
        const ca = summaryData.componentAverages;
        if (ca) {
          setComponentScores([
            { label: "TLS Protocol Score", value: Math.round(ca.tlsVersionScore * 10) / 10, max: 100 },
            { label: "Certificate Algorithm Score", value: Math.round(ca.certSigAlgoScore * 10) / 10, max: 100 },
            { label: "Key Exchange Score", value: Math.round(ca.keyExchangeScore * 10) / 10, max: 100 },
            { label: "JWKS/JWT Score", value: Math.round(ca.jwksAlgoScore * 10) / 10, max: 100 },
            { label: "Cipher Strength Score", value: Math.round(ca.cipherStrengthScore * 10) / 10, max: 100 },
          ]);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load rating data";
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-3" />
        <p className="text-destructive">{error || "No data available"}</p>
      </div>
    );
  }

  const cyberScore = Math.round((1 - summary.averageScore / 100) * 1000);
  const tier: "Legacy" | "Standard" | "Elite PQC" =
    cyberScore >= 800 ? "Elite PQC" : cyberScore >= 500 ? "Standard" : "Legacy";
  const diff = cyberScore - BANKING_AVERAGE;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero Gauge */}
      <Card className="overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold tracking-tight mb-1">Cyber Rating</h1>
            <p className="text-sm text-muted-foreground mb-4">Organization Post-Quantum Readiness Score</p>
            <div className="w-72 h-72">
              <CyberScoreGauge score={cyberScore} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier Indicator */}
      <div className="grid grid-cols-3 gap-3">
        {(["Legacy", "Standard", "Elite PQC"] as const).map((t) => {
          const isActive = tier === t;
          const colors: Record<string, string> = {
            Legacy: "border-rose-500/40 bg-rose-500/10 text-rose-400",
            Standard: "border-amber-500/40 bg-amber-500/10 text-amber-400",
            "Elite PQC": "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
          };
          const inactiveStyle = "border-white/8 bg-card text-muted-foreground";
          return (
            <div
              key={t}
              className={`rounded-lg border-2 p-4 text-center transition-all ${isActive ? colors[t] : inactiveStyle}`}
            >
              <p className="text-sm font-semibold">{t}</p>
              <p className="text-xs mt-1 opacity-70">
                {t === "Legacy" && "< 500"}
                {t === "Standard" && "500 – 799"}
                {t === "Elite PQC" && "≥ 800"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Component Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Component Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {componentScores.map((cs) => {
            const pct = Math.min(100, (cs.value / cs.max) * 100);
            // Lower score = better (risk score), so invert for color
            const invertedPct = 100 - pct;
            const barColor =
              invertedPct >= 70 ? "bg-emerald-500" : invertedPct >= 40 ? "bg-amber-500" : "bg-rose-500";
            return (
              <div key={cs.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium">{cs.label}</span>
                  <span className="text-sm tabular-nums text-muted-foreground">{cs.value} / {cs.max}</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Benchmark */}
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Your organization scores{" "}
            <span className={`font-bold ${diff >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {Math.abs(diff)} points {diff >= 0 ? "better" : "worse"}
            </span>{" "}
            than the banking sector average ({BANKING_AVERAGE})
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
