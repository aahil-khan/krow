"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Plus, Minus, ArrowRight } from "lucide-react";
import type { DriftResult } from "@/types";
import { classificationBgColor } from "@/lib/formatters";

interface DriftEntry {
  hostname: string;
  previousScore: number;
  currentScore: number;
  previousClassification?: string;
  currentClassification?: string;
}

interface DriftSummaryProps {
  data: {
    regressions: DriftEntry[];
    improvements: DriftEntry[];
    newAssets: DriftEntry[];
    removedAssets: string[];
    avgScoreChange: number;
    previousAvgScore: number;
    currentAvgScore: number;
  };
}

export function DriftSummary({ data }: DriftSummaryProps) {
  const { regressions, improvements, newAssets, removedAssets, avgScoreChange, previousAvgScore, currentAvgScore } = data;
  const scoreImproved = avgScoreChange < 0;

  return (
    <div className="space-y-6">
      {/* Score comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Score Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{previousAvgScore}</div>
              <div className="text-xs text-muted-foreground">Baseline</div>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
            <div className="text-center">
              <div className="text-3xl font-bold">{currentAvgScore}</div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
              scoreImproved ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
            }`}>
              {scoreImproved ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
              {Math.abs(avgScoreChange)} pts
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-red-500/30">
          <CardContent className="py-3 text-center">
            <TrendingUp className="h-4 w-4 text-red-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-red-500">{regressions.length}</div>
            <div className="text-xs text-muted-foreground">Regressions</div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30">
          <CardContent className="py-3 text-center">
            <TrendingDown className="h-4 w-4 text-green-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-green-500">{improvements.length}</div>
            <div className="text-xs text-muted-foreground">Improvements</div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30">
          <CardContent className="py-3 text-center">
            <Plus className="h-4 w-4 text-blue-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-blue-500">{newAssets.length}</div>
            <div className="text-xs text-muted-foreground">New Assets</div>
          </CardContent>
        </Card>
        <Card className="border-gray-500/30">
          <CardContent className="py-3 text-center">
            <Minus className="h-4 w-4 text-gray-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-gray-500">{removedAssets.length}</div>
            <div className="text-xs text-muted-foreground">Removed</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed lists */}
      {regressions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-red-500 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Regressions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {regressions.map((item) => (
                <div key={item.hostname} className="flex items-center justify-between text-sm border-b pb-2">
                  <span className="font-mono">{item.hostname}</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-500">
                      {item.previousScore}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-500">
                      {item.currentScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {improvements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-green-500 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" /> Improvements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {improvements.map((item) => (
                <div key={item.hostname} className="flex items-center justify-between text-sm border-b pb-2">
                  <span className="font-mono">{item.hostname}</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-500">
                      {item.previousScore}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-500">
                      {item.currentScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {newAssets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-blue-500 flex items-center gap-2">
              <Plus className="h-4 w-4" /> New Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {newAssets.map((item) => (
                <div key={item.hostname} className="flex items-center justify-between text-sm border-b pb-2">
                  <span className="font-mono">{item.hostname}</span>
                  <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-500">
                    {item.currentScore ?? "—"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
