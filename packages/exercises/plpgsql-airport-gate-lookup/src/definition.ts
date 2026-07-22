import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'plpgsql-airport-gate-lookup',
  topic: ['plpgsql', 'functions'],
  difficulty: 'Beginner',
  title: { de: 'Fluggastbrücken pro Terminal zählen', en: 'Count jet bridge gates' },
  prompt: {
    de: [
      'Die Bodenabfertigung braucht eine schnelle Abfrage, wie viele Gates eines Terminals eine Fluggastbrücke haben.',
      '',
      'Schreibe eine PL/pgSQL-Funktion `jet_bridge_gates(p_terminal text) RETURNS integer`.',
      '',
      'Lies die Zahl mit `SELECT ... INTO` in eine Variable ein und gib sie zurück.',
      'Ein Terminal, das es nicht gibt, muss 0 liefern, niemals NULL.'
    ].join('\n'),
    en: [
      'Ground handling wants a quick lookup for how many gates of a terminal have a jet bridge.',
      '',
      'Write a PL/pgSQL function `jet_bridge_gates(p_terminal text) RETURNS integer`.',
      '',
      'Read the number into a variable with `SELECT ... INTO` and return it.',
      'A terminal that does not exist must yield 0, never NULL.'
    ].join('\n')
  },
  seedSql: `
    DROP FUNCTION IF EXISTS jet_bridge_gates(text);
    DROP TABLE IF EXISTS gate;

    CREATE TABLE gate (
      id integer PRIMARY KEY,
      terminal text NOT NULL,
      label text NOT NULL,
      jet_bridge boolean NOT NULL
    );

    INSERT INTO gate (id, terminal, label, jet_bridge) VALUES
      (1, 'A', 'A1', true),
      (2, 'A', 'A2', true),
      (3, 'A', 'A3', true),
      (4, 'A', 'A4', false),
      (5, 'B', 'B1', false),
      (6, 'B', 'B2', false),
      (7, 'B', 'B3', false),
      (8, 'C', 'C1', true),
      (9, 'C', 'C2', true);
  `,
  starterSql: [
    'CREATE OR REPLACE FUNCTION jet_bridge_gates(p_terminal text) RETURNS integer AS $jet_bridge_gates$',
    'DECLARE',
    '  total integer;',
    'BEGIN',
    '  RETURN total;',
    'END;',
    '$jet_bridge_gates$ LANGUAGE plpgsql;'
  ].join('\n'),
  hints: [
    {
      text: {
        de: '`SELECT ... INTO` schreibt das Ergebnis einer Anfrage direkt in eine deklarierte Variable — für einen einzelnen Wert brauchst du keinen Cursor.',
        en: 'SELECT ... INTO writes the result of a query straight into a declared variable — no cursor needed for a single value.'
      }
    },
    {
      text: {
        de: 'Gib Parameter und Spalte unterschiedliche Namen, sonst vergleicht die WHERE-Klausel die Spalte mit sich selbst.',
        en: 'Give the parameter and the column different names, otherwise the WHERE clause compares the column with itself.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'Terminal A hat 3 Gates mit Fluggastbrücke',
          en: 'Terminal A has 3 jet bridge gates'
        },
        sql: "SELECT jet_bridge_gates('A') = 3 AS ok;"
      },
      {
        label: {
          de: 'Terminal B hat Gates, aber keins mit Fluggastbrücke',
          en: 'Terminal B has gates but none with a jet bridge'
        },
        sql: "SELECT jet_bridge_gates('B') = 0 AS ok;"
      },
      {
        label: {
          de: 'Terminal C hat 2 Gates mit Fluggastbrücke',
          en: 'Terminal C has 2 jet bridge gates'
        },
        sql: "SELECT jet_bridge_gates('C') = 2 AS ok;"
      },
      {
        label: { de: 'Ein unbekanntes Terminal liefert 0', en: 'An unknown terminal yields 0' },
        sql: "SELECT jet_bridge_gates('Z') = 0 AS ok;"
      },
      {
        label: {
          de: 'Ein NULL-Terminal liefert ebenfalls 0',
          en: 'A NULL terminal yields 0 as well'
        },
        sql: 'SELECT jet_bridge_gates(NULL) = 0 AS ok;'
      }
    ]
  },
  tags: ['function', 'select-into', 'aggregation']
};
