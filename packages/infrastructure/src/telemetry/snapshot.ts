import type { TelemetryEvent } from '@db-dojo/core';

export interface TelemetrySnapshot {
  totalQueries: number;
  totalSubmissions: number;
  passedSubmissions: number;
  events: TelemetryEvent[];
}

export function buildTelemetrySnapshot(events: TelemetryEvent[]): TelemetrySnapshot {
  let totalQueries = 0;
  let totalSubmissions = 0;
  let passedSubmissions = 0;

  for (const event of events) {
    if (event.type === 'query-executed') {
      totalQueries += 1;
    }
    if (event.type === 'exercise-submitted') {
      totalSubmissions += 1;
      if (event.passed) {
        passedSubmissions += 1;
      }
    }
  }

  return { totalQueries, totalSubmissions, passedSubmissions, events };
}
