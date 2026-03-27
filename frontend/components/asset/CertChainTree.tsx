import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ChevronRight } from "lucide-react";

interface CertChainTreeProps {
  subject: string | null;
  issuer: string | null;
  sigAlgo: string | null;
  keySize: number | null;
  expiry: string | null;
}

export function CertChainTree({
  subject,
  issuer,
  sigAlgo,
  keySize,
  expiry,
}: CertChainTreeProps) {
  // Build a simple chain: Issuer (CA) → Subject (Leaf)
  const isExpired = expiry ? new Date(expiry) < new Date() : false;

  const chainNodes: { label: string; role: string; details: string[] }[] = [];

  // Root/Issuer node
  if (issuer && issuer !== subject) {
    chainNodes.push({
      label: issuer,
      role: "Certificate Authority",
      details: ["Issuing CA"],
    });
  }

  // Leaf node
  if (subject) {
    const details: string[] = [];
    if (sigAlgo) details.push(`Signature: ${sigAlgo}`);
    if (keySize) details.push(`Key: ${keySize} bits`);
    if (expiry) {
      const formatted = new Date(expiry).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      details.push(`Expires: ${formatted}`);
    }

    chainNodes.push({
      label: subject,
      role: "Leaf Certificate",
      details,
    });
  }

  if (chainNodes.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4" /> Certificate Chain
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {chainNodes.map((node, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index > 0 && (
                <div className="flex items-center gap-2 pl-4 py-1 text-muted-foreground">
                  <ChevronRight className="h-3 w-3" />
                  <div className="h-px flex-1 bg-border" />
                </div>
              )}

              {/* Node */}
              <div
                className={`border rounded-lg p-3 ${
                  index === chainNodes.length - 1
                    ? isExpired
                      ? "border-red-500/30 bg-red-500/5"
                      : "border-green-500/30 bg-green-500/5"
                    : "border-muted"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{node.label}</span>
                  <Badge variant="outline" className="text-xs">
                    {node.role}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {node.details.map((detail, i) => (
                    <span key={i} className="text-xs text-muted-foreground">
                      {detail}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Expiry warning */}
        {isExpired && (
          <div className="mt-3 p-2 rounded bg-red-500/10 text-red-500 text-xs font-medium">
            ⚠ Certificate has expired
          </div>
        )}
      </CardContent>
    </Card>
  );
}
