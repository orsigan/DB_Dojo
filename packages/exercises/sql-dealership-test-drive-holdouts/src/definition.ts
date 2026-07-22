import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'sql-dealership-test-drive-holdouts',
  topic: ['sql', 'subqueries'],
  difficulty: 'Advanced',
  title: {
    de: 'Kunden ohne Probefahrt mit dem Comet EV',
    en: 'Customers who never test-drove the Comet EV'
  },
  prompt: {
    de: [
      'Das Autohaus will alle Kunden anschreiben, die den `Comet EV` noch nie zur Probe gefahren sind.',
      '',
      'Manche Probefahrten sind spontane Laufkundschaft ohne Kundenkonto — dort ist `customer_id` NULL.',
      'Diese Probefahrten gehören zu niemandem und dürfen kein Kundenkonto ausschließen.',
      '',
      'Gib `name` zurück, sortiert nach `name`.'
    ].join('\n'),
    en: [
      'The dealership wants to write to every customer who has never test-driven the `Comet EV`.',
      '',
      'Some test drives are walk-ins with no linked account — there `customer_id` is NULL.',
      'Those test drives belong to nobody and must not rule out any customer account.',
      '',
      'Return `name`, ordered by `name`.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS test_drive;
    DROP TABLE IF EXISTS customer;

    CREATE TABLE customer (
      id integer PRIMARY KEY,
      name text NOT NULL
    );

    CREATE TABLE test_drive (
      id integer PRIMARY KEY,
      customer_id integer REFERENCES customer (id),
      model text NOT NULL
    );

    INSERT INTO customer (id, name) VALUES
      (1, 'Anna'),
      (2, 'Ben'),
      (3, 'Clara'),
      (4, 'David'),
      (5, 'Elena');

    INSERT INTO test_drive (id, customer_id, model) VALUES
      (1, 1, 'Comet EV'),
      (2, 2, 'Falcon'),
      (3, 3, 'Comet EV'),
      (4, 3, 'Falcon'),
      (5, 5, 'Falcon'),
      (6, NULL, 'Falcon');
  `,
  starterSql: [
    'SELECT c.name',
    'FROM customer AS c',
    'WHERE c.id NOT IN (',
    "  SELECT t.customer_id FROM test_drive AS t WHERE t.model <> 'Comet EV'",
    ');'
  ].join('\n'),
  hints: [
    {
      text: {
        de: 'Die Unterabfrage im Starter liefert auch die NULL von der anonymen Probefahrt (Zeile 6) mit. Sobald eine Unterabfrage bei NOT IN ein NULL enthält, wird `x NOT IN (a, b, NULL)` für jedes x zu UNKNOWN statt TRUE — die Abfrage liefert für niemanden mehr eine Zeile.',
        en: "The starter's subquery also returns the NULL from the anonymous test drive (row 6). As soon as a NOT IN subquery contains a NULL, `x NOT IN (a, b, NULL)` evaluates to UNKNOWN instead of TRUE for every x — the query silently returns no rows for anyone."
      }
    },
    {
      text: {
        de: 'NOT EXISTS prüft pro Kunde direkt, ob eine passende Probefahrt existiert, statt eine Liste von Werten zu vergleichen. Ein NULL in `test_drive.customer_id` kann diese Zeile dann nie mit einem Kunden verknüpfen und verfälscht daher nichts.',
        en: "NOT EXISTS checks per customer whether a matching test drive exists, instead of comparing against a list of values. A NULL in test_drive.customer_id can never join to any customer row there, so it can't corrupt the result."
      }
    },
    {
      text: {
        de: 'Formuliere die korrelierte Unterabfrage so: „gibt es eine Probefahrt dieses Kunden mit Modell Comet EV?“ und negiere mit NOT EXISTS davor.',
        en: 'Phrase the correlated subquery as "does a Comet EV test drive by this customer exist?" and negate it with NOT EXISTS.'
      }
    }
  ],
  grading: {
    kind: 'result-equals',
    ordered: true,
    expectedSql: `
      SELECT c.name
      FROM customer AS c
      WHERE NOT EXISTS (
        SELECT 1
        FROM test_drive AS t
        WHERE t.customer_id = c.id
          AND t.model = 'Comet EV'
      )
      ORDER BY c.name;
    `
  },
  tags: ['not-exists', 'not-in', 'null', 'correlated-subquery']
};
