import type { Exercise, QueryResult, Verdict } from '@db-dojo/core';
import { useEffect, useState } from 'react';
import type { ExerciseHostApi } from './contract';

export type HistoryEntryStatus = 'ok' | 'passed' | 'failed' | 'error';

export interface HistoryEntry {
  sql: string;
  timestamp: number;
  status: HistoryEntryStatus;
}

const MAX_HISTORY_ENTRIES = 20;

function loadHistory(storageKey: string): HistoryEntry[] {
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export interface ExerciseRunner {
  sql: string;
  setSql: (sql: string) => void;
  result: QueryResult | null;
  verdict: Verdict | null;
  error: string | null;
  busy: boolean;
  history: HistoryEntry[];
  run: () => Promise<void>;
  submit: () => Promise<void>;
  reset: () => Promise<void>;
  loadFromHistory: (entry: HistoryEntry) => void;
}

/** Tab '1' is the original, pre-tabs shell — it keeps the legacy unsuffixed
 * storage keys so existing drafts/history survive the upgrade to multiple tabs. */
const LEGACY_TAB_ID = '1';

export function useExerciseRunner(
  exercise: Exercise,
  host: ExerciseHostApi,
  tabId: string = LEGACY_TAB_ID
): ExerciseRunner {
  const tabSuffix = tabId === LEGACY_TAB_ID ? '' : `:${tabId}`;
  const draftStorageKey = `db-dojo:draft:${exercise.id}${tabSuffix}`;
  const [sql, setSql] = useState(
    () => window.localStorage.getItem(draftStorageKey) ?? exercise.starterSql ?? ''
  );
  const [result, setResult] = useState<QueryResult | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const historyStorageKey = `db-dojo:history:${exercise.id}${tabSuffix}`;
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory(historyStorageKey));

  useEffect(() => {
    window.localStorage.setItem(draftStorageKey, sql);
  }, [draftStorageKey, sql]);

  useEffect(() => {
    window.localStorage.setItem(historyStorageKey, JSON.stringify(history));
  }, [historyStorageKey, history]);

  const addHistoryEntry = (entrySql: string, status: HistoryEntryStatus) => {
    setHistory((entries) =>
      [{ sql: entrySql, timestamp: Date.now(), status }, ...entries].slice(0, MAX_HISTORY_ENTRIES)
    );
  };

  const run = async () => {
    setBusy(true);
    setVerdict(null);
    const outcome = await host.runSql(sql);
    if (outcome.success) {
      setResult(outcome.value);
      setError(null);
      addHistoryEntry(sql, 'ok');
    } else {
      setResult(null);
      setError(outcome.error.message);
      addHistoryEntry(sql, 'error');
    }
    setBusy(false);
  };

  const submit = async () => {
    setBusy(true);
    const outcome = await host.submit(sql);
    if (outcome.success) {
      setVerdict(outcome.value);
      setError(null);
      addHistoryEntry(sql, outcome.value.passed ? 'passed' : 'failed');
    } else {
      setError(outcome.error.message);
      addHistoryEntry(sql, 'error');
    }
    setBusy(false);
  };

  const reset = async () => {
    setBusy(true);
    await host.reset();
    setSql(exercise.starterSql ?? '');
    setResult(null);
    setVerdict(null);
    setError(null);
    setBusy(false);
  };

  const loadFromHistory = (entry: HistoryEntry) => {
    setSql(entry.sql);
  };

  return {
    sql,
    setSql,
    result,
    verdict,
    error,
    busy,
    history,
    run,
    submit,
    reset,
    loadFromHistory
  };
}
