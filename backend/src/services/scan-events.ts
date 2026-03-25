import { EventEmitter } from "events";

// Global event emitter for scan progress within this Node process.
export const scanEvents = new EventEmitter();
scanEvents.setMaxListeners(50);

export type ScanProgressEvent =
  | {
      scanId: string;
      event:
        | "discovery_start"
        | "discovery_complete"
        | "asset_scanned"
        | "scoring_complete"
        | "scan_complete"
        | "scan_failed";
      data: Record<string, unknown>;
    };

export function emitScanProgress(event: ScanProgressEvent): void {
  scanEvents.emit(`scan:${event.scanId}`, event);
}

