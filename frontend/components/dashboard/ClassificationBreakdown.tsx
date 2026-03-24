import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RiskClassification } from "@/types";

interface ClassificationBreakdownProps {
  data: Record<RiskClassification, number>;
  total: number;
}

const classConfig: { key: RiskClassification; label: string; color: string }[] = [
  { key: "FULLY_QUANTUM_SAFE", label: "Fully Quantum Safe", color: "bg-green-500" },
  { key: "PQC_READY", label: "PQC Ready", color: "bg-blue-500" },
  { key: "PARTIALLY_SAFE", label: "Partially Safe", color: "bg-amber-500" },
  { key: "VULNERABLE", label: "Vulnerable", color: "bg-red-500" },
];

export default function ClassificationBreakdown({ data, total }: ClassificationBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Risk Classification Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {classConfig.map(({ key, label, color }) => {
          const count = data[key] || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <div key={key} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{count} ({pct}%)</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
