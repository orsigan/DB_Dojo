import { localize } from '@db-dojo/core';
import type { ExerciseModule } from '@db-dojo/exercise-kit';
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { exerciseModules } from '../app/exercise-registry';
import { useLanguage } from '../app/i18n/use-language';
import { useTranslation } from '../app/i18n/use-translation';
import { modes } from '../app/modes/registry';
import type { ModeDefinition, View } from '../app/modes/types';
import { DifficultyBadge } from './DifficultyBadge';
import { SearchIcon } from './icon-bar/icons';

const MAX_EXERCISE_RESULTS = 8;

type PaletteResult =
  | { type: 'mode'; mode: ModeDefinition; label: string }
  | { type: 'exercise'; module: ExerciseModule; label: string };

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  navigate: (view: View) => void;
}

export function CommandPalette({ open, onClose, navigate }: CommandPaletteProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      inputRef.current?.focus();
    }
  }, [open]);

  function handleQueryChange(value: string) {
    setQuery(value);
    setActiveIndex(0);
  }

  const modeResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    return modes
      .filter((mode) => mode.showInSidebar)
      .map((mode) => ({ mode, label: t(`nav.${mode.id}`) }))
      .filter((entry) => !q || entry.label.toLowerCase().includes(q));
  }, [query, t]);

  const exerciseResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [];
    }
    return exerciseModules
      .filter((exerciseModule) => {
        const { title, id, topic } = exerciseModule.definition;
        return (
          localize(title, language).toLowerCase().includes(q) ||
          id.toLowerCase().includes(q) ||
          topic.some((segment) => segment.toLowerCase().includes(q))
        );
      })
      .slice(0, MAX_EXERCISE_RESULTS);
  }, [query, language]);

  const results: PaletteResult[] = useMemo(
    () => [
      ...modeResults.map((entry) => ({
        type: 'mode' as const,
        mode: entry.mode,
        label: entry.label
      })),
      ...exerciseResults.map((exerciseModule) => ({
        type: 'exercise' as const,
        module: exerciseModule,
        label: localize(exerciseModule.definition.title, language)
      }))
    ],
    [modeResults, exerciseResults, language]
  );

  if (!open) {
    return null;
  }

  function selectResult(result: PaletteResult) {
    if (result.type === 'mode') {
      navigate(result.mode.defaultView());
    } else {
      navigate({ kind: 'exercise', id: result.module.definition.id });
    }
    onClose();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => (results.length ? (prev + 1) % results.length : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => (results.length ? (prev - 1 + results.length) % results.length : 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const active = results[activeIndex];
      if (active) {
        selectResult(active);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  }

  return (
    <>
      <button
        type="button"
        className="command-palette-backdrop"
        aria-label={t('commandPalette.closeOverlay')}
        onClick={onClose}
      />
      <div
        className="command-palette"
        role="dialog"
        aria-modal="true"
        aria-label={t('commandPalette.ariaLabel')}
      >
        <div className="command-palette-input-row">
          <SearchIcon className="command-palette-icon" />
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
            placeholder={t('commandPalette.placeholder')}
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            onKeyDown={handleKeyDown}
            aria-label={t('commandPalette.ariaLabel')}
          />
          <span className="command-palette-hint">{t('commandPalette.closeHint')}</span>
        </div>

        <div className="command-palette-results">
          {results.length === 0 && (
            <p className="command-palette-empty muted">{t('commandPalette.emptyState')}</p>
          )}

          {modeResults.length > 0 && (
            <div className="command-palette-section">
              <span className="command-palette-section-heading">
                {t('commandPalette.modesHeading')}
              </span>
              {modeResults.map((entry, index) => (
                <button
                  key={entry.mode.id}
                  type="button"
                  className={
                    index === activeIndex
                      ? 'command-palette-result active'
                      : 'command-palette-result'
                  }
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() =>
                    selectResult({ type: 'mode', mode: entry.mode, label: entry.label })
                  }
                >
                  <span>{entry.label}</span>
                </button>
              ))}
            </div>
          )}

          {exerciseResults.length > 0 && (
            <div className="command-palette-section">
              <span className="command-palette-section-heading">
                {t('commandPalette.exercisesHeading')}
              </span>
              {exerciseResults.map((exerciseModule, index) => {
                const globalIndex = modeResults.length + index;
                const title = localize(exerciseModule.definition.title, language);
                return (
                  <button
                    key={exerciseModule.definition.id}
                    type="button"
                    className={
                      globalIndex === activeIndex
                        ? 'command-palette-result active'
                        : 'command-palette-result'
                    }
                    onMouseEnter={() => setActiveIndex(globalIndex)}
                    onClick={() =>
                      selectResult({ type: 'exercise', module: exerciseModule, label: title })
                    }
                  >
                    <span className="command-palette-result-main">
                      <span>{title}</span>
                      <span className="muted">{exerciseModule.definition.topic.join(' / ')}</span>
                    </span>
                    <DifficultyBadge difficulty={exerciseModule.definition.difficulty} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
