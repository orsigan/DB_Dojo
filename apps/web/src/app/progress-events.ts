import type { Attempt } from '@db-dojo/core';

export type ProgressEvent = { type: 'attempt-recorded'; attempt: Attempt } | { type: 'rebaseline' };

type Listener = (event: ProgressEvent) => void;

const listeners = new Set<Listener>();
let suppressed = false;

export function publishProgressEvent(event: ProgressEvent): void {
  if (suppressed) {
    return;
  }
  for (const listener of listeners) {
    listener(event);
  }
}

export function subscribeToProgressEvents(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function withSuppressedProgressEvents<Value>(
  fn: () => Promise<Value>
): Promise<Value> {
  suppressed = true;
  try {
    return await fn();
  } finally {
    suppressed = false;
    publishProgressEvent({ type: 'rebaseline' });
  }
}
