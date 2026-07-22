import { type Achievement, type Attempt, computeAchievements, localize } from '@db-dojo/core';
import { useMemo } from 'react';
import { exerciseModules } from '../app/exercise-registry';
import { useLanguage } from '../app/i18n/use-language';
import { useTranslation } from '../app/i18n/use-translation';

export function AchievementsPanel({ attempts }: { attempts: Attempt[] }) {
  const { t } = useTranslation();
  const achievements = useMemo(
    () =>
      computeAchievements(
        attempts,
        exerciseModules.map((module) => module.definition)
      ),
    [attempts]
  );

  const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length;
  const sortedAchievements = [...achievements].sort(
    (a, b) => Number(b.unlocked) - Number(a.unlocked)
  );

  return (
    <section className="achievements-panel">
      <div className="achievements-header">
        <h3>{t('achievements.title')}</h3>
        <span className="muted">
          {t('achievements.unlockedCount', { count: unlockedCount, total: achievements.length })}
        </span>
      </div>
      <div className="achievements-grid">
        {sortedAchievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </section>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const progress = achievement.progress;
  const progressPercent = progress
    ? Math.min(100, Math.round((progress.current / progress.target) * 100))
    : 0;

  return (
    <div className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
      <span className="achievement-icon" aria-hidden="true">
        {achievement.icon}
      </span>
      <div className="achievement-text">
        <span className="achievement-title">{localize(achievement.title, language)}</span>
        <span className="achievement-description muted">
          {localize(achievement.description, language)}
        </span>
        {!achievement.unlocked && progress && (
          <div className="achievement-progress">
            <div className="progress-bar">
              <span className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="achievement-progress-label muted">
              {t('achievements.progress', { current: progress.current, target: progress.target })}
            </span>
          </div>
        )}
        {!achievement.unlocked && !progress && (
          <span className="achievement-locked-hint muted">{t('achievements.locked')}</span>
        )}
      </div>
    </div>
  );
}
