import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'views-university-course-enrollment-summary',
  topic: ['views'],
  difficulty: 'Advanced',
  title: {
    de: 'Aggregationssicht auf Kurseinschreibungen',
    en: 'Aggregation view on course enrollments'
  },
  prompt: {
    de: [
      'Das Prüfungsamt einer Universität will für jeden Kurs auf einen Blick sehen, wie viele',
      'Studierende eingeschrieben sind und wie ihr Notendurchschnitt aussieht, ohne bei jeder',
      'Anfrage erneut zu verbinden und zu gruppieren.',
      '',
      'Erstelle eine Sicht namens `course_enrollment_summary`, die `course` mit `enrollment`',
      'verbindet und pro Kurs genau eine Zeile liefert mit:',
      '',
      '- `course_id` — die ID des Kurses',
      '- `title` — der Kurstitel',
      '- `enrolled_count` — Anzahl der eingeschriebenen Studierenden',
      '- `average_grade` — Notendurchschnitt, gerundet auf zwei Nachkommastellen',
      '',
      'Nur Kurse mit mindestens einer Einschreibung sollen in der Sicht auftauchen.'
    ].join('\n'),
    en: [
      "A university's registrar office wants to see at a glance, for every course, how many",
      'students are enrolled and what their average grade looks like, without re-joining and',
      're-grouping on every single query.',
      '',
      'Create a view named `course_enrollment_summary` that joins `course` with `enrollment`',
      'and reports exactly one row per course with:',
      '',
      '- `course_id` — the id of the course',
      '- `title` — the course title',
      '- `enrolled_count` — the number of enrolled students',
      '- `average_grade` — the average grade, rounded to two decimal places',
      '',
      'Only courses with at least one enrollment should show up in the view.'
    ].join('\n')
  },
  seedSql: `
    DROP VIEW IF EXISTS course_enrollment_summary;
    DROP TABLE IF EXISTS enrollment;
    DROP TABLE IF EXISTS course;
    DROP FUNCTION IF EXISTS statement_is_rejected(text);

    CREATE FUNCTION statement_is_rejected(statement text) RETURNS boolean AS $fn$
    BEGIN
      EXECUTE statement;
      RETURN false;
    EXCEPTION WHEN others THEN
      RETURN true;
    END;
    $fn$ LANGUAGE plpgsql;

    CREATE TABLE course (
      course_id integer PRIMARY KEY,
      title text NOT NULL,
      credit_hours integer NOT NULL
    );

    CREATE TABLE enrollment (
      enrollment_id integer PRIMARY KEY,
      course_id integer NOT NULL REFERENCES course (course_id),
      student_name text NOT NULL,
      grade numeric(3, 1) NOT NULL
    );

    INSERT INTO course (course_id, title, credit_hours) VALUES
      (1, 'Database Systems', 6),
      (2, 'Algorithms', 5),
      (3, 'Linear Algebra', 4),
      (4, 'Art History', 3);

    INSERT INTO enrollment (enrollment_id, course_id, student_name, grade) VALUES
      (1, 1, 'Mia', 1.7),
      (2, 1, 'Jonas', 2.3),
      (3, 1, 'Elif', 1.0),
      (4, 2, 'Mia', 2.0),
      (5, 2, 'Noah', 3.3),
      (6, 3, 'Elif', 1.3);
  `,
  starterSql: [
    'CREATE VIEW course_enrollment_summary AS',
    'SELECT c.course_id, c.title, e.grade',
    'FROM course c',
    'JOIN enrollment e ON e.course_id = c.course_id;'
  ].join('\n'),
  hints: [
    {
      text: {
        de: 'Die Sicht liefert eine Zeile pro Kurs statt pro Einschreibung — das ist ein Signal für GROUP BY course_id (und title), mit COUNT(*) und AVG(grade) im SELECT-Teil.',
        en: 'The view reports one row per course rather than per enrollment — that calls for GROUP BY course_id (and title), with COUNT(*) and AVG(grade) in the SELECT list.'
      }
    },
    {
      text: {
        de: 'ROUND(AVG(grade), 2) rundet den Durchschnitt auf zwei Nachkommastellen; ein JOIN statt LEFT JOIN sorgt dafür, dass Kurse ohne Einschreibung gar nicht erst erscheinen.',
        en: 'ROUND(AVG(grade), 2) rounds the average to two decimal places; a plain JOIN rather than LEFT JOIN keeps courses without enrollments out of the result entirely.'
      }
    },
    {
      text: {
        de: 'Eine Aggregationssicht lässt keine sinnvolle Abbildung auf die Basisrelation zu: enrolled_count und average_grade entstehen erst durch GROUP BY über mehrere enrollment-Zeilen, also gibt es keine einzelne Zeile, in die ein INSERT auf der Sicht zurückübersetzt werden könnte.',
        en: 'An aggregation view has no sensible mapping back to the base relation: enrolled_count and average_grade only exist because GROUP BY collapses several enrollment rows, so there is no single row an INSERT on the view could be translated back into.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'course_enrollment_summary existiert als Sicht',
          en: 'course_enrollment_summary exists as a view'
        },
        sql: "SELECT count(*) = 1 AS ok FROM pg_views WHERE schemaname = 'public' AND viewname = 'course_enrollment_summary';"
      },
      {
        label: {
          de: 'Sie hat die vier erwarteten Spalten',
          en: 'It has the four expected columns'
        },
        sql: `
          SELECT count(*) = 4
            AND bool_and(column_name IN ('course_id', 'title', 'enrolled_count', 'average_grade')) AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'course_enrollment_summary';
        `
      },
      {
        label: {
          de: 'Nur die drei Kurse mit Einschreibungen erscheinen',
          en: 'Only the three courses with enrollments show up'
        },
        sql: 'SELECT count(*) = 3 AS ok FROM course_enrollment_summary;'
      },
      {
        label: {
          de: 'Anzahl und Notendurchschnitt stimmen für jeden Kurs exakt',
          en: 'The count and average grade are exactly right for every course'
        },
        sql: `
          WITH expected AS (
            SELECT
              c.course_id,
              c.title,
              count(e.enrollment_id) AS enrolled_count,
              round(avg(e.grade), 2) AS average_grade
            FROM course AS c
            JOIN enrollment AS e ON e.course_id = c.course_id
            GROUP BY c.course_id, c.title
          )
          SELECT NOT EXISTS (
            SELECT course_id, title, enrolled_count, average_grade FROM expected
            EXCEPT
            SELECT course_id, title, enrolled_count, average_grade FROM course_enrollment_summary
          ) AND NOT EXISTS (
            SELECT course_id, title, enrolled_count, average_grade FROM course_enrollment_summary
            EXCEPT
            SELECT course_id, title, enrolled_count, average_grade FROM expected
          ) AS ok;
        `
      },
      {
        label: {
          de: 'Ein direktes INSERT in die Aggregationssicht wird von Postgres abgelehnt',
          en: 'A direct INSERT into the aggregation view is rejected by Postgres'
        },
        sql: `
          SELECT statement_is_rejected(
            $q$INSERT INTO course_enrollment_summary (course_id, title, enrolled_count, average_grade) VALUES (99, 'Ghost Course', 1, 4.0)$q$
          ) AS ok;
        `
      }
    ]
  },
  tags: ['view', 'aggregation', 'group-by', 'not-updatable']
};
