"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Loader2, Scan as ScanIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createScan, getScans } from "@/services/api";
import { useSSE } from "@/lib/useSSE";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { formatDate } from "@/lib/formatters";
import type { Scan } from "@/types";

export default function ScanPage() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [activeScanId, setActiveScanId] = useState<string | null>(null);
  const { progress, latestEvent, isComplete, percentComplete } = useSSE(activeScanId);
  const router = useRouter();

  // Clear activeScanId and refresh list when SSE indicates completion
  useEffect(() => {
    if (!isComplete || !activeScanId) return;
    setActiveScanId(null);
    getScans().then(setScans).catch(() => {});
    // Auto-navigate to dashboard after 2 seconds
    const timeout = setTimeout(() => router.push("/dashboard"), 2000);
    return () => clearTimeout(timeout);
  }, [isComplete, activeScanId, router]);

  // Initial scan list fetch
  useEffect(() => {
    async function fetchScans() {
      try {
        const data = await getScans();
        setScans(data);
      } catch {
        // Silently fail — scan list is non-critical
      }
    }
    fetchScans();
  }, []);

  // Polling: refresh every 3s while any scan is active
  useEffect(() => {
    const hasActiveScan = scans.some(
      (s) => s.status !== "COMPLETED" && s.status !== "FAILED"
    );

    if (!hasActiveScan) return;

    const interval = setInterval(async () => {
      try {
        const data = await getScans();
        setScans(data);
      } catch {
        // Ignore polling errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [scans]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const scan = await createScan(domain.trim());
      setScans((prev) => [scan, ...prev]);
      setActiveScanId(scan.id);
      setDomain("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to start scan";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Start a New Scan</h1>
        <p className="text-muted-foreground">
          Enter a root domain to discover and scan all public-facing assets for quantum-cryptography
          readiness.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Root Domain
          </CardTitle>
          <CardDescription>
            Krow will discover all subdomains, APIs, and VPN endpoints via certificate transparency
            logs and perform full TLS inspection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              placeholder="e.g. pnb.co.in"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !domain.trim()}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <ScanIcon className="h-4 w-4 mr-2" />
                  Start Scan
                </>
              )}
            </Button>
          </form>
      {error && <p className="text-sm text-destructive mt-3">{error}</p>}
        </CardContent>
      </Card>

      {/* Live Scan Progress */}
      {activeScanId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className={cn("h-5 w-5", !isComplete && "animate-spin")} />
              {isComplete ? "Scan Complete" : "Scanning..."}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {latestEvent?.message || "Initializing..."}
            </p>

            <div className="bg-gray-900 text-green-400 font-mono text-xs rounded-lg p-4 max-h-48 overflow-y-auto">
              {progress.map((p, i) => (
                <div key={i}>[{p.progress}%] {p.message}</div>
              ))}
            </div>

            {isComplete && (
              <Button onClick={() => router.push("/dashboard")}>
                View Results
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Scans */}
      {scans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assets</TableHead>
                  <TableHead>Started</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scans.map((scan) => (
                  <TableRow
                    key={scan.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => scan.status === "COMPLETED" && router.push("/dashboard")}
                  >
                    <TableCell className="font-mono text-sm">{scan.domain}</TableCell>
                    <TableCell><StatusBadge status={scan.status} /></TableCell>
                    <TableCell>{scan.totalAssets || "—"}</TableCell>
                    <TableCell className="text-sm">
                      {scan.startedAt ? formatDate(scan.startedAt) : "Pending"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
