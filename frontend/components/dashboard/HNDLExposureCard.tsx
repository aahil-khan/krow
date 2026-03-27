"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Lock, Unlock } from "lucide-react";

interface HNDLExposureCardProps {
  totalAssets: number;
  vulnerableAssets: number;
  vulnerableHostnames: string[];
}

export function HNDLExposureCard({
  totalAssets,
  vulnerableAssets,
  vulnerableHostnames,
}: HNDLExposureCardProps) {
  const exposurePercent = totalAssets > 0 ? Math.round((vulnerableAssets / totalAssets) * 100) : 0;
  const isHigh = exposurePercent > 30;

  return (
    <Card className={isHigh ? "border-red-500/50" : "border-green-500/50"}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          {isHigh ? (
            <Unlock className="h-5 w-5 text-red-500" />
          ) : (
            <Lock className="h-5 w-5 text-green-500" />
          )}
          HNDL Exposure
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Exposure bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Exposure Level</span>
            <span className={isHigh ? "text-red-500 font-semibold" : "text-green-500 font-semibold"}>
              {exposurePercent}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${isHigh ? "bg-red-500" : "bg-green-500"}`}
              style={{ width: `${exposurePercent}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Vulnerable: </span>
            <span className="font-medium">{vulnerableAssets}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total: </span>
            <span className="font-medium">{totalAssets}</span>
          </div>
        </div>

        {/* Vulnerable hostnames */}
        {vulnerableHostnames.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              At-risk endpoints:
            </p>
            <ul className="text-xs space-y-0.5">
              {vulnerableHostnames.slice(0, 5).map((h) => (
                <li key={h} className="text-red-400 font-mono">• {h}</li>
              ))}
              {vulnerableHostnames.length > 5 && (
                <li className="text-muted-foreground">
                  +{vulnerableHostnames.length - 5} more
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
