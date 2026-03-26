import { Badge } from "@/components/ui/badge";
import { Globe, Code, Shield, Mail } from "lucide-react";

type AssetType = "SUBDOMAIN" | "API" | "VPN" | "MAIL";

interface AssetTypeBadgeProps {
  type: AssetType;
}

const assetTypeConfig: Record<AssetType, { label: string; icon: typeof Globe; color: string }> = {
  SUBDOMAIN: {
    label: "Subdomain",
    icon: Globe,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  API: {
    label: "API",
    icon: Code,
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  VPN: {
    label: "VPN",
    icon: Shield,
    color: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  MAIL: {
    label: "Mail",
    icon: Mail,
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
};

export function AssetTypeBadge({ type }: AssetTypeBadgeProps) {
  const config = assetTypeConfig[type] || assetTypeConfig.SUBDOMAIN;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.color} gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
