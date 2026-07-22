import type { Language, LocalizedText } from '@db-dojo/core';
import { localize } from '@db-dojo/core';

const strings = {
  run: { de: 'Ausführen', en: 'Run' },
  runHint: { de: 'Ausführen ({shortcut})', en: 'Run ({shortcut})' },
  submit: { de: 'Einreichen', en: 'Submit' },
  submitHint: { de: 'Einreichen ({shortcut})', en: 'Submit ({shortcut})' },
  reset: { de: 'Zurücksetzen', en: 'Reset' },
  format: { de: 'Formatieren', en: 'Format' },
  passed: { de: 'Bestanden', en: 'Passed' },
  notThereYet: { de: 'Noch nicht ganz', en: 'Not there yet' },
  showSolution: { de: 'Lösung anzeigen', en: 'Show solution' },
  explain: { de: 'Erklären', en: 'Explain' },
  explainDisabledHint: {
    de: 'Explain funktioniert nur bei SELECT-, INSERT-, UPDATE- oder DELETE-Abfragen.',
    en: 'Explain only works for SELECT, INSERT, UPDATE or DELETE queries.'
  },
  hint: { de: 'Hinweis', en: 'Hint' },
  statementExecuted: { de: 'Anweisung ausgeführt', en: 'Statement executed' },
  rowsAffected: { de: 'Zeile(n) betroffen', en: 'row(s) affected' },
  rowsReturned: { de: 'Zeile(n)', en: 'row(s)' },
  resultView: { de: 'Ergebnisansicht', en: 'Result view' },
  viewTable: { de: 'Tabelle', en: 'Table' },
  viewChart: { de: 'Diagramm', en: 'Chart' },
  explainCost: { de: 'geschätzte Kosten', en: 'estimated cost' },
  explainRows: { de: 'Zeilen', en: 'rows' },
  explainActualTime: { de: 'tatsächliche Zeit', en: 'actual time' },
  explainActualRows: { de: 'tatsächliche Zeilen', en: 'actual rows' },
  history: { de: 'Verlauf', en: 'History' },
  historyEmpty: { de: 'Noch keine Abfragen ausgeführt.', en: 'No queries run yet.' },
  historyStatusOk: { de: 'Ausgeführt', en: 'Ran' },
  historyStatusPassed: { de: 'Bestanden', en: 'Passed' },
  historyStatusFailed: { de: 'Fehlgeschlagen', en: 'Failed' },
  historyStatusError: { de: 'Fehler', en: 'Error' },
  shellTab: { de: 'Shell', en: 'Shell' },
  newTab: { de: 'Neuer Tab', en: 'New tab' },
  closeTab: { de: 'Tab schließen', en: 'Close tab' },
  splitView: { de: 'Teilen', en: 'Split' },
  unsplit: { de: 'Teilung aufheben', en: 'Unsplit' },
  workspaceWindowPrompt: { de: 'Aufgabe', en: 'Task' },
  workspaceWindowSchema: { de: 'Schema', en: 'Schema' },
  workspaceWindowShell: { de: 'Shell', en: 'Shell' },
  collapseWindow: { de: 'Fenster einklappen', en: 'Collapse window' },
  expandWindow: { de: 'Fenster ausklappen', en: 'Expand window' },
  resizeColumns: { de: 'Spaltenbreite ändern', en: 'Resize columns' },
  resizeRows: { de: 'Zeilenhöhe ändern', en: 'Resize rows' },
  resizePanes: { de: 'Fensterbreite ändern', en: 'Resize panes' }
} satisfies Record<string, LocalizedText>;

export type UiStringKey = keyof typeof strings;

export function t(key: UiStringKey, language: Language): string {
  return localize(strings[key], language);
}

export function modifierKeyLabel(): string {
  return typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac') ? '⌘' : 'Ctrl';
}
