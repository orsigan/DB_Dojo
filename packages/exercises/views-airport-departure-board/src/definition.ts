import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'views-airport-departure-board',
  topic: ['views'],
  difficulty: 'Beginner',
  title: { de: 'Verbundsicht für die Abflugtafel', en: 'Join view for the departure board' },
  prompt: {
    de: [
      'Die Abflugbildschirme eines Regionalflughafens brauchen Flug- und Gate-Daten nebeneinander,',
      'aber die Anzeigesoftware kann nur aus einer einzigen Relation lesen.',
      '',
      'Erstelle eine Sicht namens `departure_board`, die `flights` mit `gates` verbindet und die',
      'Spalten `flight_no`, `destination`, `terminal`, `gate_code` und `departs_at` liefert.',
      'Flüge, denen noch kein Gate zugewiesen ist, dürfen nicht auf der Tafel erscheinen.'
    ].join('\n'),
    en: [
      'The departure screens of a regional airport need flight data and gate data side by side,',
      'but the display software can only read a single relation.',
      '',
      'Create a view named `departure_board` that joins `flights` with `gates` and returns the',
      'columns `flight_no`, `destination`, `terminal`, `gate_code` and `departs_at`.',
      'Flights that have no gate assigned yet must not appear on the board.'
    ].join('\n')
  },
  seedSql: `
    DROP VIEW IF EXISTS departure_board;
    DROP TABLE IF EXISTS flights;
    DROP TABLE IF EXISTS gates;

    CREATE TABLE gates (
      code text PRIMARY KEY,
      terminal text NOT NULL,
      capacity integer NOT NULL
    );

    CREATE TABLE flights (
      id integer PRIMARY KEY,
      flight_no text NOT NULL,
      destination text NOT NULL,
      gate_code text REFERENCES gates (code),
      departs_at timestamp NOT NULL
    );

    INSERT INTO gates (code, terminal, capacity) VALUES
      ('A1', 'North', 180),
      ('A2', 'North', 220),
      ('B7', 'South', 95);

    INSERT INTO flights (id, flight_no, destination, gate_code, departs_at) VALUES
      (1, 'LH1420', 'Vienna', 'A1', '2026-04-02 07:35'),
      (2, 'AF2210', 'Lyon', 'B7', '2026-04-02 08:10'),
      (3, 'BA0917', 'Edinburgh', 'A2', '2026-04-02 09:45'),
      (4, 'KL1783', 'Rotterdam', 'A1', '2026-04-02 11:20'),
      (5, 'IB3355', 'Bilbao', NULL, '2026-04-02 13:05');
  `,
  starterSql:
    'CREATE VIEW departure_board AS\nSELECT f.flight_no, f.destination, f.departs_at\nFROM flights AS f;',
  hints: [
    {
      text: {
        de: 'Eine Verbundsicht verbirgt die Verbundbedingung vor allen, die sie lesen — Nutzer sehen eine flache Relation statt zweier Tabellen.',
        en: 'A join view hides the join condition from everyone who reads it — consumers see one flat relation instead of two tables.'
      }
    },
    {
      text: {
        de: 'Ein Inner Join lässt Flüge mit `gate_code` = NULL automatisch weg, weil NULL zu keinem Gate passt.',
        en: 'An inner join already drops flights whose `gate_code` is NULL, because NULL matches no gate.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'departure_board existiert als Sicht',
          en: 'departure_board exists as a view'
        },
        sql: "SELECT count(*) = 1 AS ok FROM pg_views WHERE schemaname = 'public' AND viewname = 'departure_board';"
      },
      {
        label: {
          de: 'Sie liefert die fünf geforderten Spalten',
          en: 'It returns the five requested columns'
        },
        sql: `
          SELECT count(*) = 5 AND bool_and(column_name IN ('flight_no', 'destination', 'terminal', 'gate_code', 'departs_at')) AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'departure_board';
        `
      },
      {
        label: {
          de: 'Es werden nur die vier Flüge mit Gate aufgelistet',
          en: 'Only the four gated flights are listed'
        },
        sql: 'SELECT count(*) = 4 AS ok FROM departure_board;'
      },
      {
        label: {
          de: 'Jede Zeile trägt das Terminal ihres Gates',
          en: 'Every row carries the terminal of its gate'
        },
        sql: `
          SELECT NOT EXISTS (
            SELECT f.flight_no, f.destination, g.terminal, g.code, f.departs_at
            FROM flights AS f
            JOIN gates AS g ON g.code = f.gate_code
            EXCEPT
            SELECT flight_no, destination, terminal, gate_code, departs_at FROM departure_board
          ) AND NOT EXISTS (
            SELECT flight_no, destination, terminal, gate_code, departs_at FROM departure_board
            EXCEPT
            SELECT f.flight_no, f.destination, g.terminal, g.code, f.departs_at
            FROM flights AS f
            JOIN gates AS g ON g.code = f.gate_code
          ) AS ok;
        `
      }
    ]
  },
  tags: ['create-view', 'join', 'simplification']
};
