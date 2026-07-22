export interface FilterChipOption {
  id: string;
  label: string;
}

export function MultiSelectFilterChips({
  label,
  options,
  selected,
  onToggle
}: {
  label: string;
  options: FilterChipOption[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="filter-group">
      <span className="filter-label">{label}</span>
      <div className="filter-chips">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected.includes(option.id)}
            className={selected.includes(option.id) ? 'filter-chip active' : 'filter-chip'}
            onClick={() => onToggle(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
