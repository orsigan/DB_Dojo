import type { IncomingMessage, ServerResponse } from 'node:http';
import type { QueryResult } from '@db-dojo/core';
import { pool } from './db';

async function readBody(request: IncomingMessage): Promise<{ sql?: string }> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(chunk as Buffer);
  }
  if (chunks.length === 0) {
    return {};
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as { sql?: string };
}

export function sendJson(response: ServerResponse, status: number, payload: unknown): void {
  response.writeHead(status, { 'content-type': 'application/json' });
  response.end(JSON.stringify(payload));
}

export function describeError(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

function setCorsHeaders(response: ServerResponse): void {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'content-type');
}

async function handleHealth(response: ServerResponse): Promise<void> {
  try {
    await pool.query('SELECT 1');
    sendJson(response, 200, { ok: true });
  } catch (cause) {
    sendJson(response, 503, { ok: false, message: describeError(cause) });
  }
}

async function handleRun(request: IncomingMessage, response: ServerResponse): Promise<void> {
  const { sql } = await readBody(request);
  if (!sql) {
    sendJson(response, 400, { message: 'Request body must include "sql".' });
    return;
  }

  const startedAt = performance.now();
  try {
    const result = await pool.query(sql);
    const durationMs = Math.round(performance.now() - startedAt);

    const queryResult: QueryResult = {
      fields: result.fields.map((field) => ({ name: field.name, dataTypeId: field.dataTypeID })),
      rows: result.rows,
      affectedRows: result.rowCount ?? 0,
      durationMs
    };
    sendJson(response, 200, queryResult);
  } catch (cause) {
    sendJson(response, 400, { message: describeError(cause) });
  }
}

async function handleExec(request: IncomingMessage, response: ServerResponse): Promise<void> {
  const { sql } = await readBody(request);
  if (!sql) {
    sendJson(response, 400, { message: 'Request body must include "sql".' });
    return;
  }

  try {
    await pool.query(sql);
    sendJson(response, 200, { ok: true });
  } catch (cause) {
    sendJson(response, 400, { message: describeError(cause) });
  }
}

async function handleReset(response: ServerResponse): Promise<void> {
  try {
    // Dropping and recreating the schema is the simplest way to give a client a clean
    // slate for seedSql. Roles created via GRANT/REVOKE exercises live outside "public"
    // and are intentionally left untouched here.
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    sendJson(response, 200, { ok: true });
  } catch (cause) {
    sendJson(response, 500, { message: describeError(cause) });
  }
}

export async function handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
  setCorsHeaders(response);

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  const path = request.url ?? '/';

  if (path === '/health') {
    await handleHealth(response);
    return;
  }
  if (path === '/run') {
    await handleRun(request, response);
    return;
  }
  if (path === '/exec') {
    await handleExec(request, response);
    return;
  }
  if (path === '/reset') {
    await handleReset(response);
    return;
  }

  sendJson(response, 404, { message: `Unknown route ${path}` });
}
