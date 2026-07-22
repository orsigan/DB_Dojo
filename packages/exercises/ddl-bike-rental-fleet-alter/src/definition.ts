import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'ddl-bike-rental-fleet-alter',
  topic: ['ddl', 'alter-drop'],
  difficulty: 'Beginner',
  title: {
    de: 'Die Mietflotte bekommt ein Preisschild',
    en: 'The rental fleet gets a price tag'
  },
  prompt: {
    de: [
      'Ein Fahrradverleih startete mit einer ganz schlichten Tabelle `bike`. Fünf Räder stehen bereits drin.',
      'Jetzt will der Laden Rahmengrößen und einen Tagessatz, und der alte Import-Vermerk kann weg.',
      '',
      'Ändere die bestehende Tabelle so, dass danach gilt:',
      '',
      '- eine Spalte `frame_size` existiert, Zeichenkette variabler Länge mit höchstens 3 Zeichen',
      '- eine Spalte `daily_rate` existiert, Dezimalzahl mit 6 Stellen und 2 Nachkommastellen,',
      '  mit dem Standardwert `12.50` — die fünf bereits gespeicherten Räder müssen danach',
      '  diesen Satz tragen, ohne dass du ein einziges UPDATE schreibst',
      '- die überflüssige Spalte `note` existiert nicht mehr',
      '',
      'Lösche die Tabelle nicht und lege sie neu an — die fünf Räder müssen erhalten bleiben.'
    ].join('\n'),
    en: [
      'A bike rental started with a very plain `bike` table. Five bikes are already in it.',
      'Now the shop wants frame sizes and a daily rate, and the old import remark can go.',
      '',
      'Change the existing table so that afterwards:',
      '',
      '- a column `frame_size` exists, variable-length string of at most 3 characters',
      '- a column `daily_rate` exists, decimal with 6 digits and 2 decimal places,',
      '  with the default value `12.50` — the five bikes that are already stored must carry',
      '  that rate afterwards, without you writing a single UPDATE',
      '- the obsolete column `note` no longer exists',
      '',
      'Do not drop and recreate the table — the five bikes have to survive.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS bike;

    CREATE TABLE bike (
      bike_id integer PRIMARY KEY,
      model varchar(40) NOT NULL,
      bought_on date NOT NULL,
      note text
    );

    INSERT INTO bike (bike_id, model, bought_on, note) VALUES
      (1, 'Cargo Mule 3', '2023-04-12', 'imported from spreadsheet'),
      (2, 'City Glide', '2024-02-01', 'imported from spreadsheet'),
      (3, 'Trail Fox', '2024-08-23', NULL),
      (4, 'Tandem Duo', '2022-05-05', 'imported from spreadsheet'),
      (5, 'City Glide', '2025-03-17', NULL);
  `,
  starterSql:
    "SELECT column_name, data_type\nFROM information_schema.columns\nWHERE table_name = 'bike'\nORDER BY ordinal_position;",
  hints: [
    {
      text: {
        de: 'Das Hinzufügen einer Spalte betrifft den Systemkatalog und jede einzelne Zeile: Jedes bestehende Tupel bekommt das neue Attribut mit NULL oder mit dem angegebenen DEFAULT-Wert belegt.',
        en: 'Adding a column touches the catalogue and every single row: each existing tuple gets the new attribute filled with NULL or with the DEFAULT you supplied.'
      }
    },
    {
      text: {
        de: 'Deshalb spielt die Reihenfolge eine Rolle — eine mit DEFAULT hinzugefügte Spalte kommt schon befüllt an, eine ohne braucht danach ein separates UPDATE.',
        en: 'That is why the order matters — a column added with a DEFAULT arrives already filled, one added without it needs a separate UPDATE.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'bike existiert noch und hat jetzt genau die fünf erwarteten Spalten',
          en: 'bike still exists and now has exactly the five expected columns'
        },
        sql: `
          SELECT array_agg(column_name::text ORDER BY column_name)
                 = ARRAY['bike_id', 'bought_on', 'daily_rate', 'frame_size', 'model'] AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'bike';
        `
      },
      {
        label: {
          de: 'frame_size ist eine Zeichenkette variabler Länge mit höchstens 3 Zeichen',
          en: 'frame_size is a variable-length string of at most 3 characters'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'bike'
            AND column_name = 'frame_size'
            AND data_type = 'character varying'
            AND character_maximum_length = 3;
        `
      },
      {
        label: {
          de: 'daily_rate ist eine Dezimalzahl mit 6 Stellen, 2 Nachkommastellen und trägt einen Standardwert',
          en: 'daily_rate is a decimal with 6 digits, 2 decimal places and carries a default value'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'bike'
            AND column_name = 'daily_rate'
            AND data_type = 'numeric'
            AND numeric_precision = 6
            AND numeric_scale = 2
            AND column_default IS NOT NULL;
        `
      },
      {
        label: {
          de: 'Alle fünf zuvor bestehenden Räder tragen jetzt den Satz 12.50',
          en: 'All five bikes that existed before now carry the rate 12.50'
        },
        sql: 'SELECT count(*) = 5 AND bool_and(daily_rate = 12.50) AS ok FROM bike;'
      },
      {
        label: {
          de: 'Ein neu eingefügtes Rad ohne Satz fällt auf 12.50 zurück',
          en: 'A newly inserted bike without a rate falls back to 12.50'
        },
        sql: `
          WITH inserted AS (
            INSERT INTO bike (bike_id, model, bought_on, frame_size)
            VALUES (6, 'Fjord Runner', DATE '2026-05-04', 'M')
            RETURNING daily_rate
          )
          SELECT daily_rate = 12.50 AS ok
          FROM inserted;
        `
      }
    ]
  },
  tags: ['alter-table', 'add-column', 'drop-column', 'default']
};
