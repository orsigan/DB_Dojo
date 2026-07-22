import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'dml-insert-library-loans',
  topic: ['dml', 'insert'],
  difficulty: 'Beginner',
  title: {
    de: 'Zwei neue Bibliotheksausleihen erfassen',
    en: 'Register two new library loans'
  },
  prompt: {
    de: [
      'Zwei Bücher wurden gerade am Ausleihschalter ausgegeben und fehlen noch in `loans`.',
      '',
      'Trage sie ein:',
      '- id `3`, ausgeliehen von Pia Lindqvist, Titel `Solaris`, ausgeliehen am 2026-04-01',
      '- id `4`, ausgeliehen von Nadia Kern, Titel `Piranesi`, ausgeliehen am 2026-04-03',
      '',
      'Keines der Bücher wurde bisher zurückgegeben, und keine der Ausleihen wurde verlängert.',
      'Schreibe diese beiden Werte nicht explizit hin — überlass das der Spaltenliste.'
    ].join('\n'),
    en: [
      'Two books have just been handed out at the lending desk and are still missing from `loans`.',
      '',
      'Insert them:',
      '- id `3`, borrowed by Pia Lindqvist, title `Solaris`, borrowed on 2026-04-01',
      '- id `4`, borrowed by Nadia Kern, title `Piranesi`, borrowed on 2026-04-03',
      '',
      'Neither book has been returned yet and neither loan has been renewed.',
      'Do not write those two values out — let the column list take care of them.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS loans;
    DROP TABLE IF EXISTS members;

    CREATE TABLE members (
      id integer PRIMARY KEY,
      name text NOT NULL
    );

    CREATE TABLE loans (
      id integer PRIMARY KEY,
      member_id integer NOT NULL REFERENCES members (id),
      title text NOT NULL,
      borrowed_on date NOT NULL,
      returned_on date,
      renewals integer NOT NULL DEFAULT 0
    );

    INSERT INTO members (id, name) VALUES
      (1, 'Nadia Kern'),
      (2, 'Omar Haddad'),
      (3, 'Pia Lindqvist');

    INSERT INTO loans (id, member_id, title, borrowed_on, returned_on, renewals) VALUES
      (1, 1, 'Dune', '2026-03-02', '2026-03-20', 1),
      (2, 2, 'The Dispossessed', '2026-03-05', NULL, 0);
  `,
  starterSql: 'SELECT * FROM loans ORDER BY id;',
  hints: [
    {
      text: {
        de: 'Ein INSERT ohne Spaltenliste muss für jede einzelne Spalte einen Wert liefern, in der Reihenfolge der Tabelle. Mit einer Spaltenliste nennst du nur die Spalten, die du tatsächlich kennst.',
        en: 'An INSERT without a column list has to supply a value for every single column, in table order. With a column list you only name the columns you actually know.'
      }
    },
    {
      text: {
        de: 'Spalten, die du in der Liste weglässt, werden automatisch gefüllt: `returned_on` hat keinen Default und akzeptiert NULL, `renewals` hat einen DEFAULT von 0.',
        en: 'Columns you leave out of the list are filled automatically: `returned_on` has no default and accepts NULL, `renewals` has a DEFAULT of 0.'
      }
    },
    {
      text: {
        de: 'Eine VALUES-Klausel kann mehrere Zeilen enthalten, getrennt durch Kommas.',
        en: 'One VALUES clause can carry several rows, separated by commas.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'loans enthält genau vier Zeilen',
          en: 'loans holds exactly four rows'
        },
        sql: 'SELECT count(*) = 4 AS ok FROM loans;'
      },
      {
        label: {
          de: 'Ausleihe 3 verleiht Solaris an Pia Lindqvist, offen und nie verlängert',
          en: 'Loan 3 lends Solaris to Pia Lindqvist, open and never renewed'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM loans AS l
          JOIN members AS m ON m.id = l.member_id
          WHERE l.id = 3
            AND m.name = 'Pia Lindqvist'
            AND l.title = 'Solaris'
            AND l.borrowed_on = DATE '2026-04-01'
            AND l.returned_on IS NULL
            AND l.renewals = 0;
        `
      },
      {
        label: {
          de: 'Ausleihe 4 verleiht Piranesi an Nadia Kern, offen und nie verlängert',
          en: 'Loan 4 lends Piranesi to Nadia Kern, open and never renewed'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM loans AS l
          JOIN members AS m ON m.id = l.member_id
          WHERE l.id = 4
            AND m.name = 'Nadia Kern'
            AND l.title = 'Piranesi'
            AND l.borrowed_on = DATE '2026-04-03'
            AND l.returned_on IS NULL
            AND l.renewals = 0;
        `
      },
      {
        label: {
          de: 'Die beiden bereits vorhandenen Ausleihen sind unverändert',
          en: 'The two loans that were already on file are untouched'
        },
        sql: `
          SELECT count(*) = 2 AS ok
          FROM loans
          WHERE (id = 1 AND member_id = 1 AND title = 'Dune'
                 AND borrowed_on = DATE '2026-03-02' AND returned_on = DATE '2026-03-20' AND renewals = 1)
             OR (id = 2 AND member_id = 2 AND title = 'The Dispossessed'
                 AND borrowed_on = DATE '2026-03-05' AND returned_on IS NULL AND renewals = 0);
        `
      }
    ]
  },
  tags: ['insert', 'values', 'default']
};
