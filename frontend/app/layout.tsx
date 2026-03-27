import type { Metadata } from "next";
import { Geist } from "next/font/google";

import LayoutShell from "@/components/layout/LayoutShell";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Krow — Quantum-Safe Scanner",
  description: "Quantum-Safe Cryptographic Scanner & CBOM Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={geist.className}>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
