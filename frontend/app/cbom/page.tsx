"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Download, FileCode, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCbomData, getCbomDownloadUrl, getCbomExcelUrl, getCbomPdfUrl, getScans } from "@/services/api";
import type { Scan } from "@/types";

type CbomComponent = {
  name?: string;
  type?: string;
  version?: string;
  "bom-ref"?: string;
  cryptoProperties?: { assetType?: string };
};

type CbomData = {
  specVersion?: string;
  metadata?: { timestamp?: string };
  components?: CbomComponent[];
};

export default function CbomExplorerPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [scanId, setScanId] = useState<string>("");
  const [cbom, setCbom] = useState<CbomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function bootstrap() {
      try {
        const all = (await getScans()) as Scan[];
        const completed = all.filter((s) => s.status === "COMPLETED");
        setScans(completed);
        if (completed.length === 0) return;
        const first = completed[0]!.id;
        setScanId(first);
        const cbomData = (await getCbomData(first)) as CbomData;
        setCbom(cbomData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load CBOM data");
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  async function onChangeScan(nextScanId: string) {
    setScanId(nextScanId);
    setLoading(true);
    setError(null);
    try {
      const cbomData = (await getCbomData(nextScanId)) as CbomData;
      setCbom(cbomData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load CBOM data");
    } finally {
      setLoading(false);
    }
  }

  const components = cbom?.components ?? [];
  const uniqueTypes = useMemo(
    () => new Set(components.map((c) => c.cryptoProperties?.assetType ?? "unknown")).size,
    [components],
  );

  if (loading && !cbom) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <FileCode className="h-6 w-6" />
          CBOM Explorer
        </h1>
        <p className="text-sm text-muted-foreground">
          Inspect CycloneDX cryptographic components and export artifacts for auditors.
        </p>
      </div>

      {error && (
        <Card>
          <CardContent className="py-6 text-destructive">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scan Selection</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <select
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
            value={scanId}
            onChange={(e) => void onChangeScan(e.target.value)}
          >
            {scans.map((s) => (
              <option key={s.id} value={s.id}>
                {s.domain} ({s.completedAt ? new Date(s.completedAt).toLocaleDateString("en-IN") : "completed"})
              </option>
            ))}
          </select>

          {scanId && (
            <div className="ml-auto flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => window.open(getCbomDownloadUrl(scanId), "_blank")}>
                <Download className="mr-1 h-3.5 w-3.5" />
                JSON
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(getCbomPdfUrl(scanId), "_blank")}>
                <Download className="mr-1 h-3.5 w-3.5" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(getCbomExcelUrl(scanId), "_blank")}>
                <Download className="mr-1 h-3.5 w-3.5" />
                Excel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm">Components</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{components.length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Unique Asset Types</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{uniqueTypes}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Spec Version</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{cbom?.specVersion ?? "—"}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Components {cbom?.metadata?.timestamp ? `· Generated ${new Date(cbom.metadata.timestamp).toLocaleString("en-IN")}` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Asset Type</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>BOM Ref</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {components.map((c, idx) => (
                <TableRow key={`${c["bom-ref"] ?? c.name ?? "component"}-${idx}`}>
                  <TableCell className="font-medium">{c.name ?? "—"}</TableCell>
                  <TableCell>{c.type ?? "—"}</TableCell>
                  <TableCell>{c.cryptoProperties?.assetType ?? "—"}</TableCell>
                  <TableCell>{c.version ?? "—"}</TableCell>
                  <TableCell className="max-w-[320px] truncate font-mono text-xs">{c["bom-ref"] ?? "—"}</TableCell>
                </TableRow>
              ))}
              {components.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No components in selected CBOM.
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

