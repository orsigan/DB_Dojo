import { type Difficulty, type ExerciseId, type ExerciseProgress, localize } from '@db-dojo/core';
import { useMemo } from 'react';
import {
  type ChapterProgress,
  chapterProgress,
  findChapterById,
  hasContent
} from '../app/chapter-tree';
import { type Chapter, curriculum } from '../app/curriculum';
import { exerciseModules } from '../app/exercise-registry';
import { chapterGraph } from '../app/graph/sources';
import { useLanguage } from '../app/i18n/use-language';
import { useTranslation } from '../app/i18n/use-translation';
import type { ModeComponentProps, View } from '../app/modes/types';
import { useLocalStorageState } from '../app/use-local-storage-state';
import { useProgress } from '../app/use-progress';
import { ComingSoonPanel } from './ComingSoonPanel';
import { GraphNodeIcon } from './chapter-icons';
import { DifficultyBadge } from './DifficultyBadge';
import { GuidedMap } from './GuidedMap';
import { DependencyGraph } from './graph/DependencyGraph';
import { type ViewMode, ViewToggle } from './ViewToggle';

export function GuidedPathView({ view, navigate }: ModeComponentProps) {
  const { t } = useTranslation();
  const analysis = useProgress();
  const [mode, setMode] = useLocalStorageState<ViewMode>('db-dojo:guided-view-mode', 'graph');

  const perExercise = useMemo(() => analysis?.perExercise ?? {}, [analysis]);
  const chapterId = view.kind === 'guided' ? view.chapterId : undefined;
  const activeChapter = chapterId ? findChapterById(curriculum, chapterId) : undefined;

  if (chapterId && !activeChapter) {
    return <p className="muted">{t('guided.chapterNotFound', { id: chapterId })}</p>;
  }

  if (activeChapter) {
    return (
      <ChapterDetail
        chapter={activeChapter}
        perExercise={perExercise}
        mode={mode}
        onChangeMode={setMode}
        navigate={navigate}
      />
    );
  }

  return (
    <section className="guided-path-root">
      <div className="guided-hero">
        <h1>{t('guided.title')}</h1>
        <p className="muted">{t('guided.tagline')}</p>
      </div>
      <GuidedMap
        chapters={curriculum}
        perExercise={perExercise}
        onOpen={(id) => navigate({ kind: 'guided', chapterId: id })}
      />
    </section>
  );
}

function ChapterDetail({
  chapter,
  perExercise,
  mode,
  onChangeMode,
  navigate
}: {
  chapter: Chapter;
  perExercise: Record<ExerciseId, ExerciseProgress>;
  mode: ViewMode;
  onChangeMode: (mode: ViewMode) => void;
  navigate: (view: View) => void;
}) {
  const { language } = useLanguage();
  const roots = useMemo(
    () => chapterGraph(chapter, exerciseModules, perExercise, language),
    [chapter, perExercise, language]
  );

  const graphMode = roots.length > 0 && mode === 'graph';

  return (
    <section className={graphMode ? 'guided-path graph-mode' : 'guided-path'}>
      <div className="guided-chapter-header">
        <div className="guided-chapter-heading">
          <h1>{chapter.title}</h1>
          {chapter.summary && <p className="muted guided-chapter-summary">{chapter.summary}</p>}
        </div>
        {roots.length > 0 && <ViewToggle mode={mode} onChange={onChangeMode} />}
      </div>

      {!hasContent(chapter) && chapter.children.length === 0 && (
        <ComingSoonPanel title={chapter.title} />
      )}

      {roots.length > 0 &&
        (mode === 'graph' ? (
          <DependencyGraph
            roots={roots}
            storageKey={`db-dojo:guided-expanded:${chapter.id}`}
            onOpen={navigate}
          />
        ) : (
          <>
            {chapter.children.length > 0 && (
              <div className="chapter-card-grid">
                {chapter.children.map((child) => (
                  <ChapterCard
                    key={child.id}
                    chapter={child}
                    progress={chapterProgress(child, perExercise)}
                    onOpen={() => navigate({ kind: 'guided', chapterId: child.id })}
                  />
                ))}
              </div>
            )}

            {chapter.exerciseIds.length > 0 && (
              <div className="exercise-card-grid">
                {chapter.exerciseIds.map((exerciseId) => {
                  const module = exerciseModules.find(
                    (candidate) => candidate.definition.id === exerciseId
                  );
                  if (!module) {
                    return null;
                  }
                  return (
                    <ExerciseCard
                      key={exerciseId}
                      title={localize(module.definition.title, language)}
                      difficulty={module.definition.difficulty}
                      passed={perExercise[exerciseId]?.passed ?? false}
                      onOpen={() => navigate({ kind: 'exercise', id: exerciseId })}
                    />
                  );
                })}
              </div>
            )}
          </>
        ))}
    </section>
  );
}

function ChapterCard({
  chapter,
  progress,
  onOpen
}: {
  chapter: Chapter;
  progress: ChapterProgress;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const available = hasContent(chapter);
  return (
    <button
      type="button"
      className={available ? 'chapter-card' : 'chapter-card empty'}
      onClick={onOpen}
    >
      <h3>
        <GraphNodeIcon className="card-icon" kind="chapter" iconKey={chapter.id} />
        {chapter.title}
      </h3>
      {chapter.summary && <p className="chapter-card-summary">{chapter.summary}</p>}
      {available ? (
        <span className="chapter-card-meta">
          {t('guided.solvedCount', {
            passed: progress.passedExercises,
            total: progress.totalExercises
          })}
        </span>
      ) : (
        <span className="chapter-card-badge">{t('common.comingSoon')}</span>
      )}
    </button>
  );
}

function ExerciseCard({
  title,
  difficulty,
  passed,
  onOpen
}: {
  title: string;
  difficulty: Difficulty;
  passed: boolean;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className={passed ? 'exercise-card passed' : 'exercise-card'}
      onClick={onOpen}
    >
      <h4>
        <GraphNodeIcon className="card-icon" kind="exercise" />
        {title}
      </h4>
      <span className="exercise-card-meta">
        <DifficultyBadge difficulty={difficulty} />
        {passed ? <span className="exercise-card-solved">✓ {t('guided.solvedWord')}</span> : null}
      </span>
    </button>
  );
}
