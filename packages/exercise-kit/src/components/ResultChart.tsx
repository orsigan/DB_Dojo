import type { Language, Row } from '@db-dojo/core';

function formatValue(value: number, language: Language): string {
  return value.toLocaleString(language === 'de' ? 'de-DE' : 'en-US');
}

export function ResultChart({
  rows,
  labelField,
  valueField,
  language
}: {
  rows: Row[];
  labelField: string;
  valueField: string;
  language: Language;
}) {
  const values = rows.map((row) => Number(row[valueField]));
  const max = Math.max(0, ...values);
  const min = Math.min(0, ...values);
  const span = max - min || 1;
  // Where 0 sits along the [min, max] axis, as a percent of the track from its left edge.
  const zeroPct = (-min / span) * 100;

  return (
    <div
      className="result-chart"
      role="img"
      aria-label={rows.map((row) => `${row[labelField]}: ${Number(row[valueField])}`).join(', ')}
    >
      {rows.map((row, index) => {
        const value = Number(row[valueField]);
        const widthPct = (Math.abs(value) / span) * 100;
        const label = String(row[labelField] ?? '∅');
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: query rows have no stable id and the list is static per execution
          <div className="result-chart-row" key={index} title={`${label}: ${value}`}>
            <span className="result-chart-label">{label}</span>
            <div className="result-chart-track">
              <div className="result-chart-zero" style={{ left: `${zeroPct}%` }} />
              <div
                className="result-chart-fill"
                style={{
                  left: `${value < 0 ? zeroPct - widthPct : zeroPct}%`,
                  width: `${widthPct}%`
                }}
              />
            </div>
            <span className="result-chart-value">{formatValue(value, language)}</span>
          </div>
        );
      })}
    </div>
  );
}
