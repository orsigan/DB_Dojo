import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'sql-brewery-beer-styles',
  topic: ['sql', 'select'],
  difficulty: 'Beginner',
  title: { de: 'Biersorten auf der Ausschanktafel', en: 'Beer styles on the taproom board' },
  prompt: {
    de: [
      'Die Ausschanktafel listet die Sorten, die die Brauerei aktuell anbietet — jede Sorte einmal, ohne Wiederholungen.',
      '',
      'Gib die Spalte `style` für jedes Bier zurück, das noch produziert wird, ohne Duplikate und sortiert nach `style`.',
      'Eine Sorte, die nur bei eingestellten Bieren vorkommt, darf nicht erscheinen.'
    ].join('\n'),
    en: [
      'The taproom board lists the styles the brewery currently offers — each style once, no repetitions.',
      '',
      'Return the column `style` for every beer that is still in production, without duplicates and ordered by `style`.',
      'A style that only appears on discontinued beers must not show up.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS beers;

    CREATE TABLE beers (
      id integer PRIMARY KEY,
      name text NOT NULL,
      style text NOT NULL,
      abv numeric NOT NULL,
      in_production boolean NOT NULL
    );

    INSERT INTO beers (id, name, style, abv, in_production) VALUES
      (1, 'Hop Harbour', 'India Pale Ale', 6.2, true),
      (2, 'Anchor Chain', 'India Pale Ale', 6.8, true),
      (3, 'Night Ferry', 'Stout', 4.9, true),
      (4, 'Harbour Mist', 'Wheat Beer', 5.1, true),
      (5, 'Old Quay', 'Barley Wine', 10.5, false),
      (6, 'Dock Light', 'Pilsner', 4.4, true),
      (7, 'Winter Rope', 'Stout', 6.0, false);
  `,
  starterSql: 'SELECT style\nFROM beers;',
  hints: [
    {
      text: {
        de: 'Ohne DISTINCT liefert ein SELECT eine Multimenge: Jede passende Zeile erscheint, eine zweimal gebraute Sorte also auch zweimal.',
        en: 'Without DISTINCT a SELECT returns a multiset: every matching row shows up, so a style brewed twice appears twice.'
      }
    },
    {
      text: {
        de: 'Der Filter muss laufen, bevor die Duplikate entfernt werden — eine Sorte, die nur bei einem eingestellten Bier überlebt, darf nie ins Ergebnis gelangen.',
        en: 'The filter has to run before the duplicates are removed — a style that survives only on a discontinued beer should never enter the result.'
      }
    }
  ],
  grading: {
    kind: 'result-equals',
    ordered: true,
    expectedSql: `
      SELECT DISTINCT b.style
      FROM beers AS b
      WHERE b.in_production
      ORDER BY b.style;
    `
  },
  tags: ['select', 'distinct', 'projection']
};
