import { type Attempt, analyzeProgress, computeStreak, type Difficulty } from '@db-dojo/core';
import { useMemo } from 'react';
import type { DayBucket, Slice } from '../shell/charts';
import { type Chapter, curriculum } from './curriculum';
import { exerciseModules } from './exercise-registry';
import { useTranslation } from './i18n/use-translation';
import { topicLabel } from './topics';

export const ACTIVITY_DAYS = 14;
export const DIFFICULTY_ORDER: Difficulty[] = ['Beginner', 'Advanced', 'Profi', 'Ultra'];
export const TOPIC_SLICE_LIMIT = 5;
export const CATEGORICAL_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)'
];

export function countChapters(chapters: Chapter[]): number {
  return chapters.length + chapters.reduce((sum, c) => sum + countChapters(c.children), 0);
}

export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Attempts per day for the trailing ACTIVITY_DAYS window, oldest first. */
export function activityByDay(attempts: Attempt[]): DayBucket[] {
  const buckets = new Map<string, DayBucket>();
  const today = new Date();

  for (let offset = ACTIVITY_DAYS - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    buckets.set(dayKey(date), { day: dayKey(date), passed: 0, failed: 0 });
  }

  for (const attempt of attempts) {
    const bucket = buckets.get(attempt.at.slice(0, 10));
    if (!bucket) {
      continue;
    }
    if (attempt.passed) {
      bucket.passed += 1;
    } else {
      bucket.failed += 1;
    }
  }

  return [...buckets.values()];
}

export function solvedTrend(attempts: Attempt[]): number[] {
  const sorted = [...attempts].sort((a, b) => a.at.localeCompare(b.at));
  const solved = new Set<string>();
  return sorted.map((attempt) => {
    if (attempt.passed) {
      solved.add(attempt.exerciseId);
    }
    return solved.size;
  });
}


export function topicDistribution(
  byTopic: { key: string; totalExercises: number }[],
  t: ReturnType<typeof useTranslation>['t']
): Slice[] {
  const sorted = [...byTopic].sort((a, b) => b.totalExercises - a.totalExercises);
  const head = sorted.slice(0, TOPIC_SLICE_LIMIT);
  const tail = sorted.slice(TOPIC_SLICE_LIMIT);

  const slices: Slice[] = head.map((category, index) => ({
    label: topicLabel(category.key.split('/')),
    value: category.totalExercises,
    color: CATEGORICAL_COLORS[index] ?? 'var(--chart-1)'
  }));

  const rest = tail.reduce((sum, category) => sum + category.totalExercises, 0);
  if (rest > 0) {
    slices.push({ label: t('analytics.other'), value: rest, color: 'var(--chart-6)' });
  }

  return slices;
}

export function useAnalyticsData(attempts: Attempt[]) {
  const { t } = useTranslation();
  const analysis = useMemo(
    () =>
      analyzeProgress(
        attempts,
        exerciseModules.map((module) => module.definition)
      ),
    [attempts]
  );

  const activity = useMemo(() => activityByDay(attempts), [attempts]);
  const trend = useMemo(() => solvedTrend(attempts), [attempts]);
  const streak = useMemo(() => computeStreak(attempts), [attempts]);

  const totalChallenges = exerciseModules.length;
  const totalChapters = countChapters(curriculum);

  const progressStates = Object.values(analysis.perExercise);
  const solved = progressStates.filter((progress) => progress.passed).length;
  const inProgress = progressStates.filter(
    (progress) => !progress.passed && progress.attempts > 0
  ).length;
  const untouched = totalChallenges - solved - inProgress;
  const solvedPercent = totalChallenges > 0 ? Math.round((solved / totalChallenges) * 100) : 0;
  const passRate =
    attempts.length > 0
      ? Math.round((attempts.filter((attempt) => attempt.passed).length / attempts.length) * 100)
      : 0;

  const completionSlices: Slice[] = [
    { label: t('analytics.solved'), value: solved, color: 'var(--pass)' },
    { label: t('analytics.inProgress'), value: inProgress, color: 'var(--difficulty-advanced)' },
    { label: t('analytics.notStarted'), value: untouched, color: 'var(--path-pending)' }
  ];

  const difficultySlices: Slice[] = DIFFICULTY_ORDER.flatMap((difficulty) => {
    const category = analysis.byDifficulty.find((candidate) => candidate.key === difficulty);
    return category
      ? [
          {
            label: difficulty,
            value: category.totalExercises,
            color: `var(--difficulty-${difficulty.toLowerCase()})`
          }
        ]
      : [];
  });

  const topicSlices = useMemo(() => topicDistribution(analysis.byTopic, t), [analysis, t]);

  return {
    totalChallenges,
    totalChapters,
    solved,
    solvedPercent,
    passRate,
    activity,
    trend,
    streak,
    completionSlices,
    difficultySlices,
    topicSlices
  };
}
