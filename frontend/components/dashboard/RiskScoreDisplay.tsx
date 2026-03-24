import { cn } from "@/lib/utils";
import type { RiskClassification } from "@/types";

interface RiskScoreDisplayProps {
  score: number;
  classification: RiskClassification;
  size?: "sm" | "md" | "lg";
}

function getClassificationColor(c: RiskClassification): string {
  switch (c) {
    case "FULLY_QUANTUM_SAFE": return "text-green-500 bg-green-500/10 border-green-500/20";
    case "PQC_READY": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    case "PARTIALLY_SAFE": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    case "VULNERABLE": return "text-red-500 bg-red-500/10 border-red-500/20";
  }
}

function getClassificationLabel(c: RiskClassification): string {
  switch (c) {
    case "FULLY_QUANTUM_SAFE": return "Fully Quantum Safe";
    case "PQC_READY": return "PQC Ready";
    case "PARTIALLY_SAFE": return "Partially Safe";
    case "VULNERABLE": return "Vulnerable";
  }
}

export default function RiskScoreDisplay({ score, classification, size = "md" }: RiskScoreDisplayProps) {
  const sizeClasses = {
    sm: "h-10 w-10 text-sm",
    md: "h-16 w-16 text-xl",
    lg: "h-24 w-24 text-3xl",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "rounded-full border-2 flex items-center justify-center font-bold",
          sizeClasses[size],
          getClassificationColor(classification)
        )}
      >
        {Math.round(score)}
      </div>
      {size !== "sm" && (
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full border",
            getClassificationColor(classification)
          )}
        >
          {getClassificationLabel(classification)}
        </span>
      )}
    </div>
  );
}
