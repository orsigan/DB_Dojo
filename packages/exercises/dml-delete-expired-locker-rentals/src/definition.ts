import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'dml-delete-expired-locker-rentals',
  topic: ['dml', 'delete'],
  difficulty: 'Beginner',
  title: {
    de: 'Abgelaufene Schließfach-Mietverträge entfernen',
    en: 'Clear out expired locker rentals'
  },
  prompt: {
    de: [
      'Das Schwimmbad räumt sein Schließfachregister zu Beginn des Mai auf.',
      '',
      'Lösche jede Miete aus `locker_rentals`, deren `rented_until` vor dem 2026-05-01 liegt.',
      '',
      'Eine Miete, die genau bis zum 2026-05-01 läuft, ist an diesem Tag noch gültig und muss erhalten bleiben.'
    ].join('\n'),
    en: [
      'The swimming pool clears its locker register at the start of May.',
      '',
      'Delete every rental from `locker_rentals` whose `rented_until` lies before 2026-05-01.',
      '',
      'A rental that runs exactly until 2026-05-01 is still valid on that day and must survive.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS locker_rentals;

    CREATE TABLE locker_rentals (
      id integer PRIMARY KEY,
      locker_no integer NOT NULL,
      holder text NOT NULL,
      rented_until date NOT NULL,
      deposit_cents integer NOT NULL
    );

    INSERT INTO locker_rentals (id, locker_no, holder, rented_until, deposit_cents) VALUES
      (1, 12, 'Ines Roth', '2026-04-14', 500),
      (2, 13, 'Jonas Weiss', '2026-04-30', 500),
      (3, 14, 'Kim Baumann', '2026-05-01', 1000),
      (4, 15, 'Lena Ott', '2026-05-09', 500),
      (5, 16, 'Marek Novak', '2026-03-28', 750),
      (6, 17, 'Nina Sauer', '2026-06-02', 1000);
  `,
  starterSql: 'SELECT id, holder, rented_until FROM locker_rentals ORDER BY rented_until;',
  hints: [
    {
      text: {
        de: 'DELETE entfernt ganze Zeilen — die WHERE-Klausel ist das Einzige, was zwischen dir und einer leeren Tabelle steht.',
        en: 'DELETE removes whole rows, so the WHERE clause is the only thing standing between you and an empty table.'
      }
    },
    {
      text: {
        de: 'Datumswerte vergleichen sich wie Zahlen: `<` bedeutet streng früher, `<=` würde auch die Miete erfassen, die genau am Stichtag endet.',
        en: 'Dates compare like numbers: `<` means strictly earlier, `<=` would also catch the rental that ends on the cut-off day itself.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'Genau die drei Mieten 3, 4 und 6 bleiben übrig',
          en: 'Exactly the three rentals 3, 4 and 6 are left'
        },
        sql: `
          SELECT count(*) = 3 AND count(*) FILTER (WHERE id IN (3, 4, 6)) = 3 AS ok
          FROM locker_rentals;
        `
      },
      {
        label: {
          de: 'Die Miete, die am 2026-05-01 endet, wurde behalten',
          en: 'The rental ending on 2026-05-01 was kept'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM locker_rentals
          WHERE id = 3 AND holder = 'Kim Baumann' AND rented_until = DATE '2026-05-01';
        `
      },
      {
        label: {
          de: 'Keine abgelaufene Miete bleibt zurück',
          en: 'No expired rental is left behind'
        },
        sql: "SELECT count(*) = 0 AS ok FROM locker_rentals WHERE rented_until < DATE '2026-05-01';"
      }
    ]
  },
  tags: ['delete', 'where', 'dates']
};
