import {
  appError,
  type DatabaseEngine,
  failure,
  type QueryResult,
  type Result,
  success
} from '@db-dojo/core';

export interface RemoteEngineOptions {
  baseUrl: string;
}

export class RemoteEngine implements DatabaseEngine {
  readonly kind = 'remote' as const;

  constructor(private readonly options: RemoteEngineOptions) {}

  async init(): Promise<Result<void>> {
    return this.expectOk('/health', {});
  }

  async run(sql: string): Promise<Result<QueryResult>> {
    return this.post<QueryResult>('/run', { sql });
  }

  async exec(sql: string): Promise<Result<void>> {
    return this.expectOk('/exec', { sql });
  }

  async reset(): Promise<Result<void>> {
    return this.expectOk('/reset', {});
  }

  private async post<Payload>(path: string, body: unknown): Promise<Result<Payload>> {
    try {
      const response = await fetch(`${this.options.baseUrl}${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        return failure(
          appError('database-query-failed', `Backend responded with status ${response.status}.`)
        );
      }

      return success((await response.json()) as Payload);
    } catch (cause) {
      return failure(
        appError('database-not-ready', cause instanceof Error ? cause.message : String(cause))
      );
    }
  }

  private async expectOk(path: string, body: unknown): Promise<Result<void>> {
    const result = await this.post<unknown>(path, body);
    return result.success ? success(undefined) : failure(result.error);
  }
}
