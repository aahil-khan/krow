"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, TrendingDown, TrendingUp, AlertTriangle, FileDown, Building2, Loader2 } from "lucide-react";
import { getDashboardSummary, getHeatmapData, getScans } from "@/services/api";
import type { DashboardSummary, HeatmapEntry, Scan, RiskClassification } from "@/types";
import { formatScore, classificationLabel, classificationBgColor } from "@/lib/formatters";
import { RiskScoreDisplay } from "@/components/dashboard/RiskScoreDisplay";
import StatCard from "@/components/dashboard/StatCard";
import ClassificationBreakdown from "@/components/dashboard/ClassificationBreakdown";
import { RiskHeatmap } from "@/components/dashboard/RiskHeatmap";

function scoreToClassification(score: number): RiskClassification {
  if (score <= 15) return "FULLY_QUANTUM_SAFE";
  if (score <= 40) return "PQC_READY";
  if (score <= 70) return "PARTIALLY_SAFE";
  return "VULNERABLE";
}

export default function CISOPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, h, sc] = await Promise.all([
          getDashboardSummary(),
          getHeatmapData(),
          getScans(),
        ]);
        setSummary(s);
        setHeatmap(h.assets || []);
        setScans(sc);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No scan data available yet.</p>
      </div>
    );
  }

  const completedScans = scans.filter((s) => s.status === "COMPLETED");
  const latestScan = completedScans[0];
  const quantumSafePercent =
    summary.totalAssets > 0
      ? Math.round(
          ((summary.classificationBreakdown.FULLY_QUANTUM_SAFE +
            summary.classificationBreakdown.PQC_READY) /
            summary.totalAssets) *
            100
        )
      : 0;
  const portfolioClassification = scoreToClassification(summary.averageScore);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Building2 className="h-6 w-6 text-blue-500" />
            CISO Portfolio Summary
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Quantum readiness overview across all scanned domains
          </p>
        </div>
        {latestScan && (
          <Button
            variant="outline"
            onClick={() => window.open(`/api/scans/${latestScan.id}/report`, "_blank")}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        )}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Assets" value={summary.totalAssets} icon={Shield} />
        <StatCard
          title="Quantum-Safe"
          value={`${quantumSafePercent}%`}
          subtitle={`${
            summary.classificationBreakdown.FULLY_QUANTUM_SAFE +
            summary.classificationBreakdown.PQC_READY
          } of ${summary.totalAssets} assets`}
          icon={TrendingDown}
        />
        <StatCard
          title="Avg Risk Score"
          value={formatScore(summary.averageScore)}
          icon={TrendingUp}
        />
        <StatCard
          title="Vulnerable"
          value={summary.classificationBreakdown.VULNERABLE}
          subtitle="Require immediate action"
          icon={AlertTriangle}
          trend={summary.classificationBreakdown.VULNERABLE > 0 ? "up" : "down"}
        />
      </div>

      {/* Risk Gauge + Classification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Risk Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <RiskScoreDisplay
              score={summary.averageScore}
              classification={portfolioClassification}
              size="lg"
            />
            <div className="grid grid-cols-2 gap-3 w-full">
              {(
                Object.entries(summary.classificationBreakdown) as [RiskClassification, number][]
              ).map(([key, count]) => (
                <div
                  key={key}
                  className={`rounded-lg p-3 text-center ${classificationBgColor(key)}`}
                >
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs">{classificationLabel(key)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <ClassificationBreakdown
          data={summary.classificationBreakdown}
          total={summary.totalAssets}
        />
      </div>

      {/* Heatmap */}
      <RiskHeatmap assets={heatmap} />

      {/* Recent Scans */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
        </CardHeader>
        <CardContent>
          {completedScans.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              No completed scans yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Domain</th>
                    <th className="pb-2 font-medium">Assets</th>
                    <th className="pb-2 font-medium">Avg Score</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Report</th>
                  </tr>
                </thead>
                <tbody>
                  {completedScans.slice(0, 5).map((scan) => (
                    <tr key={scan.id} className="border-b last:border-0">
                      <td className="py-2 font-mono text-sm">{scan.domain}</td>
                      <td className="py-2">{scan.totalAssets}</td>
                      <td className="py-2">
                        {scan.averageScore != null ? formatScore(scan.averageScore) : "—"}
                      </td>
                      <td className="py-2">
                        <span className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-500">
                          Completed
                        </span>
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {scan.completedAt
                          ? new Date(scan.completedAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            window.open(`/api/scans/${scan.id}/report`, "_blank")
                          }
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
