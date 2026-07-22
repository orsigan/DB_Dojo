import type { AppError } from './errors';

export type Result<Value> = { success: true; value: Value } | { success: false; error: AppError };

export function success<Value>(value: Value): Result<Value> {
  return { success: true, value };
}

export function failure(error: AppError): Result<never> {
  return { success: false, error };
}
