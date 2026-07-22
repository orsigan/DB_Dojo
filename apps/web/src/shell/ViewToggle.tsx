export type ViewMode = 'graph' | 'cards';

const OPTIONS: { id: ViewMode; label: string }[] = [
  { id: 'graph', label: 'Graph' },
  { id: 'cards', label: 'Cards' }
];

/** Switches a surface between its dependency graph and its plain card list. */
export function ViewToggle({
  mode,
  onChange
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="segmented" role="tablist" aria-label="Layout">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={option.id === mode}
          className={option.id === mode ? 'segmented-option active' : 'segmented-option'}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
