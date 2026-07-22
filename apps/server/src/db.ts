import { Pool } from 'pg';

const databaseUrl = process.env['DATABASE_URL'] ?? 'postgres://dojo:dojo@localhost:5432/db_dojo';

export const pool = new Pool({ connectionString: databaseUrl });
