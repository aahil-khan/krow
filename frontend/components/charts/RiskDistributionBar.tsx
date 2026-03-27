"use client";

import { ResponsiveBar } from "@nivo/bar";
import { HeatmapEntry } from "@/types";

interface RiskDistributionBarProps {
  assets: HeatmapEntry[];
}

export default function RiskDistributionBar({ assets }: RiskDistributionBarProps) {
  const buckets = [
    { range: "Safe (0-25)", min: 0, max: 25, color: "#10b981" },
    { range: "Low (25-50)", min: 25, max: 50, color: "#22d3ee" },
    { range: "Medium (50-75)", min: 50, max: 75, color: "#f59e0b" },
    { range: "High (75-100)", min: 75, max: 100, color: "#f43f5e" },
  ];

  const data = buckets.map((b) => ({
    range: b.range,
    count: assets.filter((a) => a.score >= b.min && a.score < (b.max === 100 ? 101 : b.max)).length,
    color: b.color,
  }));

  return (
    <div className="w-full h-full min-h-70">
      <ResponsiveBar
        data={data}
        keys={["count"]}
        indexBy="range"
        layout="horizontal"
        margin={{ top: 10, right: 30, bottom: 30, left: 120 }}
        padding={0.35}
        colors={({ data }) => data.color as string}
        borderRadius={4}
        enableGridX={true}
        enableGridY={false}
        gridXValues={4}
        axisLeft={{
          tickSize: 0,
          tickPadding: 12,
        }}
        axisBottom={{
          tickSize: 0,
          tickPadding: 8,
        }}
        labelSkipWidth={24}
        labelTextColor="#020617"
        theme={{
          text: { fill: "#94a3b8" },
          axis: {
            ticks: { text: { fill: "#94a3b8", fontSize: 12 } },
          },
          grid: {
            line: { stroke: "rgba(255,255,255,0.05)" },
          },
          tooltip: {
            container: {
              background: "#0f172a",
              color: "#e2e8f0",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.08)",
            },
          },
        }}
      />
    </div>
  );
}
