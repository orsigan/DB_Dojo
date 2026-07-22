import {
  type Attempt,
  type ExerciseId,
  type ProgressRepository,
  type Result,
  success
} from '@db-dojo/core';

export class InMemoryProgressRepository implements ProgressRepository {
  private readonly attempts: Attempt[] = [];

  async record(attempt: Attempt): Promise<Result<void>> {
    this.attempts.push(attempt);
    return success(undefined);
  }

  async historyFor(exerciseId: ExerciseId): Promise<Attempt[]> {
    return this.attempts.filter((attempt) => attempt.exerciseId === exerciseId);
  }

  async all(): Promise<Attempt[]> {
    return this.attempts;
  }
}
