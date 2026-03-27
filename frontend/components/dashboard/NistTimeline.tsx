"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface NistTimelineProps {
  hasQuantumSafeAssets: boolean;
  hasPqcReadyAssets: boolean;
  allQuantumSafe: boolean;
}

const milestones = [
  {
    year: "2024",
    title: "FIPS 203/204/205 Published",
    description: "ML-KEM, ML-DSA, SLH-DSA standards finalized by NIST",
    status: "completed" as const,
  },
  {
    year: "2025",
    title: "Inventory & Assessment",
    description: "Identify all cryptographic assets and assess quantum vulnerability",
    statusKey: "hasPqcReadyAssets" as const,
  },
  {
    year: "2026",
    title: "Hybrid Migration",
    description: "Deploy hybrid key exchange (classical + PQC) on critical systems",
    statusKey: "hasQuantumSafeAssets" as const,
  },
  {
    year: "2028",
    title: "Full PQC Deployment",
    description: "Complete migration to quantum-safe algorithms across all assets",
    statusKey: "allQuantumSafe" as const,
  },
  {
    year: "2030",
    title: "Legacy Deprecation",
    description: "Disable all classical-only cryptographic algorithms",
    status: "future" as const,
  },
];

export function NistTimeline({
  hasQuantumSafeAssets,
  hasPqcReadyAssets,
  allQuantumSafe,
}: NistTimelineProps) {
  const statusMap = { hasQuantumSafeAssets, hasPqcReadyAssets, allQuantumSafe };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">NIST PQC Migration Roadmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {milestones.map((milestone, index) => {
            let status: "completed" | "current" | "future";
            if (milestone.status) {
              status = milestone.status;
            } else if (milestone.statusKey && statusMap[milestone.statusKey]) {
              status = "completed";
            } else {
              status = "future";
            }

            return (
              <div key={milestone.year} className="flex gap-4">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  {status === "completed" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  ) : status === "current" ? (
                    <Clock className="h-5 w-5 text-amber-500 shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                  {index < milestones.length - 1 && (
                    <div className={`w-0.5 h-full min-h-8 ${status === "completed" ? "bg-green-500" : "bg-muted"}`} />
                  )}
                </div>

                {/* Content */}
                <div className="pb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{milestone.year}</span>
                    <span className="font-medium text-sm">{milestone.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{milestone.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
