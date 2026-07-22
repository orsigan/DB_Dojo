import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'sql-bike-rental-price-list',
  topic: ['sql', 'select'],
  difficulty: 'Beginner',
  title: { de: 'Preisliste des Fahrradverleihs', en: 'Bike rental price list' },
  prompt: {
    de: [
      'Der Verleih druckt eine Preisliste: jedes erschwingliche Fahrrad kombiniert mit jedem angebotenen Mietzeitraum.',
      '',
      'Nur Fahrräder, deren `daily_rate` zwischen 10 und 20 liegt, gehören auf die Liste — beide Grenzen eingeschlossen.',
      'Kombiniere jedes dieser Fahrräder mit jeder Zeile von `rental_periods` und berechne den Gesamtpreis als Tagessatz mal Tage.',
      '',
      'Gib `model`, `days` und `price` zurück, sortiert nach `model` und dann nach `days`.'
    ].join('\n'),
    en: [
      'The rental shop prints a price list: every affordable bike combined with every rental period it offers.',
      '',
      'Only bikes whose `daily_rate` lies between 10 and 20 belong on the list — both limits included.',
      'Combine each of those bikes with each row of `rental_periods` and compute the total price as daily rate times days.',
      '',
      'Return `model`, `days` and `price`, ordered by `model` and then by `days`.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS rental_periods;
    DROP TABLE IF EXISTS bikes;

    CREATE TABLE bikes (
      id integer PRIMARY KEY,
      model text NOT NULL,
      category text NOT NULL,
      daily_rate numeric NOT NULL
    );

    CREATE TABLE rental_periods (
      days integer PRIMARY KEY,
      label text NOT NULL
    );

    INSERT INTO bikes (id, model, category, daily_rate) VALUES
      (1, 'Alley Cruiser', 'city', 12.50),
      (2, 'Cargo Mule', 'cargo', 34.00),
      (3, 'Dune Rider', 'gravel', 19.90),
      (4, 'Ember Bolt', 'e-bike', 20.00),
      (5, 'Fjord Tourer', 'trekking', 9.50);

    INSERT INTO rental_periods (days, label) VALUES
      (1, 'day'),
      (3, 'weekend'),
      (7, 'week');
  `,
  starterSql: 'SELECT model, daily_rate\nFROM bikes;',
  hints: [
    {
      text: {
        de: 'Werden zwei Relationen in FROM ohne Verbundbedingung genannt, entsteht das kartesische Produkt — genau das „jedes mit jedem", das die Preisliste braucht.',
        en: 'Naming two relations in FROM without a join condition builds the cartesian product — exactly the "each with each" the price list needs.'
      }
    },
    {
      text: {
        de: 'BETWEEN ist eine Abkürzung für >= und <=, daher gehören beide Grenzwerte noch zur Liste.',
        en: 'BETWEEN is a shorthand for >= and <=, so both boundary rates still belong to the list.'
      }
    },
    {
      text: {
        de: 'Eine berechnete Spalte hat keinen eigenen Namen, bis du ihr mit AS einen gibst.',
        en: 'A computed column has no name of its own until you give it one with AS.'
      }
    }
  ],
  grading: {
    kind: 'result-equals',
    ordered: true,
    expectedSql: `
      SELECT b.model, p.days, b.daily_rate * p.days AS price
      FROM bikes AS b, rental_periods AS p
      WHERE b.daily_rate BETWEEN 10 AND 20
      ORDER BY b.model, p.days;
    `
  },
  tags: ['cross-join', 'arithmetic', 'between']
};
