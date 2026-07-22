import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'views-library-public-catalogue',
  topic: ['views'],
  difficulty: 'Beginner',
  title: { de: 'Eine öffentliche Katalogsicht', en: 'A public catalogue view' },
  prompt: {
    de: [
      'Die Terminals im Lesesaal einer Stadtbibliothek sollen Besuchern das Stöbern im Bestand erlauben,',
      'dürfen aber nie verraten, was ein Buch gekostet hat oder wer es gespendet hat.',
      '',
      'Erstelle eine Sicht namens `public_catalogue` auf `books`, die genau die Spalten',
      '`title`, `author` und `shelf_code` offenlegt, eine Zeile pro Buch.'
    ].join('\n'),
    en: [
      'The reading-room terminals of a city library should let visitors browse the collection,',
      'but they must never reveal what a book cost or who donated it.',
      '',
      'Create a view named `public_catalogue` over `books` that exposes exactly the columns',
      '`title`, `author` and `shelf_code`, one row per book.'
    ].join('\n')
  },
  seedSql: `
    DROP VIEW IF EXISTS public_catalogue;
    DROP TABLE IF EXISTS books;

    CREATE TABLE books (
      id integer PRIMARY KEY,
      title text NOT NULL,
      author text NOT NULL,
      shelf_code text NOT NULL,
      acquisition_price numeric NOT NULL,
      donated_by text
    );

    INSERT INTO books (id, title, author, shelf_code, acquisition_price, donated_by) VALUES
      (1, 'The Salt Roads', 'Nalo Hopkinson', 'A-12', 18.90, 'Estate Vogel'),
      (2, 'Tidal Atlas', 'Marek Sobol', 'B-03', 42.00, NULL),
      (3, 'Kitchen Chemistry', 'Ida Brenner', 'C-07', 24.50, 'Foundation Lindt'),
      (4, 'Marsh Birds', 'Tomas Reyes', 'A-04', 31.75, NULL),
      (5, 'Glass and Iron', 'Hanne Loft', 'D-21', 15.00, 'Estate Vogel');
  `,
  starterSql: 'CREATE VIEW public_catalogue AS\nSELECT title\nFROM books;',
  hints: [
    {
      text: {
        de: 'Eine Sicht speichert die Anfrage, nicht die Zeilen — jedes SELECT auf die Sicht führt diese Anfrage erneut gegen `books` aus.',
        en: 'A view stores the query, not the rows — every SELECT on the view runs that query against `books` again.'
      }
    },
    {
      text: {
        de: 'Eine Spalte aus der SELECT-Liste wegzulassen, ist es, was sie verbirgt: Eine Sicht kann nicht offenlegen, was sie nie ausgewählt hat.',
        en: 'Leaving a column out of the SELECT list is what hides it: a view cannot expose what it never selected.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'public_catalogue existiert als Sicht',
          en: 'public_catalogue exists as a view'
        },
        sql: "SELECT count(*) = 1 AS ok FROM pg_views WHERE schemaname = 'public' AND viewname = 'public_catalogue';"
      },
      {
        label: {
          de: 'Sie legt genau title, author und shelf_code offen',
          en: 'It exposes exactly title, author and shelf_code'
        },
        sql: `
          SELECT count(*) = 3 AND bool_and(column_name IN ('title', 'author', 'shelf_code')) AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'public_catalogue';
        `
      },
      {
        label: { de: 'Sie listet alle fünf Bücher', en: 'It lists all five books' },
        sql: 'SELECT count(*) = 5 AS ok FROM public_catalogue;'
      },
      {
        label: {
          de: 'Ihre Zeilen stimmen mit der Tabelle books überein',
          en: 'Its rows match the books table'
        },
        sql: `
          SELECT NOT EXISTS (
            SELECT title, author, shelf_code FROM books
            EXCEPT
            SELECT title, author, shelf_code FROM public_catalogue
          ) AND NOT EXISTS (
            SELECT title, author, shelf_code FROM public_catalogue
            EXCEPT
            SELECT title, author, shelf_code FROM books
          ) AS ok;
        `
      }
    ]
  },
  tags: ['create-view', 'projection', 'privacy']
};
