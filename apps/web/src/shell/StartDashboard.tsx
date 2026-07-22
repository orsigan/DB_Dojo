import type { Attempt } from '@db-dojo/core';
import { useTranslation } from '../app/i18n/use-translation';
import type { View } from '../app/modes/types';
import { AnalyticsCharts, AnalyticsKpis, StreakBadge } from './AnalyticsPanels';

export function StartDashboard({
  attempts,
  navigate
}: {
  attempts: Attempt[];
  navigate: (view: View) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="dashboard">
      <div className="dashboard-head">
        <h2>{t('start.atAGlance')}</h2>
        <button
          type="button"
          className="dashboard-link"
          onClick={() => navigate({ kind: 'stats' })}
        >
          {t('start.fullStatistics')}
        </button>
      </div>

      <StreakBadge attempts={attempts} />
      <AnalyticsKpis attempts={attempts} />
      <AnalyticsCharts attempts={attempts} />
    </div>
  );
}
