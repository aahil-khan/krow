"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAsset, getScanDrift } from "@/services/api";
import { Asset, DriftResult } from "@/types";
import { RiskScoreDisplay } from "@/components/dashboard/RiskScoreDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Shield,
  Lock,
  Key,
  FileText,
  AlertTriangle,
  Loader2,
  TrendingUp,
  TrendingDown,
  GitCompare,
} from "lucide-react";
import { classificationLabel, formatDate, classificationBgColor } from "@/lib/formatters";
import { RecommendationPanel } from "@/components/asset/RecommendationPanel";
import { BadgeCard } from "@/components/badge/BadgeCard";

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drift, setDrift] = useState<DriftResult | null>(null);
  const [driftLoading, setDriftLoading] = useState(false);
  const [driftError, setDriftError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAsset() {
      try {
        const data = await getAsset(params.id as string);
        setAsset(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load asset";
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    fetchAsset();
  }, [params.id]);

  const handleCompareDrift = async () => {
    if (!asset) return;
    setDriftLoading(true);
    setDriftError(null);
    try {
      const data = await getScanDrift(asset.scanId);
      setDrift(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load drift data";
      setDriftError(message);
    } finally {
      setDriftLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-3" />
        <p className="text-destructive">{error || "Asset not found"}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const riskScore = asset.riskScore;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-mono">{asset.hostname}</h1>
          <p className="text-sm text-muted-foreground">
            Port {asset.port} · {asset.assetType} · {asset.isAlive ? "Reachable" : "Unreachable"}
          </p>
        </div>
        {riskScore && (
          <RiskScoreDisplay
            score={riskScore.totalScore}
            classification={riskScore.classification}
            size="lg"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: TLS & Cert Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* TLS Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-4 w-4" /> TLS Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">TLS Version</p>
                  <p className="font-medium">{asset.tlsVersion || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Key Exchange</p>
                  <p className="font-medium">{asset.keyExchange || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Preferred Cipher</p>
                  <p className="font-mono text-sm">{asset.preferredCipher || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">JWKS Algorithm</p>
                  <p className="font-medium">{asset.jwksAlgorithm || "Not detected"}</p>
                </div>
              </div>

              {asset.cipherSuites && asset.cipherSuites.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Cipher Suites</p>
                    <div className="flex flex-wrap gap-2">
                      {asset.cipherSuites.map((cipher, i) => (
                        <Badge key={i} variant="outline" className="font-mono text-xs">
                          {cipher}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Certificate Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Certificate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Subject</p>
                  <p className="font-medium">{asset.certSubject || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Issuer</p>
                  <p className="font-medium">{asset.certIssuer || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Signature Algorithm</p>
                  <p className="font-mono text-sm">{asset.certSigAlgo || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Key Size</p>
                  <p className="font-medium">{asset.certKeySize ? `${asset.certKeySize} bits` : "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expires</p>
                  <p className="font-medium">{asset.certExpiry ? formatDate(asset.certExpiry) : "Unknown"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <RecommendationPanel assetId={params.id as string} />        </div>

        {/* Right column: Risk Breakdown */}
        <div className="space-y-6">
          {/* Risk Score Breakdown */}
          {riskScore && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Risk Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center pb-4">
                  <div className="text-4xl font-bold">{riskScore.totalScore}</div>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${classificationBgColor(riskScore.classification)}`}>
                    {classificationLabel(riskScore.classification)}
                  </span>
                </div>

                <Separator />

                <RiskComponentBar label="Key Exchange" score={riskScore.keyExchangeScore} weight={40} />
                <RiskComponentBar label="TLS Version" score={riskScore.tlsVersionScore} weight={15} />
                <RiskComponentBar label="Cert Signature" score={riskScore.certSigAlgoScore} weight={10} />
                <RiskComponentBar label="JWKS Algorithm" score={riskScore.jwksAlgoScore} weight={10} />
                <RiskComponentBar label="Cipher Strength" score={riskScore.cipherStrengthScore} weight={10} />
              </CardContent>
            </Card>
          )}

          {asset.badge && <BadgeCard badge={asset.badge} />}
        </div>
      </div>

      {/* Scan Drift */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GitCompare className="h-4 w-4" /> Scan Drift
            </CardTitle>
            {!drift && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCompareDrift}
                disabled={driftLoading}
              >
                {driftLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <GitCompare className="h-4 w-4 mr-2" />
                )}
                Compare to Baseline
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!drift && !driftLoading && !driftError && (
            <p className="text-sm text-muted-foreground">
              Click &ldquo;Compare to Baseline&rdquo; to detect changes since the last baseline scan.
            </p>
          )}
          {driftError && (
            <p className="text-sm text-destructive">{driftError}</p>
          )}
          {drift && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="rounded-lg bg-muted p-3 text-center">
                  <div className="text-xl font-bold">{drift.summary.totalChanged}</div>
                  <div className="text-xs text-muted-foreground">Changed</div>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <div className="text-xl font-bold">{drift.summary.previousAvgScore.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">Prev Avg</div>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <div className="text-xl font-bold">{drift.summary.currentAvgScore.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">Curr Avg</div>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <div className={`text-xl font-bold ${
                    drift.summary.avgScoreChange < 0 ? "text-green-500" : "text-red-500"
                  }`}>
                    {drift.summary.avgScoreChange > 0 ? "+" : ""}{drift.summary.avgScoreChange.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">Score &Delta;</div>
                </div>
              </div>

              {/* Regressions */}
              {drift.regressions.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1 text-sm font-medium text-red-500 mb-2">
                    <TrendingUp className="h-3.5 w-3.5" /> Regressions ({drift.regressions.length})
                  </h4>
                  <div className="space-y-1">
                    {drift.regressions.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs bg-red-500/10 rounded-md px-3 py-2">
                        <span className="font-mono">{item.hostname}</span>
                        <span>{item.previousScore ?? "—"} → {item.currentScore ?? "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvements */}
              {drift.improvements.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1 text-sm font-medium text-green-500 mb-2">
                    <TrendingDown className="h-3.5 w-3.5" /> Improvements ({drift.improvements.length})
                  </h4>
                  <div className="space-y-1">
                    {drift.improvements.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs bg-green-500/10 rounded-md px-3 py-2">
                        <span className="font-mono">{item.hostname}</span>
                        <span>{item.previousScore ?? "—"} → {item.currentScore ?? "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Assets */}
              {drift.newAssets.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-blue-500 mb-2">
                    New Assets ({drift.newAssets.length})
                  </h4>
                  <div className="space-y-1">
                    {drift.newAssets.map((item, i) => (
                      <div key={i} className="text-xs bg-blue-500/10 rounded-md px-3 py-2 font-mono">
                        {item.hostname}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Removed Assets */}
              {drift.removedAssets.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Removed Assets ({drift.removedAssets.length})
                  </h4>
                  <div className="space-y-1">
                    {drift.removedAssets.map((item, i) => (
                      <div key={i} className="text-xs bg-muted rounded-md px-3 py-2 font-mono">
                        {item.hostname}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RiskComponentBar({ label, score, weight }: { label: string; score: number; weight: number }) {
  const barColor =
    score <= 15 ? "bg-green-500" :
    score <= 40 ? "bg-blue-500" :
    score <= 70 ? "bg-amber-500" :
    "bg-red-500";

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label} <span className="text-muted-foreground">({weight}%)</span></span>
        <span className="font-mono">{score}/100</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
