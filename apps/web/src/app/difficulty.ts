import type { Difficulty } from '@db-dojo/core';

/** Every difficulty, ordered from easiest to hardest. */
export const difficulties: Difficulty[] = ['Beginner', 'Advanced', 'Profi', 'Ultra'];

const ranks: Record<Difficulty, number> = { Beginner: 0, Advanced: 1, Profi: 2, Ultra: 3 };

export function difficultyRank(difficulty: Difficulty): number {
  return ranks[difficulty];
}

export function difficultyClass(difficulty: Difficulty): string {
  return difficulty.toLowerCase();
}
