import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'dml-insert-brewery-tasting-queue',
  topic: ['dml', 'insert'],
  difficulty: 'Advanced',
  title: {
    de: 'IPA-Sude für die Verkostung einreihen',
    en: 'Queue the IPA batches for tasting'
  },
  prompt: {
    de: [
      'Jedes 2026 gebraute IPA muss von der Verkostungsjury probiert werden.',
      '',
      'Fülle die leere Tabelle `tasting_queue` aus `batches` mit einer Zeile pro passendem Sud:',
      '- `batch_id` — die ID des Suds',
      '- `beer_name` — der Name des Biers',
      '- `sample_litres` — zwei Prozent der Sudgröße in `litres`',
      '',
      'Sude anderer Stilrichtung und IPAs, die in einem anderen Jahr gebraut wurden, bleiben außen vor.',
      'Schreibst du die Werte von Hand aus, kopierst du nur das Braulogbuch — lies sie stattdessen aus `batches`.'
    ].join('\n'),
    en: [
      'Every IPA brewed in 2026 has to be sampled by the tasting panel.',
      '',
      'Fill the empty table `tasting_queue` from `batches` with one row per qualifying batch:',
      '- `batch_id` — the id of the batch',
      '- `beer_name` — the name of the beer',
      '- `sample_litres` — two percent of the batch size in `litres`',
      '',
      'Batches of another style, and IPAs brewed in a different year, stay out of the queue.',
      'Write the values out by hand and you will be copying the brewery log — read them out of `batches` instead.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS tasting_queue;
    DROP TABLE IF EXISTS batches;

    CREATE TABLE batches (
      id integer PRIMARY KEY,
      beer_name text NOT NULL,
      style text NOT NULL,
      litres integer NOT NULL,
      brewed_on date NOT NULL
    );

    CREATE TABLE tasting_queue (
      batch_id integer PRIMARY KEY REFERENCES batches (id),
      beer_name text NOT NULL,
      sample_litres numeric NOT NULL
    );

    INSERT INTO batches (id, beer_name, style, litres, brewed_on) VALUES
      (1, 'Harbour Haze', 'IPA', 1200, '2026-02-11'),
      (2, 'Cellar Dunkel', 'Lager', 900, '2026-02-20'),
      (3, 'Pier Pale', 'IPA', 600, '2026-03-04'),
      (4, 'Old Anchor', 'IPA', 800, '2025-11-19'),
      (5, 'Foghorn Stout', 'Stout', 1500, '2026-01-30'),
      (6, 'Ninth Wave', 'IPA', 1000, '2026-05-22');
  `,
  starterSql: 'SELECT id, beer_name, style, litres, brewed_on FROM batches ORDER BY id;',
  hints: [
    {
      text: {
        de: 'INSERT akzeptiert anstelle einer VALUES-Liste auch eine Anfrage: Die von der Anfrage gelieferten Spalten werden positionell mit der Spaltenliste der Zieltabelle abgeglichen.',
        en: 'INSERT accepts a query in place of a VALUES list: the columns the query returns are matched positionally against the column list of the target table.'
      }
    },
    {
      text: {
        de: 'Die Zeilen, die in `tasting_queue` landen, sind unabhängige Kopien — spätere Änderungen an `batches` wirken sich nicht auf sie aus.',
        en: 'The rows that land in `tasting_queue` are independent copies — later edits to `batches` will not follow them.'
      }
    },
    {
      text: {
        de: 'Ein ganzes Kalenderjahr lässt sich am einfachsten als Bereich mit zwei Grenzen auf `brewed_on` ausdrücken.',
        en: 'A whole calendar year is easiest to express as a range with two bounds on `brewed_on`.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'Die Warteschlange enthält genau drei Sude',
          en: 'The queue holds exactly three batches'
        },
        sql: 'SELECT count(*) = 3 AS ok FROM tasting_queue;'
      },
      {
        label: {
          de: 'Die eingereihten Sude sind die 2026er IPAs mit der richtigen Probenmenge',
          en: 'The queued batches are the 2026 IPAs with the right sample size'
        },
        sql: `
          SELECT count(*) = 3 AS ok
          FROM tasting_queue
          WHERE (batch_id = 1 AND beer_name = 'Harbour Haze' AND sample_litres = 24)
             OR (batch_id = 3 AND beer_name = 'Pier Pale' AND sample_litres = 12)
             OR (batch_id = 6 AND beer_name = 'Ninth Wave' AND sample_litres = 20);
        `
      },
      {
        label: {
          de: 'Das Lager, der Stout und das 2025er IPA wurden nicht eingereiht',
          en: 'The lager, the stout and the 2025 IPA were not queued'
        },
        sql: 'SELECT count(*) = 0 AS ok FROM tasting_queue WHERE batch_id IN (2, 4, 5);'
      },
      {
        label: {
          de: 'Das Braulogbuch selbst ist unverändert',
          en: 'The brewery log itself is unchanged'
        },
        sql: `
          SELECT count(*) = 6 AS ok
          FROM batches
          WHERE (id = 1 AND litres = 1200) OR (id = 2 AND litres = 900) OR (id = 3 AND litres = 600)
             OR (id = 4 AND litres = 800) OR (id = 5 AND litres = 1500) OR (id = 6 AND litres = 1000);
        `
      }
    ]
  },
  tags: ['insert-select', 'subquery', 'filter']
};
