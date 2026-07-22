import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'integrity-roastery-batch-limits',
  topic: ['integrity', 'constraints'],
  difficulty: 'Beginner',
  title: {
    de: 'Röst-Batch-Grenzen als CHECK-Constraints',
    en: 'Roast batch limits as CHECK constraints'
  },
  prompt: {
    de: [
      'Die Kaffeerösterei hat zwei semantische Regeln für jede Zeile von `roast_batch`:',
      '',
      '1. `roast_minutes` ist immer größer als 0 und nie höher als 30.',
      '2. `green_weight_kg` beträgt mindestens 5.',
      '',
      'Beide Regeln betrachten nur die Zeile, die gerade geschrieben wird, gehören also als',
      'CHECK-Constraints in die Tabelle. Ergänze sie bei `roast_batch` und nenne sie genau',
      '`chk_roast_minutes` und `chk_green_weight`.'
    ].join('\n'),
    en: [
      'The coffee roastery has two semantic rules for every row of `roast_batch`:',
      '',
      '1. `roast_minutes` is always greater than 0 and never above 30.',
      '2. `green_weight_kg` is at least 5.',
      '',
      'Both rules only look at the row being written, so they belong into the table as CHECK constraints.',
      'Add them to `roast_batch` and name them exactly `chk_roast_minutes` and `chk_green_weight`.'
    ].join('\n')
  },
  seedSql: `
    DROP FUNCTION IF EXISTS try_roast_batch(text, integer, numeric);
    DROP TABLE IF EXISTS roast_batch;

    CREATE TABLE roast_batch (
      id serial PRIMARY KEY,
      bean_origin text NOT NULL,
      roast_minutes integer NOT NULL,
      green_weight_kg numeric NOT NULL,
      roasted_on date NOT NULL
    );

    INSERT INTO roast_batch (bean_origin, roast_minutes, green_weight_kg, roasted_on) VALUES
      ('Yirgacheffe', 12, 60, '2026-02-11'),
      ('Huila', 14, 45, '2026-02-13'),
      ('Sumatra Lintong', 17, 80, '2026-02-14');

    CREATE FUNCTION try_roast_batch(p_origin text, p_minutes integer, p_weight numeric)
    RETURNS boolean AS $$
    BEGIN
      INSERT INTO roast_batch (bean_origin, roast_minutes, green_weight_kg, roasted_on)
      VALUES (p_origin, p_minutes, p_weight, DATE '2026-03-01');
      RETURN true;
    EXCEPTION WHEN others THEN
      RETURN false;
    END;
    $$ LANGUAGE plpgsql;
  `,
  starterSql: 'SELECT bean_origin, roast_minutes, green_weight_kg\nFROM roast_batch;',
  hints: [
    {
      text: {
        de: 'Ein CHECK-Constraint wird bei jedem INSERT und UPDATE ausgewertet, kann aber nur die Zeile betrachten, die er gerade prüft — für eine Bereichsregel reicht das genau.',
        en: 'A CHECK constraint is evaluated for every INSERT and UPDATE, but it can only look at the row it is checking — that is exactly enough for a range rule.'
      }
    },
    {
      text: {
        de: 'ALTER TABLE ... ADD CONSTRAINT <name> CHECK (...) hängt einen benannten Constraint an eine Tabelle, die bereits existiert und bereits Daten enthält.',
        en: 'ALTER TABLE ... ADD CONSTRAINT <name> CHECK (...) attaches a named constraint to a table that already exists and already holds data.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'Ein CHECK-Constraint namens chk_roast_minutes existiert auf roast_batch',
          en: 'A CHECK constraint named chk_roast_minutes exists on roast_batch'
        },
        sql: "SELECT count(*) = 1 AS ok FROM pg_constraint WHERE conname = 'chk_roast_minutes' AND conrelid = 'roast_batch'::regclass AND contype = 'c';"
      },
      {
        label: {
          de: 'Ein CHECK-Constraint namens chk_green_weight existiert auf roast_batch',
          en: 'A CHECK constraint named chk_green_weight exists on roast_batch'
        },
        sql: "SELECT count(*) = 1 AS ok FROM pg_constraint WHERE conname = 'chk_green_weight' AND conrelid = 'roast_batch'::regclass AND contype = 'c';"
      },
      {
        label: {
          de: 'Ein normaler Batch (13 Minuten, 50 kg) wird weiterhin akzeptiert',
          en: 'A normal batch (13 minutes, 50 kg) is still accepted'
        },
        sql: "SELECT try_roast_batch('Nyeri AA', 13, 50) AS ok;"
      },
      {
        label: {
          de: 'Ein 45 Minuten gerösteter Batch wird abgelehnt',
          en: 'A batch roasted for 45 minutes is rejected'
        },
        sql: "SELECT NOT try_roast_batch('Burnt Offering', 45, 50) AS ok;"
      },
      {
        label: {
          de: 'Ein 0 Minuten gerösteter Batch wird abgelehnt',
          en: 'A batch roasted for 0 minutes is rejected'
        },
        sql: "SELECT NOT try_roast_batch('Raw Beans', 0, 50) AS ok;"
      },
      {
        label: {
          de: 'Ein Batch mit nur 2 kg Rohkaffee wird abgelehnt',
          en: 'A batch of only 2 kg green coffee is rejected'
        },
        sql: "SELECT NOT try_roast_batch('Sample Roast', 12, 2) AS ok;"
      }
    ]
  },
  tags: ['check', 'constraint', 'alter-table']
};
