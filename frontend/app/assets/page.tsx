"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Search, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { classificationBgColor, classificationLabel, daysUntil, formatDate } from "@/lib/formatters";
import { getLatestCompletedScan, getScanAssets } from "@/services/api";
import type { Asset, RiskClassification } from "@/types";

type FilterKey = "ALL" | RiskClassification;

const FILTERS: FilterKey[] = [
  "ALL",
  "FULLY_QUANTUM_SAFE",
  "PQC_READY",
  "PARTIALLY_SAFE",
  "VULNERABLE",
];

function tlsTone(tlsVersion: string | null): string {
  if (!tlsVersion) return "text-muted-foreground";
  if (tlsVersion.includes("1.3")) return "text-green-500";
  if (tlsVersion.includes("1.2")) return "text-amber-500";
  return "text-red-500";
}

export default function AssetInventoryPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("ALL");

  useEffect(() => {
    async function load() {
      try {
        const latest = await getLatestCompletedScan();
        if (!latest) {
          setAssets([]);
          return;
        }
        const data = (await getScanAssets(latest.id)) as Asset[];
        setAssets(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load asset inventory");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return assets
      .filter((a) =>
        query.trim()
          ? a.hostname.toLowerCase().includes(query.trim().toLowerCase())
          : true,
      )
      .filter((a) =>
        activeFilter === "ALL" ? true : a.riskScore?.classification === activeFilter,
      )
      .sort((a, b) => (b.riskScore?.totalScore ?? -1) - (a.riskScore?.totalScore ?? -1));
  }, [assets, query, activeFilter]);

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Asset Inventory</h1>
        <p className="text-sm text-muted-foreground">
          Search and inspect cryptographic posture of discovered assets from the latest completed scan.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative max-w-md">
            <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search hostname..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Badge
                key={f}
                variant={activeFilter === f ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setActiveFilter(f)}
              >
                {f === "ALL" ? "All" : classificationLabel(f)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assets ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hostname</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>TLS</TableHead>
                <TableHead>Key Exchange</TableHead>
                <TableHead>Cert Expiry</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((asset) => {
                const expiryDays = asset.certExpiry ? daysUntil(asset.certExpiry) : null;
                const expiryClass =
                  expiryDays == null
                    ? "text-muted-foreground"
                    : expiryDays < 30
                      ? "text-red-500"
                      : expiryDays < 60
                        ? "text-amber-500"
                        : "text-green-500";

                return (
                  <TableRow
                    key={asset.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/assets/${asset.id}`)}
                  >
                    <TableCell className="font-mono text-xs">{asset.hostname}</TableCell>
                    <TableCell>{asset.riskScore ? `${Math.round(asset.riskScore.totalScore * 10) / 10}` : "—"}</TableCell>
                    <TableCell>
                      {asset.riskScore ? (
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${classificationBgColor(asset.riskScore.classification)}`}>
                          {classificationLabel(asset.riskScore.classification)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className={tlsTone(asset.tlsVersion)}>{asset.tlsVersion ?? "—"}</TableCell>
                    <TableCell>{asset.keyExchange ?? "—"}</TableCell>
                    <TableCell className={expiryClass}>
                      {asset.certExpiry ? formatDate(asset.certExpiry) : "—"}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-xs">
                        <Shield className={`h-3.5 w-3.5 ${asset.isAlive ? "text-green-500" : "text-red-500"}`} />
                        {asset.isAlive ? "Alive" : "Down"}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No assets matched this filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

