import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'integrity-gallery-no-price-cut',
  topic: ['integrity', 'triggers'],
  difficulty: 'Advanced',
  title: { de: 'Ein Preis, der nie fallen darf', en: 'A price that must never fall' },
  prompt: {
    de: [
      'Die Galerie senkt nie den Preis eines Kunstwerks, sobald es gelistet ist — erhöhen ist erlaubt,',
      'gleich lassen ist erlaubt, senken nicht.',
      'Ein CHECK-Constraint kann diese Regel nicht ausdrücken, weil er nur die neue Zeile sieht und nie die alte.',
      '',
      'Schreibe eine Trigger-Funktion `reject_price_cut()`, die mit RAISE EXCEPTION eine Ausnahme auslöst,',
      'sobald der neue `price_eur` niedriger ist als der alte, sodass das UPDATE fehlschlägt.',
      'Jedes andere Update läuft unverändert durch, gib also `NEW` zurück.',
      '',
      'Hänge sie als Trigger namens `trg_no_price_cut` ein, der BEFORE UPDATE ON `artwork` FOR EACH ROW läuft.'
    ].join('\n'),
    en: [
      'The gallery never lowers the price of an artwork once it is listed — raising it is allowed,',
      'keeping it is allowed, lowering it is not.',
      'A CHECK constraint cannot express this rule, because it only sees the new row and never the old one.',
      '',
      'Write a trigger function `reject_price_cut()` that raises an exception with RAISE EXCEPTION',
      'as soon as the new `price_eur` is lower than the old one, so the UPDATE fails.',
      'Every other update passes through unchanged, so return `NEW`.',
      '',
      'Attach it as a trigger named `trg_no_price_cut` that runs BEFORE UPDATE ON `artwork` FOR EACH ROW.'
    ].join('\n')
  },
  seedSql: `
    DROP TRIGGER IF EXISTS trg_no_price_cut ON artwork;
    DROP FUNCTION IF EXISTS reject_price_cut();
    DROP FUNCTION IF EXISTS probe_price_raise();
    DROP FUNCTION IF EXISTS probe_price_cut();
    DROP FUNCTION IF EXISTS probe_same_price();
    DROP FUNCTION IF EXISTS probe_unrelated_update();
    DROP TABLE IF EXISTS artwork;

    CREATE TABLE artwork (
      id serial PRIMARY KEY,
      title text NOT NULL,
      artist text NOT NULL,
      price_eur numeric NOT NULL
    );

    INSERT INTO artwork (title, artist, price_eur) VALUES
      ('Harbour at Dusk', 'Nele Barth', 7500),
      ('Red Silence', 'Otto Kranz', 4200),
      ('Blue Field', 'Nele Barth', 3100),
      ('Paper Moon', 'Ilse Marner', 2600);

    CREATE FUNCTION probe_price_raise() RETURNS boolean AS $$
    DECLARE
      stored numeric;
    BEGIN
      UPDATE artwork SET price_eur = 9000 WHERE title = 'Harbour at Dusk';
      SELECT price_eur INTO stored FROM artwork WHERE title = 'Harbour at Dusk';
      RETURN stored = 9000;
    EXCEPTION WHEN others THEN
      RETURN false;
    END;
    $$ LANGUAGE plpgsql;

    CREATE FUNCTION probe_price_cut() RETURNS boolean AS $$
    DECLARE
      price_before numeric;
      price_after numeric;
      was_rejected boolean;
    BEGIN
      SELECT price_eur INTO price_before FROM artwork WHERE title = 'Red Silence';
      BEGIN
        UPDATE artwork SET price_eur = price_before - 500 WHERE title = 'Red Silence';
        was_rejected := false;
      EXCEPTION WHEN others THEN
        was_rejected := true;
      END;
      SELECT price_eur INTO price_after FROM artwork WHERE title = 'Red Silence';
      RETURN was_rejected AND price_after = price_before;
    END;
    $$ LANGUAGE plpgsql;

    CREATE FUNCTION probe_same_price() RETURNS boolean AS $$
    DECLARE
      stored numeric;
    BEGIN
      UPDATE artwork SET price_eur = price_eur WHERE title = 'Paper Moon';
      SELECT price_eur INTO stored FROM artwork WHERE title = 'Paper Moon';
      RETURN stored = 2600;
    EXCEPTION WHEN others THEN
      RETURN false;
    END;
    $$ LANGUAGE plpgsql;

    CREATE FUNCTION probe_unrelated_update() RETURNS boolean AS $$
    DECLARE
      stored text;
    BEGIN
      UPDATE artwork SET artist = 'Nele Barth-Kroll' WHERE title = 'Blue Field';
      SELECT artist INTO stored FROM artwork WHERE title = 'Blue Field';
      RETURN stored = 'Nele Barth-Kroll';
    EXCEPTION WHEN others THEN
      RETURN false;
    END;
    $$ LANGUAGE plpgsql;
  `,
  starterSql: [
    'CREATE OR REPLACE FUNCTION reject_price_cut() RETURNS trigger AS $$',
    'BEGIN',
    '  RETURN NEW;',
    'END;',
    '$$ LANGUAGE plpgsql;'
  ].join('\n'),
  hints: [
    {
      text: {
        de: 'Nur ein Row-Trigger auf UPDATE sieht beide Versionen der Zeile gleichzeitig: OLD enthält die gespeicherten Werte, NEW die, die das Statement schreiben will.',
        en: 'Only a row trigger on UPDATE sees both versions of the row at once: OLD holds the stored values, NEW the ones the statement wants to write.'
      }
    },
    {
      text: {
        de: 'RAISE EXCEPTION bricht das gesamte Statement ab, sodass die gespeicherte Zeile ihren alten Preis behält — NEW stattdessen still zu überschreiben würde den Aufrufer glauben lassen, das Update sei erfolgreich gewesen.',
        en: 'RAISE EXCEPTION aborts the whole statement, so the stored row keeps its old price — quietly overwriting NEW instead would let the caller believe the update succeeded.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'trg_no_price_cut läuft BEFORE UPDATE on artwork, für jede Zeile',
          en: 'trg_no_price_cut runs BEFORE UPDATE on artwork, for each row'
        },
        sql: "SELECT count(*) = 1 AS ok FROM pg_trigger AS t WHERE t.tgrelid = 'artwork'::regclass AND t.tgname = 'trg_no_price_cut' AND pg_get_triggerdef(t.oid) ILIKE '%BEFORE UPDATE%' AND pg_get_triggerdef(t.oid) ILIKE '%FOR EACH ROW%';"
      },
      {
        label: {
          de: 'Einen Preis zu erhöhen ist erlaubt und wird gespeichert',
          en: 'Raising a price is allowed and is stored'
        },
        sql: 'SELECT probe_price_raise() AS ok;'
      },
      {
        label: {
          de: 'Einen Preis zu senken löst einen Fehler aus und lässt den alten Preis unverändert',
          en: 'Lowering a price raises an error and leaves the old price in place'
        },
        sql: 'SELECT probe_price_cut() AS ok;'
      },
      {
        label: {
          de: 'Denselben Preis erneut zu schreiben ist erlaubt',
          en: 'Writing the same price again is allowed'
        },
        sql: 'SELECT probe_same_price() AS ok;'
      },
      {
        label: {
          de: 'Eine andere Spalte zu aktualisieren funktioniert weiterhin',
          en: 'Updating another column still works'
        },
        sql: 'SELECT probe_unrelated_update() AS ok;'
      }
    ]
  },
  tags: ['trigger', 'before-update', 'raise-exception', 'old-new']
};
