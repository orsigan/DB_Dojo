import type { ExerciseId, ExerciseProgress } from '@db-dojo/core';
import { chapterProgress } from '../app/chapter-tree';
import type { Chapter } from '../app/curriculum';
import { curriculum } from '../app/curriculum';
import { useTranslation } from '../app/i18n/use-translation';
import { ChapterIcon } from './chapter-icons';
import { type ChapterStatus, computeChapterStatuses } from './GuidedMap';

const STATUS_LABEL_KEY: Record<ChapterStatus, string> = {
  completed: 'milestones.statusCompleted',
  current: 'milestones.statusCurrent',
  pending: 'milestones.statusPending'
};

export function MilestonesPanel({
  perExercise
}: {
  perExercise: Record<ExerciseId, ExerciseProgress>;
}) {
  const { t } = useTranslation();
  const statuses = computeChapterStatuses(curriculum, perExercise);
  const completedCount = statuses.filter((status) => status === 'completed').length;

  return (
    <section className="milestones-panel">
      <div className="achievements-header">
        <h3>{t('milestones.title')}</h3>
        <span className="muted">
          {t('milestones.completedCount', { count: completedCount, total: curriculum.length })}
        </span>
      </div>
      <div className="milestones-grid">
        {curriculum.map((chapter, index) => (
          <MilestoneCard
            key={chapter.id}
            chapter={chapter}
            status={statuses[index] ?? 'pending'}
            perExercise={perExercise}
          />
        ))}
      </div>
    </section>
  );
}

function MilestoneCard({
  chapter,
  status,
  perExercise
}: {
  chapter: Chapter;
  status: ChapterStatus;
  perExercise: Record<ExerciseId, ExerciseProgress>;
}) {
  const { t } = useTranslation();
  const progress = chapterProgress(chapter, perExercise);
  const hasExercises = progress.totalExercises > 0;
  const percent = hasExercises
    ? Math.round((progress.passedExercises / progress.totalExercises) * 100)
    : 0;

  return (
    <div className={`milestone-card ${status}`}>
      <span className="milestone-card-icon" aria-hidden="true">
        <ChapterIcon chapterId={chapter.id} />
      </span>
      <div className="milestone-card-text">
        <div className="milestone-card-heading">
          <span className="milestone-card-title">{chapter.title}</span>
          <span className="milestone-card-status-badge">{t(STATUS_LABEL_KEY[status])}</span>
        </div>
        {chapter.summary && <span className="milestone-card-summary muted">{chapter.summary}</span>}
        {hasExercises && (
          <div className="achievement-progress">
            <div className="progress-bar">
              <span className="progress-bar-fill" style={{ width: `${percent}%` }} />
            </div>
            <span className="achievement-progress-label muted">
              {t('guided.solvedCount', {
                passed: progress.passedExercises,
                total: progress.totalExercises
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
