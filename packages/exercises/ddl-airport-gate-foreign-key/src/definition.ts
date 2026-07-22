import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'ddl-airport-gate-foreign-key',
  topic: ['ddl', 'foreign-keys'],
  difficulty: 'Advanced',
  title: {
    de: 'Gates gehören zu einem Terminal',
    en: 'Gates belong to a terminal'
  },
  prompt: {
    de: [
      'Der Flughafen speichert seine Terminals bereits in `terminal`, mit einem zweistelligen Code als Schlüssel.',
      'Ein Gate existiert nie für sich allein: Es gehört immer zu genau einem Terminal.',
      '',
      'Erstelle die Tabelle `gate` mit diesen Spalten und Regeln:',
      '',
      '- `gate_id` — Ganzzahl, Primärschlüssel',
      '- `label` — Zeichenkette variabler Länge mit höchstens 6 Zeichen, nie NULL, eindeutig über den ganzen Flughafen',
      '- `terminal_code` — Zeichenkette fester Länge von 2 Zeichen, nie NULL,',
      '  referenziert `terminal (terminal_code)`',
      '',
      'Die Referenz muss sich so verhalten: Wenn ein Terminal abgerissen wird, verschwinden seine Gates',
      'mit ihm, und wenn ein Terminal umnummeriert wird, folgen seine Gates automatisch dem neuen Code.'
    ].join('\n'),
    en: [
      'The airport already stores its terminals in `terminal`, keyed by a two-character code.',
      'A gate never exists on its own: it always sits in exactly one terminal.',
      '',
      'Create the table `gate` with these columns and rules:',
      '',
      '- `gate_id` — whole number, primary key',
      '- `label` — variable-length string of at most 6 characters, never NULL, unique across the airport',
      '- `terminal_code` — fixed-length string of 2 characters, never NULL,',
      '  referencing `terminal (terminal_code)`',
      '',
      'The reference has to behave like this: when a terminal is torn down, its gates disappear',
      'with it, and when a terminal is renumbered, its gates follow the new code automatically.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS gate;
    DROP TABLE IF EXISTS terminal;
    DROP FUNCTION IF EXISTS statement_is_rejected(text);

    CREATE FUNCTION statement_is_rejected(statement text) RETURNS boolean AS $fn$
    BEGIN
      EXECUTE statement;
      RETURN false;
    EXCEPTION WHEN others THEN
      RETURN true;
    END;
    $fn$ LANGUAGE plpgsql;

    CREATE TABLE terminal (
      terminal_code char(2) PRIMARY KEY,
      name varchar(40) NOT NULL,
      opened_in integer NOT NULL
    );

    INSERT INTO terminal (terminal_code, name, opened_in) VALUES
      ('T1', 'Main Hall', 1972),
      ('T2', 'North Pier', 2003),
      ('T3', 'Regional Wing', 1988);
  `,
  starterSql:
    'CREATE TABLE gate (\n  gate_id integer PRIMARY KEY,\n  label varchar(6) NOT NULL\n);',
  hints: [
    {
      text: {
        de: 'Ein Fremdschlüssel kann nur auf eine Spalte zeigen, die in der referenzierten Tabelle garantiert eindeutig ist — hier ist das der Primärschlüssel von terminal.',
        en: 'A foreign key can only point at a column that is guaranteed unique in the referenced table — here that is the primary key of terminal.'
      }
    },
    {
      text: {
        de: 'Die referentiellen Aktionen entscheiden, was mit den abhängigen Zeilen passiert. Ohne sie gilt das Standardverhalten NO ACTION, das den Löschvorgang einfach verweigert.',
        en: 'The referential actions decide what happens to the dependent rows. Without them the default NO ACTION applies and simply refuses the delete.'
      }
    },
    {
      text: {
        de: 'Ein einspaltiger Fremdschlüssel kann direkt hinter der Spalte notiert werden; nur ein mehrspaltiger muss nach der Spaltenliste stehen.',
        en: 'A single-column foreign key may be written directly behind the column; only a multi-column one has to stand after the column list.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'gate.terminal_code referenziert terminal und kaskadiert sowohl bei DELETE als auch bei UPDATE',
          en: 'gate.terminal_code references terminal and cascades on both DELETE and UPDATE'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM pg_constraint
          WHERE contype = 'f'
            AND conrelid = to_regclass('public.gate')
            AND confrelid = to_regclass('public.terminal')
            AND confdeltype = 'c'
            AND confupdtype = 'c';
        `
      },
      {
        label: {
          de: 'terminal_code ist eine Zeichenkette fester Länge von 2 Zeichen und lehnt NULL ab',
          en: 'terminal_code is a fixed-length string of 2 characters and rejects NULL'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'gate'
            AND column_name = 'terminal_code'
            AND data_type = 'character'
            AND character_maximum_length = 2
            AND is_nullable = 'NO';
        `
      },
      {
        label: {
          de: 'Zwei Gates in bestehenden Terminals können eingefügt werden',
          en: 'Two gates in existing terminals can be inserted'
        },
        sql: `
          WITH inserted AS (
            INSERT INTO gate (gate_id, label, terminal_code)
            VALUES (1, 'A1', 'T1'), (2, 'C7', 'T3')
            RETURNING 1 AS written
          )
          SELECT count(*) = 2 AS ok
          FROM inserted;
        `
      },
      {
        label: {
          de: 'Ein Gate im unbekannten Terminal T9 wird abgelehnt',
          en: 'A gate in the unknown terminal T9 is rejected'
        },
        sql: `
          SELECT statement_is_rejected(
            $q$INSERT INTO gate (gate_id, label, terminal_code) VALUES (3, 'B2', 'T9')$q$
          ) AS ok;
        `
      },
      {
        label: {
          de: 'Ein zweites Gate mit dem Label A1 wird abgelehnt',
          en: 'A second gate with the label A1 is rejected'
        },
        sql: `
          SELECT statement_is_rejected(
            $q$INSERT INTO gate (gate_id, label, terminal_code) VALUES (4, 'A1', 'T2')$q$
          ) AS ok;
        `
      },
      {
        label: {
          de: 'Terminal T3 kann abgerissen werden, obwohl es noch ein Gate hat',
          en: 'Terminal T3 can be torn down even though it still has a gate'
        },
        sql: `
          WITH removed AS (
            DELETE FROM terminal WHERE terminal_code = 'T3' RETURNING 1 AS gone
          )
          SELECT count(*) = 1 AS ok
          FROM removed;
        `
      },
      {
        label: {
          de: 'Das Gate von T3 verschwand mit, das Gate von T1 blieb erhalten',
          en: 'The gate of T3 went with it, the gate of T1 survived'
        },
        sql: `
          SELECT NOT EXISTS (SELECT 1 FROM gate WHERE terminal_code = 'T3')
             AND EXISTS (SELECT 1 FROM gate WHERE terminal_code = 'T1') AS ok;
        `
      },
      {
        label: {
          de: 'Terminal T1 kann in T9 umnummeriert werden',
          en: 'Terminal T1 can be renumbered to T9'
        },
        sql: `
          WITH renumbered AS (
            UPDATE terminal SET terminal_code = 'T9' WHERE terminal_code = 'T1' RETURNING 1 AS changed
          )
          SELECT count(*) = 1 AS ok
          FROM renumbered;
        `
      },
      {
        label: {
          de: 'Gate A1 folgte der Umnummerierung und zeigt jetzt auf T9',
          en: 'Gate A1 followed the renumbering and now points at T9'
        },
        sql: "SELECT (SELECT terminal_code FROM gate WHERE gate_id = 1) = 'T9' AS ok;"
      }
    ]
  },
  tags: ['foreign-key', 'references', 'cascade', 'referential-integrity']
};
