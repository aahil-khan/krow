"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  FileCode,
  FileText,
  Gauge,
  LayoutDashboard,
  Radar,
  Server,
  Shield,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";

const overviewItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Scan", path: "/scan", icon: Radar },
];

const analysisItems = [
  { label: "Asset Inventory", path: "/assets", icon: Server },
  { label: "CBOM Explorer", path: "/cbom", icon: FileCode },
  { label: "PQC Posture", path: "/posture", icon: ShieldCheck },
  { label: "Cyber Rating", path: "/rating", icon: Gauge },
];

const complianceItems = [
  { label: "Reports", path: "/reports", icon: FileText },
  { label: "Badge Verify", path: "/badges/verify", icon: BadgeCheck },
];

function NavSection({ title, items, pathname }: { title: string; items: typeof overviewItems; pathname: string }) {
  return (
    <div className="mb-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 mb-2">
        {title}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "text-cyan-400 bg-cyan-400/10"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 rounded-r-full bg-cyan-400" />
              )}
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/8 bg-sidebar min-h-screen p-4 flex flex-col">
      {/* Logo */}
      <div className="mb-8 px-3 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-cyan-400/10 flex items-center justify-center">
          <Shield className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">KROW</h1>
          <p className="text-[10px] text-muted-foreground leading-tight">Quantum Security Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1">
        <NavSection title="Overview" items={overviewItems} pathname={pathname} />
        <NavSection title="Analysis" items={analysisItems} pathname={pathname} />
        <NavSection title="Compliance" items={complianceItems} pathname={pathname} />
      </nav>

      {/* Footer */}
      <div className="border-t border-white/8 pt-4 mt-4 px-3">
        <p className="text-[10px] text-muted-foreground/60">v1.0 &middot; PSB Hackathon 2026</p>
      </div>
    </aside>
  );
}
