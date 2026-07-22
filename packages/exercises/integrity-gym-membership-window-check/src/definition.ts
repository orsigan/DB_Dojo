import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'integrity-gym-membership-window-check',
  topic: ['integrity', 'constraints'],
  difficulty: 'Profi',
  title: {
    de: 'Kurszeitfenster und Teilnehmerzahl als CHECK-Constraints',
    en: 'Class time window and headcount as CHECK constraints'
  },
  prompt: {
    de: [
      'Das Fitnessstudio plant Gruppenkurse in `gym_class` und braucht zwei semantische',
      'Regeln, die beide nur die Spalten der gerade geschriebenen Zeile betrachten:',
      '',
      '1. `ends_at` liegt immer nach `starts_at` — ein Kurs kann nicht enden, bevor er',
      '   begonnen hat.',
      '2. `max_participants` liegt zwischen 1 und 30 (jeweils einschließlich).',
      '',
      'Beide Regeln vergleichen nichts mit einer früheren Zeile und aggregieren nichts',
      'über mehrere Zeilen hinweg, gehören also als CHECK-Constraints in die Tabelle.',
      'Ergänze sie bei `gym_class` und nenne sie genau `chk_class_time_order` und',
      '`chk_class_capacity`.'
    ].join('\n'),
    en: [
      'The gym schedules group fitness classes in `gym_class` and needs two semantic',
      'rules that both only look at the columns of the row being written:',
      '',
      '1. `ends_at` is always after `starts_at` — a class cannot end before it started.',
      '2. `max_participants` is between 1 and 30 (inclusive on both ends).',
      '',
      'Neither rule compares against an earlier row or aggregates across several rows,',
      'so both belong into the table as CHECK constraints. Add them to `gym_class` and',
      'name them exactly `chk_class_time_order` and `chk_class_capacity`.'
    ].join('\n')
  },
  seedSql: `
    DROP FUNCTION IF EXISTS try_add_gym_class(text, timestamp, timestamp, integer);
    DROP TABLE IF EXISTS gym_class;

    CREATE TABLE gym_class (
      id serial PRIMARY KEY,
      name text NOT NULL,
      starts_at timestamp NOT NULL,
      ends_at timestamp NOT NULL,
      max_participants integer NOT NULL
    );

    INSERT INTO gym_class (name, starts_at, ends_at, max_participants) VALUES
      ('Morning Yoga', '2026-08-03 07:00', '2026-08-03 08:00', 20),
      ('HIIT Blast', '2026-08-03 18:00', '2026-08-03 18:45', 16),
      ('Spin Cycle', '2026-08-04 06:30', '2026-08-04 07:15', 24);

    CREATE FUNCTION try_add_gym_class(p_name text, p_starts_at timestamp, p_ends_at timestamp, p_max_participants integer)
    RETURNS boolean AS $$
    BEGIN
      INSERT INTO gym_class (name, starts_at, ends_at, max_participants)
      VALUES (p_name, p_starts_at, p_ends_at, p_max_participants);
      RETURN true;
    EXCEPTION WHEN others THEN
      RETURN false;
    END;
    $$ LANGUAGE plpgsql;
  `,
  starterSql: 'SELECT name, starts_at, ends_at, max_participants\nFROM gym_class;',
  hints: [
    {
      text: {
        de: 'Ein CHECK darf mehrere Spalten derselben Zeile vergleichen, z. B. `ends_at > starts_at` — beide Werte stehen ja in der Zeile, die gerade geprüft wird. Das ist etwas anderes als der Vergleich mit dem alten Wert bei einem UPDATE (z. B. „keine Preissenkung") oder eine Summe über mehrere Zeilen — beides kann ein CHECK nicht, dafür braucht es einen Trigger.',
        en: 'A CHECK may compare several columns of the same row, e.g. `ends_at > starts_at` — both values live in the row currently being checked. That is different from comparing against the previous value on an UPDATE (like "no price decrease") or aggregating across several rows — a CHECK cannot do either, that needs a trigger.'
      }
    },
    {
      text: {
        de: 'Für eine Bereichsregel wie „zwischen 1 und 30" reicht `CHECK (max_participants BETWEEN 1 AND 30)` — ALTER TABLE ... ADD CONSTRAINT hängt den benannten Constraint an die bereits gefüllte Tabelle an.',
        en: 'For a range rule like "between 1 and 30", `CHECK (max_participants BETWEEN 1 AND 30)` is enough — ALTER TABLE ... ADD CONSTRAINT attaches the named constraint to the table that already holds data.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'Ein CHECK-Constraint namens chk_class_time_order existiert auf gym_class',
          en: 'A CHECK constraint named chk_class_time_order exists on gym_class'
        },
        sql: "SELECT count(*) = 1 AS ok FROM pg_constraint WHERE conname = 'chk_class_time_order' AND conrelid = 'gym_class'::regclass AND contype = 'c';"
      },
      {
        label: {
          de: 'Ein CHECK-Constraint namens chk_class_capacity existiert auf gym_class',
          en: 'A CHECK constraint named chk_class_capacity exists on gym_class'
        },
        sql: "SELECT count(*) = 1 AS ok FROM pg_constraint WHERE conname = 'chk_class_capacity' AND conrelid = 'gym_class'::regclass AND contype = 'c';"
      },
      {
        label: {
          de: 'Ein normaler Kurs (60 Minuten, 18 Plätze) wird weiterhin akzeptiert',
          en: 'A normal class (60 minutes, 18 spots) is still accepted'
        },
        sql: "SELECT try_add_gym_class('Evening Pilates', '2026-08-05 19:00', '2026-08-05 20:00', 18) AS ok;"
      },
      {
        label: {
          de: 'Ein Kurs, der vor Beginn endet, wird abgelehnt',
          en: 'A class that ends before it starts is rejected'
        },
        sql: "SELECT NOT try_add_gym_class('Time Warp', '2026-08-05 19:00', '2026-08-05 18:00', 18) AS ok;"
      },
      {
        label: {
          de: 'Ein Kurs mit 0 maximalen Teilnehmern wird abgelehnt',
          en: 'A class with 0 maximum participants is rejected'
        },
        sql: "SELECT NOT try_add_gym_class('Empty Room', '2026-08-05 19:00', '2026-08-05 20:00', 0) AS ok;"
      },
      {
        label: {
          de: 'Ein Kurs mit 45 maximalen Teilnehmern wird abgelehnt',
          en: 'A class with 45 maximum participants is rejected'
        },
        sql: "SELECT NOT try_add_gym_class('Mega Class', '2026-08-05 19:00', '2026-08-05 20:00', 45) AS ok;"
      },
      {
        label: {
          de: 'Ein Kurs mit 30 maximalen Teilnehmern (Obergrenze) wird akzeptiert',
          en: 'A class with 30 maximum participants (the upper bound) is accepted'
        },
        sql: "SELECT try_add_gym_class('Full House', '2026-08-06 09:00', '2026-08-06 10:00', 30) AS ok;"
      }
    ]
  },
  tags: ['check', 'constraint', 'alter-table']
};
