import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'permissions-nurse-vitals-write',
  topic: ['permissions'],
  difficulty: 'Beginner',
  title: { de: 'Was eine Pflegekraft schreiben darf', en: 'What a nurse may write' },
  prompt: {
    de: [
      'Auf der Station erfassen Pflegekräfte Vitalzeichen: Sie lesen die vorhandenen Messwerte, fügen neue hinzu und korrigieren Tippfehler in den selbst eingetragenen.',
      'Das Löschen eines Messwerts ist nie erlaubt — ein falscher Wert wird korrigiert, nicht gelöscht.',
      '',
      'Die Rolle `nurse` existiert bereits. Gib ihr SELECT, INSERT und UPDATE auf `vital_signs` und nichts darüber hinaus.',
      'Die Tabelle `discharge_letters` wird ausschließlich von Ärzten geschrieben und muss für `nurse` unerreichbar bleiben.'
    ].join('\n'),
    en: [
      'On the ward, nurses record vital signs: they read the existing measurements, add new ones and correct typos in the ones they entered.',
      'Deleting a measurement is never allowed — a wrong reading is corrected, not erased.',
      '',
      'The role `nurse` already exists. Give it SELECT, INSERT and UPDATE on `vital_signs` and nothing beyond that.',
      'The table `discharge_letters` is written by physicians only and must stay out of reach for `nurse`.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS vital_signs;
    DROP TABLE IF EXISTS discharge_letters;
    DROP ROLE IF EXISTS nurse;

    CREATE ROLE nurse;

    CREATE TABLE vital_signs (
      id integer PRIMARY KEY,
      patient_id integer NOT NULL,
      measured_at timestamp NOT NULL,
      pulse integer NOT NULL,
      temperature numeric(4, 1) NOT NULL
    );

    CREATE TABLE discharge_letters (
      id integer PRIMARY KEY,
      patient_id integer NOT NULL,
      diagnosis text NOT NULL,
      signed_by text NOT NULL
    );

    INSERT INTO vital_signs (id, patient_id, measured_at, pulse, temperature) VALUES
      (1, 101, '2026-03-02 06:30', 72, 36.8),
      (2, 101, '2026-03-02 14:30', 78, 37.1),
      (3, 102, '2026-03-02 06:45', 88, 38.4),
      (4, 103, '2026-03-02 07:10', 64, 36.5);

    INSERT INTO discharge_letters (id, patient_id, diagnosis, signed_by) VALUES
      (1, 101, 'Pneumonia, resolved', 'Dr. Aksoy'),
      (2, 103, 'Fractured radius', 'Dr. Lindqvist');
  `,
  starterSql: 'GRANT SELECT ON vital_signs TO nurse;',
  hints: [
    {
      text: {
        de: 'Ein GRANT-Statement kann eine kommagetrennte Liste von Rechten für dasselbe Objekt tragen, sodass alle drei in eine einzige Zeile passen.',
        en: 'One GRANT statement can carry a comma-separated list of privileges for the same object, so all three fit into a single line.'
      }
    },
    {
      text: {
        de: 'ALL PRIVILEGES wäre kürzer zu tippen, vergibt aber auch DELETE, TRUNCATE, REFERENCES und TRIGGER — gib nur, was die Aufgabe tatsächlich braucht.',
        en: 'ALL PRIVILEGES would be shorter to type, but it also hands out DELETE, TRUNCATE, REFERENCES and TRIGGER — grant only what the job actually needs.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: { de: 'nurse darf vital_signs lesen', en: 'nurse may read vital_signs' },
        sql: "SELECT has_table_privilege('nurse', 'vital_signs', 'SELECT') AS ok;"
      },
      {
        label: {
          de: 'nurse darf Messwerte hinzufügen und korrigieren',
          en: 'nurse may add and correct measurements'
        },
        sql: `
          SELECT has_table_privilege('nurse', 'vital_signs', 'INSERT')
             AND has_table_privilege('nurse', 'vital_signs', 'UPDATE') AS ok;
        `
      },
      {
        label: {
          de: 'nurse kann Messwerte nicht entfernen',
          en: 'nurse cannot remove measurements'
        },
        sql: `
          SELECT NOT has_table_privilege('nurse', 'vital_signs', 'DELETE')
             AND NOT has_table_privilege('nurse', 'vital_signs', 'TRUNCATE') AS ok;
        `
      },
      {
        label: {
          de: 'discharge_letters bleibt von nurse unangetastet',
          en: 'discharge_letters stays untouched by nurse'
        },
        sql: `
          SELECT NOT has_table_privilege('nurse', 'discharge_letters', 'SELECT')
             AND NOT has_table_privilege('nurse', 'discharge_letters', 'INSERT') AS ok;
        `
      }
    ]
  },
  tags: ['grant', 'privileges', 'clinic']
};
