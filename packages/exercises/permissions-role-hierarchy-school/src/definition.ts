import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'permissions-role-hierarchy-school',
  topic: ['permissions', 'roles'],
  difficulty: 'Profi',
  title: {
    de: 'Eine Rollenhierarchie für das Schulsekretariat',
    en: 'A role hierarchy for the school office'
  },
  prompt: {
    de: [
      'Das Schulsekretariat möchte Rechte an Funktionen knüpfen, nicht an Personen. Die Rolle `school_staff` existiert bereits als Basis der Hierarchie.',
      '',
      'Baue folgende Struktur auf:',
      '- `school_staff` darf SELECT auf `students` ausführen.',
      '- `teacher` ist Mitglied von `school_staff` und darf zusätzlich `grades` per UPDATE ändern.',
      '- `exam_auditor` ist Mitglied von `teacher`, wird aber mit NOINHERIT angelegt: Es bleibt Mitglied, ohne die Rechte automatisch zu besitzen, und erhält sie erst nach einem expliziten SET ROLE.',
      '',
      'Rechte dürfen niemals nach unten durchsickern: `school_staff` darf nicht das Recht erhalten, Noten zu ändern.'
    ].join('\n'),
    en: [
      'The school office wants privileges attached to functions, not to people. The role `school_staff` already exists as the base of the hierarchy.',
      '',
      'Build the following structure:',
      '- `school_staff` may SELECT from `students`.',
      '- `teacher` is a member of `school_staff` and may additionally UPDATE `grades`.',
      '- `exam_auditor` is a member of `teacher`, but created with NOINHERIT: it stays a member without automatically holding the privileges, and only picks them up after an explicit SET ROLE.',
      '',
      'Privileges must never flow downwards: `school_staff` must not gain the right to change grades.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS grades;
    DROP TABLE IF EXISTS students;
    DROP ROLE IF EXISTS exam_auditor;
    DROP ROLE IF EXISTS teacher;
    DROP ROLE IF EXISTS school_staff;

    CREATE ROLE school_staff;

    CREATE TABLE students (
      id integer PRIMARY KEY,
      full_name text NOT NULL,
      class_name text NOT NULL
    );

    CREATE TABLE grades (
      id integer PRIMARY KEY,
      student_id integer NOT NULL REFERENCES students (id),
      subject text NOT NULL,
      mark integer NOT NULL
    );

    INSERT INTO students (id, full_name, class_name) VALUES
      (1, 'Lea Hartmann', '9b'),
      (2, 'Omar Said', '9b'),
      (3, 'Fenna de Vries', '10a');

    INSERT INTO grades (id, student_id, subject, mark) VALUES
      (1, 1, 'Mathematics', 2),
      (2, 1, 'Biology', 1),
      (3, 2, 'Mathematics', 3),
      (4, 3, 'History', 2);
  `,
  starterSql: 'GRANT SELECT ON students TO school_staff;',
  hints: [
    {
      text: {
        de: 'Rollen können Mitglieder anderer Rollen sein. GRANT <Rolle> TO <Rolle> baut die Hierarchie auf, während die Tabellenrechte einmalig an die Rolle vergeben werden, die ganz unten sitzt.',
        en: 'Roles can be members of other roles. GRANT <role> TO <role> builds the hierarchy, while the table privileges are granted once to the role that sits at the bottom of it.'
      }
    },
    {
      text: {
        de: 'Mitgliedschaft und Vererbung sind zwei verschiedene Dinge: Ein NOINHERIT-Mitglied ist trotzdem ein vollwertiges Mitglied, muss die Rechte aber explizit mit SET ROLE anfordern.',
        en: 'Membership and inheritance are two different things: a NOINHERIT member is still a full member, it just has to ask for the privileges explicitly with SET ROLE.'
      }
    },
    {
      text: {
        de: 'Lege die Rolle mit ihrem NOINHERIT-Attribut an, bevor du ihr die Mitgliedschaft gewährst — die Mitgliedschaft speichert die Vererbungseinstellung, die zu diesem Zeitpunkt gilt.',
        en: 'Create the role with its NOINHERIT attribute before you grant it the membership — the membership records the inheritance setting it finds at that moment.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: { de: 'Alle drei Rollen existieren', en: 'All three roles exist' },
        sql: `
          SELECT count(*) = 3 AS ok
          FROM pg_roles
          WHERE rolname IN ('school_staff', 'teacher', 'exam_auditor');
        `
      },
      {
        label: { de: 'school_staff darf students lesen', en: 'school_staff may read students' },
        sql: "SELECT has_table_privilege('school_staff', 'students', 'SELECT') AS ok;"
      },
      {
        label: {
          de: 'teacher ist Mitglied von school_staff und erbt den Lesezugriff',
          en: 'teacher is a member of school_staff and inherits the read access'
        },
        sql: `
          SELECT pg_has_role('teacher', 'school_staff', 'MEMBER')
             AND has_table_privilege('teacher', 'students', 'SELECT') AS ok;
        `
      },
      {
        label: { de: 'teacher darf Noten ändern', en: 'teacher may change grades' },
        sql: "SELECT has_table_privilege('teacher', 'grades', 'UPDATE') AS ok;"
      },
      {
        label: {
          de: 'Rechte fließen nicht nach unten zu school_staff durch',
          en: 'Privileges do not flow down to school_staff'
        },
        sql: `
          SELECT NOT has_table_privilege('school_staff', 'grades', 'UPDATE')
             AND NOT has_table_privilege('school_staff', 'students', 'UPDATE') AS ok;
        `
      },
      {
        label: {
          de: 'exam_auditor ist Mitglied von teacher',
          en: 'exam_auditor is a member of teacher'
        },
        sql: "SELECT pg_has_role('exam_auditor', 'teacher', 'MEMBER') AS ok;"
      },
      {
        label: { de: 'exam_auditor vererbt nicht', en: 'exam_auditor does not inherit' },
        sql: "SELECT NOT rolinherit AS ok FROM pg_roles WHERE rolname = 'exam_auditor';"
      },
      {
        label: {
          de: 'exam_auditor besitzt nichts, bevor es explizit die Rolle wechselt',
          en: 'exam_auditor holds nothing until it switches role explicitly'
        },
        sql: `
          SELECT NOT pg_has_role('exam_auditor', 'teacher', 'USAGE')
             AND NOT has_table_privilege('exam_auditor', 'students', 'SELECT')
             AND NOT has_table_privilege('exam_auditor', 'grades', 'UPDATE') AS ok;
        `
      }
    ]
  },
  tags: ['roles', 'hierarchy', 'noinherit']
};
