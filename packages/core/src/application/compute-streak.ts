import type { Attempt } from './ports/progress-repository';

export interface Streak {
  current: number;
  longest: number;
}

const MS_PER_DAY = 86_400_000;

export function computeStreak(attempts: Attempt[], today: Date = new Date()): Streak {
  if (attempts.length === 0) {
    return { current: 0, longest: 0 };
  }

  const activeDays = [
    ...new Set(attempts.map((attempt) => startOfDay(new Date(attempt.at)).getTime()))
  ]
    .sort((a, b) => a - b)
    .map((time) => new Date(time));

  let longest = 0;
  let longestRun = 0;
  let previousDay: Date | undefined;
  for (const day of activeDays) {
    longestRun =
      previousDay !== undefined && daysBetween(day, previousDay) === 1 ? longestRun + 1 : 1;
    longest = Math.max(longest, longestRun);
    previousDay = day;
  }

  const mostRecentDay = previousDay as Date;
  const gapToToday = daysBetween(startOfDay(today), mostRecentDay);

  // A streak still counts as active if the last activity was yesterday, not
  // just today, so today alone never resets it before the day is over.
  if (gapToToday > 1) {
    return { current: 0, longest };
  }

  let current = 0;
  let nextDay: Date | undefined;
  for (const day of [...activeDays].reverse()) {
    if (nextDay !== undefined && daysBetween(nextDay, day) !== 1) {
      break;
    }
    current += 1;
    nextDay = day;
  }

  return { current, longest };
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(later: Date, earlier: Date): number {
  return Math.round((startOfDay(later).getTime() - startOfDay(earlier).getTime()) / MS_PER_DAY);
}
