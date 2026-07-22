import { type Attempt, localize, TOPIC_ICONS } from '@db-dojo/core';
import { exerciseModules } from '../app/exercise-registry';
import { useLanguage } from '../app/i18n/use-language';
import { useTranslation } from '../app/i18n/use-translation';
import { useAttempts } from '../app/use-attempts';
import {
  attemptDayKey,
  formatAttemptDuration,
  formatAttemptTime,
  formatDayLabel
} from './history-format';
import { CheckCircleIcon } from './icon-bar/icons';

interface AttemptGroup {
  dayKey: string;
  attempts: Attempt[];
}

function groupByDay(attempts: Attempt[]): AttemptGroup[] {
  const sorted = [...attempts].sort((a, b) => b.at.localeCompare(a.at));
  const groups: AttemptGroup[] = [];
  for (const attempt of sorted) {
    const key = attemptDayKey(attempt.at);
    const current = groups.at(-1);
    if (current && current.dayKey === key) {
      current.attempts.push(attempt);
    } else {
      groups.push({ dayKey: key, attempts: [attempt] });
    }
  }
  return groups;
}

export function HistoryView() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const attempts = useAttempts().filter((attempt) => attempt.passed);
  const groups = groupByDay(attempts);

  return (
    <section className="history-page">
      <h1>{t('history.title')}</h1>
      <p className="muted">
        {t('history.subtitle')} · {t('history.entryCount', { count: attempts.length })}
      </p>

      {groups.length === 0 ? (
        <p className="muted history-page-empty">{t('history.empty')}</p>
      ) : (
        <div className="history-timeline">
          {groups.map((group) => (
            <div key={group.dayKey} className="history-day-group">
              <h2 className="history-day-heading">
                {formatDayLabel(group.attempts[0]?.at ?? '', language, t)}
              </h2>
              <ul className="history-day-entries">
                {group.attempts.map((attempt) => (
                  <HistoryEntry
                    key={`${attempt.exerciseId}-${attempt.at}`}
                    attempt={attempt}
                    language={language}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function HistoryEntry({
  attempt,
  language
}: {
  attempt: Attempt;
  language: ReturnType<typeof useLanguage>['language'];
}) {
  const exercise = exerciseModules.find(
    (module) => module.definition.id === attempt.exerciseId
  )?.definition;
  const topicIcon = exercise ? (TOPIC_ICONS[exercise.topic[0] ?? ''] ?? '📘') : '📘';

  return (
    <li className="history-entry passed">
      <span className="history-entry-status" aria-hidden="true">
        <CheckCircleIcon className="history-status-icon pass" />
      </span>

      <span className="history-entry-topic-icon" aria-hidden="true">
        {topicIcon}
      </span>

      <div className="history-entry-body">
        <span className="history-entry-title">
          {exercise ? localize(exercise.title, language) : attempt.exerciseId}
        </span>
        <span className="history-entry-meta muted">
          {formatAttemptTime(attempt.at, language)} · {formatAttemptDuration(attempt.durationMs)}
        </span>
      </div>

      {exercise && (
        <span className={`difficulty-badge ${exercise.difficulty.toLowerCase()}`}>
          {exercise.difficulty}
        </span>
      )}
    </li>
  );
}
