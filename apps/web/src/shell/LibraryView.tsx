import type { Difficulty } from '@db-dojo/core';
import { useMemo } from 'react';
import { conceptFilters } from '../app/concepts';
import { exerciseModules } from '../app/exercise-registry';
import type { GraphNode } from '../app/graph/model';
import { unifiedGraph } from '../app/graph/sources';
import { useLanguage } from '../app/i18n/use-language';
import { useTranslation } from '../app/i18n/use-translation';
import type { ModeComponentProps } from '../app/modes/types';
import { useLocalStorageState } from '../app/use-local-storage-state';
import { useProgress } from '../app/use-progress';
import { CardBrowser } from './CardBrowser';
import { DifficultyFilterChips } from './filters/DifficultyFilterChips';
import { MultiSelectFilterChips } from './filters/MultiSelectFilterChips';
import { StatusFilterChips } from './filters/StatusFilterChips';
import { DependencyGraph } from './graph/DependencyGraph';
import { type ViewMode, ViewToggle } from './ViewToggle';

type Status = 'all' | 'unsolved' | 'solved';

interface LibraryFilters {
  search: string;
  difficulties: Difficulty[];
  concepts: string[];
  status: Status;
}

function filterTree(nodes: GraphNode[], filters: LibraryFilters): GraphNode[] {
  const result: GraphNode[] = [];
  for (const node of nodes) {
    if (node.kind === 'exercise') {
      if (matchesExercise(node, filters)) {
        result.push(node);
      }
      continue;
    }
    const children = filterTree(node.children, filters);
    if (children.length > 0) {
      result.push({ ...node, children });
    }
  }
  return result;
}

function matchesExercise(node: GraphNode, filters: LibraryFilters): boolean {
  if (filters.search && !node.label.toLowerCase().includes(filters.search)) {
    return false;
  }
  if (
    filters.difficulties.length > 0 &&
    (!node.difficulty || !filters.difficulties.includes(node.difficulty))
  ) {
    return false;
  }
  if (
    filters.concepts.length > 0 &&
    !filters.concepts.some((concept) => node.tags?.includes(concept))
  ) {
    return false;
  }
  const solved = node.passedExercises === node.totalExercises;
  if (filters.status === 'solved' && !solved) {
    return false;
  }
  if (filters.status === 'unsolved' && solved) {
    return false;
  }
  return true;
}

export function LibraryView({ navigate }: ModeComponentProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const hints: Record<ViewMode, string> = {
    graph: t('library.hintGraph'),
    cards: t('library.hintCards')
  };
  const statusOptions: { id: Status; label: string }[] = [
    { id: 'all', label: t('common.statusAll') },
    { id: 'unsolved', label: t('common.statusUnsolved') },
    { id: 'solved', label: t('common.statusSolved') }
  ];
  const analysis = useProgress();
  const [mode, setMode] = useLocalStorageState<ViewMode>('db-dojo:library-view-mode', 'graph');
  const perExercise = useMemo(() => analysis?.perExercise ?? {}, [analysis]);
  const roots = useMemo(
    () => unifiedGraph(exerciseModules, perExercise, language),
    [perExercise, language]
  );

  const [search, setSearch] = useLocalStorageState('db-dojo:library-filter-search', '');
  const [selectedDifficulties, setSelectedDifficulties] = useLocalStorageState<Difficulty[]>(
    'db-dojo:library-filter-difficulties',
    []
  );
  const [selectedConcepts, setSelectedConcepts] = useLocalStorageState<string[]>(
    'db-dojo:library-filter-concepts',
    []
  );
  const [status, setStatus] = useLocalStorageState<Status>('db-dojo:library-filter-status', 'all');

  const filtersActive =
    search.trim().length > 0 ||
    selectedDifficulties.length > 0 ||
    selectedConcepts.length > 0 ||
    status !== 'all';

  const filteredRoots = useMemo(() => {
    if (!filtersActive) {
      return roots;
    }
    return filterTree(roots, {
      search: search.trim().toLowerCase(),
      difficulties: selectedDifficulties,
      concepts: selectedConcepts,
      status
    });
  }, [roots, filtersActive, search, selectedDifficulties, selectedConcepts, status]);

  function toggleDifficulty(difficulty: Difficulty) {
    setSelectedDifficulties((prev) =>
      prev.includes(difficulty)
        ? prev.filter((entry) => entry !== difficulty)
        : [...prev, difficulty]
    );
  }

  function toggleConcept(tag: string) {
    setSelectedConcepts((prev) =>
      prev.includes(tag) ? prev.filter((entry) => entry !== tag) : [...prev, tag]
    );
  }

  function clearFilters() {
    setSearch('');
    setSelectedDifficulties([]);
    setSelectedConcepts([]);
    setStatus('all');
  }

  const emptyLabel = filtersActive ? t('common.noMatches') : t('library.noContent');

  return (
    <section className={mode === 'graph' ? 'library-view graph-mode' : 'library-view'}>
      <div className="library-header">
        <div className="library-heading">
          <h1>{t('library.title')}</h1>
          <p className="muted library-hint">{hints[mode]}</p>
        </div>
        <ViewToggle mode={mode} onChange={setMode} />
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <span className="filter-label">{t('common.filterSearchLabel')}</span>
          <input
            type="text"
            className="library-search-input"
            placeholder={t('library.searchPlaceholder')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <DifficultyFilterChips
          label={t('common.filterDifficultyLabel')}
          selected={selectedDifficulties}
          onToggle={toggleDifficulty}
        />

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

      {mode === 'graph' ? (
        <DependencyGraph
          roots={filteredRoots}
          storageKey="db-dojo:library-expanded"
          onOpen={navigate}
          emptyLabel={emptyLabel}
        />
      ) : (
        <CardBrowser
          roots={filteredRoots}
          storageKey="db-dojo:library-cards-path"
          onOpen={navigate}
          emptyLabel={emptyLabel}
        />
      )}
    </section>
  );
}
