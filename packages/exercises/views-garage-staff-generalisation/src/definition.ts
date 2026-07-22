import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'views-garage-staff-generalisation',
  topic: ['views'],
  difficulty: 'Advanced',
  title: { de: 'Generalisierung als Vereinigungssicht', en: 'Generalisation as a union view' },
  prompt: {
    de: [
      'Eine Autowerkstatt hat ihre Personalhierarchie mit dem "Hausklassenmodell" abgebildet: Nur die',
      'Spezialisierungen bekamen eigene Tabellen — `mechanics`, `service_advisors` und `apprentices`.',
      'Für die Generalisierung gibt es keine Tabelle, doch der Lohnexport braucht eine flache Liste von',
      'allen.',
      '',
      'Erstelle eine Sicht namens `staff` mit den Spalten `staff_no` und `name`, die alle drei',
      'Spezialisierungstabellen vereinigt.'
    ].join('\n'),
    en: [
      'A car workshop mapped its staff hierarchy with the "Hausklassenmodell": only the',
      'specialisations got their own tables — `mechanics`, `service_advisors` and `apprentices`.',
      'There is no table for the generalisation, yet the payroll export needs one flat list of',
      'everybody.',
      '',
      'Create a view named `staff` with the columns `staff_no` and `name` that unites all three',
      'specialisation tables.'
    ].join('\n')
  },
  seedSql: `
    DROP VIEW IF EXISTS staff;
    DROP TABLE IF EXISTS mechanics;
    DROP TABLE IF EXISTS service_advisors;
    DROP TABLE IF EXISTS apprentices;

    CREATE TABLE mechanics (
      staff_no integer PRIMARY KEY,
      name text NOT NULL,
      certification text NOT NULL
    );

    CREATE TABLE service_advisors (
      staff_no integer PRIMARY KEY,
      name text NOT NULL,
      desk text NOT NULL
    );

    CREATE TABLE apprentices (
      staff_no integer PRIMARY KEY,
      name text NOT NULL,
      school text NOT NULL
    );

    INSERT INTO mechanics (staff_no, name, certification) VALUES
      (101, 'Rita Falk', 'Diesel systems'),
      (102, 'Arno Bergmann', 'Electric drivetrain'),
      (103, 'Malik Sadiq', 'Bodywork');

    INSERT INTO service_advisors (staff_no, name, desk) VALUES
      (201, 'Petra Lindt', 'Front left'),
      (202, 'Sven Aalto', 'Front right');

    INSERT INTO apprentices (staff_no, name, school) VALUES
      (301, 'Nora Kilic', 'BS Technik Ost'),
      (302, 'Jasper Wolff', 'BS Technik Ost');
  `,
  starterSql: 'CREATE VIEW staff AS\nSELECT staff_no, name\nFROM mechanics;',
  hints: [
    {
      text: {
        de: 'Im Hausklassenmodell hat der Supertyp keinen eigenen Speicher — die Sicht ist der einzige Ort, an dem die Generalisierung existiert.',
        en: 'In the Hausklassenmodell the supertype has no storage of its own — the view is the only place where the generalisation exists.'
      }
    },
    {
      text: {
        de: 'Die Zweige eines UNION müssen in Spaltenanzahl und -typ übereinstimmen, daher muss jeder Zweig auf die Attribute projizieren, die der Supertyp tatsächlich hat.',
        en: 'The branches of a UNION must agree in column count and type, so each branch has to project down to the attributes the supertype actually has.'
      }
    },
    {
      text: {
        de: 'Eine mit UNION gebaute Sicht ist unter SQL-92 nicht änderbar: Das System kann nicht wissen, zu welcher der drei Tabellen eine neue Zeile gehört.',
        en: 'A view built with UNION is not updatable under SQL-92: the system cannot tell which of the three tables a new row belongs to.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: { de: 'staff existiert als Sicht', en: 'staff exists as a view' },
        sql: "SELECT count(*) = 1 AS ok FROM pg_views WHERE schemaname = 'public' AND viewname = 'staff';"
      },
      {
        label: {
          de: 'Sie hat genau die Spalten staff_no und name',
          en: 'It has exactly the columns staff_no and name'
        },
        sql: `
          SELECT count(*) = 2 AND bool_and(column_name IN ('staff_no', 'name')) AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'staff';
        `
      },
      {
        label: { de: 'Alle sieben Mitarbeiter erscheinen', en: 'All seven staff members appear' },
        sql: 'SELECT count(*) = 7 AS ok FROM staff;'
      },
      {
        label: {
          de: 'Die Sicht ist die Vereinigung der drei Spezialisierungen',
          en: 'The view is the union of the three specialisations'
        },
        sql: `
          WITH expected AS (
            SELECT staff_no, name FROM mechanics
            UNION
            SELECT staff_no, name FROM service_advisors
            UNION
            SELECT staff_no, name FROM apprentices
          )
          SELECT NOT EXISTS (
            SELECT * FROM expected
            EXCEPT
            SELECT staff_no, name FROM staff
          ) AND NOT EXISTS (
            SELECT staff_no, name FROM staff
            EXCEPT
            SELECT * FROM expected
          ) AS ok;
        `
      }
    ]
  },
  tags: ['create-view', 'union', 'generalisation']
};
