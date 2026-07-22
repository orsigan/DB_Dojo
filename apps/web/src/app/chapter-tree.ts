import type { ExerciseId, ExerciseProgress } from '@db-dojo/core';
import type { Chapter } from './curriculum';

export function allExerciseIds(chapter: Chapter): string[] {
  return [...chapter.exerciseIds, ...chapter.children.flatMap(allExerciseIds)];
}

export function hasContent(chapter: Chapter): boolean {
  return allExerciseIds(chapter).length > 0;
}

export interface ChapterProgress {
  totalExercises: number;
  attemptedExercises: number;
  passedExercises: number;
}

export function chapterProgress(
  chapter: Chapter,
  perExercise: Record<ExerciseId, ExerciseProgress>
): ChapterProgress {
  let totalExercises = 0;
  let attemptedExercises = 0;
  let passedExercises = 0;

  for (const exerciseId of allExerciseIds(chapter)) {
    const progress = perExercise[exerciseId];
    if (!progress) {
      continue;
    }
    totalExercises += 1;
    if (progress.attempts > 0) {
      attemptedExercises += 1;
    }
    if (progress.passed) {
      passedExercises += 1;
    }
  }

  return { totalExercises, attemptedExercises, passedExercises };
}

export function findChapterById(chapters: Chapter[], id: string): Chapter | undefined {
  for (const chapter of chapters) {
    if (chapter.id === id) {
      return chapter;
    }
    const found = findChapterById(chapter.children, id);
    if (found) {
      return found;
    }
  }
  return undefined;
}

export function findChapterPath(chapters: Chapter[], id: string): Chapter[] | undefined {
  for (const chapter of chapters) {
    if (chapter.id === id) {
      return [chapter];
    }
    const childPath = findChapterPath(chapter.children, id);
    if (childPath) {
      return [chapter, ...childPath];
    }
  }
  return undefined;
}
