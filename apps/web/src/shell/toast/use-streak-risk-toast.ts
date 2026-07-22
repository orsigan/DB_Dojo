import { computeStreak } from '@db-dojo/core';
import { useEffect, useRef } from 'react';
import { useTranslation } from '../../app/i18n/use-translation';
import { useServices } from '../../app/services-context';
import type { ToastInput } from './toast-types';

const STREAK_RISK_HOURS = [17, 20, 22];
const STREAK_CHECK_INTERVAL_MS = 5 * 60 * 1000;
const STREAK_WARN_STORAGE_KEY = 'db-dojo:streak-warned';

interface WarnedState {
  date: string;
  hours: number[];
}

function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function loadWarnedState(): WarnedState {
  try {
    const raw = window.localStorage.getItem(STREAK_WARN_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WarnedState) : { date: '', hours: [] };
  } catch {
    return { date: '', hours: [] };
  }
}

function saveWarnedState(state: WarnedState): void {
  try {
    window.localStorage.setItem(STREAK_WARN_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable (private mode/quota) — warnings just repeat this session
  }
}

/** Nudges the user in the evening if today's streak is still unclaimed. */
export function useStreakRiskToast(showToast: (toast: ToastInput) => void): void {
  const services = useServices();
  const { t } = useTranslation();
  const warnedRef = useRef(loadWarnedState());

  useEffect(() => {
    async function checkStreakRisk() {
      const attempts = await services.progress.all();
      const streak = computeStreak(attempts);
      if (streak.current <= 0) {
        return;
      }
      const now = new Date();
      const attemptedToday = attempts.some((attempt) => isSameLocalDay(new Date(attempt.at), now));
      if (attemptedToday) {
        return;
      }
      const dueHour = [...STREAK_RISK_HOURS].reverse().find((hour) => now.getHours() >= hour);
      if (dueHour === undefined) {
        return;
      }
      const key = localDayKey(now);
      if (warnedRef.current.date !== key) {
        warnedRef.current = { date: key, hours: [] };
      }
      if (warnedRef.current.hours.includes(dueHour)) {
        return;
      }
      warnedRef.current = { date: key, hours: [...warnedRef.current.hours, dueHour] };
      saveWarnedState(warnedRef.current);
      showToast({
        kind: 'streak-risk',
        title: t('notifications.streakRiskTitle'),
        message: t('notifications.streakRiskMessage', { count: streak.current })
      });
    }

    void checkStreakRisk();
    const interval = window.setInterval(() => void checkStreakRisk(), STREAK_CHECK_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [services, showToast, t]);
}
