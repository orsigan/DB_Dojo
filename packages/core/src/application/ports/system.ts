export interface Clock {
  now(): Date;
  elapsedMs(): number;
}

export interface IdGenerator {
  uuid(): string;
}

export interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}
