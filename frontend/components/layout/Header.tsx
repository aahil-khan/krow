"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Portfolio Dashboard",
  "/scan": "New Scan",
  "/reports": "Reports & CBOM",
  "/badges/verify": "Badge Verification",
  "/ciso": "CISO Executive View",
};

export default function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Krow";

  return (
    <header className="h-14 border-b bg-card flex items-center px-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="ml-auto flex items-center gap-4">
        <span className="text-sm text-muted-foreground">v1.0</span>
      </div>
    </header>
  );
}
