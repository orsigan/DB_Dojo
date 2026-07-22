import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'dml-delete-duplicate-star-readings',
  topic: ['dml', 'delete'],
  difficulty: 'Profi',
  title: {
    de: 'Beobachtungsprotokoll bereinigen',
    en: 'De-duplicate the observation log'
  },
  prompt: {
    de: [
      'Der nächtliche Import lief zweimal, daher enthält `star_readings` dieselbe Beobachtung mehrfach.',
      '',
      'Eine Beobachtung ist dieselbe, wenn `telescope`, `observed_on` und `star_catalog_id` übereinstimmen.',
      'Behalte für jede solche Gruppe nur die Zeile mit der kleinsten `id` und lösche den Rest.',
      '',
      'Die erneut importierten Zeilen sind keine exakten Kopien — manche tragen eine leicht andere `magnitude`.',
      'Messwerte, die nur einmal erfasst wurden, müssen unverändert erhalten bleiben.'
    ].join('\n'),
    en: [
      'The nightly import ran twice, so `star_readings` contains the same observation more than once.',
      '',
      'An observation is the same one when `telescope`, `observed_on` and `star_catalog_id` agree.',
      'For every such group keep only the row with the smallest `id` and delete the rest.',
      '',
      'The re-imported rows are not perfect copies — some carry a slightly different `magnitude`.',
      'Readings that were only recorded once must survive untouched.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS star_readings;

    CREATE TABLE star_readings (
      id integer PRIMARY KEY,
      telescope text NOT NULL,
      observed_on date NOT NULL,
      star_catalog_id text NOT NULL,
      magnitude numeric NOT NULL,
      imported_at timestamp NOT NULL
    );

    INSERT INTO star_readings (id, telescope, observed_on, star_catalog_id, magnitude, imported_at) VALUES
      (1, 'Meridian', '2026-02-01', 'HD 209458', 7.65, '2026-02-02 03:00'),
      (2, 'Meridian', '2026-02-01', 'HD 209458', 7.66, '2026-02-02 09:14'),
      (3, 'Meridian', '2026-02-01', 'HD 189733', 7.67, '2026-02-02 03:01'),
      (4, 'Dome C', '2026-02-01', 'HD 209458', 7.64, '2026-02-02 03:02'),
      (5, 'Meridian', '2026-02-02', 'HD 209458', 7.70, '2026-02-03 03:00'),
      (6, 'Dome C', '2026-02-01', 'HD 209458', 7.64, '2026-02-02 09:15'),
      (7, 'Dome C', '2026-02-01', 'HD 209458', 7.69, '2026-02-02 11:40'),
      (8, 'Meridian', '2026-02-01', 'HD 189733', 7.67, '2026-02-02 09:16'),
      (9, 'Bergland', '2026-02-05', 'BD +17 4708', 9.35, '2026-02-06 02:12');
  `,
  starterSql:
    'SELECT telescope, observed_on, star_catalog_id, count(*) AS copies\nFROM star_readings\nGROUP BY telescope, observed_on, star_catalog_id\nORDER BY 1, 2, 3;',
  hints: [
    {
      text: {
        de: 'Ein DELETE darf eine Zeile mit genau der Tabelle vergleichen, aus der es löscht — gib der Tabelle zwei Aliase, damit du "diese Zeile" und "eine frühere Zeile" getrennt ansprechen kannst.',
        en: 'A DELETE may compare a row against the very table it deletes from — give the table two aliases so you can talk about "this row" and "an earlier row" separately.'
      }
    },
    {
      text: {
        de: 'Eine Zeile muss genau dann weg, wenn eine andere Zeile derselben Gruppe eine kleinere id trägt. So formuliert ergibt sich der Überlebende jeder Gruppe von selbst.',
        en: 'A row has to go exactly when some other row of the same group carries a smaller id. Phrased that way the survivor of each group falls out on its own.'
      }
    },
    {
      text: {
        de: 'Da sich die Kopien in `magnitude` unterscheiden, würde eine Gruppierung über die ganze Zeile gar keine Duplikate finden — die drei Schlüsselspalten definieren die Gruppe.',
        en: 'Since the copies differ in `magnitude`, grouping by the whole row would find no duplicates at all — the three key columns define the group.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'Genau die Messwerte 1, 3, 4, 5 und 9 bleiben erhalten',
          en: 'Exactly the readings 1, 3, 4, 5 and 9 survive'
        },
        sql: `
          SELECT count(*) = 5 AND count(*) FILTER (WHERE id IN (1, 3, 4, 5, 9)) = 5 AS ok
          FROM star_readings;
        `
      },
      {
        label: {
          de: 'Keine Beobachtung ist mehr doppelt erfasst',
          en: 'No observation is recorded twice any more'
        },
        sql: `
          SELECT count(*) = 0 AS ok
          FROM (
            SELECT 1
            FROM star_readings
            GROUP BY telescope, observed_on, star_catalog_id
            HAVING count(*) > 1
          ) AS duplicate_groups;
        `
      },
      {
        label: {
          de: 'Die verbliebenen Zeilen behalten ihre ursprüngliche magnitude',
          en: 'The surviving rows kept their original magnitude'
        },
        sql: `
          SELECT count(*) = 5 AS ok
          FROM star_readings
          WHERE (id = 1 AND magnitude = 7.65)
             OR (id = 3 AND magnitude = 7.67)
             OR (id = 4 AND magnitude = 7.64)
             OR (id = 5 AND magnitude = 7.70)
             OR (id = 9 AND magnitude = 9.35);
        `
      },
      {
        label: {
          de: 'Die einzeln erfassten Messwerte von Meridian und Bergland wurden nicht mitgelöscht',
          en: 'The single-copy readings from Meridian and Bergland were not swept away'
        },
        sql: `
          SELECT count(*) = 2 AS ok
          FROM star_readings
          WHERE (id = 5 AND telescope = 'Meridian' AND observed_on = DATE '2026-02-02')
             OR (id = 9 AND telescope = 'Bergland' AND star_catalog_id = 'BD +17 4708');
        `
      }
    ]
  },
  tags: ['delete', 'duplicates', 'correlated-subquery']
};
