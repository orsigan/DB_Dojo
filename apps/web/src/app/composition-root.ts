import type {
  Clock,
  DatabaseEngine,
  ExerciseRepository,
  ProgressRepository,
  TelemetrySink
} from '@db-dojo/core';
import {
  createEngine,
  type EngineKind,
  InMemoryTelemetry,
  LocalStorageProgressRepository,
  LocalStorageTelemetry,
  StaticExerciseRepository,
  SystemClock,
  type TelemetrySnapshot
} from '@db-dojo/infrastructure';
import { exerciseModules } from './exercise-registry';
import { publishProgressEvent } from './progress-events';

export type Telemetry = TelemetrySink & { snapshot(): TelemetrySnapshot };

export interface Services {
  engine: DatabaseEngine;
  exercises: ExerciseRepository;
  progress: ProgressRepository;
  telemetry: Telemetry;
  clock: Clock;
}

function withProgressNotifications(inner: ProgressRepository): ProgressRepository {
  return {
    historyFor: (exerciseId) => inner.historyFor(exerciseId),
    all: () => inner.all(),
    async record(attempt) {
      const result = await inner.record(attempt);
      if (result.success) {
        publishProgressEvent({ type: 'attempt-recorded', attempt });
      }
      return result;
    }
  };
}

export function createServices(): Services {
  const kind = (import.meta.env['VITE_DB_ENGINE'] as EngineKind | undefined) ?? 'pglite';
  const remoteBaseUrl = import.meta.env['VITE_REMOTE_API_URL'] as string | undefined;
  const engine = createEngine(remoteBaseUrl ? { kind, remoteBaseUrl } : { kind });

  const persistTelemetry = import.meta.env['VITE_TELEMETRY_PERSIST'] !== 'false';

  const definitions = exerciseModules.map((module) => module.definition);

  return {
    engine,
    exercises: new StaticExerciseRepository(definitions),
    progress: withProgressNotifications(new LocalStorageProgressRepository()),
    telemetry: persistTelemetry ? new LocalStorageTelemetry() : new InMemoryTelemetry(),
    clock: new SystemClock()
  };
}
