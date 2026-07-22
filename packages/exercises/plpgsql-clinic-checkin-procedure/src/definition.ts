import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'plpgsql-clinic-checkin-procedure',
  topic: ['plpgsql', 'functions'],
  difficulty: 'Advanced',
  title: { de: 'Einen Patienten in ein Zimmer einchecken', en: 'Check a patient into a room' },
  prompt: {
    de: [
      'Die Ambulanz führt in `checkin` höchstens einen Check-in pro Patient und Tag.',
      '',
      'Schreibe eine gespeicherte Prozedur `record_checkin(p_patient_id integer, p_room text)`:',
      '',
      '- falls der Patient noch keinen Check-in für `current_date` hat, füge einen mit diesem Zimmer ein',
      '- andernfalls verschiebe den bestehenden heutigen Check-in in das neue Zimmer',
      '',
      'Nutze `EXISTS` (oder `NOT EXISTS`), um die beiden Fälle zu unterscheiden.',
      'Rufe sie danach zweimal auf, damit die Check-ins auch tatsächlich erfasst werden:',
      '',
      "`CALL record_checkin(2, 'Room B');` und `CALL record_checkin(5, 'Room C');`"
    ].join('\n'),
    en: [
      'The outpatient clinic keeps at most one check-in per patient and day in `checkin`.',
      '',
      'Write a stored procedure `record_checkin(p_patient_id integer, p_room text)`:',
      '',
      '- if the patient has no check-in for `current_date` yet, insert one with that room',
      '- otherwise move the existing check-in of today to the new room',
      '',
      'Use `EXISTS` (or `NOT EXISTS`) to tell the two cases apart.',
      'Afterwards call it twice, so the check-ins are actually recorded:',
      '',
      "`CALL record_checkin(2, 'Room B');` and `CALL record_checkin(5, 'Room C');`"
    ].join('\n')
  },
  seedSql: `
    DROP PROCEDURE IF EXISTS record_checkin(integer, text);
    DROP TABLE IF EXISTS checkin;
    DROP TABLE IF EXISTS patient;

    CREATE TABLE patient (
      id integer PRIMARY KEY,
      name text NOT NULL
    );

    CREATE TABLE checkin (
      patient_id integer NOT NULL REFERENCES patient (id),
      visit_day date NOT NULL,
      room text NOT NULL,
      PRIMARY KEY (patient_id, visit_day)
    );

    INSERT INTO patient (id, name) VALUES
      (1, 'Nadia'),
      (2, 'Omar'),
      (3, 'Pia'),
      (4, 'Rune'),
      (5, 'Sena');

    INSERT INTO checkin (patient_id, visit_day, room) VALUES
      (2, current_date, 'Room A'),
      (3, current_date - 1, 'Room D');
  `,
  starterSql: [
    'CREATE OR REPLACE PROCEDURE record_checkin(p_patient_id integer, p_room text) AS $record_checkin$',
    'BEGIN',
    "  RAISE NOTICE 'checking in patient % into %', p_patient_id, p_room;",
    'END;',
    '$record_checkin$ LANGUAGE plpgsql;'
  ].join('\n'),
  hints: [
    {
      text: {
        de: 'Eine Prozedur hat keine `RETURNS`-Klausel und wird mit `CALL` statt `SELECT` gestartet — sie nur zu erstellen ändert noch nichts an der Tabelle.',
        en: 'A procedure has no RETURNS clause and is started with CALL instead of SELECT — creating it alone changes nothing in the table.'
      }
    },
    {
      text: {
        de: '`EXISTS` fragt nur, ob eine Anfrage überhaupt eine Zeile liefert, das ist günstiger und klarer als zu zählen.',
        en: 'EXISTS only asks whether a query yields any row at all, so it is cheaper and clearer than counting.'
      }
    },
    {
      text: {
        de: 'Der Tag ist Teil des Schlüssels: Ein Check-in von gestern darf vom heutigen Aufruf nicht angerührt werden.',
        en: 'The day is part of the key: a check-in from yesterday must not be touched by today’s call.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'Omars heutiger Check-in wurde in Room B verschoben',
          en: 'Omar’s check-in of today was moved to Room B'
        },
        sql: "SELECT room = 'Room B' AS ok FROM checkin WHERE patient_id = 2 AND visit_day = current_date;"
      },
      {
        label: {
          de: 'Omar hat weiterhin genau einen Check-in',
          en: 'Omar still has exactly one check-in'
        },
        sql: 'SELECT count(*) = 1 AS ok FROM checkin WHERE patient_id = 2;'
      },
      {
        label: {
          de: 'Sena bekam einen neuen Check-in in Room C',
          en: 'Sena got a new check-in in Room C'
        },
        sql: "SELECT room = 'Room C' AS ok FROM checkin WHERE patient_id = 5 AND visit_day = current_date;"
      },
      {
        label: {
          de: 'Pias Check-in von gestern ist unverändert',
          en: 'Pia’s check-in from yesterday is untouched'
        },
        sql: "SELECT room = 'Room D' AS ok FROM checkin WHERE patient_id = 3 AND visit_day = current_date - 1;"
      },
      {
        label: {
          de: 'Die Tabelle enthält insgesamt drei Check-ins',
          en: 'The table holds three check-ins in total'
        },
        sql: 'SELECT count(*) = 3 AS ok FROM checkin;'
      },
      {
        label: {
          de: 'Die Prozedur record_checkin existiert',
          en: 'The procedure record_checkin exists'
        },
        sql: "SELECT count(*) = 1 AS ok FROM pg_proc WHERE proname = 'record_checkin' AND prokind = 'p';"
      }
    ]
  },
  tags: ['procedure', 'call', 'exists']
};
