import type { DatabaseEngine } from '@db-dojo/core';
import { PgliteEngine } from './pglite-engine';
import { RemoteEngine } from './remote-engine';

export type EngineKind = 'pglite' | 'remote';

export interface CreateEngineOptions {
  kind: EngineKind;
  remoteBaseUrl?: string;
}

export function createEngine(options: CreateEngineOptions): DatabaseEngine {
  if (options.kind === 'remote') {
    return new RemoteEngine({ baseUrl: options.remoteBaseUrl ?? 'http://localhost:8787' });
  }
  return new PgliteEngine();
}
