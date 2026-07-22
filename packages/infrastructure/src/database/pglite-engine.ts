import {
  appError,
  type DatabaseEngine,
  failure,
  type QueryResult,
  type Result,
  type Row,
  success
} from '@db-dojo/core';
import { PGlite } from '@electric-sql/pglite';

export class PgliteEngine implements DatabaseEngine {
  readonly kind = 'pglite' as const;
  private database: PGlite | null = null;

  async init(): Promise<Result<void>> {
    try {
      this.database = await PGlite.create();
      return success(undefined);
    } catch (cause) {
      return failure(appError('database-not-ready', describe(cause)));
    }
  }

  async run(sql: string): Promise<Result<QueryResult>> {
    if (!this.database) {
      return failure(appError('database-not-ready', 'The database is not initialised yet.'));
    }

    const startedAt = performance.now();
    try {
      const statements = await this.database.exec(sql);
      const last = statements.at(-1);
      const durationMs = Math.round(performance.now() - startedAt);

      return success({
        fields: (last?.fields ?? []).map((field) => ({
          name: field.name,
          dataTypeId: field.dataTypeID
        })),
        rows: (last?.rows ?? []) as Row[],
        affectedRows: last?.affectedRows ?? 0,
        durationMs
      });
    } catch (cause) {
      return failure(appError('database-query-failed', describe(cause)));
    }
  }

  async exec(sql: string): Promise<Result<void>> {
    if (!this.database) {
      return failure(appError('database-not-ready', 'The database is not initialised yet.'));
    }
    try {
      await this.database.exec(sql);
      return success(undefined);
    } catch (cause) {
      return failure(appError('database-query-failed', describe(cause)));
    }
  }

  async reset(): Promise<Result<void>> {
    if (!this.database) {
      return this.init();
    }

    return this.exec('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  }
}

function describe(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}
