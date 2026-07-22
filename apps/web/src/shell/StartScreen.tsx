import { type Attempt, type Language, localize } from '@db-dojo/core';
import { type SubmitEvent, useEffect, useMemo, useState } from 'react';
import { findChapterPath } from '../app/chapter-tree';
import { currentUser } from '../app/current-user';
import { curriculum } from '../app/curriculum';
import { exerciseModules } from '../app/exercise-registry';
import { useLanguage } from '../app/i18n/use-language';
import { useTranslation } from '../app/i18n/use-translation';
import type { ModeComponentProps, View } from '../app/modes/types';
import { useServices } from '../app/services-context';
import { useLocalStorageState } from '../app/use-local-storage-state';
import { LAST_VIEW_STORAGE_KEY } from '../app/use-url-view';
import { ClockIcon, SearchIcon } from './icon-bar/icons';
import { StartDashboard } from './StartDashboard';

const MAX_SEARCH_RESULTS = 6;
const MAX_SEARCH_HISTORY = 6;
const SEARCH_HISTORY_STORAGE_KEY = 'search-history';

const MODE_CARDS: { kind: 'guided' | 'free' | 'library' }[] = [
  { kind: 'guided' },
  { kind: 'free' },
  { kind: 'library' }
];

function readLastView(): View | null {
  try {
    const raw = window.localStorage.getItem(LAST_VIEW_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as View) : null;
  } catch {
    return null;
  }
}

function describeLastView(
  view: View,
  t: ReturnType<typeof useTranslation>['t'],
  language: Language
): { title: string; subtitle: string } | null {
  switch (view.kind) {
    case 'guided': {
      const path = view.chapterId ? findChapterPath(curriculum, view.chapterId) : undefined;
      const chapter = path?.[path.length - 1];
      return { title: chapter?.title ?? t('start.guidedTitle'), subtitle: t('start.guidedTitle') };
    }
    case 'free':
      return { title: t('start.freeTitle'), subtitle: t('start.freePracticeSubtitle') };
    case 'library':
      return { title: t('start.libraryTitle'), subtitle: t('start.libraryBrowseSubtitle') };
    case 'stats':
      return { title: t('nav.stats'), subtitle: t('start.yourProgress') };
    case 'exercise': {
      const exerciseModule = exerciseModules.find(
        (candidate) => candidate.definition.id === view.id
      );
      if (!exerciseModule) {
        return null;
      }
      return {
        title: localize(exerciseModule.definition.title, language),
        subtitle: t('start.exercise')
      };
    }
    default:
      return null;
  }
}

export function StartScreen({ navigate }: ModeComponentProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const services = useServices();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [lastView] = useState<View | null>(readLastView);
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useLocalStorageState<string[]>(
    SEARCH_HISTORY_STORAGE_KEY,
    []
  );

  useEffect(() => {
    services.progress.all().then(setAttempts);
  }, [services]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [];
    }
    return exerciseModules
      .filter((exerciseModule) => {
        const { title, tags, topic } = exerciseModule.definition;
        return (
          localize(title, language).toLowerCase().includes(q) ||
          tags.some((tag) => tag.toLowerCase().includes(q)) ||
          topic.some((segment) => segment.toLowerCase().includes(q))
        );
      })
      .slice(0, MAX_SEARCH_RESULTS);
  }, [query, language]);

  const continueTo = lastView && describeLastView(lastView, t, language);
  const modeCards = MODE_CARDS.filter((card) => card.kind !== lastView?.kind);

  function recordSearchHistory(term: string) {
    const trimmed = term.trim();
    if (!trimmed) {
      return;
    }
    setSearchHistory((prev) =>
      [trimmed, ...prev.filter((entry) => entry.toLowerCase() !== trimmed.toLowerCase())].slice(
        0,
        MAX_SEARCH_HISTORY
      )
    );
  }

  function removeSearchHistoryEntry(term: string) {
    setSearchHistory((prev) => prev.filter((entry) => entry !== term));
  }

  function handleSearchSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    recordSearchHistory(query);
    const first = results[0];
    if (first) {
      navigate({ kind: 'exercise', id: first.definition.id });
    }
  }

  function selectSearchResult(exerciseId: string) {
    recordSearchHistory(query);
    navigate({ kind: 'exercise', id: exerciseId });
  }

  function handleSearchBlur() {
    recordSearchHistory(query);
  }

  return (
    <section className="start-screen">
      <div className="start-main">
        <div className="start-hero">
          <p className="start-greeting">{t('start.welcomeBack', { name: currentUser.name })}</p>
          <h1>DB Dojo</h1>
          <p className="muted">{t('start.tagline')}</p>

          <search className="start-search">
            <form onSubmit={handleSearchSubmit}>
              <SearchIcon className="start-search-icon" />
              <input
                type="search"
                className="start-search-input"
                placeholder={t('start.searchPlaceholder')}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onBlur={handleSearchBlur}
                aria-label={t('start.searchAriaLabel')}
              />

              {results.length > 0 && (
                <div className="start-search-results">
                  {results.map((exerciseModule) => (
                    <button
                      key={exerciseModule.definition.id}
                      type="button"
                      className="start-search-result"
                      onClick={() => selectSearchResult(exerciseModule.definition.id)}
                    >
                      <span>{localize(exerciseModule.definition.title, language)}</span>
                      <span className="muted">{exerciseModule.definition.topic.join(' / ')}</span>
                    </button>
                  ))}
                </div>
              )}

              {query.trim().length === 0 && searchHistory.length > 0 && (
                <div className="start-search-results start-search-history">
                  <div className="start-search-history-head">
                    <span className="muted">{t('start.recentSearches')}</span>
                    <button
                      type="button"
                      className="start-search-history-clear"
                      onClick={() => setSearchHistory([])}
                    >
                      {t('start.clear')}
                    </button>
                  </div>
                  {searchHistory.map((term) => (
                    <div key={term} className="start-search-history-row">
                      <button
                        type="button"
                        className="start-search-result start-search-history-item"
                        onClick={() => setQuery(term)}
                      >
                        <ClockIcon className="start-search-history-icon" />
                        <span>{term}</span>
                      </button>
                      <button
                        type="button"
                        className="start-search-history-remove"
                        aria-label={t('start.removeSearchHistory', { term })}
                        onClick={() => removeSearchHistoryEntry(term)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </form>
          </search>
        </div>

        {continueTo && (
          <button
            type="button"
            className="mode-card continue-card"
            onClick={() => navigate(lastView as View)}
          >
            <span className="continue-card-label">
              <ClockIcon />
              {t('start.continue')}
            </span>
            <h3>{continueTo.title}</h3>
            <p className="muted">{continueTo.subtitle}</p>
          </button>
        )}

        <div className="mode-card-grid">
          {modeCards.map((card) => (
            <button
              key={card.kind}
              type="button"
              className="mode-card"
              onClick={() => navigate({ kind: card.kind })}
            >
              <h3>{t(`start.${card.kind}Title`)}</h3>
              <p className="muted">{t(`start.${card.kind}Description`)}</p>
            </button>
          ))}
        </div>

        <StartDashboard attempts={attempts} navigate={navigate} />
      </div>
    </section>
  );
}
