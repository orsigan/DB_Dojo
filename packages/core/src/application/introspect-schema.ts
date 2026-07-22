import { failure, type Result, success } from '../domain/result';
import type { DatabaseEngine } from './ports/database-engine';

export interface SchemaColumn {
  name: string;
  dataType: string;
  nullable: boolean;
  isPrimaryKey: boolean;
  isUnique: boolean;
}

export interface SchemaForeignKey {
  table: string;
  column: string;
  referencedTable: string;
  referencedColumn: string;
}

export interface SchemaTable {
  name: string;
  columns: SchemaColumn[];
}

export interface SchemaInfo {
  tables: SchemaTable[];
  foreignKeys: SchemaForeignKey[];
}

const COLUMNS_QUERY = `
  SELECT
    c.table_name AS table_name,
    c.column_name AS column_name,
    c.data_type AS data_type,
    c.is_nullable AS is_nullable,
    c.ordinal_position AS ordinal_position,
    EXISTS (
      SELECT 1
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON kcu.constraint_name = tc.constraint_name AND kcu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_name = c.table_name
        AND tc.table_schema = c.table_schema
        AND kcu.column_name = c.column_name
    ) AS is_primary_key,
    EXISTS (
      SELECT 1
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON kcu.constraint_name = tc.constraint_name AND kcu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'UNIQUE'
        AND tc.table_name = c.table_name
        AND tc.table_schema = c.table_schema
        AND kcu.column_name = c.column_name
    ) AS is_unique
  FROM information_schema.columns c
  JOIN information_schema.tables t
    ON t.table_name = c.table_name AND t.table_schema = c.table_schema
  WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
  ORDER BY c.table_name, c.ordinal_position;
`;

const FOREIGN_KEYS_QUERY = `
  SELECT
    tc.table_name AS table_name,
    kcu.column_name AS column_name,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_column
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON kcu.constraint_name = tc.constraint_name AND kcu.table_schema = tc.table_schema
  JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
  WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
  ORDER BY tc.table_name, kcu.ordinal_position;
`;

export async function introspectSchema(engine: DatabaseEngine): Promise<Result<SchemaInfo>> {
  const columnsResult = await engine.run(COLUMNS_QUERY);
  if (!columnsResult.success) {
    return failure(columnsResult.error);
  }

  const foreignKeysResult = await engine.run(FOREIGN_KEYS_QUERY);
  if (!foreignKeysResult.success) {
    return failure(foreignKeysResult.error);
  }

  const tables = new Map<string, SchemaTable>();
  for (const row of columnsResult.value.rows) {
    const tableName = row['table_name'] as string;
    let table = tables.get(tableName);
    if (!table) {
      table = { name: tableName, columns: [] };
      tables.set(tableName, table);
    }
    table.columns.push({
      name: row['column_name'] as string,
      dataType: row['data_type'] as string,
      nullable: row['is_nullable'] === 'YES',
      isPrimaryKey: row['is_primary_key'] === true,
      isUnique: row['is_unique'] === true
    });
  }

  const foreignKeys: SchemaForeignKey[] = foreignKeysResult.value.rows.map((row) => ({
    table: row['table_name'] as string,
    column: row['column_name'] as string,
    referencedTable: row['referenced_table'] as string,
    referencedColumn: row['referenced_column'] as string
  }));

  return success({ tables: [...tables.values()], foreignKeys });
}
