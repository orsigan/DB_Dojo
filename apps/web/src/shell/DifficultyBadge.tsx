import type { Difficulty } from '@db-dojo/core';
import { difficultyClass } from '../app/difficulty';

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`difficulty-badge ${difficultyClass(difficulty)}`}>
      <span className="difficulty-dot" aria-hidden="true" />
      {difficulty}
    </span>
  );
}

export function DifficultyDot({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={`difficulty-dot standalone ${difficultyClass(difficulty)}`}
      role="img"
      title={difficulty}
      aria-label={difficulty}
    />
  );
}
