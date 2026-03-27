import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 space-y-4", className)}>
      <Icon className="h-12 w-12 text-muted-foreground" />
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground text-center max-w-md">{description}</p>
      {action}
    </div>
  );
}
