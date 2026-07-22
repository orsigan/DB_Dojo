import { type Difficulty, localize } from '@db-dojo/core';
import type { ExerciseModule } from '@db-dojo/exercise-kit';
import { useMemo } from 'react';
import { conceptFilters } from '../app/concepts';
import { difficultyRank } from '../app/difficulty';
import { exerciseModules } from '../app/exercise-registry';
import { useLanguage } from '../app/i18n/use-language';
import { useTranslation } from '../app/i18n/use-translation';
import type { ModeComponentProps } from '../app/modes/types';
import { topicKey, topicLabel } from '../app/topics';
import { useLocalStorageState } from '../app/use-local-storage-state';
import { useProgress } from '../app/use-progress';
import { ComingSoonPanel } from './ComingSoonPanel';
import { DifficultyBadge } from './DifficultyBadge';
import { DifficultyFilterChips } from './filters/DifficultyFilterChips';
import { MultiSelectFilterChips } from './filters/MultiSelectFilterChips';
import { StatusFilterChips } from './filters/StatusFilterChips';

type Status = 'all' | 'unsolved' | 'solved';

export function FreeModeView({ navigate }: ModeComponentProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const analysis = useProgress();
  const [selectedDifficulties, setSelectedDifficulties] = useLocalStorageState<Difficulty[]>(
    'db-dojo:freemode-filter-difficulties',
    []
  );
  const [selectedTopics, setSelectedTopics] = useLocalStorageState<string[]>(
    'db-dojo:freemode-filter-topics',
    []
  );
  const [selectedConcepts, setSelectedConcepts] = useLocalStorageState<string[]>(
    'db-dojo:freemode-filter-concepts',
    []
  );
  const [status, setStatus] = useLocalStorageState<Status>(
    'db-dojo:freemode-filter-status',
    'unsolved'
  );

  const statusOptions: { id: Status; label: string }[] = [
    { id: 'all', label: t('common.statusAll') },
    { id: 'unsolved', label: t('common.statusUnsolved') },
    { id: 'solved', label: t('common.statusSolved') }
  ];

  const perExercise = useMemo(() => analysis?.perExercise ?? {}, [analysis]);

  // Every distinct top-level topic, so the filter offers exactly what exists.
  const topicOptions = useMemo(() => {
    const keys = new Set<string>();
    for (const module of exerciseModules) {
      const path = module.definition.topic;
      if (path.length > 0) {
        keys.add(topicKey(path.slice(0, 1)));
      }
    }
    return [...keys].sort();
  }, []);

  const matches = useMemo(() => {
    return exerciseModules
      .filter((module) => {
        const { difficulty, topic, tags, id } = module.definition;
        if (selectedDifficulties.length > 0 && !selectedDifficulties.includes(difficulty)) {
          return false;
        }
        if (selectedTopics.length > 0 && !selectedTopics.includes(topicKey(topic.slice(0, 1)))) {
          return false;
        }
        if (
          selectedConcepts.length > 0 &&
          !selectedConcepts.some((concept) => tags.includes(concept))
        ) {
          return false;
        }
        const passed = perExercise[id]?.passed ?? false;
        if (status === 'unsolved' && passed) {
          return false;
        }
        if (status === 'solved' && !passed) {
          return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          difficultyRank(a.definition.difficulty) - difficultyRank(b.definition.difficulty) ||
          localize(a.definition.title, language).localeCompare(
            localize(b.definition.title, language)
          )
      );
  }, [selectedDifficulties, selectedTopics, selectedConcepts, status, perExercise, language]);

  if (exerciseModules.length === 0) {
    return <ComingSoonPanel title={t('freeMode.title')} />;
  }

  function toggleDifficulty(difficulty: Difficulty) {
    setSelectedDifficulties((prev) =>
      prev.includes(difficulty)
        ? prev.filter((entry) => entry !== difficulty)
        : [...prev, difficulty]
    );
  }

  function toggleTopic(key: string) {
    setSelectedTopics((prev) =>
      prev.includes(key) ? prev.filter((entry) => entry !== key) : [...prev, key]
    );
  }

  function toggleConcept(tag: string) {
    setSelectedConcepts((prev) =>
      prev.includes(tag) ? prev.filter((entry) => entry !== tag) : [...prev, tag]
    );
  }

  function clearFilters() {
    setSelectedDifficulties([]);
    setSelectedTopics([]);
    setSelectedConcepts([]);
    setStatus('all');
  }

  function pickRandom() {
    const picked = matches[Math.floor(Math.random() * matches.length)];
    if (picked) {
      navigate({ kind: 'exercise', id: picked.definition.id });
    }
  }

  const filtersActive =
    selectedDifficulties.length > 0 ||
    selectedTopics.length > 0 ||
    selectedConcepts.length > 0 ||
    status !== 'all';

  return (
    <section className="free-mode">
      <div className="free-mode-hero">
        <h1>{t('freeMode.title')}</h1>
        <p className="muted">{t('freeMode.tagline')}</p>
      </div>

      <div className="filter-bar">
        <DifficultyFilterChips
          label={t('common.filterDifficultyLabel')}
          selected={selectedDifficulties}
          onToggle={toggleDifficulty}
        />

        {topicOptions.length > 1 && (
          <MultiSelectFilterChips
            label={t('common.filterTopicLabel')}
            options={topicOptions.map((key) => ({ id: key, label: topicLabel(key.split('/')) }))}
            selected={selectedTopics}
            onToggle={toggleTopic}
          />
        )}

        <MultiSelectFilterChips
          label={t('common.filterConceptLabel')}
          options={conceptFilters.map((concept) => ({ id: concept.tag, label: concept.label }))}
          selected={selectedConcepts}
          onToggle={toggleConcept}
        />

        <StatusFilterChips
          label={t('common.filterStatusLabel')}
          options={statusOptions}
          value={status}
          onChange={setStatus}
        />

        {filtersActive && (
          <button type="button" className="filter-clear" onClick={clearFilters}>
            {t('common.clearFilters')}
          </button>
        )}
      </div>

      <div className="free-mode-actions">
        <span className="muted">
          {matches.length === 1
            ? t('freeMode.matchesSingular', { count: matches.length })
            : t('freeMode.matchesPlural', { count: matches.length })}
        </span>
        <button
          type="button"
          className="primary"
          disabled={matches.length === 0}
          onClick={pickRandom}
        >
          {t('freeMode.surpriseMe')}
        </button>
      </div>

      {matches.length === 0 ? (
        <p className="muted">{t('common.noMatches')}</p>
      ) : (
        <ul className="challenge-list">
          {matches.map((module) => (
            <ChallengeRow
              key={module.definition.id}
              module={module}
              passed={perExercise[module.definition.id]?.passed ?? false}
              onOpen={() => navigate({ kind: 'exercise', id: module.definition.id })}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function ChallengeRow({
  module,
  passed,
  onOpen
}: {
  module: ExerciseModule;
  passed: boolean;
  onOpen: () => void;
}) {
  const { language } = useLanguage();
  const { title, difficulty, topic } = module.definition;
  return (
    <li>
      <button type="button" className="challenge-row" onClick={onOpen}>
        <span className="challenge-row-main">
          <span className="challenge-row-title">{localize(title, language)}</span>
          <span className="challenge-row-topic">
            {topic.map((_, index) => topicLabel(topic.slice(0, index + 1))).join(' › ')}
          </span>
        </span>
        <span className="challenge-row-meta">
          <DifficultyBadge difficulty={difficulty} />
          {passed && <span className="challenge-row-solved">✓</span>}
        </span>
      </button>
    </li>
  );
}
