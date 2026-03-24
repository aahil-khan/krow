import type { Metadata } from "next";
import { Geist } from "next/font/google";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Krow — Quantum-Safe Scanner",
  description: "Quantum-Safe Cryptographic Scanner & CBOM Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
