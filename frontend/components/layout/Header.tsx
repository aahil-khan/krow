"use client";

import { usePathname } from "next/navigation";
import { Bell, ChevronRight, User } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/": "Welcome",
  "/dashboard": "Portfolio Dashboard",
  "/scan": "New Scan",
  "/assets": "Asset Inventory",
  "/cbom": "CBOM Explorer",
  "/posture": "PQC Posture",
  "/rating": "Cyber Rating",
  "/reports": "Reports & Compliance",
  "/badges/verify": "Badge Verification",
  "/ciso": "CISO Executive View",
};

export default function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Krow";

  // Build breadcrumb segments
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="h-14 border-b border-white/8 bg-card flex items-center px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm">
        <span className="text-muted-foreground">Krow</span>
        {segments.map((seg, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
            <span className={i === segments.length - 1 ? "text-foreground font-medium" : "text-muted-foreground"}>
              {pageTitles["/" + segments.slice(0, i + 1).join("/")] || seg.charAt(0).toUpperCase() + seg.slice(1)}
            </span>
          </span>
        ))}
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        <button className="relative p-2 rounded-md hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400" />
        </button>
        <div className="h-8 w-8 rounded-full bg-cyan-400/20 flex items-center justify-center">
          <User className="h-4 w-4 text-cyan-400" />
        </div>
      </div>
    </header>
  );
}
