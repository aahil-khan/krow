"use client";

import type { Badge as BadgeType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/formatters";

interface BadgeCardProps {
  badge: BadgeType;
}

export function BadgeCard({ badge }: BadgeCardProps) {
  const isExpired = new Date(badge.expiresAt) < new Date();
  const isRevoked = badge.revokedAt !== null;
  const isValid = !isExpired && !isRevoked;

  return (
    <Card className={isValid ? "border-green-500/30" : "border-red-500/30"}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className={`h-5 w-5 ${isValid ? "text-green-500" : "text-red-500"}`} />
          PQC Compliance Badge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Badge Type */}
        <div className="text-center">
          <Badge
            className={
              badge.badgeType === "FULLY_QUANTUM_SAFE"
                ? "bg-green-500/10 text-green-500 border-green-500/20 text-sm px-3 py-1"
                : "bg-blue-500/10 text-blue-500 border-blue-500/20 text-sm px-3 py-1"
            }
          >
            {badge.badgeType === "FULLY_QUANTUM_SAFE" ? "Fully Quantum Safe" : "PQC Ready"}
          </Badge>
        </div>

        {/* QR Code */}
        {badge.qrCodeData && (
          <div className="flex justify-center">
            <img
              src={badge.qrCodeData}
              alt="Badge Verification QR Code"
              className="w-40 h-40 rounded-lg border p-1"
            />
          </div>
        )}

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Score</span>
            <span className="font-mono font-medium">{badge.score}/100</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Issued</span>
            <span>{formatDate(badge.issuedAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Expires</span>
            <span>{formatDate(badge.expiresAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Signature</span>
            <span className="font-mono text-xs truncate max-w-37.5">{badge.signature.slice(0, 16)}...</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Status</span>
            <div className="flex items-center gap-1">
              {isValid ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-green-500 text-xs font-medium">Valid</span>
                </>
              ) : (
                <>
                  <Clock className="h-3.5 w-3.5 text-red-500" />
                  <span className="text-red-500 text-xs font-medium">
                    {isRevoked ? "Revoked" : "Expired"}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
