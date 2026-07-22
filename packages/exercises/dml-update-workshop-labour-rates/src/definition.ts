import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'dml-update-workshop-labour-rates',
  topic: ['dml', 'update'],
  difficulty: 'Beginner',
  title: {
    de: 'Diagnosetarif erhöhen',
    en: 'Raise the diagnostics rate'
  },
  prompt: {
    de: [
      'Die Werkstatt kalkuliert ihre Diagnosearbeiten neu.',
      '',
      'Erhöhe `hourly_rate` um 10 Prozent für jeden Auftrag, dessen `job_type` `diagnostics` ist,',
      'unabhängig davon, ob der Auftrag noch offen oder bereits erledigt ist.',
      '',
      'Alle anderen Aufträge behalten ihren bisherigen Tarif, und `labour_hours` bleibt überall unverändert.'
    ].join('\n'),
    en: [
      'The workshop is repricing its diagnostics work.',
      '',
      'Raise `hourly_rate` by 10 percent for every job whose `job_type` is `diagnostics`,',
      'no matter whether the job is still open or already done.',
      '',
      'All other jobs keep the rate they have, and `labour_hours` stays as it is everywhere.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS service_jobs;

    CREATE TABLE service_jobs (
      id integer PRIMARY KEY,
      vehicle_plate text NOT NULL,
      job_type text NOT NULL,
      labour_hours numeric NOT NULL,
      hourly_rate numeric NOT NULL,
      status text NOT NULL
    );

    INSERT INTO service_jobs (id, vehicle_plate, job_type, labour_hours, hourly_rate, status) VALUES
      (1, 'M-XY 4711', 'diagnostics', 1.5, 82.00, 'open'),
      (2, 'B-AC 208', 'brakes', 3.0, 95.00, 'open'),
      (3, 'K-LM 91', 'diagnostics', 0.5, 70.00, 'done'),
      (4, 'HH-QR 33', 'exhaust', 2.5, 88.00, 'open'),
      (5, 'S-TU 12', 'diagnostics', 2.0, 100.00, 'open');
  `,
  starterSql: 'SELECT id, job_type, hourly_rate, status FROM service_jobs ORDER BY id;',
  hints: [
    {
      text: {
        de: 'Der neue Wert darf ein Ausdruck über den alten sein — SET liest die Spalte so, wie sie vor Beginn der Anweisung war.',
        en: 'The new value may be an expression over the old one — SET reads the column as it was before the statement started.'
      }
    },
    {
      text: {
        de: 'Ohne WHERE-Klausel überschreibt ein UPDATE jede Zeile der Tabelle, wodurch auch die Brems- und Auspuffaufträge neu bepreist würden.',
        en: 'Without a WHERE clause an UPDATE rewrites every row of the table, which would reprice the brake and exhaust jobs too.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'Alle drei Diagnoseaufträge kosten 10 Prozent mehr',
          en: 'All three diagnostics jobs cost 10 percent more'
        },
        sql: `
          SELECT count(*) = 3 AS ok
          FROM service_jobs
          WHERE (id = 1 AND hourly_rate = 90.2)
             OR (id = 3 AND hourly_rate = 77)
             OR (id = 5 AND hourly_rate = 110);
        `
      },
      {
        label: {
          de: 'Die Brems- und Auspuffaufträge behalten ihren alten Tarif',
          en: 'The brake and exhaust jobs keep their old rate'
        },
        sql: `
          SELECT count(*) = 2 AS ok
          FROM service_jobs
          WHERE (id = 2 AND hourly_rate = 95)
             OR (id = 4 AND hourly_rate = 88);
        `
      },
      {
        label: {
          de: 'Kein Auftrag wurde hinzugefügt, entfernt oder umtypisiert, und die Stunden sind unverändert',
          en: 'No job was added, removed or re-typed, and the hours are unchanged'
        },
        sql: `
          SELECT count(*) = 5 AS ok
          FROM service_jobs
          WHERE (id = 1 AND job_type = 'diagnostics' AND labour_hours = 1.5)
             OR (id = 2 AND job_type = 'brakes' AND labour_hours = 3.0)
             OR (id = 3 AND job_type = 'diagnostics' AND labour_hours = 0.5)
             OR (id = 4 AND job_type = 'exhaust' AND labour_hours = 2.5)
             OR (id = 5 AND job_type = 'diagnostics' AND labour_hours = 2.0);
        `
      }
    ]
  },
  tags: ['update', 'where', 'expression']
};
