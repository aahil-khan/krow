"use client";

import { RiskClassification } from "@/types";
import { classificationLabel } from "@/lib/formatters";

interface HeatmapCellProps {
  hostname: string;
  score: number;
  classification: RiskClassification;
  onClick?: () => void;
}

function getScoreColor(score: number): string {
  if (score <= 15) return "bg-green-500 hover:bg-green-600";
  if (score <= 40) return "bg-blue-500 hover:bg-blue-600";
  if (score <= 70) return "bg-amber-500 hover:bg-amber-600";
  return "bg-red-500 hover:bg-red-600";
}

export function HeatmapCell({ hostname, score, classification, onClick }: HeatmapCellProps) {
  const shortName = hostname.split(".")[0];

  return (
    <button
      onClick={onClick}
      className={`
        ${getScoreColor(score)}
        rounded-md p-2 text-white text-xs font-mono
        transition-colors cursor-pointer
        flex flex-col items-center justify-center min-h-15
      `}
      title={`${hostname} — Score: ${score}/100 (${classificationLabel(classification)})`}
    >
      <span className="truncate w-full text-center">{shortName}</span>
      <span className="font-bold text-sm">{score}</span>
    </button>
  );
}
