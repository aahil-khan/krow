"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

interface CipherListProps {
  ciphers: string[];
  preferredCipher: string | null;
}

function getCipherStrength(cipher: string): { label: string; color: string } {
  const upper = cipher.toUpperCase();

  // Quantum-safe
  if (upper.includes("ML-KEM") || upper.includes("KYBER")) {
    return { label: "Quantum Safe", color: "bg-green-500/10 text-green-600 border-green-500/20" };
  }
  // Strong classical
  if (upper.includes("AES_256_GCM") || upper.includes("AES-256-GCM")) {
    return { label: "Strong", color: "bg-green-500/10 text-green-600 border-green-500/20" };
  }
  if (upper.includes("CHACHA20") || upper.includes("AES_128_GCM") || upper.includes("AES-128-GCM")) {
    return { label: "Good", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
  }
  // Weak
  if (upper.includes("CBC")) {
    return { label: "Weak", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
  }
  // Broken
  if (upper.includes("RC4") || upper.includes("DES") || upper.includes("3DES") || upper.includes("NULL")) {
    return { label: "Broken", color: "bg-red-500/10 text-red-600 border-red-500/20" };
  }
  // Unknown
  return { label: "Unknown", color: "bg-gray-500/10 text-gray-600 border-gray-500/20" };
}

export function CipherList({ ciphers, preferredCipher }: CipherListProps) {
  if (!ciphers || ciphers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Cipher Suites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No cipher suites detected.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Cipher Suites ({ciphers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cipher Suite</TableHead>
              <TableHead>Strength</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ciphers.map((cipher, index) => {
              const strength = getCipherStrength(cipher);
              const isPreferred = cipher === preferredCipher;

              return (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm">
                    {cipher}
                    {isPreferred && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Preferred
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={strength.color}>
                      {strength.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {strength.label === "Broken" || strength.label === "Weak" ? (
                      <span className="text-xs text-red-500">Needs migration</span>
                    ) : (
                      <span className="text-xs text-green-500">OK</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
