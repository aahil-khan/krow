"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, Scan, FileText, BarChart3 } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8">
      {/* Hero */}
      <div className="space-y-4 max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
          <Shield className="h-4 w-4" />
          Post-Quantum Cryptography Scanner
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Is your infrastructure{" "}
          <span className="text-primary">quantum-safe</span>?
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Krow discovers, scans, and scores every TLS endpoint across your domain for
          quantum-cryptography readiness — before it&apos;s too late.
        </p>
      </div>

      {/* CTA */}
      <div className="flex gap-3">
        <Button size="lg" onClick={() => router.push("/scan")}>
          Get Started <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        <Button size="lg" variant="outline" onClick={() => router.push("/dashboard")}>
          View Dashboard
        </Button>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-3xl w-full">
        <div className="rounded-xl border bg-card p-6 text-left space-y-2">
          <Scan className="h-8 w-8 text-blue-500" />
          <h3 className="font-semibold">Auto-Discovery</h3>
          <p className="text-sm text-muted-foreground">
            Discovers all subdomains, APIs, and VPN endpoints via certificate transparency logs.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 text-left space-y-2">
          <BarChart3 className="h-8 w-8 text-amber-500" />
          <h3 className="font-semibold">Risk Scoring</h3>
          <p className="text-sm text-muted-foreground">
            Scores each asset 0–100 across 5 cryptographic components with NIST-aligned weights.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 text-left space-y-2">
          <FileText className="h-8 w-8 text-green-500" />
          <h3 className="font-semibold">CBOM & Compliance</h3>
          <p className="text-sm text-muted-foreground">
            Generates Cryptographic Bill of Materials and one-click compliance reports.
          </p>
        </div>
      </div>
    </div>
  );
}
