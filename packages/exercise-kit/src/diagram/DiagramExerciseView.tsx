import type { Diagram, Verdict } from '@db-dojo/core';
import { localize } from '@db-dojo/core';
import { useEffect, useState } from 'react';
import { HintList } from '../components/HintList';
import type { ExerciseViewProps } from '../contract';
import { DiagramCanvas } from './DiagramCanvas';
import { DiagramPalette } from './DiagramPalette';
import { d } from './diagram-strings';
import { type DiagramToolsetId, toolsOf } from './diagram-tools';
import { useDiagramEditor } from './use-diagram-editor';

const EMPTY_DIAGRAM: Diagram = { nodes: [], edges: [] };

export interface DiagramExerciseViewProps extends ExerciseViewProps {
  toolset?: DiagramToolsetId;
  starterDiagram?: Diagram;
}

export function DiagramExerciseView({
  exercise,
  host,
  language,
  toolset = 'all',
  starterDiagram = EMPTY_DIAGRAM
}: DiagramExerciseViewProps) {
  const editor = useDiagramEditor(exercise.id, starterDiagram, language);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [taskVisible, setTaskVisible] = useState(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';

      if (event.key === 'Escape') {
        editor.cancelPending();
        return;
      }
      if ((event.key === 'z' || event.key === 'Z') && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        editor.undo();
        return;
      }
      if (!typing && (event.key === 'Delete' || event.key === 'Backspace')) {
        event.preventDefault();
        editor.deleteSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  const submit = async () => {
    setBusy(true);
    const outcome = await host.submitDiagram(editor.diagram);
    if (outcome.success) {
      setVerdict(outcome.value);
      setError(null);
    } else {
      setVerdict(null);
      setError(outcome.error.message);
    }
    setBusy(false);
  };

  return (
    <div className="diagram-exercise">
      <header className="diagram-header">
        <div className="diagram-header-main">
          <h2 className="exercise-title">{localize(exercise.title, language)}</h2>
          {taskVisible && (
            <>
              <p className="diagram-prompt">{localize(exercise.prompt, language)}</p>
              <HintList hints={exercise.hints} language={language} />
            </>
          )}
        </div>

        <div className="diagram-header-actions">
          <button type="button" className="ghost" onClick={() => setTaskVisible(!taskVisible)}>
            {d(taskVisible ? 'hideTask' : 'showTask', language)}
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => {
              if (window.confirm(d('resetConfirm', language))) {
                editor.reset();
                setVerdict(null);
              }
            }}
          >
            {d('reset', language)}
          </button>
          <button type="button" className="primary" onClick={submit} disabled={busy}>
            {busy ? d('checking', language) : d('submit', language)}
          </button>
        </div>
      </header>

      <div className="diagram-body">
        <DiagramCanvas editor={editor} language={language} />
        <DiagramPalette
          tools={toolsOf(toolset)}
          language={language}
          activeToolId={editor.activeTool?.id ?? null}
          onArm={editor.armTool}
        />
      </div>

      {error && <p className="error diagram-feedback">{error}</p>}

      {verdict && (
        <div className={verdict.passed ? 'diagram-verdict pass' : 'diagram-verdict fail'}>
          <div className="diagram-verdict-head">
            <strong>{d(verdict.passed ? 'passed' : 'notThereYet', language)}</strong>
            <button
              type="button"
              className="ghost"
              aria-label={d('closeFeedback', language)}
              onClick={() => setVerdict(null)}
            >
              ×
            </button>
          </div>
          <ul>
            {verdict.feedback.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
