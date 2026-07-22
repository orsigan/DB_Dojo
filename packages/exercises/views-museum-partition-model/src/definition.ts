import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'views-museum-partition-model',
  topic: ['views'],
  difficulty: 'Profi',
  title: {
    de: 'Spezialisierungssichten im Partitionierungsmodell',
    en: 'Specialisation views in the partition model'
  },
  prompt: {
    de: [
      'Ein Museum speichert sein Personal mit dem Partitionierungsmodell: Die Generalisierung `staff_members`',
      'enthält die gemeinsamen Attribute, während `curator_details` und `guide_details` nur den',
      'Primärschlüssel plus die für diese Spezialisierung spezifischen Attribute enthalten.',
      'Anwendungen wollen jedoch vollständige Kuratoren und vollständige Guides sehen.',
      '',
      'Erstelle zwei Sichten:',
      '- `curators` mit den Spalten `staff_no`, `name`, `hired_on`, `specialism`, `office`',
      '- `guides` mit den Spalten `staff_no`, `name`, `hired_on`, `languages`, `tour_zone`',
      '',
      'Ein Mitarbeiter, der weder Kurator noch Guide ist, darf in keiner der beiden Sichten erscheinen.'
    ].join('\n'),
    en: [
      'A museum stores its staff with the partition model: the generalisation `staff_members`',
      'holds the shared attributes, while `curator_details` and `guide_details` hold only the',
      'primary key plus the attributes specific to that specialisation.',
      'Applications, however, want to see complete curators and complete guides.',
      '',
      'Create two views:',
      '- `curators` with the columns `staff_no`, `name`, `hired_on`, `specialism`, `office`',
      '- `guides` with the columns `staff_no`, `name`, `hired_on`, `languages`, `tour_zone`',
      '',
      'A staff member who is neither a curator nor a guide must appear in neither view.'
    ].join('\n')
  },
  seedSql: `
    DROP VIEW IF EXISTS curators;
    DROP VIEW IF EXISTS guides;
    DROP TABLE IF EXISTS curator_details;
    DROP TABLE IF EXISTS guide_details;
    DROP TABLE IF EXISTS staff_members;

    CREATE TABLE staff_members (
      staff_no integer PRIMARY KEY,
      name text NOT NULL,
      hired_on date NOT NULL
    );

    CREATE TABLE curator_details (
      staff_no integer PRIMARY KEY REFERENCES staff_members (staff_no),
      specialism text NOT NULL,
      office text NOT NULL
    );

    CREATE TABLE guide_details (
      staff_no integer PRIMARY KEY REFERENCES staff_members (staff_no),
      languages text NOT NULL,
      tour_zone text NOT NULL
    );

    INSERT INTO staff_members (staff_no, name, hired_on) VALUES
      (1, 'Helene Aust', '2019-03-01'),
      (2, 'Ravi Chandran', '2021-09-15'),
      (3, 'Mira Solheim', '2017-01-20'),
      (4, 'Ansgar Petit', '2023-06-05'),
      (5, 'Yara Bittar', '2020-11-11'),
      (6, 'Piet Hoving', '2022-02-28');

    INSERT INTO curator_details (staff_no, specialism, office) VALUES
      (1, 'Bronze Age', 'W-104'),
      (3, 'Print graphics', 'W-207'),
      (5, 'Textiles', 'E-011');

    INSERT INTO guide_details (staff_no, languages, tour_zone) VALUES
      (2, 'de,en,ta', 'Antiquity'),
      (4, 'de,fr', 'Modern wing');
  `,
  starterSql:
    'CREATE VIEW curators AS\nSELECT s.staff_no, s.name, s.hired_on\nFROM staff_members AS s;',
  hints: [
    {
      text: {
        de: 'Das Partitionierungsmodell teilt eine konzeptuelle Entität auf zwei Tabellen auf, die sich einen Primärschlüssel teilen — die Spezialisierungssicht setzt sie wieder zusammen.',
        en: 'The partition model splits one conceptual entity across two tables that share a primary key — the specialisation view puts it back together.'
      }
    },
    {
      text: {
        de: 'Der Verbund über den gemeinsamen Primärschlüssel ist zugleich der Filter: Ein Mitarbeiter ohne Detailzeile findet einfach keinen Verbundpartner.',
        en: 'Joining on the shared primary key is also the filter: a staff member without a detail row simply finds no join partner.'
      }
    },
    {
      text: {
        de: 'Wähle nicht `*` aus beiden Tabellen — das würde `staff_no` doppelt liefern, und die Sicht hätte nicht die geforderte Spaltenliste.',
        en: 'Do not select `*` from both tables — that would give you `staff_no` twice, and the view would not have the requested column list.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'curators und guides existieren beide als Sichten',
          en: 'Both curators and guides exist as views'
        },
        sql: "SELECT count(*) = 2 AS ok FROM pg_views WHERE schemaname = 'public' AND viewname IN ('curators', 'guides');"
      },
      {
        label: {
          de: 'curators hat die fünf geforderten Spalten',
          en: 'curators has the five requested columns'
        },
        sql: `
          SELECT count(*) = 5 AND bool_and(column_name IN ('staff_no', 'name', 'hired_on', 'specialism', 'office')) AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'curators';
        `
      },
      {
        label: {
          de: 'guides hat die fünf geforderten Spalten',
          en: 'guides has the five requested columns'
        },
        sql: `
          SELECT count(*) = 5 AND bool_and(column_name IN ('staff_no', 'name', 'hired_on', 'languages', 'tour_zone')) AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'guides';
        `
      },
      {
        label: {
          de: 'curators zeigt genau die drei Kuratoren mit ihren gemeinsamen Attributen',
          en: 'curators shows exactly the three curators with their shared attributes'
        },
        sql: `
          WITH expected AS (
            SELECT s.staff_no, s.name, s.hired_on, c.specialism, c.office
            FROM staff_members AS s
            JOIN curator_details AS c ON c.staff_no = s.staff_no
          )
          SELECT NOT EXISTS (
            SELECT * FROM expected
            EXCEPT
            SELECT staff_no, name, hired_on, specialism, office FROM curators
          ) AND NOT EXISTS (
            SELECT staff_no, name, hired_on, specialism, office FROM curators
            EXCEPT
            SELECT * FROM expected
          ) AS ok;
        `
      },
      {
        label: {
          de: 'guides zeigt genau die zwei Guides mit ihren gemeinsamen Attributen',
          en: 'guides shows exactly the two guides with their shared attributes'
        },
        sql: `
          WITH expected AS (
            SELECT s.staff_no, s.name, s.hired_on, g.languages, g.tour_zone
            FROM staff_members AS s
            JOIN guide_details AS g ON g.staff_no = s.staff_no
          )
          SELECT NOT EXISTS (
            SELECT * FROM expected
            EXCEPT
            SELECT staff_no, name, hired_on, languages, tour_zone FROM guides
          ) AND NOT EXISTS (
            SELECT staff_no, name, hired_on, languages, tour_zone FROM guides
            EXCEPT
            SELECT * FROM expected
          ) AS ok;
        `
      },
      {
        label: {
          de: 'Piet Hoving gehört zu keiner Spezialisierung und taucht nirgends auf',
          en: 'Piet Hoving belongs to no specialisation and shows up nowhere'
        },
        sql: `
          SELECT NOT EXISTS (SELECT 1 FROM curators WHERE staff_no = 6)
             AND NOT EXISTS (SELECT 1 FROM guides WHERE staff_no = 6) AS ok;
        `
      }
    ]
  },
  tags: ['create-view', 'generalisation', 'join']
};
