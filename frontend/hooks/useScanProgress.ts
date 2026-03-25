import { useEffect, useRef, useState } from "react";

export interface ScanProgressEvent {
  event: string;
  progress: number;
  message?: string;
  asset?: {
    hostname: string;
    tlsVersion?: string;
    score?: number;
  };
}

export function useScanProgress(scanId: string | null) {
  const [progress, setProgress] = useState(0);
  const [events, setEvents] = useState<ScanProgressEvent[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!scanId) return;

    setProgress(0);
    setEvents([]);
    setIsComplete(false);

    const es = new EventSource(`/api/scans/${scanId}/progress`);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const data: ScanProgressEvent = JSON.parse(e.data);
        setProgress(data.progress ?? 0);
        setEvents((prev) => [...prev, data].slice(-50));
        if (data.event === "completed" || data.event === "failed") {
          setIsComplete(true);
          es.close();
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      setIsComplete(true);
      es.close();
    };

    return () => {
      es.close();
    };
  }, [scanId]);

  return { progress, events, isComplete };
}
