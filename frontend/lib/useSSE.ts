"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface ScanProgress {
  event: string;
  progress: number;
  message: string;
  status?: string;
  assetCount?: number;
  asset?: {
    hostname: string;
    tlsVersion?: string;
    keyExchange?: string;
    score?: number;
    classification?: string;
  };
  summary?: {
    totalAssets: number;
    avgScore: number;
  };
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
        const data: ScanProgress = JSON.parse(event.data);
        setProgress((prev) => [...prev, data]);
        setLatestEvent(data);

        if (data.event === "completed" || data.event === "failed") {
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
