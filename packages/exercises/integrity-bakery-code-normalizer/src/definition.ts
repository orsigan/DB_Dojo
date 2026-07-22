import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'integrity-bakery-code-normalizer',
  topic: ['integrity', 'triggers'],
  difficulty: 'Beginner',
  title: {
    de: 'Produktcodes vor dem Speichern normalisieren',
    en: 'Normalise product codes before they are stored'
  },
  prompt: {
    de: [
      'Das Bäckereipersonal tippt Produktcodes von Hand ein, daher kommt `product.code` mit überflüssigen',
      'Leerzeichen und in gemischter Groß-/Kleinschreibung an. Jeder Code muss getrimmt und in',
      'Großbuchstaben in der Tabelle landen.',
      '',
      'Schreibe eine Triggerfunktion `normalize_product_code()`, die `NEW.code` auf die getrimmte,',
      'großgeschriebene Form ändert und `NEW` zurückgibt.',
      'Hänge sie als Trigger namens `trg_normalize_product_code` an, der BEFORE INSERT ON `product`',
      'FOR EACH ROW läuft.',
      '',
      'Nur der Code wird verändert, alles andere bleibt so, wie es eingefügt wurde.'
    ].join('\n'),
    en: [
      'The bakery staff type product codes by hand, so `product.code` arrives with stray blanks and in mixed case.',
      'Every code must reach the table trimmed and in upper case.',
      '',
      'Write a trigger function `normalize_product_code()` that changes `NEW.code` to the trimmed,',
      'upper-case form and returns `NEW`.',
      'Attach it as a trigger named `trg_normalize_product_code` that runs BEFORE INSERT ON `product`',
      'FOR EACH ROW.',
      '',
      'Only the code is touched, everything else stays as it was inserted.'
    ].join('\n')
  },
  seedSql: `
    DROP TRIGGER IF EXISTS trg_normalize_product_code ON product;
    DROP FUNCTION IF EXISTS normalize_product_code();
    DROP FUNCTION IF EXISTS insert_product(text, text);
    DROP TABLE IF EXISTS product;

    CREATE TABLE product (
      id serial PRIMARY KEY,
      code text NOT NULL,
      name text NOT NULL
    );

    INSERT INTO product (code, name) VALUES
      ('SD-001', 'Sourdough loaf'),
      ('PR-004', 'Pretzel');

    CREATE FUNCTION insert_product(p_code text, p_name text) RETURNS text AS $$
    DECLARE
      stored_code text;
    BEGIN
      INSERT INTO product (code, name) VALUES (p_code, p_name) RETURNING code INTO stored_code;
      RETURN stored_code;
    END;
    $$ LANGUAGE plpgsql;
  `,
  starterSql: [
    'CREATE OR REPLACE FUNCTION normalize_product_code() RETURNS trigger AS $$',
    'BEGIN',
    '  RETURN NEW;',
    'END;',
    '$$ LANGUAGE plpgsql;'
  ].join('\n'),
  hints: [
    {
      text: {
        de: 'Nur ein BEFORE-Row-Trigger kann die Zeile noch ändern: Sein Rückgabewert wird an den eigentlichen Schreibvorgang weitergereicht. Ein AFTER-Trigger sieht die Zeile erst, wenn sie schon gespeichert ist.',
        en: 'Only a BEFORE row trigger can still change the row: it hands its return value on to the actual write. An AFTER trigger sees the row when it is already stored.'
      }
    },
    {
      text: {
        de: 'In einem Row-Trigger ist die eingehende Zeile die Record-Variable NEW — weise NEW.code zu und gib NEW zurück, damit die geänderte Zeile geschrieben wird.',
        en: 'Inside a row trigger the incoming row is the record variable NEW — assign to NEW.code and return NEW so the changed row is the one that gets written.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'trg_normalize_product_code läuft BEFORE INSERT auf product, für jede Zeile',
          en: 'trg_normalize_product_code runs BEFORE INSERT on product, for each row'
        },
        sql: "SELECT count(*) = 1 AS ok FROM pg_trigger AS t WHERE t.tgrelid = 'product'::regclass AND t.tgname = 'trg_normalize_product_code' AND pg_get_triggerdef(t.oid) ILIKE '%BEFORE INSERT%' AND pg_get_triggerdef(t.oid) ILIKE '%FOR EACH ROW%';"
      },
      {
        label: {
          de: 'Ein Code mit Leerzeichen und Kleinbuchstaben wird als BG-014 gespeichert',
          en: 'A code with blanks and lower case letters is stored as BG-014'
        },
        sql: "SELECT insert_product('  bg-014 ', 'Baguette') = 'BG-014' AS ok;"
      },
      {
        label: {
          de: 'Ein bereits sauberer Code wird unverändert gespeichert',
          en: 'An already clean code is stored unchanged'
        },
        sql: "SELECT insert_product('CR-002', 'Croissant') = 'CR-002' AS ok;"
      },
      {
        label: {
          de: 'Der Produktname wird vom Trigger nicht verändert',
          en: 'The product name is not modified by the trigger'
        },
        sql: "SELECT count(*) = 1 AS ok FROM product WHERE code = 'BG-014' AND name = 'Baguette';"
      }
    ]
  },
  tags: ['trigger', 'before-insert', 'new']
};
