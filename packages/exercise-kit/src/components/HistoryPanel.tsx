import type { Language } from '@db-dojo/core';
import { useState } from 'react';
import { t } from '../strings';
import type { HistoryEntry, HistoryEntryStatus } from '../use-exercise-runner';

const STATUS_STRING_KEY: Record<
  HistoryEntryStatus,
  'historyStatusOk' | 'historyStatusPassed' | 'historyStatusFailed' | 'historyStatusError'
> = {
  ok: 'historyStatusOk',
  passed: 'historyStatusPassed',
  failed: 'historyStatusFailed',
  error: 'historyStatusError'
};

function formatTimestamp(timestamp: number, language: Language): string {
  return new Date(timestamp).toLocaleTimeString(language === 'de' ? 'de-DE' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function previewOf(sql: string): string {
  const singleLine = sql.trim().replace(/\s+/g, ' ');
  return singleLine.length > 60 ? `${singleLine.slice(0, 60)}…` : singleLine;
}

export function HistoryPanel({
  history,
  onSelect,
  language
}: {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  language: Language;
}) {
  const [expanded, setExpanded] = useState(false);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="history-panel">
      <button type="button" className="ghost" onClick={() => setExpanded((value) => !value)}>
        {t('history', language)} ({history.length})
      </button>

      {expanded && (
        <ul className="history-panel-list">
          {history.map((entry) => (
            <li key={entry.timestamp} className="history-panel-entry">
              <button
                type="button"
                className="history-panel-entry-button"
                onClick={() => onSelect(entry)}
              >
                <span className={`history-panel-status history-panel-status-${entry.status}`}>
                  {t(STATUS_STRING_KEY[entry.status], language)}
                </span>
                <span className="history-panel-time">
                  {formatTimestamp(entry.timestamp, language)}
                </span>
                <span className="history-panel-sql">{previewOf(entry.sql)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
