import type { TelemetryEvent, TelemetrySink } from '@db-dojo/core';
import { buildTelemetrySnapshot, type TelemetrySnapshot } from './snapshot';

export class InMemoryTelemetry implements TelemetrySink {
  private readonly events: TelemetryEvent[] = [];

  emit(event: TelemetryEvent): void {
    this.events.push(event);
  }

  snapshot(): TelemetrySnapshot {
    return buildTelemetrySnapshot(this.events);
  }
}
