import type { ExerciseId } from '../../domain/ids';

export type TelemetryEvent =
  | { type: 'query-executed'; durationMs: number; ok: boolean }
  | { type: 'exercise-opened'; exerciseId: ExerciseId; topic: string[] }
  | { type: 'exercise-submitted'; exerciseId: ExerciseId; passed: boolean; durationMs: number };

export interface TelemetrySink {
  emit(event: TelemetryEvent): void;
}
