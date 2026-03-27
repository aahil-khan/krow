"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PeerBenchmarkProps {
  organizationScore: number;
  organizationName?: string;
}

const benchmarks = [
  { name: "Banking Average", score: 62 },
  { name: "Insurance Average", score: 58 },
  { name: "Fintech Average", score: 45 },
  { name: "Government Average", score: 72 },
];

export function PeerBenchmark({ organizationScore, organizationName = "Your Organization" }: PeerBenchmarkProps) {
  const allEntries = [
    { name: organizationName, score: organizationScore, isOrg: true },
    ...benchmarks.map((b) => ({ ...b, isOrg: false })),
  ].sort((a, b) => a.score - b.score);

  const maxScore = 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Industry Peer Comparison</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {allEntries.map((entry) => (
          <div key={entry.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className={entry.isOrg ? "font-semibold text-blue-500" : "text-muted-foreground"}>
                {entry.name}
              </span>
              <span className={entry.isOrg ? "font-semibold" : "text-muted-foreground"}>
                {entry.score}/100
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  entry.isOrg
                    ? "bg-blue-500"
                    : entry.score <= 40
                      ? "bg-green-500"
                      : entry.score <= 70
                        ? "bg-amber-500"
                        : "bg-red-500"
                }`}
                style={{ width: `${(entry.score / maxScore) * 100}%` }}
              />
            </div>
          </div>
        ))}
        <p className="text-xs text-muted-foreground mt-4">
          Lower scores indicate better quantum readiness. Benchmarks are based on PSB 2026 industry data.
        </p>
      </CardContent>
    </Card>
  );
}
