import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'ddl-workshop-repair-order-constraints',
  topic: ['ddl', 'constraints'],
  difficulty: 'Beginner',
  title: {
    de: 'Reparaturaufträge, die nicht schiefgehen können',
    en: 'Repair orders that cannot go wrong'
  },
  prompt: {
    de: [
      'Eine Autowerkstatt führt ihre Fahrzeuge in `vehicle` und braucht jetzt eine Tabelle für die Reparaturaufträge.',
      'Am Empfang wird schnell getippt, deshalb muss die Tabelle selbst Unsinn zurückweisen.',
      '',
      'Erstelle die Tabelle `repair_order` mit diesen Spalten und Regeln:',
      '',
      '- `order_id` — Ganzzahl, Primärschlüssel',
      '- `plate` — Zeichenkette variabler Länge mit höchstens 10 Zeichen, nie NULL',
      '- `description` — text, nie NULL',
      '- `labour_hours` — Dezimalzahl mit 4 Stellen und 1 Nachkommastelle, nie NULL,',
      '  Standardwert `1.0` und muss größer als null sein',
      "- `status` — Zeichenkette variabler Länge mit höchstens 12 Zeichen, nie NULL, Standardwert `'open'`",
      "  und erlaubt nur die Werte `'open'`, `'in_progress'` und `'done'`"
    ].join('\n'),
    en: [
      'A car workshop keeps its vehicles in `vehicle` and now needs a table for the repair orders.',
      'The front desk types fast, so the table itself has to reject nonsense.',
      '',
      'Create the table `repair_order` with these columns and rules:',
      '',
      '- `order_id` — whole number, primary key',
      '- `plate` — variable-length string of at most 10 characters, never NULL',
      '- `description` — text, never NULL',
      '- `labour_hours` — decimal with 4 digits and 1 decimal place, never NULL,',
      '  defaults to `1.0` and must be greater than zero',
      "- `status` — variable-length string of at most 12 characters, never NULL, defaults to `'open'`",
      "  and only allows the values `'open'`, `'in_progress'` and `'done'`"
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS repair_order;
    DROP TABLE IF EXISTS vehicle;
    DROP FUNCTION IF EXISTS statement_is_rejected(text);

    CREATE FUNCTION statement_is_rejected(statement text) RETURNS boolean AS $fn$
    BEGIN
      EXECUTE statement;
      RETURN false;
    EXCEPTION WHEN others THEN
      RETURN true;
    END;
    $fn$ LANGUAGE plpgsql;

    CREATE TABLE vehicle (
      plate varchar(10) PRIMARY KEY,
      model varchar(30) NOT NULL,
      built_in integer NOT NULL
    );

    INSERT INTO vehicle (plate, model, built_in) VALUES
      ('M-AB 1234', 'Kombi 2.0', 2018),
      ('M-CD 5678', 'Van Diesel', 2021),
      ('RO-XY 90', 'City Mini', 2015);
  `,
  starterSql: 'CREATE TABLE repair_order (\n  order_id integer,\n  plate varchar(10)\n);',
  hints: [
    {
      text: {
        de: 'Ein DEFAULT greift nur, wenn das INSERT die Spalte weglässt — es hindert niemanden daran, explizit einen schlechten Wert einzutragen. Dafür ist CHECK da.',
        en: 'A DEFAULT only steps in when the INSERT leaves the column out — it does not stop anyone from writing a bad value in explicitly. That is what CHECK is for.'
      }
    },
    {
      text: {
        de: 'Ein CHECK, das nur eine Spalte betrachtet, kann direkt hinter dieser Spaltendefinition stehen; es braucht keine eigene Zeile nach der Spaltenliste.',
        en: 'A CHECK that only looks at one column can be written directly behind that column definition; it does not need its own line after the column list.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'order_id ist der Primärschlüssel von repair_order',
          en: 'order_id is the primary key of repair_order'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON kcu.constraint_name = tc.constraint_name
           AND kcu.constraint_schema = tc.constraint_schema
          WHERE tc.table_schema = 'public'
            AND tc.table_name = 'repair_order'
            AND tc.constraint_type = 'PRIMARY KEY'
            AND kcu.column_name = 'order_id';
        `
      },
      {
        label: {
          de: 'plate ist eine Zeichenkette variabler Länge mit höchstens 10 Zeichen und lehnt NULL ab',
          en: 'plate is a variable-length string of at most 10 characters and rejects NULL'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'repair_order'
            AND column_name = 'plate'
            AND data_type = 'character varying'
            AND character_maximum_length = 10
            AND is_nullable = 'NO';
        `
      },
      {
        label: {
          de: 'Ein minimaler Auftrag wird akzeptiert und bekommt die Standardwerte 1.0 Stunden und Status open',
          en: 'A minimal order is accepted and receives the defaults 1.0 hours and status open'
        },
        sql: `
          WITH inserted AS (
            INSERT INTO repair_order (order_id, plate, description)
            VALUES (1, 'M-AB 1234', 'oil change')
            RETURNING labour_hours, status
          )
          SELECT labour_hours = 1.0 AND status = 'open' AS ok
          FROM inserted;
        `
      },
      {
        label: {
          de: 'Ein Reparaturauftrag ohne Beschreibung wird abgelehnt',
          en: 'A repair order without a description is rejected'
        },
        sql: `
          SELECT statement_is_rejected(
            $q$INSERT INTO repair_order (order_id, plate, description) VALUES (2, 'M-CD 5678', NULL)$q$
          ) AS ok;
        `
      },
      {
        label: {
          de: 'Ein zweiter Auftrag mit derselben order_id wird abgelehnt',
          en: 'A second order with the same order_id is rejected'
        },
        sql: `
          SELECT statement_is_rejected(
            $q$INSERT INTO repair_order (order_id, plate, description) VALUES (1, 'RO-XY 90', 'new tyres')$q$
          ) AS ok;
        `
      },
      {
        label: {
          de: 'Null oder negative Arbeitsstunden werden abgelehnt',
          en: 'Zero or negative labour hours are rejected'
        },
        sql: `
          SELECT statement_is_rejected(
            $q$INSERT INTO repair_order (order_id, plate, description, labour_hours)
               VALUES (3, 'M-CD 5678', 'brake check', -2.0)$q$
          ) AS ok;
        `
      },
      {
        label: {
          de: 'Ein unbekannter Status wie "waiting" wird abgelehnt',
          en: 'An unknown status such as "waiting" is rejected'
        },
        sql: `
          SELECT statement_is_rejected(
            $q$INSERT INTO repair_order (order_id, plate, description, status)
               VALUES (4, 'RO-XY 90', 'clutch', 'waiting')$q$
          ) AS ok;
        `
      },
      {
        label: {
          de: 'Der erlaubte Status in_progress wird akzeptiert',
          en: 'The allowed status in_progress is accepted'
        },
        sql: `
          WITH inserted AS (
            INSERT INTO repair_order (order_id, plate, description, labour_hours, status)
            VALUES (5, 'RO-XY 90', 'clutch', 3.5, 'in_progress')
            RETURNING 1 AS written
          )
          SELECT count(*) = 1 AS ok
          FROM inserted;
        `
      }
    ]
  },
  tags: ['constraints', 'check', 'default', 'not-null']
};
