import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap
} from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { PostgreSQL, type SQLNamespace, sql } from '@codemirror/lang-sql';
import {
  bracketMatching,
  defaultHighlightStyle,
  indentOnInput,
  syntaxHighlighting
} from '@codemirror/language';
import { Compartment, EditorState } from '@codemirror/state';
import {
  drawSelection,
  EditorView,
  highlightActiveLine,
  keymap,
  lineNumbers
} from '@codemirror/view';
import type { Language, SchemaInfo } from '@db-dojo/core';
import { useEffect, useRef, useState } from 'react';
import { format as formatSql } from 'sql-formatter';
import type { ExerciseHostApi } from '../contract';
import { t } from '../strings';
import { useAutocompleteSetting } from '../use-autocomplete-setting';

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: Language;
  host?: ExerciseHostApi;
  onRun?: () => void;
  onSubmit?: () => void;
}

function schemaNamespace(schema: SchemaInfo | null): SQLNamespace {
  const namespace: Record<string, string[]> = {};
  for (const table of schema?.tables ?? []) {
    namespace[table.name] = table.columns.map((column) => column.name);
  }
  return namespace;
}

export function SqlEditor({ value, onChange, language, host, onRun, onSubmit }: SqlEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onRunRef = useRef(onRun);
  onRunRef.current = onRun;
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;
  const sqlCompartmentRef = useRef<Compartment | null>(null);
  const [autocompleteEnabled] = useAutocompleteSetting();
  const [schema, setSchema] = useState<SchemaInfo | null>(null);

  useEffect(() => {
    if (!host) {
      return;
    }
    let active = true;
    host.introspectSchema().then((outcome) => {
      if (active && outcome.success) {
        setSchema(outcome.value);
      }
    });
    return () => {
      active = false;
    };
  }, [host]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: value/autocompleteEnabled only seed the initial doc/extensions; later changes flow through the dedicated sync effects below.
  useEffect(() => {
    if (!containerRef.current) return;

    const sqlCompartment = new Compartment();
    sqlCompartmentRef.current = sqlCompartment;

    const view = new EditorView({
      parent: containerRef.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          drawSelection(),
          history(),
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          syntaxHighlighting(defaultHighlightStyle),
          sqlCompartment.of(sql({ dialect: PostgreSQL, schema: schemaNamespace(schema) })),
          ...(autocompleteEnabled ? [autocompletion()] : []),
          keymap.of([
            {
              key: 'Mod-Enter',
              run: () => {
                onRunRef.current?.();
                return true;
              },
              preventDefault: true
            },
            {
              key: 'Mod-Shift-Enter',
              run: () => {
                onSubmitRef.current?.();
                return true;
              },
              preventDefault: true
            },
            ...closeBracketsKeymap,
            ...defaultKeymap,
            ...historyKeymap,
            ...(autocompleteEnabled ? completionKeymap : [])
          ]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString());
            }
          })
        ]
      })
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
      sqlCompartmentRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    const sqlCompartment = sqlCompartmentRef.current;
    if (!view || !sqlCompartment) return;
    view.dispatch({
      effects: sqlCompartment.reconfigure(
        sql({ dialect: PostgreSQL, schema: schemaNamespace(schema) })
      )
    });
  }, [schema]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    // Only push external value changes (e.g. reset) into the editor — dispatching on every
    // keystroke would echo the change back and reset the cursor to the start of the document.
    if (value !== view.state.doc.toString()) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value }
      });
    }
  }, [value]);

  const handleFormat = () => {
    const view = viewRef.current;
    if (!view) return;
    const formatted = formatSql(view.state.doc.toString(), { language: 'postgresql' });
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: formatted }
    });
    onChangeRef.current(formatted);
  };

  return (
    <div className="sql-editor-shell">
      <div className="sql-editor-toolbar">
        <button type="button" className="ghost sql-editor-format" onClick={handleFormat}>
          {t('format', language)}
        </button>
      </div>
      <div className="sql-editor" ref={containerRef} />
    </div>
  );
}
