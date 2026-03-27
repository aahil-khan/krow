"use client";

import { ResponsiveRadialBar } from "@nivo/radial-bar";

interface CyberScoreGaugeProps {
  score: number; // 0-1000
}

export default function CyberScoreGauge({ score }: CyberScoreGaugeProps) {
  const color = score >= 700 ? "#10b981" : score >= 400 ? "#f59e0b" : "#f43f5e";
  const label = score >= 700 ? "Elite PQC" : score >= 400 ? "Standard" : "Legacy";

  return (
    <div className="relative w-full h-full min-h-65">
      <ResponsiveRadialBar
        data={[
          {
            id: "score",
            data: [{ x: "Score", y: score }],
          },
        ]}
        maxValue={1000}
        startAngle={-135}
        endAngle={135}
        innerRadius={0.65}
        padding={0.3}
        cornerRadius={4}
        colors={[color]}
        tracksColor="rgba(255,255,255,0.05)"
        enableRadialGrid={false}
        enableCircularGrid={false}
        radialAxisStart={null}
        circularAxisOuter={null}
        isInteractive={false}
      />
      {/* Center overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-5xl font-bold tabular-nums" style={{ color }}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground mt-1">/ 1000</span>
        <span className="text-xs font-semibold mt-2 px-2 py-0.5 rounded-full" style={{ color, backgroundColor: `${color}20` }}>
          {label}
        </span>
      </div>
    </div>
  );
}
