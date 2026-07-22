import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'ddl-observatory-booking-guardrails',
  topic: ['ddl', 'constraints'],
  difficulty: 'Ultra',
  title: {
    de: 'Beobachtungsslots, die nicht kollidieren dürfen',
    en: 'Observation slots that cannot collide'
  },
  prompt: {
    de: [
      'Die Sternwarte bucht Teleskopzeit in Slots. Zwei Regeln müssen gelten, und keine von beiden',
      'passt in einen einfachen Spalten-Constraint.',
      '',
      'Schritt 1 — der Slot-Code ist ein eigener Wertebereich, wiederverwendet in der ganzen Datenbank.',
      'Erstelle einen benutzerdefinierten Wertebereich namens `slot_code`, aufgebaut auf `varchar(8)`, der nur',
      'drei Großbuchstaben, einen Bindestrich und vier Ziffern akzeptiert — zum Beispiel `AND-0042`.',
      '',
      'Schritt 2 — erstelle die Tabelle `observation_slot`:',
      '',
      '- `slot_id` — Ganzzahl, Primärschlüssel',
      '- `code` — vom neuen Wertebereich `slot_code`, nie NULL',
      '- `telescope_id` — Ganzzahl, nie NULL, referenziert `telescope (telescope_id)`',
      '- `night` — date, nie NULL',
      "- `status` — varchar(10), nie NULL, nur `'booked'` oder `'cancelled'`",
      '',
      'Schritt 3 — ein Teleskop darf pro Nacht nur einen *gebuchten* Slot halten, während es',
      'beliebig viele stornierte Slots für dieselbe Nacht ansammeln darf. Setze das mit einer eindeutigen',
      'Zugriffsstruktur namens `uq_active_slot_per_night` über `telescope_id, night` durch, die nur die gebuchten Zeilen erfasst.'
    ].join('\n'),
    en: [
      'The observatory books telescope time in slots. Two rules have to hold, and neither of them',
      'fits into a plain column constraint.',
      '',
      'Step 1 — the slot code is a value range of its own, reused across the whole database.',
      'Create a user-defined value range named `slot_code`, built on `varchar(8)`, that only accepts',
      'three uppercase letters, a hyphen and four digits — for example `AND-0042`.',
      '',
      'Step 2 — create the table `observation_slot`:',
      '',
      '- `slot_id` — whole number, primary key',
      '- `code` — of your new value range `slot_code`, never NULL',
      '- `telescope_id` — whole number, never NULL, referencing `telescope (telescope_id)`',
      '- `night` — date, never NULL',
      "- `status` — varchar(10), never NULL, only `'booked'` or `'cancelled'`",
      '',
      'Step 3 — a telescope may hold only one *booked* slot per night, while it may collect any',
      'number of cancelled slots for that same night. Enforce this with a unique access structure',
      'named `uq_active_slot_per_night` over `telescope_id, night` that only covers the booked rows.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS observation_slot;
    DROP TABLE IF EXISTS telescope;
    DROP DOMAIN IF EXISTS slot_code;
    DROP FUNCTION IF EXISTS statement_is_rejected(text);

    CREATE FUNCTION statement_is_rejected(statement text) RETURNS boolean AS $fn$
    BEGIN
      EXECUTE statement;
      RETURN false;
    EXCEPTION WHEN others THEN
      RETURN true;
    END;
    $fn$ LANGUAGE plpgsql;

    CREATE TABLE telescope (
      telescope_id integer PRIMARY KEY,
      name varchar(30) NOT NULL,
      mirror_cm integer NOT NULL
    );

    INSERT INTO telescope (telescope_id, name, mirror_cm) VALUES
      (1, 'Great Refractor', 60),
      (2, 'Cassegrain North', 120),
      (3, 'Survey Scope', 40);
  `,
  starterSql:
    'CREATE TABLE observation_slot (\n  slot_id integer PRIMARY KEY,\n  telescope_id integer NOT NULL REFERENCES telescope (telescope_id)\n);',
  hints: [
    {
      text: {
        de: 'Ein benannter Wertebereich lebt neben den Tabellen, nicht in einer von ihnen — er ist ein Basistyp plus eine Einschränkung, und jede damit deklarierte Spalte erbt diese Einschränkung.',
        en: 'A named value range lives next to the tables, not inside one — it is a base type plus a restriction, and every column declared with it inherits that restriction.'
      }
    },
    {
      text: {
        de: 'Ein UNIQUE-Constraint erfasst immer jede Zeile der Tabelle. Nur die Zugriffsstruktur dahinter kann angewiesen werden, nur eine Teilmenge zu erfassen — deshalb kann die dritte Regel nicht als Tabellen-Constraint geschrieben werden.',
        en: 'A UNIQUE constraint always covers every row of the table. Only the access structure behind it can be told to cover a subset, so the third rule cannot be written as a table constraint.'
      }
    },
    {
      text: {
        de: 'Für das Code-Muster ist ein Abgleich mit einem regulären Ausdruck gegen den geprüften Wert der kürzeste Weg; innerhalb der Wertebereich-Definition trägt der geprüfte Wert ein festes Schlüsselwort als Namen.',
        en: 'For the code pattern a regular expression match against the tested value is the shortest route; inside the value range definition the tested value has a fixed keyword as its name.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'Der Wertebereich slot_code existiert und ist auf varchar(8) aufgebaut',
          en: 'The value range slot_code exists and is built on varchar(8)'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM information_schema.domains
          WHERE domain_schema = 'public'
            AND domain_name = 'slot_code'
            AND data_type = 'character varying'
            AND character_maximum_length = 8;
        `
      },
      {
        label: {
          de: 'slot_code akzeptiert AND-0042 und lehnt abc-1 ab',
          en: 'slot_code accepts AND-0042 and rejects abc-1'
        },
        sql: `
          SELECT ('AND-0042'::slot_code IS NOT NULL)
             AND statement_is_rejected($q$SELECT 'abc-1'::slot_code$q$) AS ok;
        `
      },
      {
        label: {
          de: 'observation_slot.code ist mit dem Wertebereich slot_code deklariert',
          en: 'observation_slot.code is declared with the value range slot_code'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'observation_slot'
            AND column_name = 'code'
            AND domain_name = 'slot_code';
        `
      },
      {
        label: {
          de: 'uq_active_slot_per_night ist eine eindeutige Struktur über telescope_id und night, beschränkt auf gebuchte Zeilen',
          en: 'uq_active_slot_per_night is a unique structure over telescope_id and night, restricted to booked rows'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM pg_indexes
          WHERE schemaname = 'public'
            AND tablename = 'observation_slot'
            AND indexname = 'uq_active_slot_per_night'
            AND indexdef LIKE 'CREATE UNIQUE INDEX%'
            AND indexdef LIKE '%(telescope_id, night)%'
            AND indexdef LIKE '%WHERE%booked%';
        `
      },
      {
        label: {
          de: 'Drei Buchungen auf unterschiedlichen Teleskopen und Nächten werden akzeptiert',
          en: 'Three bookings on different telescopes and nights are accepted'
        },
        sql: `
          WITH inserted AS (
            INSERT INTO observation_slot (slot_id, code, telescope_id, night, status)
            VALUES
              (1, 'AND-0042', 1, DATE '2026-09-12', 'booked'),
              (2, 'ORI-0007', 2, DATE '2026-09-12', 'booked'),
              (3, 'LYR-0113', 1, DATE '2026-09-13', 'booked')
            RETURNING 1 AS written
          )
          SELECT count(*) = 3 AS ok
          FROM inserted;
        `
      },
      {
        label: {
          de: 'Ein fehlerhafter Slot-Code wird vom Wertebereich abgelehnt',
          en: 'A malformed slot code is rejected by the value range'
        },
        sql: `
          SELECT statement_is_rejected(
            $q$INSERT INTO observation_slot (slot_id, code, telescope_id, night, status)
               VALUES (4, 'and-42', 3, DATE '2026-09-12', 'booked')$q$
          ) AS ok;
        `
      },
      {
        label: {
          de: 'Ein Slot auf dem unbekannten Teleskop 9 wird abgelehnt',
          en: 'A slot on the unknown telescope 9 is rejected'
        },
        sql: `
          SELECT statement_is_rejected(
            $q$INSERT INTO observation_slot (slot_id, code, telescope_id, night, status)
               VALUES (5, 'CYG-0001', 9, DATE '2026-09-12', 'booked')$q$
          ) AS ok;
        `
      },
      {
        label: {
          de: 'Ein zweiter gebuchter Slot auf Teleskop 1 für die Nacht vom 2026-09-12 wird abgelehnt',
          en: 'A second booked slot on telescope 1 for the night of 2026-09-12 is rejected'
        },
        sql: `
          SELECT statement_is_rejected(
            $q$INSERT INTO observation_slot (slot_id, code, telescope_id, night, status)
               VALUES (6, 'CYG-0002', 1, DATE '2026-09-12', 'booked')$q$
          ) AS ok;
        `
      },
      {
        label: {
          de: 'Zwei stornierte Slots auf demselben Teleskop und derselben Nacht sind weiterhin erlaubt',
          en: 'Two cancelled slots on that same telescope and night are still allowed'
        },
        sql: `
          WITH inserted AS (
            INSERT INTO observation_slot (slot_id, code, telescope_id, night, status)
            VALUES
              (7, 'CYG-0003', 1, DATE '2026-09-12', 'cancelled'),
              (8, 'CYG-0004', 1, DATE '2026-09-12', 'cancelled')
            RETURNING 1 AS written
          )
          SELECT count(*) = 2 AS ok
          FROM inserted;
        `
      },
      {
        label: {
          de: 'Ein unbekannter Status wird abgelehnt',
          en: 'An unknown status is rejected'
        },
        sql: `
          SELECT statement_is_rejected(
            $q$INSERT INTO observation_slot (slot_id, code, telescope_id, night, status)
               VALUES (9, 'CYG-0005', 3, DATE '2026-09-20', 'pending')$q$
          ) AS ok;
        `
      }
    ]
  },
  tags: ['domain', 'partial-index', 'unique', 'advanced']
};
