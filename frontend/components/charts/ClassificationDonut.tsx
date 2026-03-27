"use client";

import { ResponsivePie } from "@nivo/pie";
import { RiskClassification } from "@/types";

interface ClassificationDonutProps {
  data: Record<RiskClassification, number>;
  total: number;
}

const classColors: Record<RiskClassification, string> = {
  FULLY_QUANTUM_SAFE: "#10b981",
  PQC_READY: "#22d3ee",
  PARTIALLY_SAFE: "#f59e0b",
  VULNERABLE: "#f43f5e",
};

const classLabels: Record<RiskClassification, string> = {
  FULLY_QUANTUM_SAFE: "Quantum Safe",
  PQC_READY: "PQC Ready",
  PARTIALLY_SAFE: "Partially Safe",
  VULNERABLE: "Vulnerable",
};

export default function ClassificationDonut({ data, total }: ClassificationDonutProps) {
  const pieData = (Object.keys(data) as RiskClassification[])
    .filter((key) => data[key] > 0)
    .map((key) => ({
      id: classLabels[key],
      label: classLabels[key],
      value: data[key],
      color: classColors[key],
    }));

  return (
    <div className="relative w-full h-full min-h-70">
      <ResponsivePie
        data={pieData}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        innerRadius={0.6}
        padAngle={2}
        cornerRadius={4}
        activeOuterRadiusOffset={4}
        colors={{ datum: "data.color" }}
        borderWidth={0}
        enableArcLinkLabels={false}
        arcLabelsSkipAngle={20}
        arcLabelsTextColor="#020617"
        theme={{
          text: { fill: "#94a3b8" },
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
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold text-foreground">{total}</span>
        <span className="text-xs text-muted-foreground">Assets</span>
      </div>
    </div>
  );
}
