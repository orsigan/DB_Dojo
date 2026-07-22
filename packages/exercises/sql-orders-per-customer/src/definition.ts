import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'sql-orders-per-customer',
  topic: ['sql', 'select'],
  difficulty: 'Beginner',
  title: { de: 'Bestellungen pro Kunde', en: 'Orders per customer' },
  prompt: {
    de: [
      'Liste jeden Kunden zusammen mit der Anzahl seiner Bestellungen auf.',
      '',
      'Gib die Spalten `name` und `order_count` zurück, sortiert nach `name`.',
      'Kunden ohne Bestellungen müssen trotzdem erscheinen, mit einer Anzahl von 0.'
    ].join('\n'),
    en: [
      'List every customer together with the number of orders they placed.',
      '',
      'Return the columns `name` and `order_count`, ordered by `name`.',
      'Customers without any orders must still appear, with a count of 0.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS customers;

    CREATE TABLE customers (
      id integer PRIMARY KEY,
      name text NOT NULL
    );

    CREATE TABLE orders (
      id integer PRIMARY KEY,
      customer_id integer NOT NULL REFERENCES customers (id),
      total numeric NOT NULL
    );

    INSERT INTO customers (id, name) VALUES
      (1, 'Alice'),
      (2, 'Bob'),
      (3, 'Carol');

    INSERT INTO orders (id, customer_id, total) VALUES
      (1, 1, 20),
      (2, 1, 35),
      (3, 2, 10);
  `,
  starterSql: 'SELECT c.name\nFROM customers AS c;',
  hints: [
    {
      text: {
        de: 'Ein LEFT JOIN behält Kunden, die keine passenden Bestellungen haben — ein INNER JOIN würde Carol verlieren.',
        en: 'A LEFT JOIN keeps customers that have no matching orders — an INNER JOIN would drop Carol.'
      }
    },
    {
      text: {
        de: 'GROUP BY fasst die verbundenen Zeilen wieder zu einer Zeile pro Kunde zusammen, damit COUNT pro Kunde funktioniert.',
        en: 'GROUP BY collapses the joined rows back to one row per customer so COUNT works per customer.'
      }
    }
  ],
  grading: {
    kind: 'result-equals',
    ordered: true,
    expectedSql: `
      SELECT c.name, count(o.id) AS order_count
      FROM customers AS c
      LEFT JOIN orders AS o ON o.customer_id = c.id
      GROUP BY c.name
      ORDER BY c.name;
    `
  },
  tags: ['join', 'aggregation', 'group-by']
};
