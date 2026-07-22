import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'views-clinic-ward-occupancy',
  topic: ['views'],
  difficulty: 'Advanced',
  title: {
    de: 'Aggregationssicht für die Stationsbelegung',
    en: 'Aggregation view for ward occupancy'
  },
  prompt: {
    de: [
      'Der Bettenmanagement-Bildschirm einer Klinik braucht eine Zeile pro Station mit der aktuellen Belegung.',
      'Ein Patient belegt ein Bett so lange, wie `discharged_on` NULL ist.',
      '',
      'Erstelle eine Sicht namens `ward_occupancy` mit den Spalten `ward_code`, `ward_name`,',
      '`occupied_beds` und `free_beds`.',
      'Jede Station muss erscheinen, auch eine ohne eine einzige Aufnahme — ihre Belegung ist 0.'
    ].join('\n'),
    en: [
      'The bed management screen of a clinic needs one line per ward with the current occupancy.',
      'A patient still occupies a bed as long as `discharged_on` is NULL.',
      '',
      'Create a view named `ward_occupancy` with the columns `ward_code`, `ward_name`,',
      '`occupied_beds` and `free_beds`.',
      'Every ward must appear, even one without a single admission — its occupancy is 0.'
    ].join('\n')
  },
  seedSql: `
    DROP VIEW IF EXISTS ward_occupancy;
    DROP TABLE IF EXISTS admissions;
    DROP TABLE IF EXISTS wards;

    CREATE TABLE wards (
      code text PRIMARY KEY,
      name text NOT NULL,
      beds integer NOT NULL
    );

    CREATE TABLE admissions (
      id integer PRIMARY KEY,
      ward_code text NOT NULL REFERENCES wards (code),
      patient text NOT NULL,
      discharged_on date
    );

    INSERT INTO wards (code, name, beds) VALUES
      ('CAR', 'Cardiology', 12),
      ('NEU', 'Neurology', 8),
      ('PAE', 'Paediatrics', 10),
      ('ONC', 'Oncology', 6);

    INSERT INTO admissions (id, ward_code, patient, discharged_on) VALUES
      (1, 'CAR', 'Ines Weber', NULL),
      (2, 'CAR', 'Omar Haddad', NULL),
      (3, 'CAR', 'Lena Frost', NULL),
      (4, 'CAR', 'Petra Nowak', '2026-02-11'),
      (5, 'NEU', 'Yusuf Kaya', NULL),
      (6, 'NEU', 'Marta Silva', NULL),
      (7, 'PAE', 'Nils Bauer', '2026-02-14'),
      (8, 'PAE', 'Aria Fenn', '2026-02-15');
  `,
  starterSql:
    'CREATE VIEW ward_occupancy AS\nSELECT w.code AS ward_code, w.name AS ward_name\nFROM wards AS w;',
  hints: [
    {
      text: {
        de: 'Eine Aggregationssicht speichert das GROUP BY für ihre Leser — dafür gibt sie aber die Änderbarkeit auf, weil hinter einer Summenzeile keine einzelne Basiszeile mehr steht.',
        en: 'An aggregation view stores the GROUP BY for its readers — but it also gives up updatability, because a summary row has no single base row behind it.'
      }
    },
    {
      text: {
        de: 'Ein LEFT JOIN von `wards` aus behält die Station, die gar keine Aufnahmen hat; ein INNER JOIN würde sie stillschweigend weglassen.',
        en: 'A LEFT JOIN from `wards` keeps the ward that has no admissions at all; an INNER JOIN would silently drop it.'
      }
    },
    {
      text: {
        de: 'Entlassene Patienten haben weiterhin Zeilen in `admissions`, daher überschätzt das Zählen aller verbundenen Zeilen die Belegung — zähle nur die mit NULL als Entlassungsdatum.',
        en: 'Discharged patients still have rows in `admissions`, so counting all joined rows overstates the occupancy — count only those with a NULL discharge date.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: { de: 'ward_occupancy existiert als Sicht', en: 'ward_occupancy exists as a view' },
        sql: "SELECT count(*) = 1 AS ok FROM pg_views WHERE schemaname = 'public' AND viewname = 'ward_occupancy';"
      },
      {
        label: {
          de: 'Sie liefert die vier geforderten Spalten',
          en: 'It returns the four requested columns'
        },
        sql: `
          SELECT count(*) = 4 AND bool_and(column_name IN ('ward_code', 'ward_name', 'occupied_beds', 'free_beds')) AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'ward_occupancy';
        `
      },
      {
        label: {
          de: 'Alle vier Stationen erscheinen, auch die leere',
          en: 'All four wards appear, including the empty one'
        },
        sql: `
          SELECT count(*) = 4 AND bool_and(occupied_beds = 0) FILTER (WHERE ward_code = 'ONC') AS ok
          FROM ward_occupancy;
        `
      },
      {
        label: {
          de: 'Belegte und freie Betten stimmen für jede Station',
          en: 'Occupied and free beds are correct for every ward'
        },
        sql: `
          WITH expected AS (
            SELECT
              w.code AS ward_code,
              w.name AS ward_name,
              count(a.id) FILTER (WHERE a.discharged_on IS NULL) AS occupied_beds,
              w.beds - count(a.id) FILTER (WHERE a.discharged_on IS NULL) AS free_beds
            FROM wards AS w
            LEFT JOIN admissions AS a ON a.ward_code = w.code
            GROUP BY w.code, w.name, w.beds
          )
          SELECT NOT EXISTS (
            SELECT ward_code, ward_name, occupied_beds, free_beds FROM expected
            EXCEPT
            SELECT ward_code, ward_name, occupied_beds, free_beds FROM ward_occupancy
          ) AND NOT EXISTS (
            SELECT ward_code, ward_name, occupied_beds, free_beds FROM ward_occupancy
            EXCEPT
            SELECT ward_code, ward_name, occupied_beds, free_beds FROM expected
          ) AS ok;
        `
      }
    ]
  },
  tags: ['create-view', 'aggregation', 'outer-join']
};
