"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

interface RiskBreakdownProps {
  tlsVersionScore: number;
  certSigAlgoScore: number;
  keyExchangeScore: number;
  jwksAlgoScore: number;
  cipherStrengthScore: number;
  totalScore: number;
}

const components = [
  { key: "keyExchangeScore" as const, label: "Key Exchange", weight: 40 },
  { key: "tlsVersionScore" as const, label: "TLS Version", weight: 15 },
  { key: "certSigAlgoScore" as const, label: "Certificate Signature", weight: 10 },
  { key: "jwksAlgoScore" as const, label: "JWKS Algorithm", weight: 10 },
  { key: "cipherStrengthScore" as const, label: "Cipher Strength", weight: 10 },
];

function getBarColor(score: number): string {
  if (score <= 15) return "bg-green-500";
  if (score <= 40) return "bg-blue-500";
  if (score <= 70) return "bg-amber-500";
  return "bg-red-500";
}

function getScoreLabel(score: number): string {
  if (score <= 15) return "Safe";
  if (score <= 40) return "Ready";
  if (score <= 70) return "At Risk";
  return "Vulnerable";
}

export function RiskBreakdown({
  tlsVersionScore,
  certSigAlgoScore,
  keyExchangeScore,
  jwksAlgoScore,
  cipherStrengthScore,
  totalScore,
}: RiskBreakdownProps) {
  const scores: Record<string, number> = {
    keyExchangeScore,
    tlsVersionScore,
    certSigAlgoScore,
    jwksAlgoScore,
    cipherStrengthScore,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Risk Score Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Score */}
        <div className="text-center pb-2 border-b">
          <div className="text-3xl font-bold">{totalScore}</div>
          <p className="text-sm text-muted-foreground">out of 100 (lower is better)</p>
        </div>

        {/* Component Bars */}
        {components.map((comp) => {
          const score = scores[comp.key];
          return (
            <div key={comp.key}>
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="font-medium">
                  {comp.label}
                  <span className="text-muted-foreground ml-1">({comp.weight}%)</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{getScoreLabel(score)}</span>
                  <span className="font-mono text-sm font-medium w-12 text-right">{score}/100</span>
                </div>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getBarColor(score)}`}
                  style={{ width: `${Math.max(score, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
