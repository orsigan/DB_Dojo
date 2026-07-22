import type { Language, QueryResult } from '@db-dojo/core';
import { useState } from 'react';
import { t } from '../strings';
import { ResultChart } from './ResultChart';

const MAX_CHART_ROWS = 20;

interface ChartFields {
  labelField: string;
  valueField: string;
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function findChartFields(result: QueryResult): ChartFields | null {
  if (result.rows.length === 0 || result.rows.length > MAX_CHART_ROWS) {
    return null;
  }

  const numericFields: string[] = [];
  const textFields: string[] = [];

  for (const field of result.fields) {
    const values = result.rows.map((row) => row[field.name]);
    const hasValue = values.some((value) => value !== null && value !== undefined);
    const allNumeric =
      hasValue &&
      values.every((value) => value === null || value === undefined || toNumber(value) !== null);
    (allNumeric ? numericFields : textFields).push(field.name);
  }

  const labelField = textFields[0];
  const valueField = numericFields[0];
  if (textFields.length !== 1 || labelField === undefined || valueField === undefined) {
    return null;
  }
  return { labelField, valueField };
}

export function ResultTable({ result, language }: { result: QueryResult; language: Language }) {
  const [view, setView] = useState<'table' | 'chart'>('table');

  if (result.fields.length === 0) {
    return (
      <p className="muted">
        {t('statementExecuted', language)} · {result.affectedRows} {t('rowsAffected', language)} ·{' '}
        {result.durationMs} ms
      </p>
    );
  }

  const chartFields = findChartFields(result);

  return (
    <div className="result-panel">
      <div className="result-meta">
        <p className="muted">
          {result.rows.length} {t('rowsReturned', language)} · {result.durationMs} ms
        </p>
        {chartFields && (
          <div className="segmented" role="tablist" aria-label={t('resultView', language)}>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'table'}
              className={view === 'table' ? 'segmented-option active' : 'segmented-option'}
              onClick={() => setView('table')}
            >
              {t('viewTable', language)}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'chart'}
              className={view === 'chart' ? 'segmented-option active' : 'segmented-option'}
              onClick={() => setView('chart')}
            >
              {t('viewChart', language)}
            </button>
          </div>
        )}
      </div>

      {view === 'chart' && chartFields ? (
        <ResultChart
          rows={result.rows}
          labelField={chartFields.labelField}
          valueField={chartFields.valueField}
          language={language}
        />
      ) : (
        <div className="result-table-wrap">
          <table className="result-table">
            <thead>
              <tr>
                {result.fields.map((field) => (
                  <th key={field.name}>{field.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, rowIndex) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: query rows have no stable id and the list is static per execution
                <tr key={rowIndex}>
                  {result.fields.map((field) => (
                    <td key={field.name}>{formatCell(row[field.name])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '∅';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}
