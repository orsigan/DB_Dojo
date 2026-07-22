import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'dml-update-greenhouse-moisture-summary',
  topic: ['dml', 'update'],
  difficulty: 'Profi',
  title: {
    de: 'Feuchtigkeitsmesswerte in die Beete übernehmen',
    en: 'Roll the moisture readings into the beds'
  },
  prompt: {
    de: [
      'Das Gewächshaus führt die aktuelle Bodenfeuchtigkeit direkt am Beet, damit der Bewässerungsroboter sie an einer Stelle auslesen kann.',
      '',
      'Für jedes Beet, das Messwerte in `moisture_readings` hat:',
      '- setze `avg_moisture` auf den Durchschnitt seiner `moisture_percent`-Werte, gerundet auf eine Nachkommastelle',
      '- setze `needs_water` genau dann auf true, wenn dieser gespeicherte Durchschnitt unter `35` liegt',
      '',
      'Ein Beet ohne Messwerte muss am Ende `avg_moisture` NULL und `needs_water` false haben —',
      'ein unbekanntes Beet ist kein durstiges Beet. `moisture_readings` selbst bleibt unverändert.'
    ].join('\n'),
    en: [
      'The greenhouse carries the current soil moisture on the bed itself so the watering robot can read it in one place.',
      '',
      'For every bed that has readings in `moisture_readings`:',
      '- set `avg_moisture` to the average of its `moisture_percent` values, rounded to one decimal',
      '- set `needs_water` to true exactly when that stored average is below `35`',
      '',
      'A bed without any reading must end up with `avg_moisture` NULL and `needs_water` false —',
      'an unknown bed is not a thirsty bed. `moisture_readings` itself stays untouched.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS moisture_readings;
    DROP TABLE IF EXISTS beds;

    CREATE TABLE beds (
      id integer PRIMARY KEY,
      name text NOT NULL,
      crop text NOT NULL,
      avg_moisture numeric,
      needs_water boolean NOT NULL DEFAULT false
    );

    CREATE TABLE moisture_readings (
      id integer PRIMARY KEY,
      bed_id integer NOT NULL REFERENCES beds (id),
      taken_on date NOT NULL,
      moisture_percent numeric NOT NULL
    );

    INSERT INTO beds (id, name, crop) VALUES
      (1, 'Bed A1', 'basil'),
      (2, 'Bed A2', 'tomato'),
      (3, 'Bed B1', 'chili'),
      (4, 'Bed B2', 'mint');

    INSERT INTO moisture_readings (id, bed_id, taken_on, moisture_percent) VALUES
      (1, 1, '2026-07-14', 41.0),
      (2, 1, '2026-07-15', 38.5),
      (3, 1, '2026-07-16', 40.5),
      (4, 2, '2026-07-14', 28.2),
      (5, 2, '2026-07-15', 31.0),
      (6, 2, '2026-07-16', 26.8),
      (7, 3, '2026-07-15', 34.4),
      (8, 3, '2026-07-16', 36.1);
  `,
  starterSql:
    'SELECT bed_id, round(avg(moisture_percent), 1) AS avg_moisture\nFROM moisture_readings\nGROUP BY bed_id\nORDER BY bed_id;',
  hints: [
    {
      text: {
        de: 'Ein UPDATE kann seine neuen Werte aus einer anderen Relation beziehen: Setze die gruppierte Anfrage in eine FROM-Klausel und verbinde sie in der WHERE-Klausel mit der Zieltabelle.',
        en: 'An UPDATE can pull its new values from another relation: put the grouped query into a FROM clause and join it to the target table in the WHERE clause.'
      }
    },
    {
      text: {
        de: 'Dieser Verbund ist zugleich der Filter — Beete, die die gruppierte Anfrage nicht liefert, werden schlicht nie berührt, genau das braucht das Minz-Beet.',
        en: 'That join is also the filter — beds the grouped query does not deliver are simply never touched, which is exactly what the mint bed needs.'
      }
    },
    {
      text: {
        de: 'Achte auf den Wahrheitswert: Ein einfaches korreliertes Subselect über eine leere Menge liefert NULL, und `NULL < 35` ist NULL, nicht false.',
        en: 'Watch the boolean: a plain correlated subselect over an empty set yields NULL, and `NULL < 35` is NULL, not false.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'Die drei gemessenen Beete tragen ihren gerundeten Durchschnitt und das richtige Flag',
          en: 'The three measured beds carry their rounded average and the right flag'
        },
        sql: `
          SELECT count(*) = 3 AS ok
          FROM beds
          WHERE (id = 1 AND avg_moisture = 40.0 AND needs_water = false)
             OR (id = 2 AND avg_moisture = 28.7 AND needs_water = true)
             OR (id = 3 AND avg_moisture = 35.3 AND needs_water = false);
        `
      },
      {
        label: {
          de: 'Das Beet ohne Messwerte bleibt unbekannt und nicht durstig',
          en: 'The bed without readings stays unknown and not thirsty'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM beds
          WHERE id = 4 AND avg_moisture IS NULL AND needs_water = false;
        `
      },
      {
        label: {
          de: 'Kein Beet wurde hinzugefügt, entfernt oder umbenannt',
          en: 'No bed was added, removed or renamed'
        },
        sql: `
          SELECT count(*) = 4 AS ok
          FROM beds
          WHERE (id = 1 AND name = 'Bed A1' AND crop = 'basil')
             OR (id = 2 AND name = 'Bed A2' AND crop = 'tomato')
             OR (id = 3 AND name = 'Bed B1' AND crop = 'chili')
             OR (id = 4 AND name = 'Bed B2' AND crop = 'mint');
        `
      },
      {
        label: {
          de: 'Die Rohmesswerte sind unverändert',
          en: 'The raw readings are unchanged'
        },
        sql: 'SELECT count(*) = 8 AND sum(moisture_percent) = 276.5 AS ok FROM moisture_readings;'
      }
    ]
  },
  tags: ['update', 'aggregation', 'null']
};
