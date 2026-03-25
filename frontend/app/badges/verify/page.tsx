"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { verifyBadge } from "@/services/api";
import type { Badge } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Shield, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/formatters";

function BadgeVerifyContent() {
  const searchParams = useSearchParams();
  const [badgeId, setBadgeId] = useState(searchParams.get("id") ?? "");
  const [loading, setLoading] = useState(false);
  const [badge, setBadge] = useState<Badge | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verify = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);
    setBadge(null);
    try {
      const result = await verifyBadge(id.trim());
      setBadge(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Badge not found or invalid";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const paramId = searchParams.get("id");
    if (paramId) verify(paramId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isExpired = badge ? new Date(badge.expiresAt) < new Date() : false;
  const isRevoked = badge ? badge.revokedAt !== null : false;
  const isValid = badge ? !isExpired && !isRevoked : false;

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Verify Badge</h1>
        <p className="text-muted-foreground">
          Confirm the authenticity and validity of a PQC compliance badge.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Badge ID
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Enter badge ID..."
              value={badgeId}
              onChange={(e) => setBadgeId(e.target.value)}
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={() => verify(badgeId)} disabled={loading || !badgeId.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-500">
              <XCircle className="h-8 w-8 shrink-0" />
              <div>
                <p className="font-semibold">Verification Failed</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {badge && (
        <Card className={isValid ? "border-green-500/30" : isRevoked ? "border-red-500/30" : "border-amber-500/30"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isValid ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              {isValid ? "Badge Verified" : isRevoked ? "Badge Revoked" : "Badge Expired"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <UiBadge
                className={
                  isValid
                    ? "bg-green-500/10 text-green-500 border-green-500/20 text-sm px-3 py-1"
                    : "bg-red-500/10 text-red-500 border-red-500/20 text-sm px-3 py-1"
                }
              >
                {badge.badgeType === "FULLY_QUANTUM_SAFE" ? "Fully Quantum Safe" : "PQC Ready"}
              </UiBadge>
            </div>

            {badge.qrCodeData && (
              <div className="flex justify-center">
                <img
                  src={badge.qrCodeData}
                  alt="Badge QR Code"
                  className="w-36 h-36 rounded-lg border p-1"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Score</p>
                <p className="font-mono font-medium">{badge.score}/100</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className={isValid ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                  {isValid ? "Valid" : isRevoked ? "Revoked" : "Expired"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Issued</p>
                <p>{formatDate(badge.issuedAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Expires</p>
                <p>{formatDate(badge.expiresAt)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Signature</p>
                <p className="font-mono text-xs break-all">{badge.signature}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function BadgeVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <BadgeVerifyContent />
    </Suspense>
  );
}
