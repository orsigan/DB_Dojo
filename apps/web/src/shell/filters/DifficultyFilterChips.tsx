import type { Difficulty } from '@db-dojo/core';
import { difficulties } from '../../app/difficulty';

export function DifficultyFilterChips({
  label,
  selected,
  onToggle
}: {
  label: string;
  selected: Difficulty[];
  onToggle: (difficulty: Difficulty) => void;
}) {
  return (
    <div className="filter-group">
      <span className="filter-label">{label}</span>
      <div className="filter-chips">
        {difficulties.map((difficulty) => (
          <button
            key={difficulty}
            type="button"
            aria-pressed={selected.includes(difficulty)}
            className={
              selected.includes(difficulty)
                ? `filter-chip difficulty ${difficulty.toLowerCase()} active`
                : `filter-chip difficulty ${difficulty.toLowerCase()}`
            }
            onClick={() => onToggle(difficulty)}
          >
            <span className="difficulty-dot" aria-hidden="true" />
            {difficulty}
          </button>
        ))}
      </div>
    </div>
  );
}
