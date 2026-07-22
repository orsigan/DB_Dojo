import type { Result } from '../../domain/result';

export type Row = Record<string, unknown>;

export interface QueryField {
  name: string;
  dataTypeId: number;
}

export interface QueryResult {
  fields: QueryField[];
  rows: Row[];
  affectedRows: number;
  durationMs: number;
}

export interface DatabaseEngine {
  kind: 'pglite' | 'remote';
  init(): Promise<Result<void>>;
  run(sql: string): Promise<Result<QueryResult>>;
  exec(sql: string): Promise<Result<void>>;
  reset(): Promise<Result<void>>;
}
