import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'ddl-harbor-container-tracking-indexes',
  topic: ['ddl', 'indexes'],
  difficulty: 'Advanced',
  title: {
    de: 'Der Hafen bekommt Indexe',
    en: 'Indexing the harbor'
  },
  prompt: {
    de: [
      'Das Terminal hat gerade den Container-Wareneingang in `container` geladen, die Tabelle ist also',
      'gefüllt und die Indexe können jetzt obendrauf.',
      '',
      'Zwei Dinge werden gebraucht:',
      '',
      '- ein Index namens `idx_container_terminal_arrived_on` über die Spaltenkombination',
      '  `terminal_code, arrived_on` in genau dieser Reihenfolge — die Disposition fragt ständig',
      '  „welche Container kamen von Terminal X und wann an"',
      '- ein eindeutiger Index namens `uq_container_dock_day` über `dock_code, arrived_on`,',
      '  weil ein Dock an einem bestimmten Tag nur einen Container abfertigen kann',
      '',
      'Für `container_id` musst du nichts hinzufügen.'
    ].join('\n'),
    en: [
      'The terminal has just finished loading the incoming containers into `container`, so the table',
      'is filled and the indexes can go on top now.',
      '',
      'Two things are needed:',
      '',
      '- an index named `idx_container_terminal_arrived_on` over the column combination',
      '  `terminal_code, arrived_on` in exactly that order — dispatch constantly asks',
      '  "which containers came from terminal X and when did they arrive"',
      '- a unique index named `uq_container_dock_day` over `dock_code, arrived_on`,',
      '  because one dock can only clear one container on a given day',
      '',
      'Do not add anything for `container_id`.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS container;
    DROP FUNCTION IF EXISTS statement_is_rejected(text);

    CREATE FUNCTION statement_is_rejected(statement text) RETURNS boolean AS $fn$
    BEGIN
      EXECUTE statement;
      RETURN false;
    EXCEPTION WHEN others THEN
      RETURN true;
    END;
    $fn$ LANGUAGE plpgsql;

    CREATE TABLE container (
      container_id integer PRIMARY KEY,
      terminal_code varchar(30) NOT NULL,
      arrived_on date NOT NULL,
      dock_code char(3) NOT NULL,
      weight_tonnes integer NOT NULL
    );

    INSERT INTO container (container_id, terminal_code, arrived_on, dock_code, weight_tonnes) VALUES
      (1, 'Nordkai', '2026-01-05', 'D01', 1200),
      (2, 'Nordkai', '2026-01-12', 'D01', 1200),
      (3, 'Nordkai', '2026-01-05', 'D02', 900),
      (4, 'Suedmole', '2026-01-20', 'D03', 600),
      (5, 'Suedmole', '2026-02-01', 'D02', 950),
      (6, 'Nordkai', '2026-02-04', 'D01', 1250),
      (7, 'Suedmole', '2026-02-10', 'D03', 640),
      (8, 'Rotdock', '2026-02-18', 'D04', 480),
      (9, 'Suedmole', '2026-03-01', 'D02', 900),
      (10, 'Nordkai', '2026-03-07', 'D05', 1300);
  `,
  starterSql:
    "SELECT indexname, indexdef\nFROM pg_indexes\nWHERE schemaname = 'public' AND tablename = 'container';",
  hints: [
    {
      text: {
        de: 'Einen Index auf einer bereits gefüllten Tabelle anzulegen ist ein einziger Bauvorgang. Hätte der Index schon beim Massen-Import existiert, hätte ihn jedes einzelne INSERT mitgepflegt.',
        en: 'Building an index on a table that is already filled is one single build. Had the index existed during the bulk load, every INSERT would have maintained it.'
      }
    },
    {
      text: {
        de: 'Bei einem mehrspaltigen Index ist die Reihenfolge der Spalten Teil seiner Identität — sie entscheidet, welche Präfixe der Kombination der Index bedienen kann.',
        en: 'Inside a multi-column index the order of the columns is part of its identity — it decides which prefixes of the combination the index can serve.'
      }
    },
    {
      text: {
        de: 'Schau dir zuerst die Starter-Ausgabe an: Der Primärschlüssel hat bereits einen Index mitgebracht, deshalb braucht container_id nichts Zusätzliches.',
        en: 'Look at the starter output first: the primary key already brought an index along, which is why nothing extra is needed for container_id.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'idx_container_terminal_arrived_on deckt terminal_code und arrived_on in dieser Reihenfolge ab',
          en: 'idx_container_terminal_arrived_on covers terminal_code and arrived_on in that order'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM pg_indexes
          WHERE schemaname = 'public'
            AND tablename = 'container'
            AND indexname = 'idx_container_terminal_arrived_on'
            AND indexdef LIKE '%(terminal_code, arrived_on)%';
        `
      },
      {
        label: {
          de: 'uq_container_dock_day ist ein eindeutiger Index über dock_code und arrived_on',
          en: 'uq_container_dock_day is a unique index over dock_code and arrived_on'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM pg_indexes
          WHERE schemaname = 'public'
            AND tablename = 'container'
            AND indexname = 'uq_container_dock_day'
            AND indexdef LIKE 'CREATE UNIQUE INDEX%'
            AND indexdef LIKE '%(dock_code, arrived_on)%';
        `
      },
      {
        label: {
          de: 'container_id ist von genau einem Index abgedeckt — dem, den der Primärschlüssel angelegt hat',
          en: 'container_id is covered by exactly one index — the one the primary key created'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM pg_indexes
          WHERE schemaname = 'public'
            AND tablename = 'container'
            AND indexdef LIKE '%(container_id)%';
        `
      },
      {
        label: {
          de: 'Ein zweiter Container an Dock D01 am 2026-01-05 wird abgelehnt',
          en: 'A second container at dock D01 on 2026-01-05 is rejected'
        },
        sql: `
          SELECT statement_is_rejected(
            $q$INSERT INTO container (container_id, terminal_code, arrived_on, dock_code, weight_tonnes)
               VALUES (11, 'Rotdock', DATE '2026-01-05', 'D01', 500)$q$
          ) AS ok;
        `
      },
      {
        label: {
          de: 'Dasselbe Dock an einem anderen Tag ist weiterhin erlaubt',
          en: 'The same dock on another day is still allowed'
        },
        sql: `
          WITH inserted AS (
            INSERT INTO container (container_id, terminal_code, arrived_on, dock_code, weight_tonnes)
            VALUES (12, 'Rotdock', DATE '2026-04-01', 'D01', 500)
            RETURNING 1 AS written
          )
          SELECT count(*) = 1 AS ok
          FROM inserted;
        `
      }
    ]
  },
  tags: ['index', 'create-index', 'unique-index', 'performance']
};
