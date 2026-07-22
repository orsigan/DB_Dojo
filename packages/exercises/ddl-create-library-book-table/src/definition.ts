import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'ddl-create-library-book-table',
  topic: ['ddl', 'create-table'],
  difficulty: 'Beginner',
  title: {
    de: 'Eine typisierte Tabelle für den Bibliothekskatalog',
    en: 'A typed table for the library catalogue'
  },
  prompt: {
    de: [
      'Die Stadtbibliothek hat ihren Katalog als einen großen Textdump erhalten, gespeichert in `book_import`.',
      'Jede Spalte darin ist untypisierter Text, sodass nichts einen Preis von `"cheap"` verhindert.',
      '',
      'Erstelle die Tabelle `book` mit genau diesen fünf Spalten und Wertebereichen:',
      '',
      '- `book_id` — Ganzzahl, Primärschlüssel',
      '- `title` — Text variabler Länge, höchstens 120 Zeichen, nie NULL',
      '- `isbn` — Text fester Länge 13',
      '- `published_on` — ein Kalenderdatum',
      '- `price` — eine exakte Dezimalzahl mit 6 Stellen insgesamt, davon 2 nach dem Komma',
      '',
      'Erstelle nur die Tabelle; du musst keine Daten hineinkopieren.'
    ].join('\n'),
    en: [
      'The city library received its catalogue as one big text dump, stored in `book_import`.',
      'Every column in there is untyped text, so nothing stops a price of `"cheap"`.',
      '',
      'Create the table `book` with exactly these five columns and value ranges:',
      '',
      '- `book_id` — whole number, primary key',
      '- `title` — text of variable length, at most 120 characters, never NULL',
      '- `isbn` — text of fixed length 13',
      '- `published_on` — a calendar date',
      '- `price` — an exact decimal number with 6 digits in total, 2 of them after the point',
      '',
      'Only create the table; you do not have to copy any data into it.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS book;
    DROP TABLE IF EXISTS book_import;

    CREATE TABLE book_import (
      line_no integer,
      raw_title text,
      raw_isbn text,
      raw_published_on text,
      raw_price text
    );

    INSERT INTO book_import (line_no, raw_title, raw_isbn, raw_published_on, raw_price) VALUES
      (1, 'The Silent Archive', '9780262033848', '2019-03-14', '24.90'),
      (2, 'Maps of the Rhine', '9780393609394', '2021-11-02', '38.00'),
      (3, 'Winter Botany', '9781408857861', '2015-06-30', '12.95'),
      (4, 'The Ledger Keeper', '9780140449136', '2023-01-19', '19.99');
  `,
  starterSql: 'CREATE TABLE book (\n  book_id integer,\n  title text\n);',
  hints: [
    {
      text: {
        de: 'Eine ISBN hat immer dieselbe Länge, ein Titel nicht. Genau dieser Unterschied trennt einen Zeichentyp fester Länge von einem variabler Länge.',
        en: 'An ISBN always has the same length, a title does not. That difference is exactly what separates a fixed-length character type from a variable-length one.'
      }
    },
    {
      text: {
        de: 'Preise brauchen exakte Nachkommastellen. Ein Gleitkommatyp würde sie runden, wähle also den Typ, mit dem du Gesamtstellen und Nachkommastellen angeben kannst.',
        en: 'Prices need exact decimal places. A floating point type would round them, so pick the type that lets you state total digits and decimal places.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'Die Tabelle "book" existiert und hat genau die fünf geforderten Spalten',
          en: 'The table "book" exists and has exactly the five required columns'
        },
        sql: `
          SELECT array_agg(column_name::text ORDER BY column_name)
                 = ARRAY['book_id', 'isbn', 'price', 'published_on', 'title'] AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'book';
        `
      },
      {
        label: {
          de: 'book_id ist eine Ganzzahl und der Primärschlüssel der Tabelle',
          en: 'book_id is an integer and the primary key of the table'
        },
        sql: `
          SELECT
            (
              SELECT data_type
              FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = 'book' AND column_name = 'book_id'
            ) = 'integer'
            AND EXISTS (
              SELECT 1
              FROM information_schema.table_constraints AS tc
              JOIN information_schema.key_column_usage AS kcu
                ON kcu.constraint_name = tc.constraint_name
               AND kcu.constraint_schema = tc.constraint_schema
              WHERE tc.table_schema = 'public'
                AND tc.table_name = 'book'
                AND tc.constraint_type = 'PRIMARY KEY'
                AND kcu.column_name = 'book_id'
            ) AS ok;
        `
      },
      {
        label: {
          de: 'title ist eine Zeichenkette variabler Länge mit höchstens 120 Zeichen und lehnt NULL ab',
          en: 'title is a variable-length string of at most 120 characters and rejects NULL'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'book'
            AND column_name = 'title'
            AND data_type = 'character varying'
            AND character_maximum_length = 120
            AND is_nullable = 'NO';
        `
      },
      {
        label: {
          de: 'isbn ist eine Zeichenkette fester Länge von 13 Zeichen',
          en: 'isbn is a fixed-length string of 13 characters'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'book'
            AND column_name = 'isbn'
            AND data_type = 'character'
            AND character_maximum_length = 13;
        `
      },
      {
        label: {
          de: 'published_on ist ein Datum und price ist eine exakte Dezimalzahl mit 6 Stellen und 2 Nachkommastellen',
          en: 'published_on is a date and price is an exact decimal with 6 digits and 2 decimal places'
        },
        sql: `
          SELECT count(*) = 2 AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'book'
            AND (
              (column_name = 'published_on' AND data_type = 'date')
              OR (
                column_name = 'price'
                AND data_type = 'numeric'
                AND numeric_precision = 6
                AND numeric_scale = 2
              )
            );
        `
      }
    ]
  },
  tags: ['create-table', 'data-types', 'primary-key']
};
