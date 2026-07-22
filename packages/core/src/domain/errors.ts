export type ErrorCode =
  | 'database-query-failed'
  | 'database-not-ready'
  | 'exercise-not-found'
  | 'grading-failed'
  | 'storage-failed'
  | 'invalid-backup';

export interface AppError {
  code: ErrorCode;
  message: string;
}

export function appError(code: ErrorCode, message: string): AppError {
  return { code, message };
}
