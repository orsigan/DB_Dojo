import {
  type Achievement,
  type Attempt,
  analyzeProgress,
  computeAchievements,
  computeStreak,
  localize,
  type Streak
} from '@db-dojo/core';
import { useCallback, useEffect, useRef } from 'react';
import { curriculum } from '../../app/curriculum';
import { exerciseModules } from '../../app/exercise-registry';
import { useLanguage } from '../../app/i18n/use-language';
import { useTranslation } from '../../app/i18n/use-translation';
import { subscribeToProgressEvents } from '../../app/progress-events';
import { useServices } from '../../app/services-context';
import { computeChapterStatuses } from '../GuidedMap';
import type { ToastInput } from './toast-types';

interface ProgressBaseline {
  achievementIds: Set<string>;
  completedChapterIds: Set<string>;
  streakCurrent: number;
}

interface ProgressSnapshot {
  achievements: Achievement[];
  completedChapterIds: Set<string>;
  streak: Streak;
}

/** Watches recorded attempts and raises a toast for every newly-crossed milestone. */
export function useProgressToasts(showToast: (toast: ToastInput) => void): void {
  const services = useServices();
  const { language } = useLanguage();
  const { t } = useTranslation();
  const baselineRef = useRef<ProgressBaseline | null>(null);

  const computeSnapshot = useCallback(async (): Promise<ProgressSnapshot> => {
    const attempts = await services.progress.all();
    const exercises = exerciseModules.map((module) => module.definition);
    const analysis = analyzeProgress(attempts, exercises);
    const achievements = computeAchievements(attempts, exercises);
    const chapterStatuses = computeChapterStatuses(curriculum, analysis.perExercise);
    const streak = computeStreak(attempts);
    return {
      achievements,
      completedChapterIds: new Set(
        curriculum.filter((_, index) => chapterStatuses[index] === 'completed').map((c) => c.id)
      ),
      streak
    };
  }, [services]);

  const toBaseline = useCallback(
    (snapshot: ProgressSnapshot): ProgressBaseline => ({
      achievementIds: new Set(snapshot.achievements.filter((a) => a.unlocked).map((a) => a.id)),
      completedChapterIds: snapshot.completedChapterIds,
      streakCurrent: snapshot.streak.current
    }),
    []
  );

  useEffect(() => {
    let active = true;
    computeSnapshot().then((snapshot) => {
      if (active) {
        baselineRef.current = toBaseline(snapshot);
      }
    });
    return () => {
      active = false;
    };
  }, [computeSnapshot, toBaseline]);

  useEffect(() => {
    async function handleAttemptRecorded(attempt: Attempt) {
      if (attempt.passed) {
        const module = exerciseModules.find(
          (candidate) => candidate.definition.id === attempt.exerciseId
        );
        if (module) {
          showToast({
            kind: 'exercise-passed',
            title: t('notifications.exercisePassedTitle'),
            message: localize(module.definition.title, language)
          });
        }
      }

      const previous = baselineRef.current;
      const snapshot = await computeSnapshot();

      if (previous) {
        curriculum.forEach((chapter) => {
          if (
            snapshot.completedChapterIds.has(chapter.id) &&
            !previous.completedChapterIds.has(chapter.id)
          ) {
            showToast({
              kind: 'milestone',
              title: t('notifications.milestoneTitle'),
              message: chapter.title
            });
          }
        });

        for (const achievement of snapshot.achievements) {
          if (achievement.unlocked && !previous.achievementIds.has(achievement.id)) {
            showToast({
              kind: 'achievement',
              title: t('notifications.achievementTitle'),
              message: localize(achievement.title, language),
              icon: achievement.icon
            });
          }
        }

        if (snapshot.streak.current > previous.streakCurrent) {
          showToast({
            kind: 'streak-kept',
            title: t('notifications.streakKeptTitle'),
            message: t('notifications.streakKeptMessage', { count: snapshot.streak.current })
          });
        }
      }

      baselineRef.current = toBaseline(snapshot);
    }

    return subscribeToProgressEvents((event) => {
      if (event.type === 'rebaseline') {
        void computeSnapshot().then((snapshot) => {
          baselineRef.current = toBaseline(snapshot);
        });
        return;
      }
      void handleAttemptRecorded(event.attempt);
    });
  }, [computeSnapshot, toBaseline, language, showToast, t]);
}
