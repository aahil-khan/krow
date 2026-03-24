import { cn } from "@/lib/utils";
import type { ScanStatus } from "@/types";
import { Loader2, CheckCircle2, XCircle, Clock, Search, BarChart3, FileText } from "lucide-react";

interface StatusBadgeProps {
  status: ScanStatus;
}

const statusConfig: Record<ScanStatus, { label: string; color: string; Icon: React.ElementType }> = {
  PENDING: { label: "Pending", color: "text-gray-500 bg-gray-500/10", Icon: Clock },
  DISCOVERING: { label: "Discovering", color: "text-blue-500 bg-blue-500/10", Icon: Search },
  SCANNING: { label: "Scanning", color: "text-indigo-500 bg-indigo-500/10", Icon: Loader2 },
  ANALYZING: { label: "Analyzing", color: "text-purple-500 bg-purple-500/10", Icon: BarChart3 },
  GENERATING_REPORTS: { label: "Generating", color: "text-amber-500 bg-amber-500/10", Icon: FileText },
  COMPLETED: { label: "Completed", color: "text-green-500 bg-green-500/10", Icon: CheckCircle2 },
  FAILED: { label: "Failed", color: "text-red-500 bg-red-500/10", Icon: XCircle },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  const isAnimated = status === "SCANNING" || status === "DISCOVERING";

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", config.color)}>
      <config.Icon className={cn("h-3 w-3", isAnimated && "animate-spin")} />
      {config.label}
    </span>
  );
}
