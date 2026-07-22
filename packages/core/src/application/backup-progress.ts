import { appError } from '../domain/errors';
import { failure, type Result, success } from '../domain/result';
import type { Attempt } from './ports/progress-repository';

const BACKUP_FORMAT_VERSION = 1;

interface ProgressBackup {
  version: number;
  exportedAt: string;
  attempts: Attempt[];
}

export function serializeAttempts(attempts: Attempt[]): string {
  const backup: ProgressBackup = {
    version: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    attempts
  };
  return JSON.stringify(backup, null, 2);
}

export function parseAttemptsExport(raw: string): Result<Attempt[]> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return failure(appError('invalid-backup', 'File is not valid JSON.'));
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return failure(appError('invalid-backup', 'File does not contain a progress backup.'));
  }

  const backup = parsed as Record<string, unknown>;
  if (backup['version'] !== BACKUP_FORMAT_VERSION) {
    return failure(appError('invalid-backup', 'Unsupported backup format version.'));
  }

  if (!Array.isArray(backup['attempts'])) {
    return failure(appError('invalid-backup', 'Backup does not contain a list of attempts.'));
  }

  const attempts: Attempt[] = [];
  for (const entry of backup['attempts']) {
    if (!isAttempt(entry)) {
      return failure(appError('invalid-backup', 'Backup contains a malformed attempt.'));
    }
    attempts.push(entry);
  }

  return success(attempts);
}

function isAttempt(value: unknown): value is Attempt {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['exerciseId'] === 'string' &&
    typeof candidate['passed'] === 'boolean' &&
    typeof candidate['durationMs'] === 'number' &&
    typeof candidate['at'] === 'string'
  );
}
