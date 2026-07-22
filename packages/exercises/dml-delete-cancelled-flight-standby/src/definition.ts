import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'dml-delete-cancelled-flight-standby',
  topic: ['dml', 'delete'],
  difficulty: 'Advanced',
  title: {
    de: 'Warteliste stornierter Flüge löschen',
    en: 'Drop the standby lists of cancelled flights'
  },
  prompt: {
    de: [
      'Wenn ein Flug storniert wird, verliert seine Warteliste ihren Sinn und wird am Gate gelöscht.',
      '',
      'Lösche jede Zeile aus `standby_list`, die zu einem Flug mit Status `cancelled` gehört.',
      '',
      'Warteliste-Einträge für Flüge, die weiterhin stattfinden, müssen erhalten bleiben, und `flights` selbst darf keine einzige Zeile verlieren.'
    ].join('\n'),
    en: [
      'When a flight is cancelled, its standby list becomes meaningless and is cleared at the gate.',
      '',
      'Delete every row from `standby_list` that belongs to a flight with status `cancelled`.',
      '',
      'Standby entries for flights that still operate must stay, and `flights` itself must not lose a single row.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS standby_list;
    DROP TABLE IF EXISTS flights;

    CREATE TABLE flights (
      id integer PRIMARY KEY,
      flight_no text NOT NULL,
      destination text NOT NULL,
      status text NOT NULL
    );

    CREATE TABLE standby_list (
      id integer PRIMARY KEY,
      flight_id integer NOT NULL REFERENCES flights (id),
      passenger text NOT NULL,
      requested_at timestamp NOT NULL
    );

    INSERT INTO flights (id, flight_no, destination, status) VALUES
      (1, 'LH 402', 'New York', 'boarding'),
      (2, 'AF 1123', 'Paris', 'cancelled'),
      (3, 'BA 917', 'London', 'scheduled'),
      (4, 'IB 3155', 'Madrid', 'cancelled');

    INSERT INTO standby_list (id, flight_id, passenger, requested_at) VALUES
      (1, 1, 'R. Amari', '2026-06-01 06:10'),
      (2, 2, 'S. Delacroix', '2026-06-01 06:12'),
      (3, 2, 'T. Okonkwo', '2026-06-01 06:31'),
      (4, 3, 'U. Fischer', '2026-06-01 07:02'),
      (5, 4, 'V. Moreau', '2026-06-01 07:20'),
      (6, 1, 'W. Silva', '2026-06-01 07:44');
  `,
  starterSql:
    'SELECT s.id, s.passenger, f.flight_no, f.status\nFROM standby_list AS s\nJOIN flights AS f ON f.id = s.flight_id\nORDER BY s.id;',
  hints: [
    {
      text: {
        de: 'DELETE nennt in seiner FROM-Klausel genau eine Tabelle — die Bedingung, die auf `flights` zugreift, gehört in ein Subselect in der WHERE-Klausel.',
        en: 'DELETE names exactly one table in its FROM clause — the condition that reaches into `flights` belongs into a subselect in the WHERE clause.'
      }
    },
    {
      text: {
        de: 'Das Subselect sollte Flug-IDs liefern, damit `flight_id IN (...)` Gleiches mit Gleichem vergleichen kann.',
        en: 'The subselect should return flight ids, so that `flight_id IN (...)` can compare like against like.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'Genau die Warteliste-Einträge 1, 4 und 6 bleiben erhalten',
          en: 'Exactly the standby entries 1, 4 and 6 survive'
        },
        sql: `
          SELECT count(*) = 3 AND count(*) FILTER (WHERE id IN (1, 4, 6)) = 3 AS ok
          FROM standby_list;
        `
      },
      {
        label: {
          de: 'Kein Warteliste-Eintrag verweist mehr auf einen stornierten Flug',
          en: 'No standby entry points at a cancelled flight any more'
        },
        sql: `
          SELECT count(*) = 0 AS ok
          FROM standby_list AS s
          JOIN flights AS f ON f.id = s.flight_id
          WHERE f.status = 'cancelled';
        `
      },
      {
        label: {
          de: 'Die verbliebenen Passagiere behalten ihre Anfragezeiten',
          en: 'The surviving passengers kept their request times'
        },
        sql: `
          SELECT count(*) = 3 AS ok
          FROM standby_list
          WHERE (id = 1 AND passenger = 'R. Amari' AND requested_at = TIMESTAMP '2026-06-01 06:10')
             OR (id = 4 AND passenger = 'U. Fischer' AND requested_at = TIMESTAMP '2026-06-01 07:02')
             OR (id = 6 AND passenger = 'W. Silva' AND requested_at = TIMESTAMP '2026-06-01 07:44');
        `
      },
      {
        label: {
          de: 'Alle vier Flüge stehen weiterhin auf der Tafel',
          en: 'All four flights are still on the board'
        },
        sql: 'SELECT count(*) = 4 AS ok FROM flights;'
      }
    ]
  },
  tags: ['delete', 'subquery', 'in']
};
