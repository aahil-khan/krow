import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface BadgeVerificationStatusProps {
  signatureValid: boolean;
  expired: boolean;
  revoked: boolean;
}

export function BadgeVerificationStatus({
  signatureValid,
  expired,
  revoked,
}: BadgeVerificationStatusProps) {
  const checks = [
    {
      label: "Digital Signature",
      valid: signatureValid,
      icon: signatureValid ? CheckCircle2 : XCircle,
    },
    {
      label: "Expiry Status",
      valid: !expired,
      icon: expired ? Clock : CheckCircle2,
    },
    {
      label: "Revocation Status",
      valid: !revoked,
      icon: revoked ? XCircle : CheckCircle2,
    },
  ];

  return (
    <div className="space-y-2">
      {checks.map((check) => (
        <div key={check.label} className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{check.label}</span>
          <div className="flex items-center gap-1">
            <check.icon
              className={`h-3.5 w-3.5 ${check.valid ? "text-green-500" : "text-red-500"}`}
            />
            <span
              className={`text-xs font-medium ${check.valid ? "text-green-500" : "text-red-500"}`}
            >
              {check.valid ? "Pass" : "Fail"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
