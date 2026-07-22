export interface Slice {
  label: string;
  value: number;
  color: string;
}

const DONUT_SIZE = 120;
const DONUT_RADIUS = 46;
const DONUT_STROKE = 18;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

export function DonutChart({
  slices,
  centerValue,
  centerLabel
}: {
  slices: Slice[];
  centerValue?: string | undefined;
  centerLabel?: string | undefined;
}) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const center = DONUT_SIZE / 2;

  let start = 0;
  const arcs = slices
    .filter((slice) => slice.value > 0)
    .map((slice) => {
      const length = (slice.value / total) * DONUT_CIRCUMFERENCE;
      const arc = { slice, length, offset: -start };
      start += length;
      return arc;
    });

  return (
    <div className="donut">
      <svg
        viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
        role="img"
        aria-label={slices.map((slice) => `${slice.label}: ${slice.value}`).join(', ')}
      >
        <circle
          cx={center}
          cy={center}
          r={DONUT_RADIUS}
          className="donut-track"
          strokeWidth={DONUT_STROKE}
        />
        <g transform={`rotate(-90 ${center} ${center})`}>
          {arcs.map((arc) => (
            <circle
              key={arc.slice.label}
              cx={center}
              cy={center}
              r={DONUT_RADIUS}
              fill="none"
              stroke={arc.slice.color}
              strokeWidth={DONUT_STROKE}
              strokeDasharray={`${arc.length} ${DONUT_CIRCUMFERENCE - arc.length}`}
              strokeDashoffset={arc.offset}
            />
          ))}
        </g>
        {centerValue && (
          <text x={center} y={center} className="donut-value">
            {centerValue}
          </text>
        )}
        {centerLabel && (
          <text x={center} y={center + 16} className="donut-caption">
            {centerLabel}
          </text>
        )}
      </svg>
      <Legend slices={slices} total={total} />
    </div>
  );
}

export function Legend({ slices, total }: { slices: Slice[]; total: number }) {
  return (
    <ul className="chart-legend">
      {slices.map((slice) => (
        <li key={slice.label}>
          <span className="legend-swatch" style={{ background: slice.color }} />
          <span className="legend-label">{slice.label}</span>
          <span className="legend-value muted">
            {slice.value}
            {total > 0 && ` · ${Math.round((slice.value / total) * 100)}%`}
          </span>
        </li>
      ))}
    </ul>
  );
}

export interface DayBucket {
  day: string;
  passed: number;
  failed: number;
}

export function ActivityChart({ buckets }: { buckets: DayBucket[] }) {
  const peak = Math.max(1, ...buckets.map((bucket) => bucket.passed + bucket.failed));

  if (buckets.every((bucket) => bucket.passed + bucket.failed === 0)) {
    return <p className="muted chart-empty">No attempts yet — solve a challenge to start.</p>;
  }

  return (
    <div className="activity-chart">
      {buckets.map((bucket) => {
        const total = bucket.passed + bucket.failed;
        return (
          <div
            key={bucket.day}
            className="activity-day"
            title={`${bucket.day}: ${bucket.passed} passed, ${bucket.failed} failed`}
          >
            <div className="activity-stack" style={{ height: `${(total / peak) * 100}%` }}>
              <div className="activity-failed" style={{ flexGrow: bucket.failed }} />
              <div className="activity-passed" style={{ flexGrow: bucket.passed }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TrendChart({ values, total }: { values: number[]; total: number }) {
  if (values.length < 2) {
    return <p className="muted chart-empty">Not enough history yet for a trend.</p>;
  }

  const width = 100;
  const height = 40;
  const ceiling = Math.max(1, total);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - (value / ceiling) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <svg
      className="trend-chart"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Solved challenges rising to ${values[values.length - 1]} of ${total}`}
    >
      <polyline points={`0,${height} ${points} ${width},${height}`} className="trend-area" />
      <polyline points={points} className="trend-line" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
