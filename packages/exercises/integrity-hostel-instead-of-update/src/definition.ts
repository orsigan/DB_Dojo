import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'integrity-hostel-instead-of-update',
  topic: ['integrity', 'triggers'],
  difficulty: 'Profi',
  title: {
    de: 'Eine Verbund-Sicht mit INSTEAD OF änderbar machen',
    en: 'Make a join view updatable with INSTEAD OF'
  },
  prompt: {
    de: [
      'Die Hostel-Rezeption arbeitet mit der Sicht `stay_overview`, die `guest` und `stay` verbindet.',
      'Ein UPDATE auf diese Sicht wird abgelehnt, weil die Datenbank nicht wissen kann, zu welcher',
      'der beiden Basistabellen eine geänderte Spalte gehört.',
      '',
      'Schreibe eine Trigger-Funktion `update_stay_overview()`, die die neuen Werte selbst verteilt:',
      '',
      '- `full_name` gehört zum Gast dieses Aufenthalts,',
      '- `room_no` und `nights` gehören zum Aufenthalt, der durch `OLD.id` identifiziert wird,',
      '- gib `NEW` zurück.',
      '',
      'Hänge sie als Trigger namens `trg_update_stay_overview` ein, der INSTEAD OF UPDATE ON',
      '`stay_overview` FOR EACH ROW läuft.'
    ].join('\n'),
    en: [
      'The hostel reception works on the view `stay_overview`, which joins `guest` and `stay`.',
      'An UPDATE on that view is refused, because the database cannot know which of the two base',
      'tables a changed column belongs to.',
      '',
      'Write a trigger function `update_stay_overview()` that distributes the new values itself:',
      '',
      '- `full_name` belongs to the guest of that stay,',
      '- `room_no` and `nights` belong to the stay identified by `OLD.id`,',
      '- return `NEW`.',
      '',
      'Attach it as a trigger named `trg_update_stay_overview` that runs INSTEAD OF UPDATE ON',
      '`stay_overview` FOR EACH ROW.'
    ].join('\n')
  },
  seedSql: `
    DROP TRIGGER IF EXISTS trg_update_stay_overview ON stay_overview;
    DROP FUNCTION IF EXISTS update_stay_overview();
    DROP FUNCTION IF EXISTS probe_rename_guest();
    DROP FUNCTION IF EXISTS probe_move_room();
    DROP FUNCTION IF EXISTS probe_combined_update();
    DROP VIEW IF EXISTS stay_overview;
    DROP TABLE IF EXISTS stay;
    DROP TABLE IF EXISTS guest;

    CREATE TABLE guest (
      id serial PRIMARY KEY,
      full_name text NOT NULL
    );

    CREATE TABLE stay (
      id serial PRIMARY KEY,
      guest_id integer NOT NULL REFERENCES guest (id),
      room_no text NOT NULL,
      nights integer NOT NULL
    );

    INSERT INTO guest (full_name) VALUES
      ('Ana Weiss'),
      ('Tomas Gerber'),
      ('Nora Feld');

    INSERT INTO stay (guest_id, room_no, nights) VALUES
      (1, 'A1', 3),
      (2, 'B2', 1),
      (3, 'C3', 7);

    CREATE VIEW stay_overview AS
      SELECT s.id, g.full_name, s.room_no, s.nights
      FROM stay AS s
      JOIN guest AS g ON g.id = s.guest_id;

    CREATE FUNCTION probe_rename_guest() RETURNS boolean AS $$
    DECLARE
      renamed integer;
    BEGIN
      UPDATE stay_overview SET full_name = 'Ana Weiss-Kron' WHERE id = 1;

      SELECT count(*) INTO renamed
      FROM guest AS g
      JOIN stay AS s ON s.guest_id = g.id
      WHERE s.id = 1 AND g.full_name = 'Ana Weiss-Kron';

      RETURN renamed = 1;
    EXCEPTION WHEN others THEN
      RETURN false;
    END;
    $$ LANGUAGE plpgsql;

    CREATE FUNCTION probe_move_room() RETURNS boolean AS $$
    DECLARE
      moved integer;
      guest_untouched integer;
    BEGIN
      UPDATE stay_overview SET room_no = 'B7', nights = 4 WHERE id = 2;

      SELECT count(*) INTO moved FROM stay WHERE id = 2 AND room_no = 'B7' AND nights = 4;
      SELECT count(*) INTO guest_untouched FROM guest WHERE full_name = 'Tomas Gerber';
      RETURN moved = 1 AND guest_untouched = 1;
    EXCEPTION WHEN others THEN
      RETURN false;
    END;
    $$ LANGUAGE plpgsql;

    CREATE FUNCTION probe_combined_update() RETURNS boolean AS $$
    DECLARE
      updated integer;
    BEGIN
      UPDATE stay_overview SET full_name = 'Nora Feld-Ritter', room_no = 'C9', nights = 2 WHERE id = 3;

      SELECT count(*) INTO updated
      FROM stay_overview
      WHERE id = 3 AND full_name = 'Nora Feld-Ritter' AND room_no = 'C9' AND nights = 2;

      RETURN updated = 1;
    EXCEPTION WHEN others THEN
      RETURN false;
    END;
    $$ LANGUAGE plpgsql;
  `,
  starterSql: [
    'CREATE OR REPLACE FUNCTION update_stay_overview() RETURNS trigger AS $$',
    'BEGIN',
    '  RETURN NEW;',
    'END;',
    '$$ LANGUAGE plpgsql;'
  ].join('\n'),
  hints: [
    {
      text: {
        de: 'Ein INSTEAD OF Trigger ersetzt die Operation vollständig: Die Sicht wird nie beschrieben, es passiert nur, was die Funktion tatsächlich tut.',
        en: 'An INSTEAD OF trigger replaces the operation completely: the view is never written to, only what the function does actually happens.'
      }
    },
    {
      text: {
        de: 'INSTEAD OF Trigger existieren nur auf Sichten und nur FOR EACH ROW — pro Statement gibt es nichts zu tun, weil eine Sicht keine eigenen Zeilen hat.',
        en: 'INSTEAD OF triggers exist only on views and only FOR EACH ROW — there is nothing to do per statement, because a view has no rows of its own.'
      }
    },
    {
      text: {
        de: 'OLD enthält die Zeile so, wie die Sicht sie gezeigt hat, OLD.id identifiziert also, welcher Aufenthalt — und darüber welcher Gast — geschrieben werden muss.',
        en: 'OLD holds the row as the view showed it, so OLD.id identifies which stay — and through it which guest — has to be written.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'trg_update_stay_overview läuft INSTEAD OF UPDATE on stay_overview, für jede Zeile',
          en: 'trg_update_stay_overview runs INSTEAD OF UPDATE on stay_overview, for each row'
        },
        sql: "SELECT count(*) = 1 AS ok FROM pg_trigger AS t WHERE t.tgrelid = 'stay_overview'::regclass AND t.tgname = 'trg_update_stay_overview' AND pg_get_triggerdef(t.oid) ILIKE '%INSTEAD OF UPDATE%' AND pg_get_triggerdef(t.oid) ILIKE '%FOR EACH ROW%';"
      },
      {
        label: {
          de: 'full_name über die Sicht zu ändern benennt den Gast um',
          en: 'Changing full_name through the view renames the guest'
        },
        sql: 'SELECT probe_rename_guest() AS ok;'
      },
      {
        label: {
          de: 'room_no und nights über die Sicht zu ändern schreibt nur den Aufenthalt',
          en: 'Changing room_no and nights through the view writes only the stay'
        },
        sql: 'SELECT probe_move_room() AS ok;'
      },
      {
        label: {
          de: 'Spalten beider Tabellen gleichzeitig zu ändern funktioniert',
          en: 'Changing columns of both tables at once works'
        },
        sql: 'SELECT probe_combined_update() AS ok;'
      },
      {
        label: {
          de: 'Keine Aufenthalts-Zeile ging verloren oder wurde dupliziert',
          en: 'No stay row was lost or duplicated'
        },
        sql: 'SELECT count(*) = 3 AS ok FROM stay;'
      }
    ]
  },
  tags: ['trigger', 'instead-of', 'view']
};
