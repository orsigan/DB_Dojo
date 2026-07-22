import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'ddl-pharmacy-inventory-datatypes',
  topic: ['ddl', 'data-types'],
  difficulty: 'Beginner',
  title: {
    de: 'Die richtigen Datentypen für die Apothekencharge',
    en: 'The right data types for the pharmacy batch table'
  },
  prompt: {
    de: [
      'Die Apotheke verwaltet ihre Chargenbestände aktuell in einer Rohdaten-Tabelle namens `drug_batch_import`.',
      'Jede Spalte darin ist Text, sodass ein Bestand von `"zwölf"` genauso akzeptiert wird wie eine Zahl.',
      '',
      'Erstelle die Tabelle `drug_batch` mit genau diesen sechs Spalten und Wertebereichen:',
      '',
      '- `batch_id` — Ganzzahl, Primärschlüssel',
      '- `batch_code` — interner Chargencode fester Länge, immer genau 8 Zeichen',
      '- `drug_name` — Text variabler Länge, höchstens 80 Zeichen, nie NULL',
      '- `unit_price` — Preis pro Einheit als exakte Dezimalzahl mit 8 Stellen insgesamt, davon 2 nach dem Komma',
      '- `quantity_on_hand` — Bestandsmenge als Ganzzahl; pro Charge bleibt sie erfahrungsgemäß klein',
      '- `expiry_date` — das Verfallsdatum der Charge',
      '',
      'Erstelle nur die Tabelle; du musst keine Daten hineinkopieren.'
    ].join('\n'),
    en: [
      'The pharmacy currently keeps its batch inventory in a raw staging table called `drug_batch_import`.',
      'Every column in there is text, so a quantity of `"twelve"` is accepted just as happily as a number.',
      '',
      'Create the table `drug_batch` with exactly these six columns and value ranges:',
      '',
      '- `batch_id` — whole number, primary key',
      '- `batch_code` — internal batch code of fixed length, always exactly 8 characters',
      '- `drug_name` — text of variable length, at most 80 characters, never NULL',
      '- `unit_price` — price per unit as an exact decimal number with 8 digits in total, 2 of them after the point',
      '- `quantity_on_hand` — stock quantity as a whole number; per batch it tends to stay small',
      '- `expiry_date` — the expiry date of the batch',
      '',
      'Only create the table; you do not have to copy any data into it.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS drug_batch;
    DROP TABLE IF EXISTS drug_batch_import;

    CREATE TABLE drug_batch_import (
      line_no integer,
      raw_batch_code text,
      raw_drug_name text,
      raw_unit_price text,
      raw_quantity_on_hand text,
      raw_expiry_date text
    );

    INSERT INTO drug_batch_import (line_no, raw_batch_code, raw_drug_name, raw_unit_price, raw_quantity_on_hand, raw_expiry_date) VALUES
      (1, 'AMX250A1', 'Amoxicillin 250mg', '0.42', '480', '2027-05-31'),
      (2, 'IBU400B2', 'Ibuprofen 400mg', '0.15', '1200', '2026-11-30'),
      (3, 'PARA500C', 'Paracetamol 500mg', '0.08', '2000', '2025-09-15'),
      (4, 'INSU100D', 'Insulin Glargine 100u', '38.75', '60', '2026-02-28');
  `,
  starterSql: 'CREATE TABLE drug_batch (\n  batch_id integer,\n  batch_code text\n);',
  hints: [
    {
      text: {
        de: 'Ein Chargencode hat für jede Charge dieselbe Länge, ein Medikamentenname nicht. Genau dieser Unterschied trennt einen Zeichentyp fester Länge von einem variabler Länge.',
        en: 'A batch code has the same length for every batch, a drug name does not. That difference is exactly what separates a fixed-length character type from a variable-length one.'
      }
    },
    {
      text: {
        de: 'Bei einem Preis pro Einheit zählt jede Nachkommastelle exakt. Ein Gleitkommatyp wie `real` speichert Werte nur näherungsweise und könnte aus 0.42 unbemerkt 0.4200000018 machen — für Abrechnungen ein echter Fehler. Ein Typ mit exakter Stellenzahl verhindert das.',
        en: 'For a price per unit, every decimal place matters exactly. A floating point type like `real` stores values only approximately and could silently turn 0.42 into 0.4200000018 — a real bug for invoicing. A type with an exact digit count prevents that.'
      }
    },
    {
      text: {
        de: 'Dass der Bestand pro Charge klein bleibt, ist Fachwissen über die Apotheke, keine Regel, die die Datenbank erzwingt. Ein kleinerer Ganzzahltyp signalisiert diese Erwartung und spart Platz, verhindert aber nicht mehr als jeder andere Ganzzahltyp auch — die Prüfung akzeptiert deshalb jeden echten Ganzzahltyp für diese Spalte.',
        en: 'That stock per batch stays small is domain knowledge about the pharmacy, not a rule the database enforces. A smaller integer type signals that expectation and saves space, but it does not prevent anything more than any other integer type would — so the grading accepts any genuine integer type for this column.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'Die Tabelle "drug_batch" existiert und hat genau die sechs geforderten Spalten',
          en: 'The table "drug_batch" exists and has exactly the six required columns'
        },
        sql: `
          SELECT array_agg(column_name::text ORDER BY column_name)
                 = ARRAY['batch_code', 'batch_id', 'drug_name', 'expiry_date', 'quantity_on_hand', 'unit_price'] AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'drug_batch';
        `
      },
      {
        label: {
          de: 'batch_id ist eine Ganzzahl und der Primärschlüssel der Tabelle',
          en: 'batch_id is an integer and the primary key of the table'
        },
        sql: `
          SELECT
            (
              SELECT data_type
              FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = 'drug_batch' AND column_name = 'batch_id'
            ) = 'integer'
            AND EXISTS (
              SELECT 1
              FROM information_schema.table_constraints AS tc
              JOIN information_schema.key_column_usage AS kcu
                ON kcu.constraint_name = tc.constraint_name
               AND kcu.constraint_schema = tc.constraint_schema
              WHERE tc.table_schema = 'public'
                AND tc.table_name = 'drug_batch'
                AND tc.constraint_type = 'PRIMARY KEY'
                AND kcu.column_name = 'batch_id'
            ) AS ok;
        `
      },
      {
        label: {
          de: 'batch_code ist eine Zeichenkette fester Länge von 8 Zeichen',
          en: 'batch_code is a fixed-length string of 8 characters'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'drug_batch'
            AND column_name = 'batch_code'
            AND data_type = 'character'
            AND character_maximum_length = 8;
        `
      },
      {
        label: {
          de: 'drug_name ist eine Zeichenkette variabler Länge mit höchstens 80 Zeichen und lehnt NULL ab',
          en: 'drug_name is a variable-length string of at most 80 characters and rejects NULL'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'drug_batch'
            AND column_name = 'drug_name'
            AND data_type = 'character varying'
            AND character_maximum_length = 80
            AND is_nullable = 'NO';
        `
      },
      {
        label: {
          de: 'expiry_date ist ein Datum und unit_price ist eine exakte Dezimalzahl mit 8 Stellen und 2 Nachkommastellen',
          en: 'expiry_date is a date and unit_price is an exact decimal with 8 digits and 2 decimal places'
        },
        sql: `
          SELECT count(*) = 2 AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'drug_batch'
            AND (
              (column_name = 'expiry_date' AND data_type = 'date')
              OR (
                column_name = 'unit_price'
                AND data_type = 'numeric'
                AND numeric_precision = 8
                AND numeric_scale = 2
              )
            );
        `
      },
      {
        label: {
          de: 'quantity_on_hand ist ein echter Ganzzahltyp (z. B. smallint oder integer)',
          en: 'quantity_on_hand is a genuine integer type (e.g. smallint or integer)'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'drug_batch'
            AND column_name = 'quantity_on_hand'
            AND data_type IN ('smallint', 'integer', 'bigint');
        `
      }
    ]
  },
  tags: ['data-types', 'create-table', 'numeric', 'char-varchar']
};
