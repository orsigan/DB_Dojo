import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'ddl-brewery-batch-indexes',
  topic: ['ddl', 'indexes'],
  difficulty: 'Advanced',
  title: {
    de: 'Das Sudhaus bekommt Indexe',
    en: 'Indexing the brew house'
  },
  prompt: {
    de: [
      'Die Brauerei hat diese Saison gerade fertig in `batch` geladen, die Tabelle ist also gefüllt',
      'und die Indexe können jetzt obendrauf.',
      '',
      'Zwei Dinge werden gebraucht:',
      '',
      '- ein Index namens `idx_batch_style_brewed_on` über die Spaltenkombination',
      '  `beer_style, brewed_on` in genau dieser Reihenfolge — der Braumeister fragt ständig',
      '  „welche Stouts haben wir gebraut und wann"',
      '- ein eindeutiger Index namens `uq_batch_tank_day` über `tank_code, brewed_on`,',
      '  weil ein Tank an einem bestimmten Tag nur einen Sud fassen kann',
      '',
      'Für `batch_id` musst du nichts hinzufügen.'
    ].join('\n'),
    en: [
      'The brewery has just finished loading this season into `batch`, so the table is filled',
      'and the indexes can go on top now.',
      '',
      'Two things are needed:',
      '',
      '- an index named `idx_batch_style_brewed_on` over the column combination',
      '  `beer_style, brewed_on` in exactly that order — the brew master constantly asks',
      '  "which stouts did we brew and when"',
      '- a unique index named `uq_batch_tank_day` over `tank_code, brewed_on`,',
      '  because one tank can only hold one batch on a given day',
      '',
      'Do not add anything for `batch_id`.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS batch;
    DROP FUNCTION IF EXISTS statement_is_rejected(text);

    CREATE FUNCTION statement_is_rejected(statement text) RETURNS boolean AS $fn$
    BEGIN
      EXECUTE statement;
      RETURN false;
    EXCEPTION WHEN others THEN
      RETURN true;
    END;
    $fn$ LANGUAGE plpgsql;

    CREATE TABLE batch (
      batch_id integer PRIMARY KEY,
      beer_style varchar(30) NOT NULL,
      brewed_on date NOT NULL,
      tank_code char(3) NOT NULL,
      litres integer NOT NULL
    );

    INSERT INTO batch (batch_id, beer_style, brewed_on, tank_code, litres) VALUES
      (1, 'Pilsner', '2026-01-08', 'T01', 1200),
      (2, 'Pilsner', '2026-01-15', 'T01', 1200),
      (3, 'Wheat', '2026-01-08', 'T02', 900),
      (4, 'Stout', '2026-01-22', 'T03', 600),
      (5, 'Wheat', '2026-02-02', 'T02', 950),
      (6, 'Pilsner', '2026-02-05', 'T01', 1250),
      (7, 'Stout', '2026-02-12', 'T03', 640),
      (8, 'Saison', '2026-02-19', 'T04', 480),
      (9, 'Wheat', '2026-03-01', 'T02', 900),
      (10, 'Pilsner', '2026-03-08', 'T05', 1300);
  `,
  starterSql:
    "SELECT indexname, indexdef\nFROM pg_indexes\nWHERE schemaname = 'public' AND tablename = 'batch';",
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
        de: 'Schau dir zuerst die Starter-Ausgabe an: Der Primärschlüssel hat bereits einen Index mitgebracht, deshalb braucht batch_id nichts Zusätzliches.',
        en: 'Look at the starter output first: the primary key already brought an index along, which is why nothing extra is needed for batch_id.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'idx_batch_style_brewed_on deckt beer_style und brewed_on in dieser Reihenfolge ab',
          en: 'idx_batch_style_brewed_on covers beer_style and brewed_on in that order'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM pg_indexes
          WHERE schemaname = 'public'
            AND tablename = 'batch'
            AND indexname = 'idx_batch_style_brewed_on'
            AND indexdef LIKE '%(beer_style, brewed_on)%';
        `
      },
      {
        label: {
          de: 'uq_batch_tank_day ist ein eindeutiger Index über tank_code und brewed_on',
          en: 'uq_batch_tank_day is a unique index over tank_code and brewed_on'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM pg_indexes
          WHERE schemaname = 'public'
            AND tablename = 'batch'
            AND indexname = 'uq_batch_tank_day'
            AND indexdef LIKE 'CREATE UNIQUE INDEX%'
            AND indexdef LIKE '%(tank_code, brewed_on)%';
        `
      },
      {
        label: {
          de: 'batch_id ist von genau einem Index abgedeckt — dem, den der Primärschlüssel angelegt hat',
          en: 'batch_id is covered by exactly one index — the one the primary key created'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM pg_indexes
          WHERE schemaname = 'public'
            AND tablename = 'batch'
            AND indexdef LIKE '%(batch_id)%';
        `
      },
      {
        label: {
          de: 'Ein zweiter Sud in Tank T01 am 2026-01-08 wird abgelehnt',
          en: 'A second batch in tank T01 on 2026-01-08 is rejected'
        },
        sql: `
          SELECT statement_is_rejected(
            $q$INSERT INTO batch (batch_id, beer_style, brewed_on, tank_code, litres)
               VALUES (11, 'Saison', DATE '2026-01-08', 'T01', 500)$q$
          ) AS ok;
        `
      },
      {
        label: {
          de: 'Derselbe Tank an einem anderen Tag ist weiterhin erlaubt',
          en: 'The same tank on another day is still allowed'
        },
        sql: `
          WITH inserted AS (
            INSERT INTO batch (batch_id, beer_style, brewed_on, tank_code, litres)
            VALUES (12, 'Saison', DATE '2026-04-01', 'T01', 500)
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
