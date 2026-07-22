import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'plpgsql-vineyard-barrel-grading',
  topic: ['plpgsql', 'cursors'],
  difficulty: 'Profi',
  title: { de: 'Fässer über einen Cursor bewerten', en: 'Grade the barrels through a cursor' },
  prompt: {
    de: [
      'Jedes Fass im Keller braucht eine Klasse. Größe und Reifezeit entscheiden darüber:',
      '',
      '- mindestens 24 Monate alt und mindestens 200 Liter -> `reserve`',
      '- mindestens 24 Monate alt, aber kleiner -> `aged`',
      '- jünger, aber mindestens 200 Liter -> `bulk`',
      '- alles andere -> `young`',
      '',
      'Schreibe eine gespeicherte Prozedur `grade_barrels()`, die einen Cursor über `barrel` öffnet, die Zeilen',
      'einzeln abholt und die Klasse der Zeile, auf der sie gerade steht, schreibt mit',
      '`UPDATE barrel SET grade = ... WHERE CURRENT OF <cursor>`.',
      '',
      'Führe sie danach einmal aus: `CALL grade_barrels();`'
    ].join('\n'),
    en: [
      'Every barrel in the cellar needs a grade. Size and maturing time decide it:',
      '',
      '- at least 24 months old and at least 200 litres -> `reserve`',
      '- at least 24 months old, but smaller -> `aged`',
      '- younger, but at least 200 litres -> `bulk`',
      '- everything else -> `young`',
      '',
      'Write a stored procedure `grade_barrels()` that opens a cursor over `barrel`, fetches the rows',
      'one by one and writes the grade of the row it is currently standing on with',
      '`UPDATE barrel SET grade = ... WHERE CURRENT OF <cursor>`.',
      '',
      'Afterwards run it once: `CALL grade_barrels();`'
    ].join('\n')
  },
  seedSql: `
    DROP PROCEDURE IF EXISTS grade_barrels();
    DROP TABLE IF EXISTS barrel;

    CREATE TABLE barrel (
      id integer PRIMARY KEY,
      cellar text NOT NULL,
      litres integer NOT NULL,
      age_months integer NOT NULL,
      grade text
    );

    INSERT INTO barrel (id, cellar, litres, age_months) VALUES
      (1, 'North', 225, 36),
      (2, 'North', 225, 24),
      (3, 'North', 200, 12),
      (4, 'South', 199, 24),
      (5, 'South', 120, 6),
      (6, 'South', 300, 23);
  `,
  starterSql: [
    'CREATE OR REPLACE PROCEDURE grade_barrels() AS $grade_barrels$',
    'DECLARE',
    '  barrels CURSOR FOR SELECT * FROM barrel;',
    'BEGIN',
    "  RAISE NOTICE 'no barrel graded yet';",
    'END;',
    '$grade_barrels$ LANGUAGE plpgsql;'
  ].join('\n'),
  hints: [
    {
      text: {
        de: '`WHERE CURRENT OF` braucht einen Cursor, der noch auf der Zeile steht — das funktioniert nur mit einer expliziten `OPEN`/`FETCH`-Schleife, nicht mit einer `FOR`-Schleife über eine einfache Anfrage.',
        en: 'WHERE CURRENT OF needs a cursor that is still standing on the row — that only works with an explicit OPEN/FETCH loop, not with a FOR loop over a plain query.'
      }
    },
    {
      text: {
        de: 'Der abgeholte Record enthält noch die alten Werte, sodass du die Klasse daraus bestimmen kannst, bevor das `UPDATE` läuft.',
        en: 'The fetched record still holds the old values, so you can decide the grade from it before the UPDATE runs.'
      }
    },
    {
      text: {
        de: 'Zwei unabhängige Bedingungen ergeben vier Fälle — verschachtele die Prüfungen so, dass jedes Fass genau einem davon entspricht.',
        en: 'Two independent conditions produce four cases — nest the checks so that each barrel matches exactly one of them.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: { de: 'Ein großes altes Fass ist reserve', en: 'A big old barrel is reserve' },
        sql: "SELECT grade = 'reserve' AS ok FROM barrel WHERE id = 1;"
      },
      {
        label: {
          de: 'Genau 24 Monate und 225 Liter ist noch reserve',
          en: 'Exactly 24 months and 225 litres is still reserve'
        },
        sql: "SELECT grade = 'reserve' AS ok FROM barrel WHERE id = 2;"
      },
      {
        label: {
          de: 'Genau 200 Liter, aber jung ist bulk',
          en: 'Exactly 200 litres but young is bulk'
        },
        sql: "SELECT grade = 'bulk' AS ok FROM barrel WHERE id = 3;"
      },
      {
        label: {
          de: 'Einen Liter unter 200, aber alt genug ist aged',
          en: 'One litre short of 200 but old enough is aged'
        },
        sql: "SELECT grade = 'aged' AS ok FROM barrel WHERE id = 4;"
      },
      {
        label: { de: 'Ein kleines junges Fass ist young', en: 'A small young barrel is young' },
        sql: "SELECT grade = 'young' AS ok FROM barrel WHERE id = 5;"
      },
      {
        label: {
          de: 'Einen Monat unter 24, aber groß ist bulk',
          en: 'One month short of 24 but large is bulk'
        },
        sql: "SELECT grade = 'bulk' AS ok FROM barrel WHERE id = 6;"
      },
      {
        label: { de: 'Kein Fass wurde übersprungen', en: 'No barrel was skipped' },
        sql: 'SELECT count(*) = 0 AS ok FROM barrel WHERE grade IS NULL;'
      }
    ]
  },
  tags: ['cursor', 'where-current-of', 'procedure', 'update']
};
