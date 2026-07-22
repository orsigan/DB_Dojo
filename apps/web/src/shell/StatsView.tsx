import { type Attempt, analyzeProgress, type CategoryBreakdown } from '@db-dojo/core';
import type { TelemetrySnapshot } from '@db-dojo/infrastructure';
import { useEffect, useState } from 'react';
import { exerciseModules } from '../app/exercise-registry';
import { useTranslation } from '../app/i18n/use-translation';
import { useServices } from '../app/services-context';
import { topicLabel } from '../app/topics';
import { AchievementsPanel } from './AchievementsPanel';
import { AnalyticsCharts, AnalyticsKpis, StreakBadge } from './AnalyticsPanels';
import { MilestonesPanel } from './MilestonesPanel';

export function StatsView() {
  const { t } = useTranslation();
  const services = useServices();
  const [snapshot, setSnapshot] = useState<TelemetrySnapshot | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  useEffect(() => {
    setSnapshot(services.telemetry.snapshot());
    services.progress.all().then(setAttempts);
  }, [services]);

  if (!snapshot) {
    return null;
  }

  const analysis = analyzeProgress(
    attempts,
    exerciseModules.map((module) => module.definition)
  );
  const trend = computeTrend(attempts);

  return (
    <section className="stats">
      <h1>{t('stats.title')}</h1>
      <p className="muted">{t('stats.subtitle')}</p>

      <MilestonesPanel perExercise={analysis.perExercise} />

      <div className="stats-layout">
        <StreakBadge attempts={attempts} />

        <div className="stat-grid">
          <Stat label={t('stats.queriesRun')} value={snapshot.totalQueries} />
          <Stat label={t('stats.submissions')} value={snapshot.totalSubmissions} />
          <Stat label={t('stats.passed')} value={snapshot.passedSubmissions} />
          <Stat label={t('stats.attemptsStored')} value={attempts.length} />
        </div>

        <AnalyticsKpis attempts={attempts} />

        {trend && (
          <div className="side-note">
            <h3>{t('stats.improvementOverTime')}</h3>
            <p>
              {t('stats.passRateComparison', {
                earlier: Math.round(trend.earlier * 100),
                recent: Math.round(trend.recent * 100)
              })}
            </p>
          </div>
        )}

        {analysis.weakestTopics.length > 0 && (
          <div className="side-note">
            <h3>{t('stats.weakestTopics')}</h3>
            <ul>
              {analysis.weakestTopics.map((category) => (
                <li key={category.key}>
                  {topicLabel(category.key.split('/'))} — {Math.round(category.passRate * 100)}% (
                  {category.passedExercises}/{category.totalExercises})
                </li>
              ))}
            </ul>
          </div>
        )}

        <CategoryTable
          title={t('stats.byTopic')}
          categories={analysis.byTopic}
          labelFor={(key) => topicLabel(key.split('/'))}
        />
        <CategoryTable
          title={t('stats.byDifficulty')}
          categories={analysis.byDifficulty}
          labelFor={(key) => key}
        />

        <AnalyticsCharts attempts={attempts} />
      </div>

      <AchievementsPanel attempts={attempts} />
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function CategoryTable({
  title,
  categories,
  labelFor
}: {
  title: string;
  categories: CategoryBreakdown[];
  labelFor: (key: string) => string;
}) {
  const { t } = useTranslation();
  if (categories.length === 0) {
    return null;
  }
  return (
    <div className="stats-section">
      <h3>{title}</h3>
      <div className="result-table-wrap">
        <table className="result-table">
          <thead>
            <tr>
              <th>{t('stats.category')}</th>
              <th>{t('stats.solved')}</th>
              <th>{t('stats.rate')}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.key}>
                <td>{labelFor(category.key)}</td>
                <td>
                  {category.passedExercises}/{category.totalExercises}
                </td>
                <td>{Math.round(category.passRate * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function computeTrend(attempts: Attempt[]): { earlier: number; recent: number } | null {
  if (attempts.length < 2) {
    return null;
  }
  const sorted = [...attempts].sort((a, b) => a.at.localeCompare(b.at));
  const mid = Math.floor(sorted.length / 2);
  const earlierHalf = sorted.slice(0, mid);
  const recentHalf = sorted.slice(mid);
  if (earlierHalf.length === 0 || recentHalf.length === 0) {
    return null;
  }
  const passRate = (list: Attempt[]) =>
    list.filter((attempt) => attempt.passed).length / list.length;
  return { earlier: passRate(earlierHalf), recent: passRate(recentHalf) };
}
