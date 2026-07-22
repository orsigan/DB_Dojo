import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'sql-vineyard-best-lot-per-region',
  topic: ['sql', 'subqueries'],
  difficulty: 'Profi',
  title: { de: 'Das beste Los jeder Region', en: 'The best lot of each region' },
  prompt: {
    de: [
      'Jede Weinregion möchte ihr bestbewertetes Los bewerben.',
      '',
      'Gib für jede Region das Los zurück, dessen `score` von keinem anderen Los derselben Region übertroffen wird.',
      'Wenn sich zwei Lose die Spitzenbewertung teilen, werden beide beworben.',
      'Eine Region ohne Lose hat nichts zu bewerben und darf nicht erscheinen.',
      '',
      'Gib `region`, `wine` und `score` zurück, sortiert nach `region` und dann nach `wine`.'
    ].join('\n'),
    en: [
      'Every wine region wants to advertise its highest rated lot.',
      '',
      'For each region, return the lot whose `score` is not beaten by any other lot of the same region.',
      'When two lots tie for the top score, both of them are advertised.',
      'A region without any lot has nothing to advertise and must not appear.',
      '',
      'Return `region`, `wine` and `score`, ordered by `region` and then by `wine`.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS lots;
    DROP TABLE IF EXISTS regions;

    CREATE TABLE regions (
      id integer PRIMARY KEY,
      name text NOT NULL
    );

    CREATE TABLE lots (
      id integer PRIMARY KEY,
      region_id integer NOT NULL REFERENCES regions (id),
      wine text NOT NULL,
      score integer NOT NULL
    );

    INSERT INTO regions (id, name) VALUES
      (1, 'Douro Valley'),
      (2, 'Mosel'),
      (3, 'Rioja'),
      (4, 'Tokaj');

    INSERT INTO lots (id, region_id, wine, score) VALUES
      (1, 1, 'Granite Terrace', 91),
      (2, 1, 'River Bend', 94),
      (3, 1, 'Sun Wall', 88),
      (4, 2, 'Blue Slate', 89),
      (5, 2, 'Kestrel Hill', 89),
      (6, 2, 'Old Vine', 85),
      (7, 3, 'Ash Grove', 82);
  `,
  starterSql:
    'SELECT r.name AS region, l.wine, l.score\nFROM lots AS l\nJOIN regions AS r ON r.id = l.region_id;',
  hints: [
    {
      text: {
        de: 'Ein einzelnes globales Maximum ist der falsche Maßstab — jedes Los muss nur an den Bewertungen seiner eigenen Region gemessen werden.',
        en: 'A single global maximum is the wrong yardstick — every lot has to be measured against the scores of its own region only.'
      }
    },
    {
      text: {
        de: 'Eine Unteranfrage, die eine Spalte der äußeren Anfrage nennt, wird einmal pro äußerer Zeile ausgewertet — genau dadurch bleibt die Vergleichsmenge auf die jeweilige Region beschränkt.',
        en: 'A subquery that mentions a column of the outer query is evaluated once per outer row, which is exactly how the comparison set stays region-local.'
      }
    },
    {
      text: {
        de: 'Ein Vergleich mit >= ALL behält beide Lose, wenn die Spitzenbewertung zweimal vorkommt, während ein einfaches > beide verwerfen würde.',
        en: 'Comparing with >= ALL keeps both lots when the top score occurs twice, while a plain > would drop them both.'
      }
    }
  ],
  grading: {
    kind: 'result-equals',
    ordered: true,
    expectedSql: `
      SELECT r.name AS region, l.wine, l.score
      FROM lots AS l
      JOIN regions AS r ON r.id = l.region_id
      WHERE l.score >= ALL (
        SELECT rival.score
        FROM lots AS rival
        WHERE rival.region_id = l.region_id
      )
      ORDER BY region, l.wine;
    `
  },
  tags: ['subquery', 'all-quantifier', 'correlated']
};
