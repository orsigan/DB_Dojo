import {
  type Attempt,
  appError,
  type ExerciseId,
  failure,
  type ProgressRepository,
  type Result,
  success
} from '@db-dojo/core';

const DEFAULT_STORAGE_KEY = 'db-dojo:progress:v1';
const MAX_STORED_ATTEMPTS = 500;

export class LocalStorageProgressRepository implements ProgressRepository {
  constructor(private readonly storageKey: string = DEFAULT_STORAGE_KEY) {}

  async record(attempt: Attempt): Promise<Result<void>> {
    const attempts = this.read();
    attempts.push(attempt);
    const trimmed = attempts.slice(-MAX_STORED_ATTEMPTS);

    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(trimmed));
      return success(undefined);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      console.warn(`[db-dojo] failed to persist attempt to localStorage: ${message}`);
      return failure(appError('storage-failed', `Could not save attempt: ${message}`));
    }
  }

  async historyFor(exerciseId: ExerciseId): Promise<Attempt[]> {
    return this.read().filter((attempt) => attempt.exerciseId === exerciseId);
  }

  async all(): Promise<Attempt[]> {
    return this.read();
  }

  private read(): Attempt[] {
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      return raw !== null ? (JSON.parse(raw) as Attempt[]) : [];
    } catch {
      return [];
    }
  }
}
