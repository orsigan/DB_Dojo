import type { TelemetryEvent, TelemetrySink } from '@db-dojo/core';
import { buildTelemetrySnapshot, type TelemetrySnapshot } from './snapshot';

const DEFAULT_STORAGE_KEY = 'db-dojo:telemetry:v1';
const MAX_STORED_EVENTS = 2000;

export class LocalStorageTelemetry implements TelemetrySink {
  constructor(private readonly storageKey: string = DEFAULT_STORAGE_KEY) {}

  emit(event: TelemetryEvent): void {
    const events = this.read();
    events.push(event);
    const trimmed = events.slice(-MAX_STORED_EVENTS);

    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(trimmed));
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      console.warn(`[db-dojo] failed to persist telemetry event to localStorage: ${message}`);
    }
  }

  snapshot(): TelemetrySnapshot {
    return buildTelemetrySnapshot(this.read());
  }

  private read(): TelemetryEvent[] {
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      return raw !== null ? (JSON.parse(raw) as TelemetryEvent[]) : [];
    } catch {
      return [];
    }
  }
}
