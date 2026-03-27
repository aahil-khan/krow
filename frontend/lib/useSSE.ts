"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Shape rendered in the log console
export interface ScanProgress {
  event: string;
  progress: number;
  message: string;
}

// Raw shape emitted by the backend SSE endpoint
interface BackendScanEvent {
  scanId: string;
  event: string;
  data: Record<string, unknown>;
}

function transformEvent(raw: BackendScanEvent): ScanProgress {
  const { event, data } = raw;
  switch (event) {
    case "discovery_start":
      return { event, progress: 5, message: `Discovering assets for ${data.domain ?? "domain"}...` };
    case "discovery_complete":
      return { event, progress: 10, message: `Found ${data.assetsFound ?? 0} assets` };
    case "asset_scanned": {
      const scanned = Number(data.scannedCount ?? 0);
      const total = Number(data.totalAssets ?? 1);
      const pct = Math.round(10 + (scanned / total) * 70);
      const alive = data.isAlive ? "" : " (unreachable)";
      return { event, progress: pct, message: `Scanned ${data.hostname ?? "asset"}${alive}` };
    }
    case "scoring_complete":
      return { event, progress: 85, message: "Running risk scoring..." };
    case "scan_complete":
      return { event, progress: 100, message: `Scan complete — ${data.totalAssets ?? 0} assets scanned` };
    case "scan_failed":
      return { event, progress: 0, message: `Scan failed: ${String(data.message ?? "unknown error")}` };
    case "connected":
      return { event, progress: 0, message: "Connected to scan stream..." };
    default:
      return { event, progress: 0, message: event };
  }
}

export function useSSE(scanId: string | null) {
  const [progress, setProgress] = useState<ScanProgress[]>([]);
  const [latestEvent, setLatestEvent] = useState<ScanProgress | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (!scanId) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setProgress([]);
    setLatestEvent(null);
    setIsConnected(false);
    setIsComplete(false);

    const es = new EventSource(`/api/scans/${scanId}/progress`);
    eventSourceRef.current = es;

    es.onopen = () => setIsConnected(true);

    es.onmessage = (event) => {
      try {
        const raw: BackendScanEvent = JSON.parse(event.data);
        const transformed = transformEvent(raw);
        setProgress((prev) => [...prev, transformed]);
        setLatestEvent(transformed);

        if (raw.event === "scan_complete" || raw.event === "scan_failed") {
          setIsComplete(true);
          es.close();
          setIsConnected(false);
        }
      } catch {
        // Ignore parse errors (keep-alive comments)
      }
    };

    es.onerror = () => {
      setIsConnected(false);
      es.close();
    };
  }, [scanId]);

  useEffect(() => {
    connect();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connect]);

  return {
    progress,
    latestEvent,
    isConnected,
    isComplete,
    percentComplete: latestEvent?.progress ?? 0,
  };
}
