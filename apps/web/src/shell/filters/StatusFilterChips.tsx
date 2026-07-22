export interface StatusFilterOption<T extends string> {
  id: T;
  label: string;
}

export function StatusFilterChips<T extends string>({
  label,
  options,
  value,
  onChange
}: {
  label: string;
  options: StatusFilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="filter-group">
      <span className="filter-label">{label}</span>
      <div className="filter-chips">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={value === option.id}
            className={value === option.id ? 'filter-chip active' : 'filter-chip'}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
