import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'ddl-hospital-referential-actions',
  topic: ['ddl', 'foreign-keys'],
  difficulty: 'Profi',
  title: {
    de: 'Drei Referenzen, drei Reaktionen',
    en: 'Three references, three reactions'
  },
  prompt: {
    de: [
      'Ein Krankenhaus führt `patient`, `doctor` und `ward`. Die Behandlungsdatensätze verbinden alle drei,',
      'und jede der drei Referenzen muss anders reagieren, wenn ihr Ziel verschwindet.',
      '',
      'Erstelle die Tabelle `treatment` mit:',
      '',
      '- `treatment_id` — Ganzzahl, Primärschlüssel',
      '- `performed_on` — date, nie NULL',
      '- `patient_id` — nie NULL, referenziert `patient`. Wenn ein Patientendatensatz gelöscht wird,',
      '  werden seine Behandlungen mitgelöscht.',
      '- `doctor_id` — darf NULL sein, referenziert `doctor`. Wenn ein Arzt das Krankenhaus verlässt,',
      '  bleibt die Behandlung erhalten, nennt aber keinen Arzt mehr.',
      "- `ward_code` — feste Länge 3, nie NULL, mit Standardwert `'GEN'`, referenziert `ward`.",
      '  Wenn eine Station geschlossen wird, fallen ihre Behandlungen auf die Standardstation zurück.',
      '',
      'Die vorbereitete Station `GEN` ist die allgemeine Station und wird nie geschlossen.'
    ].join('\n'),
    en: [
      'A hospital keeps `patient`, `doctor` and `ward`. The treatment records tie all three together,',
      'and each of the three references has to react differently when its target disappears.',
      '',
      'Create the table `treatment` with:',
      '',
      '- `treatment_id` — whole number, primary key',
      '- `performed_on` — date, never NULL',
      '- `patient_id` — never NULL, references `patient`. When a patient record is erased,',
      '  their treatments are erased along with it.',
      '- `doctor_id` — may be NULL, references `doctor`. When a doctor leaves the hospital,',
      '  the treatment stays on file but no longer names a doctor.',
      "- `ward_code` — fixed length 3, never NULL, defaults to `'GEN'`, references `ward`.",
      '  When a ward is closed, its treatments fall back to the default ward.',
      '',
      'The seeded ward `GEN` is the general ward and is never closed.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS treatment;
    DROP TABLE IF EXISTS patient;
    DROP TABLE IF EXISTS doctor;
    DROP TABLE IF EXISTS ward;
    DROP FUNCTION IF EXISTS statement_is_rejected(text);

    CREATE FUNCTION statement_is_rejected(statement text) RETURNS boolean AS $fn$
    BEGIN
      EXECUTE statement;
      RETURN false;
    EXCEPTION WHEN others THEN
      RETURN true;
    END;
    $fn$ LANGUAGE plpgsql;

    CREATE TABLE ward (
      ward_code char(3) PRIMARY KEY,
      name varchar(30) NOT NULL
    );

    CREATE TABLE doctor (
      doctor_id integer PRIMARY KEY,
      name varchar(40) NOT NULL,
      speciality varchar(30) NOT NULL
    );

    CREATE TABLE patient (
      patient_id integer PRIMARY KEY,
      name varchar(40) NOT NULL,
      admitted_on date NOT NULL
    );

    INSERT INTO ward (ward_code, name) VALUES
      ('GEN', 'General'),
      ('CAR', 'Cardiology'),
      ('ORT', 'Orthopaedics');

    INSERT INTO doctor (doctor_id, name, speciality) VALUES
      (1, 'Dr. Ferrand', 'cardiology'),
      (2, 'Dr. Okonjo', 'orthopaedics'),
      (3, 'Dr. Weiss', 'internal medicine');

    INSERT INTO patient (patient_id, name, admitted_on) VALUES
      (1, 'Marta Selig', '2026-02-11'),
      (2, 'Ben Kovac', '2026-02-14'),
      (3, 'Ilka Reuter', '2026-03-02');
  `,
  starterSql:
    'CREATE TABLE treatment (\n  treatment_id integer PRIMARY KEY,\n  performed_on date NOT NULL\n);',
  hints: [
    {
      text: {
        de: 'Ob eine Fremdschlüsselspalte NULL enthalten darf, ist eine Modellierungsentscheidung, und sie legt fest, welche Reaktionen überhaupt möglich sind — eine Reaktion, die NULL schreibt, kann auf einer NOT NULL-Spalte nicht funktionieren.',
        en: 'Whether a foreign key column may hold NULL is a modelling decision, and it decides which reactions are even possible — a reaction that writes NULL cannot work on a NOT NULL column.'
      }
    },
    {
      text: {
        de: 'Eine der drei Reaktionen schreibt einen Wert in die abhängigen Zeilen, statt sie zu leeren. Dieser Wert muss als Spalten-Default existieren, und er muss in der referenzierten Tabelle existieren.',
        en: 'One of the three reactions writes a value into the dependent rows instead of clearing them. That value has to exist as a column default, and it has to exist in the referenced table.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'Die Referenz zu patient löscht die abhängigen Behandlungen',
          en: 'The reference to patient deletes the dependent treatments'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM pg_constraint
          WHERE contype = 'f'
            AND conrelid = to_regclass('public.treatment')
            AND confrelid = to_regclass('public.patient')
            AND confdeltype = 'c';
        `
      },
      {
        label: {
          de: 'Die Referenz zu doctor leert die Spalte, und doctor_id darf NULL enthalten',
          en: 'The reference to doctor clears the column and doctor_id may hold NULL'
        },
        sql: `
          SELECT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE contype = 'f'
              AND conrelid = to_regclass('public.treatment')
              AND confrelid = to_regclass('public.doctor')
              AND confdeltype = 'n'
          )
          AND EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'treatment'
              AND column_name = 'doctor_id'
              AND is_nullable = 'YES'
          ) AS ok;
        `
      },
      {
        label: {
          de: 'Die Referenz zu ward fällt auf den Standardwert zurück, und ward_code hat einen',
          en: 'The reference to ward falls back to the default, and ward_code has one'
        },
        sql: `
          SELECT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE contype = 'f'
              AND conrelid = to_regclass('public.treatment')
              AND confrelid = to_regclass('public.ward')
              AND confdeltype = 'd'
          )
          AND EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'treatment'
              AND column_name = 'ward_code'
              AND is_nullable = 'NO'
              AND column_default LIKE '%GEN%'
          ) AS ok;
        `
      },
      {
        label: {
          de: 'Vier Behandlungen können erfasst werden',
          en: 'Four treatments can be recorded'
        },
        sql: `
          WITH inserted AS (
            INSERT INTO treatment (treatment_id, performed_on, patient_id, doctor_id, ward_code)
            VALUES
              (1, DATE '2026-02-12', 1, 1, 'GEN'),
              (2, DATE '2026-02-15', 2, 2, 'ORT'),
              (3, DATE '2026-03-03', 3, 3, 'CAR'),
              (4, DATE '2026-03-04', 1, 3, 'ORT')
            RETURNING 1 AS written
          )
          SELECT count(*) = 4 AS ok
          FROM inserted;
        `
      },
      {
        label: {
          de: 'Dr. Okonjo kann das Krankenhaus verlassen',
          en: 'Dr. Okonjo can leave the hospital'
        },
        sql: `
          WITH removed AS (
            DELETE FROM doctor WHERE doctor_id = 2 RETURNING 1 AS gone
          )
          SELECT count(*) = 1 AS ok
          FROM removed;
        `
      },
      {
        label: {
          de: 'Behandlung 2 ist noch erfasst, nennt aber keinen Arzt mehr',
          en: 'Treatment 2 is still on file but no longer names a doctor'
        },
        sql: `
          SELECT EXISTS (SELECT 1 FROM treatment WHERE treatment_id = 2)
             AND (SELECT doctor_id FROM treatment WHERE treatment_id = 2) IS NULL AS ok;
        `
      },
      {
        label: {
          de: 'Die Kardiologie-Station kann geschlossen werden',
          en: 'The cardiology ward can be closed'
        },
        sql: `
          WITH removed AS (
            DELETE FROM ward WHERE ward_code = 'CAR' RETURNING 1 AS gone
          )
          SELECT count(*) = 1 AS ok
          FROM removed;
        `
      },
      {
        label: {
          de: 'Behandlung 3 wechselte auf die allgemeine Station',
          en: 'Treatment 3 moved to the general ward'
        },
        sql: "SELECT (SELECT ward_code FROM treatment WHERE treatment_id = 3) = 'GEN' AS ok;"
      },
      {
        label: {
          de: 'Ein Patientendatensatz kann gelöscht werden',
          en: 'A patient record can be erased'
        },
        sql: `
          WITH removed AS (
            DELETE FROM patient WHERE patient_id = 1 RETURNING 1 AS gone
          )
          SELECT count(*) = 1 AS ok
          FROM removed;
        `
      },
      {
        label: {
          de: 'Nur dieser Patient verlor seine Behandlungen, die anderen beiden Datensätze bleiben bestehen',
          en: 'Only that patient lost the treatments, the other two records remain'
        },
        sql: `
          SELECT NOT EXISTS (SELECT 1 FROM treatment WHERE treatment_id IN (1, 4))
             AND (SELECT count(*) FROM treatment) = 2 AS ok;
        `
      }
    ]
  },
  tags: ['foreign-key', 'on-delete', 'set-null', 'set-default']
};
