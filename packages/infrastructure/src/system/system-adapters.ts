import type { Clock, IdGenerator, Logger } from '@db-dojo/core';

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }

  elapsedMs(): number {
    return performance.now();
  }
}

export class CryptoIdGenerator implements IdGenerator {
  uuid(): string {
    return crypto.randomUUID();
  }
}

export class ConsoleLogger implements Logger {
  info(message: string, context?: Record<string, unknown>): void {
    console.info(message, context ?? {});
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(message, context ?? {});
  }

  error(message: string, context?: Record<string, unknown>): void {
    console.error(message, context ?? {});
  }
}
