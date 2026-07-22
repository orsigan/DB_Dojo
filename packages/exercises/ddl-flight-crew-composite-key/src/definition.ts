import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'ddl-flight-crew-composite-key',
  topic: ['ddl', 'create-table'],
  difficulty: 'Profi',
  title: {
    de: 'Crew-Einteilung mit zusammengesetztem Schlüssel',
    en: 'Crew roster with a composite key'
  },
  prompt: {
    de: [
      'Eine Fluggesellschaft identifiziert einen Flugabschnitt über das Paar `flight_no` plus `leg_date`,',
      'wie du in der vorbereiteten Tabelle `flight_leg` siehst.',
      'Die Einteilungstabelle muss auf dieser Identifikation aufbauen.',
      '',
      'Erstelle die Tabelle `crew_assignment` mit den Spalten',
      '`flight_no` (feste Länge 6), `leg_date` (date), `crew_member` (varchar 40),',
      '`role` (varchar 14, nie NULL), `duty_start` und `duty_end` (beide time, nie NULL).',
      '',
      'Jede Regel unten muss genau den angegebenen Namen tragen, damit sie später gelöscht werden kann:',
      '',
      '- `pk_crew_assignment` — der Primärschlüssel, aus `flight_no`, `leg_date` und `crew_member`',
      '- `uq_one_flight_per_day` — über `leg_date` und `crew_member`: niemand wird',
      '  am selben Tag auf zwei verschiedenen Flügen eingeteilt',
      "- `chk_crew_role` — `role` erlaubt nur `'captain'`, `'first_officer'`, `'purser'` und `'cabin'`",
      '- `chk_duty_window` — `duty_end` muss nach `duty_start` liegen'
    ].join('\n'),
    en: [
      'An airline identifies a flight leg by the pair `flight_no` plus `leg_date`,',
      'as you can see in the seeded table `flight_leg`.',
      'The roster table has to be built on top of that identification.',
      '',
      'Create the table `crew_assignment` with the columns',
      '`flight_no` (fixed length 6), `leg_date` (date), `crew_member` (varchar 40),',
      '`role` (varchar 14, never NULL), `duty_start` and `duty_end` (both time, never NULL).',
      '',
      'Every rule below has to carry exactly the given name, so it can be dropped later:',
      '',
      '- `pk_crew_assignment` — the primary key, made of `flight_no`, `leg_date` and `crew_member`',
      '- `uq_one_flight_per_day` — over `leg_date` and `crew_member`: nobody is rostered',
      '  on two different flights on the same day',
      "- `chk_crew_role` — `role` only allows `'captain'`, `'first_officer'`, `'purser'` and `'cabin'`",
      '- `chk_duty_window` — `duty_end` has to lie after `duty_start`'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS crew_assignment;
    DROP TABLE IF EXISTS flight_leg;
    DROP FUNCTION IF EXISTS statement_is_rejected(text);

    CREATE FUNCTION statement_is_rejected(statement text) RETURNS boolean AS $fn$
    BEGIN
      EXECUTE statement;
      RETURN false;
    EXCEPTION WHEN others THEN
      RETURN true;
    END;
    $fn$ LANGUAGE plpgsql;

    CREATE TABLE flight_leg (
      flight_no char(6),
      leg_date date,
      aircraft varchar(10) NOT NULL,
      CONSTRAINT pk_flight_leg PRIMARY KEY (flight_no, leg_date)
    );

    INSERT INTO flight_leg (flight_no, leg_date, aircraft) VALUES
      ('LH1042', '2026-05-04', 'A320neo'),
      ('LH1042', '2026-05-05', 'A320neo'),
      ('LH0731', '2026-05-04', 'A350'),
      ('LH0208', '2026-05-04', 'A320');
  `,
  starterSql:
    'CREATE TABLE crew_assignment (\n  flight_no char(6),\n  leg_date date,\n  crew_member varchar(40)\n);',
  hints: [
    {
      text: {
        de: 'Eine Regel, die mehr als ein Attribut betrifft, kann nicht hinter einer einzelnen Spaltendefinition stehen — sie muss nach der Spaltenliste stehen und ihre Spalten explizit nennen.',
        en: 'A rule that mentions more than one attribute cannot sit behind a single column definition — it has to stand after the column list and name its columns explicitly.'
      }
    },
    {
      text: {
        de: 'Vergleiche die beiden mehrspaltigen Regeln: Die eine identifiziert eine Zeile, die andere verbietet nur eine Wiederholung. Eine Tabelle hat höchstens eine der ersten Art und beliebig viele der zweiten.',
        en: 'Compare the two multi-column rules: one identifies a row, the other only forbids a repetition. A table has at most one of the first kind and any number of the second.'
      }
    },
    {
      text: {
        de: 'Einem Constraint einen Namen zu geben ist keine Kosmetik — es ist der Griff, den du später zum Löschen oder Ersetzen brauchst.',
        en: 'Giving a constraint a name is not decoration — it is the handle you need later to drop or replace it.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'pk_crew_assignment ist der Primärschlüssel über flight_no, leg_date und crew_member',
          en: 'pk_crew_assignment is the primary key over flight_no, leg_date and crew_member'
        },
        sql: `
          SELECT count(*) = 3 AS ok
          FROM pg_constraint AS c
          JOIN pg_attribute AS a
            ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
          WHERE c.conname = 'pk_crew_assignment'
            AND c.contype = 'p'
            AND c.conrelid = to_regclass('public.crew_assignment')
            AND array_length(c.conkey, 1) = 3
            AND a.attname IN ('flight_no', 'leg_date', 'crew_member');
        `
      },
      {
        label: {
          de: 'uq_one_flight_per_day ist eine UNIQUE-Regel über leg_date und crew_member',
          en: 'uq_one_flight_per_day is a UNIQUE rule over leg_date and crew_member'
        },
        sql: `
          SELECT count(*) = 2 AS ok
          FROM pg_constraint AS c
          JOIN pg_attribute AS a
            ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
          WHERE c.conname = 'uq_one_flight_per_day'
            AND c.contype = 'u'
            AND c.conrelid = to_regclass('public.crew_assignment')
            AND array_length(c.conkey, 1) = 2
            AND a.attname IN ('leg_date', 'crew_member');
        `
      },
      {
        label: {
          de: 'Beide benannten CHECK-Constraints existieren auf der Tabelle',
          en: 'Both named CHECK constraints exist on the table'
        },
        sql: `
          SELECT count(*) = 2 AS ok
          FROM pg_constraint
          WHERE conrelid = to_regclass('public.crew_assignment')
            AND contype = 'c'
            AND conname IN ('chk_crew_role', 'chk_duty_window');
        `
      },
      {
        label: {
          de: 'Ein Captain und ein Purser können auf demselben Flugabschnitt eingeteilt werden',
          en: 'A captain and a purser can be rostered on the same leg'
        },
        sql: `
          WITH inserted AS (
            INSERT INTO crew_assignment (flight_no, leg_date, crew_member, role, duty_start, duty_end)
            VALUES
              ('LH1042', DATE '2026-05-04', 'Nadine Roth', 'captain', TIME '06:10', TIME '11:45'),
              ('LH1042', DATE '2026-05-04', 'Piet Salm', 'purser', TIME '06:10', TIME '11:45')
            RETURNING 1 AS written
          )
          SELECT count(*) = 2 AS ok
          FROM inserted;
        `
      },
      {
        label: {
          de: 'Dieselbe Person auf einem zweiten Flug am selben Tag wird abgelehnt',
          en: 'The same person on a second flight on the same day is rejected'
        },
        sql: `
          SELECT statement_is_rejected(
            $q$INSERT INTO crew_assignment (flight_no, leg_date, crew_member, role, duty_start, duty_end)
               VALUES ('LH0731', DATE '2026-05-04', 'Nadine Roth', 'captain', TIME '14:00', TIME '19:00')$q$
          ) AS ok;
        `
      },
      {
        label: {
          de: 'Dieselbe Person am nächsten Tag ist erlaubt',
          en: 'The same person on the next day is allowed'
        },
        sql: `
          WITH inserted AS (
            INSERT INTO crew_assignment (flight_no, leg_date, crew_member, role, duty_start, duty_end)
            VALUES ('LH1042', DATE '2026-05-05', 'Nadine Roth', 'captain', TIME '06:10', TIME '11:45')
            RETURNING 1 AS written
          )
          SELECT count(*) = 1 AS ok
          FROM inserted;
        `
      },
      {
        label: {
          de: 'Eine unbekannte Rolle wie "chef" wird abgelehnt',
          en: 'An unknown role such as "chef" is rejected'
        },
        sql: `
          SELECT statement_is_rejected(
            $q$INSERT INTO crew_assignment (flight_no, leg_date, crew_member, role, duty_start, duty_end)
               VALUES ('LH0208', DATE '2026-05-04', 'Ida Lang', 'chef', TIME '08:00', TIME '12:00')$q$
          ) AS ok;
        `
      },
      {
        label: {
          de: 'Ein Dienstzeitraum, der endet bevor er beginnt, wird abgelehnt',
          en: 'A duty window that ends before it starts is rejected'
        },
        sql: `
          SELECT statement_is_rejected(
            $q$INSERT INTO crew_assignment (flight_no, leg_date, crew_member, role, duty_start, duty_end)
               VALUES ('LH0208', DATE '2026-05-04', 'Ida Lang', 'cabin', TIME '12:00', TIME '08:00')$q$
          ) AS ok;
        `
      }
    ]
  },
  tags: ['composite-key', 'unique', 'check', 'named-constraints']
};
