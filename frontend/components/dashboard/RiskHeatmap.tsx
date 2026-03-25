"use client";

import { HeatmapEntry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

function getHeatmapColor(score: number): string {
  if (score <= 15) return "bg-green-500";
  if (score <= 40) return "bg-blue-500";
  if (score <= 70) return "bg-amber-500";
  return "bg-red-500";
}

function getHeatmapHoverColor(score: number): string {
  if (score <= 15) return "hover:bg-green-600";
  if (score <= 40) return "hover:bg-blue-600";
  if (score <= 70) return "hover:bg-amber-600";
  return "hover:bg-red-600";
}

interface RiskHeatmapProps {
  assets: HeatmapEntry[];
}

export function RiskHeatmap({ assets }: RiskHeatmapProps) {
  const router = useRouter();

  if (assets.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {assets.map((asset) => (
            <button
              key={asset.id}
              onClick={() => router.push(`/assets/${asset.id}`)}
              className={`
                ${getHeatmapColor(asset.score)}
                ${getHeatmapHoverColor(asset.score)}
                rounded-md p-2 text-white text-xs font-mono
                transition-colors cursor-pointer
                flex flex-col items-center justify-center min-h-15
              `}
              title={`${asset.hostname} — Score: ${asset.score}`}
            >
              <span className="truncate w-full text-center">
                {asset.hostname.split(".")[0]}
              </span>
              <span className="font-bold text-sm">{asset.score}</span>
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" /> 0–15 Safe
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500" /> 16–40 Ready
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-500" /> 41–70 Partial
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" /> 71–100 Vulnerable
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
