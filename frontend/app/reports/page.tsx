"use client";

import { useEffect, useState } from "react";
import { getScans } from "@/services/api";
import type { Scan } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, Loader2, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/formatters";

export default function ReportsPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getScans()
      .then((data: Scan[]) => setScans(data.filter((s) => s.status === "COMPLETED")))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Failed to load scans";
        setError(message);
      })
      .finally(() => setLoading(false));
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

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Compliance Reports
        </h1>
        <p className="text-sm text-muted-foreground">
          Download quantum readiness compliance reports for completed scans
        </p>
      </div>

      {scans.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No completed scans yet. Run a scan first to generate compliance reports.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {scans.map((scan) => {
            return (
              <Card key={scan.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold font-mono">{scan.domain}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {scan.completedAt ? formatDate(scan.completedAt) : "—"}
                      </span>
                      <span>{scan.totalAssets} assets</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/api/scans/${scan.id}/cbom`, "_blank")}
                    >
                      JSON
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open(`/api/scans/${scan.id}/report`, "_blank")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
