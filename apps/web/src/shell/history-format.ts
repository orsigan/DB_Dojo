import type { Language } from '@db-dojo/core';

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function attemptDayKey(at: string): string {
  return dayKey(new Date(at));
}

export function formatDayLabel(at: string, language: Language, t: (key: string) => string): string {
  const date = new Date(at);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (dayKey(date) === dayKey(today)) {
    return t('history.today');
  }
  if (dayKey(date) === dayKey(yesterday)) {
    return t('history.yesterday');
  }
  return date.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

export function formatAttemptTime(at: string, language: Language): string {
  return new Date(at).toLocaleTimeString(language === 'de' ? 'de-DE' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatAttemptDuration(durationMs: number): string {
  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }
  return `${(durationMs / 1000).toFixed(1)} s`;
}
