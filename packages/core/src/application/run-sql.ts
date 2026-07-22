import type { Result } from '../domain/result';
import type { DatabaseEngine, QueryResult } from './ports/database-engine';
import type { TelemetrySink } from './ports/telemetry';

export interface RunSqlDependencies {
  engine: DatabaseEngine;
  telemetry: TelemetrySink;
}

export async function runSql(
  dependencies: RunSqlDependencies,
  sql: string
): Promise<Result<QueryResult>> {
  const result = await dependencies.engine.run(sql);

  dependencies.telemetry.emit({
    type: 'query-executed',
    durationMs: result.success ? result.value.durationMs : 0,
    ok: result.success
  });

  return result;
}
