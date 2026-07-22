import { localize } from '@db-dojo/core';
import { exerciseModules } from '../../app/exercise-registry';
import { useLanguage } from '../../app/i18n/use-language';
import { useTranslation } from '../../app/i18n/use-translation';
import { useAttempts } from '../../app/use-attempts';
import { formatAttemptTime } from '../history-format';
import { CheckCircleIcon, ClockIcon } from './icons';
import type { IconBarItemConfig } from './types';

const RECENT_LIMIT = 8;

export function createHistoryMenuItem(options: {
  onShowHistory: () => void;
  t: ReturnType<typeof useTranslation>['t'];
}): IconBarItemConfig {
  return {
    id: 'history',
    label: options.t('historyMenu.buttonLabel'),
    icon: <ClockIcon />,
    panel: (close) => <HistoryMenuPanel onShowHistory={options.onShowHistory} close={close} />
  };
}

function HistoryMenuPanel({
  onShowHistory,
  close
}: {
  onShowHistory: () => void;
  close: () => void;
}) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const attempts = useAttempts();

  const recent = attempts
    .filter((attempt) => attempt.passed)
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, RECENT_LIMIT);

  return (
    <div className="history-menu-panel">
      <div className="history-menu-panel-header">{t('historyMenu.title')}</div>

      {recent.length === 0 ? (
        <p className="history-menu-panel-empty muted">{t('historyMenu.empty')}</p>
      ) : (
        <ul className="history-menu-panel-list">
          {recent.map((attempt) => {
            const exercise = exerciseModules.find(
              (module) => module.definition.id === attempt.exerciseId
            )?.definition;
            return (
              <li key={`${attempt.exerciseId}-${attempt.at}`} className="history-menu-panel-row">
                <CheckCircleIcon className="history-status-icon pass" />
                <span className="history-menu-panel-title">
                  {exercise ? localize(exercise.title, language) : attempt.exerciseId}
                </span>
                <span className="history-menu-panel-time muted">
                  {formatAttemptTime(attempt.at, language)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        className="history-menu-panel-viewall"
        onClick={() => {
          onShowHistory();
          close();
        }}
      >
        {t('historyMenu.viewAll')}
      </button>
    </div>
  );
}
