"use client";

import { useEffect, useState } from "react";
import { getRecommendation } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Brain, Loader2, AlertTriangle } from "lucide-react";

interface Recommendation {
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  component: string;
  currentValue: string;
  targetValue: string;
  action: string;
  rationale: string;
}

interface RecommendationData {
  summary: string;
  recommendations: Recommendation[];
  migrationTimeline: string;
  complianceNotes: string;
  isFallback: boolean;
}

const priorityColors: Record<string, string> = {
  CRITICAL: "bg-red-500/10 text-red-500 border-red-500/20",
  HIGH: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  MEDIUM: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  LOW: "bg-green-500/10 text-green-500 border-green-500/20",
};

interface RecommendationPanelProps {
  assetId: string;
}

export function RecommendationPanel({ assetId }: RecommendationPanelProps) {
  const [data, setData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await getRecommendation(assetId);
        setData(result);
      } catch {
        setError("Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [assetId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
          <span className="text-muted-foreground">Generating recommendations...</span>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
          <span className="text-destructive">{error}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-4 w-4" /> Migration Recommendations
          {data.isFallback && (
            <Badge variant="outline" className="text-xs font-normal ml-2">
              Rule-based
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <p className="text-sm text-muted-foreground">{data.summary}</p>

        <Separator />

        {/* Recommendations */}
        <div className="space-y-3">
          {data.recommendations.map((rec, i) => (
            <div key={i} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={priorityColors[rec.priority]}>
                    {rec.priority}
                  </Badge>
                  <span className="font-medium text-sm">{rec.component}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Current:</span>{" "}
                  <span className="font-mono">{rec.currentValue}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Target:</span>{" "}
                  <span className="font-mono text-green-500">{rec.targetValue}</span>
                </div>
              </div>
              <p className="text-sm">{rec.action}</p>
              <p className="text-xs text-muted-foreground italic">{rec.rationale}</p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Timeline & Compliance */}
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Migration Timeline</p>
            <p className="font-medium">{data.migrationTimeline}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Compliance Notes</p>
            <p className="text-xs">{data.complianceNotes}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
