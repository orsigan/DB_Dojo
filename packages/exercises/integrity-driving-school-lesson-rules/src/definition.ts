import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'integrity-driving-school-lesson-rules',
  topic: ['integrity', 'constraints'],
  difficulty: 'Advanced',
  title: {
    de: 'Vier Fahrstunden-Regeln als deklarative Constraints',
    en: 'Four lesson rules as declarative constraints'
  },
  prompt: {
    de: [
      'Die Fahrschule beschreibt ihre Miniwelt mit vier Regeln. Die Tabelle `lesson` wurde ohne',
      'davon angelegt — ergänze alle vier als deklarative Constraints.',
      '',
      '1. Eine Fahrstunde nennt immer einen Schüler: `pupil` muss NOT NULL sein.',
      '2. Nur ein existierender Fahrlehrer darf gebucht werden: Constraint `fk_lesson_instructor` auf',
      '   `instructor_id`, das auf `instructor (id)` verweist.',
      '3. Eine Fahrstunde endet nach ihrem Beginn: Constraint `chk_lesson_window` mit `ends_at > starts_at`.',
      '4. Ein Fahrlehrer kann nicht zwei Fahrstunden zum selben Zeitpunkt beginnen: Constraint `uq_lesson_slot`',
      '   über `(instructor_id, starts_at)`.',
      '',
      'Nutze genau diese Constraint-Namen.'
    ].join('\n'),
    en: [
      'The driving school describes its mini world with four rules. The table `lesson` was created',
      'without any of them — add all four as declarative constraints.',
      '',
      '1. A lesson always names a pupil: `pupil` must be NOT NULL.',
      '2. Only an existing instructor may be booked: constraint `fk_lesson_instructor` on',
      '   `instructor_id` referencing `instructor (id)`.',
      '3. A lesson ends after it starts: constraint `chk_lesson_window` with `ends_at > starts_at`.',
      '4. One instructor cannot start two lessons at the same moment: constraint `uq_lesson_slot`',
      '   over `(instructor_id, starts_at)`.',
      '',
      'Use exactly these constraint names.'
    ].join('\n')
  },
  seedSql: `
    DROP FUNCTION IF EXISTS try_lesson(integer, text, timestamp, timestamp);
    DROP TABLE IF EXISTS lesson;
    DROP TABLE IF EXISTS instructor;

    CREATE TABLE instructor (
      id serial PRIMARY KEY,
      full_name text NOT NULL
    );

    CREATE TABLE lesson (
      id serial PRIMARY KEY,
      instructor_id integer,
      pupil text,
      starts_at timestamp NOT NULL,
      ends_at timestamp NOT NULL
    );

    INSERT INTO instructor (full_name) VALUES
      ('Kai Determann'),
      ('Ruth Palm');

    INSERT INTO lesson (instructor_id, pupil, starts_at, ends_at) VALUES
      (1, 'Tarek Sahin', '2026-04-06 08:00', '2026-04-06 09:30'),
      (1, 'Lena Fuchs', '2026-04-06 10:00', '2026-04-06 11:30'),
      (2, 'Jonas Bree', '2026-04-06 08:00', '2026-04-06 09:30');

    CREATE FUNCTION try_lesson(p_instructor integer, p_pupil text, p_starts timestamp, p_ends timestamp)
    RETURNS boolean AS $$
    BEGIN
      INSERT INTO lesson (instructor_id, pupil, starts_at, ends_at)
      VALUES (p_instructor, p_pupil, p_starts, p_ends);
      RETURN true;
    EXCEPTION WHEN others THEN
      RETURN false;
    END;
    $$ LANGUAGE plpgsql;
  `,
  starterSql: 'ALTER TABLE lesson ALTER COLUMN pupil SET NOT NULL;',
  hints: [
    {
      text: {
        de: 'Jede der vier Regeln entspricht einer der klassischen Constraint-Arten: NOT NULL, FOREIGN KEY, CHECK und UNIQUE — für keine davon ist prozeduraler Code nötig.',
        en: 'Each of the four rules maps onto one of the classic constraint kinds: NOT NULL, FOREIGN KEY, CHECK and UNIQUE — no procedural code is needed for any of them.'
      }
    },
    {
      text: {
        de: 'Ein CHECK, der zwei Spalten derselben Zeile vergleicht, muss als Tabellen-Constraint geschrieben werden, nicht neben einer einzelnen Spalte.',
        en: 'A CHECK that compares two columns of the same row must be written as a table constraint, not next to a single column.'
      }
    },
    {
      text: {
        de: 'Die vorhandenen Zeilen erfüllen bereits alle vier Regeln, jedes ALTER TABLE geht also durch — schlägt eins fehl, lies nochmal genau, was es eigentlich verlangt.',
        en: 'The existing rows already satisfy all four rules, so every ALTER TABLE goes through — if one fails, re-read what it actually demands.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: { de: 'lesson.pupil ist NOT NULL', en: 'lesson.pupil is NOT NULL' },
        sql: "SELECT a.attnotnull AS ok FROM pg_attribute AS a WHERE a.attrelid = 'lesson'::regclass AND a.attname = 'pupil';"
      },
      {
        label: {
          de: 'Der Fremdschlüssel fk_lesson_instructor existiert',
          en: 'The foreign key fk_lesson_instructor exists'
        },
        sql: "SELECT count(*) = 1 AS ok FROM pg_constraint WHERE conname = 'fk_lesson_instructor' AND conrelid = 'lesson'::regclass AND contype = 'f';"
      },
      {
        label: {
          de: 'Der Check-Constraint chk_lesson_window existiert',
          en: 'The check constraint chk_lesson_window exists'
        },
        sql: "SELECT count(*) = 1 AS ok FROM pg_constraint WHERE conname = 'chk_lesson_window' AND conrelid = 'lesson'::regclass AND contype = 'c';"
      },
      {
        label: {
          de: 'Der Unique-Constraint uq_lesson_slot existiert',
          en: 'The unique constraint uq_lesson_slot exists'
        },
        sql: "SELECT count(*) = 1 AS ok FROM pg_constraint WHERE conname = 'uq_lesson_slot' AND conrelid = 'lesson'::regclass AND contype = 'u';"
      },
      {
        label: {
          de: 'Eine korrekt geformte Fahrstunde wird weiterhin akzeptiert',
          en: 'A well formed lesson is still accepted'
        },
        sql: "SELECT try_lesson(2, 'Mira Volk', TIMESTAMP '2026-04-07 08:00', TIMESTAMP '2026-04-07 09:30') AS ok;"
      },
      {
        label: {
          de: 'Eine Fahrstunde ohne Schüler wird abgelehnt',
          en: 'A lesson without a pupil is rejected'
        },
        sql: "SELECT NOT try_lesson(1, NULL, TIMESTAMP '2026-04-08 08:00', TIMESTAMP '2026-04-08 09:30') AS ok;"
      },
      {
        label: {
          de: 'Eine Fahrstunde mit unbekanntem Fahrlehrer wird abgelehnt',
          en: 'A lesson with an unknown instructor is rejected'
        },
        sql: "SELECT NOT try_lesson(99, 'Mira Volk', TIMESTAMP '2026-04-09 08:00', TIMESTAMP '2026-04-09 09:30') AS ok;"
      },
      {
        label: {
          de: 'Eine Fahrstunde, die vor ihrem Beginn endet, wird abgelehnt',
          en: 'A lesson that ends before it starts is rejected'
        },
        sql: "SELECT NOT try_lesson(1, 'Mira Volk', TIMESTAMP '2026-04-10 11:00', TIMESTAMP '2026-04-10 09:30') AS ok;"
      },
      {
        label: {
          de: 'Eine zweite Fahrstunde zur selben Startzeit beim selben Fahrlehrer wird abgelehnt',
          en: 'A second lesson at the same start time for the same instructor is rejected'
        },
        sql: "SELECT NOT try_lesson(1, 'Mira Volk', TIMESTAMP '2026-04-06 08:00', TIMESTAMP '2026-04-06 09:30') AS ok;"
      }
    ]
  },
  tags: ['constraint', 'check', 'foreign-key', 'unique']
};
