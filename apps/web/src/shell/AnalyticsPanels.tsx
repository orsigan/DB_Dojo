import type { Attempt } from '@db-dojo/core';
import { ACTIVITY_DAYS, useAnalyticsData } from '../app/analytics';
import { useTranslation } from '../app/i18n/use-translation';
import { ActivityChart, DonutChart, TrendChart } from './charts';

export function AnalyticsKpis({ attempts }: { attempts: Attempt[] }) {
  const { t } = useTranslation();
  const { totalChallenges, totalChapters, solved, solvedPercent, passRate } =
    useAnalyticsData(attempts);

  return (
    <div className="kpi-grid">
      <Kpi label={t('analytics.challenges')} value={totalChallenges} />
      <Kpi label={t('analytics.chapters')} value={totalChapters} />
      <Kpi
        label={t('analytics.solved')}
        value={solved}
        hint={t('analytics.percentComplete', { percent: solvedPercent })}
      />
      <Kpi
        label={t('analytics.attempts')}
        value={attempts.length}
        hint={attempts.length > 0 ? t('analytics.percentPassed', { percent: passRate }) : undefined}
      />
    </div>
  );
}

export function StreakBadge({ attempts }: { attempts: Attempt[] }) {
  const { t } = useTranslation();
  const { streak } = useAnalyticsData(attempts);

  return (
    <div className="streak-badge">
      <span className="streak-badge-flame" aria-hidden="true">
        🔥
      </span>
      <div className="streak-badge-text">
        <span className="streak-badge-value">
          {streak.current === 1
            ? t('analytics.streakDay', { count: streak.current })
            : t('analytics.streakDays', { count: streak.current })}
        </span>
        {streak.longest > streak.current && (
          <span className="streak-badge-hint muted">
            {t('analytics.longestStreak', { days: streak.longest })}
          </span>
        )}
      </div>
    </div>
  );
}

export function AnalyticsCharts({ attempts }: { attempts: Attempt[] }) {
  const { t } = useTranslation();
  const {
    totalChallenges,
    solvedPercent,
    activity,
    trend,
    completionSlices,
    difficultySlices,
    topicSlices
  } = useAnalyticsData(attempts);

  return (
    <div className="dashboard-panel-grid">
      <section className="dashboard-panel">
        <h3>{t('analytics.completion')}</h3>
        <DonutChart
          slices={completionSlices}
          centerValue={`${solvedPercent}%`}
          centerLabel={t('analytics.solvedLower')}
        />
      </section>

      <section className="dashboard-panel">
        <h3>{t('analytics.byDifficulty')}</h3>
        <DonutChart slices={difficultySlices} />
      </section>

      {topicSlices.length > 0 && (
        <section className="dashboard-panel">
          <h3>{t('analytics.byTopic')}</h3>
          <DonutChart slices={topicSlices} />
        </section>
      )}

      <section className="dashboard-panel">
        <h3>{t('analytics.activityLastNDays', { days: ACTIVITY_DAYS })}</h3>
        <ActivityChart buckets={activity} />
      </section>

      <section className="dashboard-panel">
        <h3>{t('analytics.solvedOverTime')}</h3>
        <TrendChart values={trend} total={totalChallenges} />
      </section>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: number; hint?: string | undefined }) {
  return (
    <div className="kpi">
      <span className="kpi-value">{value}</span>
      <span className="kpi-label">{label}</span>
      {hint && <span className="kpi-hint muted">{hint}</span>}
    </div>
  );
}
