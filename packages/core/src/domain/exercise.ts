import type { GradingSpec } from './grading';
import type { ExerciseId } from './ids';
import type { LocalizedText } from './localized-text';

export type Difficulty = 'Beginner' | 'Advanced' | 'Profi' | 'Ultra';

export interface Hint {
  text: LocalizedText;
}

export interface Exercise {
  id: ExerciseId;
  topic: string[];
  difficulty: Difficulty;
  title: LocalizedText;
  prompt: LocalizedText;
  seedSql: string;
  starterSql?: string;
  hints: Hint[];
  grading: GradingSpec;
  tags: string[];
}
