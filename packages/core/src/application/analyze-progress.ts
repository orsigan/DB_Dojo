import type { Difficulty, Exercise } from '../domain/exercise';
import type { ExerciseId } from '../domain/ids';
import type { Attempt } from './ports/progress-repository';

export interface ExerciseProgress {
  exerciseId: ExerciseId;
  attempts: number;
  passed: boolean;
  lastAttemptAt?: string;
}

export interface CategoryBreakdown {
  key: string;
  totalExercises: number;
  attemptedExercises: number;
  passedExercises: number;
  totalAttempts: number;
  passRate: number;
}

export interface ProgressAnalysis {
  perExercise: Record<ExerciseId, ExerciseProgress>;
  byTopic: CategoryBreakdown[];
  byTag: CategoryBreakdown[];
  byDifficulty: CategoryBreakdown[];
  weakestTopics: CategoryBreakdown[];
}

const WEAKEST_TOPICS_LIMIT = 3;

export function analyzeProgress(attempts: Attempt[], exercises: Exercise[]): ProgressAnalysis {
  const perExercise: Record<ExerciseId, ExerciseProgress> = {};

  for (const exercise of exercises) {
    perExercise[exercise.id] = { exerciseId: exercise.id, attempts: 0, passed: false };
  }

  for (const attempt of attempts) {
    const progress = perExercise[attempt.exerciseId];
    if (!progress) {
      continue;
    }
    progress.attempts += 1;
    progress.passed = progress.passed || attempt.passed;
    if (!progress.lastAttemptAt || attempt.at > progress.lastAttemptAt) {
      progress.lastAttemptAt = attempt.at;
    }
  }

  const byTopic = groupBy(exercises, perExercise, (exercise) => [exercise.topic.join('/')]);
  const byTag = groupBy(exercises, perExercise, (exercise) => exercise.tags);
  const byDifficulty = groupBy(
    exercises,
    perExercise,
    (exercise) => [exercise.difficulty] as Difficulty[]
  );

  const weakestTopics = byTopic
    .filter((category) => category.attemptedExercises > 0)
    .sort((a, b) => a.passRate - b.passRate || b.totalAttempts - a.totalAttempts)
    .slice(0, WEAKEST_TOPICS_LIMIT);

  return { perExercise, byTopic, byTag, byDifficulty, weakestTopics };
}

function groupBy(
  exercises: Exercise[],
  perExercise: Record<ExerciseId, ExerciseProgress>,
  keysFor: (exercise: Exercise) => string[]
): CategoryBreakdown[] {
  const byKey = new Map<string, CategoryBreakdown>();

  for (const exercise of exercises) {
    const progress = perExercise[exercise.id];
    for (const key of keysFor(exercise)) {
      let category = byKey.get(key);
      if (!category) {
        category = {
          key,
          totalExercises: 0,
          attemptedExercises: 0,
          passedExercises: 0,
          totalAttempts: 0,
          passRate: 0
        };
        byKey.set(key, category);
      }
      category.totalExercises += 1;
      if (progress) {
        category.totalAttempts += progress.attempts;
        if (progress.attempts > 0) {
          category.attemptedExercises += 1;
        }
        if (progress.passed) {
          category.passedExercises += 1;
        }
      }
    }
  }

  for (const category of byKey.values()) {
    category.passRate =
      category.totalExercises > 0 ? category.passedExercises / category.totalExercises : 0;
  }

  return [...byKey.values()];
}
