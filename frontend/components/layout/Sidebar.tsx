"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  Scan,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "New Scan", path: "/scan", icon: Scan },
  { label: "Reports", path: "/reports", icon: FileText },
  { label: "Badge Verify", path: "/badges/verify", icon: ShieldCheck },
  { label: "CISO View", path: "/ciso", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card min-h-screen p-4 flex flex-col">
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold tracking-tight">Krow</h1>
        <p className="text-xs text-muted-foreground mt-1">Quantum-Safe Scanner</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t pt-4 mt-4">
        <p className="text-xs text-muted-foreground px-2">PSB Hackathon 2026</p>
        <p className="text-xs text-muted-foreground px-2">Team Krow</p>
      </div>
    </aside>
  );
}
