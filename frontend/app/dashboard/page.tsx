"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDashboardSummary, getHeatmapData } from "@/services/api";
import { DashboardSummary, HeatmapEntry } from "@/types";
import { StatCard } from "@/components/dashboard/StatCard";
import ClassificationBreakdown from "@/components/dashboard/ClassificationBreakdown";
import { RiskScoreDisplay } from "@/components/dashboard/RiskScoreDisplay";
import { RiskHeatmap } from "@/components/dashboard/RiskHeatmap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield, Activity, AlertTriangle, Clock, Loader2, FileText, ScanIcon, Building2 } from "lucide-react";
import { classificationLabel, classificationBgColor, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryData, heatmapData] = await Promise.all([
          getDashboardSummary(),
          getHeatmapData(),
        ]);
        setSummary(summaryData);
        setHeatmap(heatmapData.assets || []);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load dashboard";
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

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-3" />
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!summary || summary.totalAssets === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-semibold">No Scan Data Yet</h2>
        <p className="text-muted-foreground">Start a new scan to see your quantum readiness portfolio.</p>
        <button
          onClick={() => router.push("/scan")}
          className="text-primary underline"
        >
          Go to New Scan →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portfolio Dashboard</h1>
          {summary.lastScanDomain && (
            <p className="text-sm text-muted-foreground">
              Last scan: <span className="font-mono">{summary.lastScanDomain}</span>
              {summary.lastScanDate && <> &middot; {formatDate(summary.lastScanDate)}</>}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/scan")}>
            <ScanIcon className="h-4 w-4 mr-2" /> New Scan
          </Button>
          <Button variant="outline" onClick={() => router.push("/reports")}>
            <FileText className="h-4 w-4 mr-2" /> View Reports
          </Button>
          <Button variant="outline" onClick={() => router.push("/ciso")}>
            <Building2 className="h-4 w-4 mr-2" /> CISO Summary
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assets"
          value={summary.totalAssets}
          subtitle={summary.lastScanDomain || ""}
          icon={Shield}
        />
        <StatCard
          title="Average Risk Score"
          value={`${summary.averageScore}/100`}
          subtitle="Lower is better"
          icon={Activity}
          trend={summary.averageScore > 70 ? "up" : summary.averageScore < 40 ? "down" : "neutral"}
        />
        <StatCard
          title="Vulnerable Assets"
          value={summary.classificationBreakdown.VULNERABLE}
          subtitle="Score > 70"
          icon={AlertTriangle}
          trend={summary.classificationBreakdown.VULNERABLE > 0 ? "up" : "down"}
        />
        <StatCard
          title="Last Scan"
          value={summary.lastScanDate ? formatDate(summary.lastScanDate) : "Never"}
          icon={Clock}
        />
      </div>

      {/* Classification Breakdown */}
      <ClassificationBreakdown
        data={summary.classificationBreakdown}
        total={summary.totalAssets}
      />

      {/* Risk Heatmap */}
      <RiskHeatmap assets={heatmap} />

      {/* Asset Risk Table */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Risk Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hostname</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>TLS Version</TableHead>
                <TableHead>Key Exchange</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {heatmap.map((asset) => (
                <TableRow
                  key={asset.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/assets/${asset.id}`)}
                >
                  <TableCell className="font-mono text-sm">{asset.hostname}</TableCell>
                  <TableCell>
                    <RiskScoreDisplay
                      score={asset.score}
                      classification={asset.classification}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${classificationBgColor(asset.classification)}`}>
                      {classificationLabel(asset.classification)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{asset.tlsVersion || "—"}</TableCell>
                  <TableCell className="text-sm">{asset.keyExchange || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
