import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'views-depot-updatable-roster',
  topic: ['views', 'updatable'],
  difficulty: 'Profi',
  title: {
    de: 'Eine änderbare Sicht, die ihre eigenen Zeilen schützt',
    en: 'An updatable view that guards its own rows'
  },
  prompt: {
    de: [
      'Das Team für die Elektroflotte eines Busdepots will seine eigenen Fahrzeuge über eine Sicht pflegen,',
      'ohne jemals versehentlich einen Dieselbus anzufassen.',
      '',
      'Erstelle eine Sicht namens `electric_buses` auf `vehicles` mit den Spalten `fleet_no`, `depot`,',
      "`seats` und `drive`, die nur die Zeilen zeigt, deren `drive` `'electric'` ist.",
      'Die Sicht muss die SQL-92-Regeln zur Änderbarkeit erfüllen, und sie muss jede Zeile ablehnen, die',
      'über sie eingefügt wird, aber danach nicht in ihr sichtbar wäre.',
      '',
      "Füge dann den neuen Bus `('EB-104', 'Riverside', 62, 'electric')` hinzu, indem du ihn über die",
      'Sicht einfügst, nicht in `vehicles`.'
    ].join('\n'),
    en: [
      'The electric fleet team of a bus depot wants to maintain its own vehicles through a view,',
      'without ever touching a diesel bus by accident.',
      '',
      'Create a view named `electric_buses` over `vehicles` with the columns `fleet_no`, `depot`,',
      "`seats` and `drive`, showing only the rows whose `drive` is `'electric'`.",
      'The view must satisfy the SQL-92 updatability rules, and it must reject any row inserted',
      'through it that would not be visible in it afterwards.',
      '',
      "Then add the new bus `('EB-104', 'Riverside', 62, 'electric')` by inserting it through the",
      'view, not into `vehicles`.'
    ].join('\n')
  },
  seedSql: `
    DROP VIEW IF EXISTS electric_buses;
    DROP TABLE IF EXISTS vehicles;

    CREATE TABLE vehicles (
      fleet_no text PRIMARY KEY,
      depot text NOT NULL,
      seats integer NOT NULL,
      drive text NOT NULL
    );

    INSERT INTO vehicles (fleet_no, depot, seats, drive) VALUES
      ('EB-101', 'Riverside', 48, 'electric'),
      ('EB-102', 'Riverside', 52, 'electric'),
      ('DB-210', 'Northgate', 60, 'diesel'),
      ('EB-103', 'Northgate', 44, 'electric'),
      ('DB-211', 'Riverside', 60, 'diesel'),
      ('HB-330', 'Southbank', 55, 'hydrogen');
  `,
  starterSql:
    'CREATE VIEW electric_buses AS\nSELECT DISTINCT fleet_no, depot, seats, drive\nFROM vehicles;',
  hints: [
    {
      text: {
        de: 'SQL-92 nennt eine Sicht nur dann änderbar, wenn sie genau eine Tabelle liest und weder DISTINCT noch eine Mengenoperation, keine Aggregat- oder Arithmetikfunktion in der Select-Liste und keine Gruppierung verwendet — der Startcode verstößt gegen eine dieser Regeln.',
        en: 'SQL-92 calls a view updatable only if it reads exactly one table and uses no DISTINCT, no set operation, no aggregate or arithmetic in the select list and no grouping — the starter breaks one of those rules.'
      }
    },
    {
      text: {
        de: 'Ohne Check-Option schluckt eine gefilterte Sicht klaglos eine Zeile, die ihre eigene WHERE-Klausel verletzt: Das Insert gelingt, und die Zeile verschwindet aus der Sicht.',
        en: 'Without a check option a filtered view happily swallows a row that violates its own WHERE clause: the insert succeeds, and the row vanishes from the view.'
      }
    },
    {
      text: {
        de: 'Sobald die Sicht änderbar ist, sprichst du sie an wie eine Tabelle: INSERT INTO electric_buses (...) VALUES (...).',
        en: 'Once the view is updatable you address it like a table: INSERT INTO electric_buses (...) VALUES (...).'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'electric_buses existiert und ist änderbar',
          en: 'electric_buses exists and is updatable'
        },
        sql: `
          SELECT count(*) = 1 AND bool_and(is_updatable = 'YES' AND is_insertable_into = 'YES') AS ok
          FROM information_schema.views
          WHERE table_schema = 'public' AND table_name = 'electric_buses';
        `
      },
      {
        label: { de: 'Die Sicht trägt eine Check-Option', en: 'The view carries a check option' },
        sql: `
          SELECT bool_and(check_option IN ('CASCADED', 'LOCAL')) AS ok
          FROM information_schema.views
          WHERE table_schema = 'public' AND table_name = 'electric_buses';
        `
      },
      {
        label: {
          de: 'Der neue Bus kam über die Sicht in der Tabelle vehicles an',
          en: 'The new bus reached the vehicles table through the view'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM vehicles
          WHERE fleet_no = 'EB-104' AND depot = 'Riverside' AND seats = 62 AND drive = 'electric';
        `
      },
      {
        label: {
          de: 'Die Sicht zeigt jetzt genau die vier Elektrobusse',
          en: 'The view now shows exactly the four electric buses'
        },
        sql: "SELECT count(*) = 4 AND bool_and(drive = 'electric') AS ok FROM electric_buses;"
      },
      {
        label: {
          de: 'Kein Diesel- oder Wasserstoffbus wurde beeinträchtigt',
          en: 'No diesel or hydrogen bus was harmed'
        },
        sql: "SELECT count(*) = 3 AS ok FROM vehicles WHERE drive <> 'electric';"
      }
    ]
  },
  tags: ['updatable-view', 'check-option', 'insert']
};
