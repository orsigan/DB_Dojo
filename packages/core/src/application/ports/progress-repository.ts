import type { ExerciseId } from '../../domain/ids';
import type { Result } from '../../domain/result';

export interface Attempt {
  exerciseId: ExerciseId;
  passed: boolean;
  durationMs: number;
  at: string;
}

export interface ProgressRepository {
  record(attempt: Attempt): Promise<Result<void>>;
  historyFor(exerciseId: ExerciseId): Promise<Attempt[]>;
  all(): Promise<Attempt[]>;
}
