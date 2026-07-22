import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'views-brewery-active-batches',
  topic: ['views'],
  difficulty: 'Beginner',
  title: { de: 'Selektionssicht auf Brauerei-Sude', en: 'Selection view on brewery batches' },
  prompt: {
    de: [
      'Das Kellerteam einer Craft-Brauerei interessiert sich nur für die Sude, die gerade',
      'gären, und es ist leid, jeden Morgen denselben Filter zu tippen.',
      '',
      'Erstelle eine Sicht namens `active_batches` auf `batches`, die alle fünf Spalten behält',
      '(`id`, `recipe`, `litres`, `status`, `tank`), aber nur die Zeilen zeigt, deren `status`',
      "`'fermenting'` ist."
    ].join('\n'),
    en: [
      'The cellar crew of a craft brewery only ever cares about the batches that are currently',
      'fermenting, and they are tired of typing the same filter every morning.',
      '',
      'Create a view named `active_batches` over `batches` that keeps all five columns',
      '(`id`, `recipe`, `litres`, `status`, `tank`) but shows only the rows whose `status`',
      "is `'fermenting'`."
    ].join('\n')
  },
  seedSql: `
    DROP VIEW IF EXISTS active_batches;
    DROP TABLE IF EXISTS batches;

    CREATE TABLE batches (
      id integer PRIMARY KEY,
      recipe text NOT NULL,
      litres numeric NOT NULL,
      status text NOT NULL,
      tank text
    );

    INSERT INTO batches (id, recipe, litres, status, tank) VALUES
      (1, 'Hop Lantern', 1200, 'fermenting', 'T-1'),
      (2, 'Winter Porter', 800, 'conditioning', 'T-2'),
      (3, 'Elderflower Sour', 450, 'fermenting', 'T-3'),
      (4, 'Amber Ale', 1500, 'bottled', 'T-4'),
      (5, 'Smoke Bock', 600, 'fermenting', 'T-5'),
      (6, 'Session IPA', 950, 'planned', NULL);
  `,
  starterSql: 'CREATE VIEW active_batches AS\nSELECT *\nFROM batches;',
  hints: [
    {
      text: {
        de: 'Eine Selektionssicht ist nichts weiter als eine gespeicherte Anfrage mit einer WHERE-Klausel — der Filter gehört in die Sichtdefinition, nicht in jede spätere Anfrage.',
        en: 'A selection view is just a stored query with a WHERE clause — the filter belongs inside the view definition, not into every later query.'
      }
    },
    {
      text: {
        de: 'Es wird nichts kopiert: Ein neuer gärender Sud in `batches` erscheint sofort in der Sicht, weil die Anfrage bei jeder Nutzung neu ausgewertet wird.',
        en: 'Nothing is copied: adding a new fermenting batch to `batches` makes it appear in the view immediately, because the query is re-evaluated on every use.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: { de: 'active_batches existiert als Sicht', en: 'active_batches exists as a view' },
        sql: "SELECT count(*) = 1 AS ok FROM pg_views WHERE schemaname = 'public' AND viewname = 'active_batches';"
      },
      {
        label: {
          de: 'Sie behält alle fünf Spalten von batches',
          en: 'It keeps all five columns of batches'
        },
        sql: `
          SELECT count(*) = 5 AND bool_and(column_name IN ('id', 'recipe', 'litres', 'status', 'tank')) AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'active_batches';
        `
      },
      {
        label: { de: 'Sie zeigt nur gärende Sude', en: 'It shows only fermenting batches' },
        sql: "SELECT count(*) = 3 AND bool_and(status = 'fermenting') AS ok FROM active_batches;"
      },
      {
        label: { de: 'Sie zeigt jeden gärenden Sud', en: 'It shows every fermenting batch' },
        sql: `
          SELECT NOT EXISTS (
            SELECT id, recipe, litres, status, tank FROM batches WHERE status = 'fermenting'
            EXCEPT
            SELECT id, recipe, litres, status, tank FROM active_batches
          ) AS ok;
        `
      }
    ]
  },
  tags: ['create-view', 'selection', 'filter']
};
