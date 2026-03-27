"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getDashboardSummary, getHeatmapData } from "@/services/api";
import { DashboardSummary, HeatmapEntry } from "@/types";
import StatCard from "@/components/dashboard/StatCard";
import RiskScoreDisplay from "@/components/dashboard/RiskScoreDisplay";
import CyberScoreGauge from "@/components/charts/CyberScoreGauge";
import ClassificationDonut from "@/components/charts/ClassificationDonut";
import RiskDistributionBar from "@/components/charts/RiskDistributionBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Shield, Activity, AlertTriangle, ShieldCheck, Loader2, FileText, ScanIcon, Search } from "lucide-react";
import { classificationLabel, classificationBgColor, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
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

  // Sort by risk score descending, filter by search
  const filteredAssets = useMemo(() => {
    const sorted = [...heatmap].sort((a, b) => b.score - a.score);
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter((a) => a.hostname.toLowerCase().includes(q));
  }, [heatmap, search]);

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

  const cyberScore = Math.round((1 - summary.averageScore / 100) * 1000);

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
            <FileText className="h-4 w-4 mr-2" /> Reports
          </Button>
        </div>
      </div>

      {/* Score + Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cyber Score Gauge */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cyber Score</CardTitle>
          </CardHeader>
          <CardContent>
            <CyberScoreGauge score={cyberScore} />
          </CardContent>
        </Card>

        {/* Stat Cards 2x2 */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
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
            subtitle="Need attention"
            icon={AlertTriangle}
            trend={summary.classificationBreakdown.VULNERABLE > 0 ? "up" : "down"}
          />
          <StatCard
            title="Quantum-Safe"
            value={summary.quantumSafeCount ?? summary.classificationBreakdown.FULLY_QUANTUM_SAFE}
            subtitle="Fully compliant"
            icon={ShieldCheck}
            trend="down"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Classification Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ClassificationDonut data={summary.classificationBreakdown} total={summary.totalAssets} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskDistributionBar assets={heatmap} />
          </CardContent>
        </Card>
      </div>

      {/* Asset Risk Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Asset Risk Overview</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search hostname..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
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
              {filteredAssets.map((asset) => (
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
