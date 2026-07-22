import { localize } from '@db-dojo/core';
import { useEffect, useState } from 'react';
import type { ExerciseViewProps } from '../contract';
import { modifierKeyLabel, t } from '../strings';
import { useExerciseRunner } from '../use-exercise-runner';
import { useShowSolutionSetting } from '../use-show-solution-setting';
import { ExplainPanel } from './ExplainPanel';
import { HintList } from './HintList';
import { HistoryPanel } from './HistoryPanel';
import { ResultTable } from './ResultTable';
import { SqlEditor } from './SqlEditor';

const FAILED_ATTEMPTS_BEFORE_SOLUTION = 3;

export function ExerciseScaffold({ exercise, host, language }: ExerciseViewProps) {
  const {
    sql,
    setSql,
    result,
    verdict,
    error,
    busy,
    history,
    run,
    submit,
    reset,
    loadFromHistory
  } = useExerciseRunner(exercise, host);
  const mod = modifierKeyLabel();

  const [showSolutionSetting] = useShowSolutionSetting();
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [solutionRevealed, setSolutionRevealed] = useState(false);

  useEffect(() => {
    if (verdict && !verdict.passed) {
      setFailedAttempts((count) => count + 1);
    }
  }, [verdict]);

  const solutionSql =
    exercise.grading.kind === 'result-equals' ? exercise.grading.expectedSql : null;
  const canShowSolution =
    showSolutionSetting &&
    solutionSql !== null &&
    failedAttempts >= FAILED_ATTEMPTS_BEFORE_SOLUTION;

  return (
    <section className="exercise">
      <p className="exercise-prompt">{localize(exercise.prompt, language)}</p>

      <HintList hints={exercise.hints} language={language} />

      <SqlEditor
        value={sql}
        onChange={setSql}
        language={language}
        host={host}
        onRun={run}
        onSubmit={submit}
      />

      <div className="exercise-actions">
        <button type="button" onClick={run} disabled={busy} title={`${mod}+Enter`}>
          {t('run', language)}
        </button>
        <button
          type="button"
          className="primary"
          onClick={submit}
          disabled={busy}
          title={`${mod}+Shift+Enter`}
        >
          {t('submit', language)}
        </button>
        <button type="button" className="ghost" onClick={reset} disabled={busy}>
          {t('reset', language)}
        </button>
      </div>

      <ExplainPanel host={host} sql={sql} language={language} />

      <HistoryPanel history={history} onSelect={loadFromHistory} language={language} />

      {error && <p className="error">{error}</p>}

      {verdict && (
        <div className={verdict.passed ? 'verdict pass' : 'verdict fail'}>
          <strong>{verdict.passed ? t('passed', language) : t('notThereYet', language)}</strong>
          <ul>
            {verdict.feedback.map((line, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: feedback lines have no stable id and the list is static
              <li key={index}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      {canShowSolution &&
        (solutionRevealed ? (
          <pre className="exercise-solution-code">{solutionSql}</pre>
        ) : (
          <button type="button" className="ghost" onClick={() => setSolutionRevealed(true)}>
            {t('showSolution', language)}
          </button>
        ))}

      {result && <ResultTable result={result} language={language} />}
    </section>
  );
}
