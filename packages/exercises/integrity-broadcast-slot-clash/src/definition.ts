import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'integrity-broadcast-slot-clash',
  topic: ['integrity', 'triggers'],
  difficulty: 'Profi',
  title: {
    de: 'Kollidierende Sendeplätze still verwerfen',
    en: 'Silently drop clashing broadcast slots'
  },
  prompt: {
    de: [
      'Der Radiosender importiert sein Programm in großen INSERT-Anweisungen. Ein Slot, der sich mit',
      'einer bestehenden Ausstrahlung auf demselben Kanal überschneidet, darf nicht in `broadcast`',
      'landen — aber der Import darf auch nicht scheitern, sonst würde eine einzige fehlerhafte Zeile',
      'den ganzen Batch zum Absturz bringen. Stattdessen wird die abgelehnte Zeile in',
      '`rejected_broadcast` für die Programmplaner gesammelt.',
      '',
      'Schreibe eine Triggerfunktion `skip_broadcast_clash()`:',
      '',
      '- Überschneidet sich der neue Slot mit einer Ausstrahlung, die bereits auf demselben `channel`',
      '  gespeichert ist, füge `channel`, `show_title`, `starts_at` und `ends_at` in',
      '  `rejected_broadcast` ein und breche das INSERT dieser Zeile ab, indem du NULL zurückgibst.',
      '- Andernfalls gib NEW zurück, damit die Zeile gespeichert wird.',
      '',
      'Zwei Slots überschneiden sich, wenn einer beginnt, bevor der andere endet, und endet, nachdem',
      'der andere begonnen hat; Slots, die sich nur berühren (einer endet genau dann, wenn der',
      'nächste beginnt), überschneiden sich nicht.',
      '',
      'Hänge sie als Trigger namens `trg_skip_broadcast_clash` an, der BEFORE INSERT ON `broadcast`',
      'FOR EACH ROW läuft.'
    ].join('\n'),
    en: [
      'The radio station imports its programme in large INSERT statements. A slot that overlaps an',
      'existing broadcast on the same channel must not reach `broadcast` — but the import must not',
      'fail either, otherwise one bad row would kill the whole batch. Instead the rejected row is',
      'collected in `rejected_broadcast` for the schedulers.',
      '',
      'Write a trigger function `skip_broadcast_clash()`:',
      '',
      '- If the new slot overlaps a broadcast that is already stored on the same `channel`,',
      '  insert `channel`, `show_title`, `starts_at` and `ends_at` into `rejected_broadcast`',
      '  and cancel the INSERT of that row by returning NULL.',
      '- Otherwise return NEW so the row is stored.',
      '',
      'Two slots overlap when one starts before the other ends and ends after the other starts;',
      'slots that only touch (one ends exactly when the next starts) do not overlap.',
      '',
      'Attach it as a trigger named `trg_skip_broadcast_clash` that runs BEFORE INSERT ON `broadcast`',
      'FOR EACH ROW.'
    ].join('\n')
  },
  seedSql: `
    DROP TRIGGER IF EXISTS trg_skip_broadcast_clash ON broadcast;
    DROP FUNCTION IF EXISTS skip_broadcast_clash();
    DROP FUNCTION IF EXISTS probe_clashing_slot();
    DROP FUNCTION IF EXISTS probe_free_slot();
    DROP FUNCTION IF EXISTS probe_other_channel();
    DROP FUNCTION IF EXISTS probe_touching_slot();
    DROP TABLE IF EXISTS rejected_broadcast;
    DROP TABLE IF EXISTS broadcast;

    CREATE TABLE broadcast (
      id serial PRIMARY KEY,
      channel text NOT NULL,
      show_title text NOT NULL,
      starts_at timestamp NOT NULL,
      ends_at timestamp NOT NULL
    );

    CREATE TABLE rejected_broadcast (
      id serial PRIMARY KEY,
      channel text NOT NULL,
      show_title text NOT NULL,
      starts_at timestamp NOT NULL,
      ends_at timestamp NOT NULL
    );

    INSERT INTO broadcast (channel, show_title, starts_at, ends_at) VALUES
      ('Welle 1', 'Morgenmagazin', '2026-05-01 09:00', '2026-05-01 10:00'),
      ('Welle 1', 'Mittagsjournal', '2026-05-01 12:00', '2026-05-01 13:00'),
      ('Welle 2', 'Nachtstudio', '2026-05-01 22:00', '2026-05-01 23:30');

    CREATE FUNCTION probe_clashing_slot() RETURNS boolean AS $$
    DECLARE
      stored integer;
      rejected integer;
    BEGIN
      INSERT INTO broadcast (channel, show_title, starts_at, ends_at)
      VALUES ('Welle 1', 'Zwischenruf', TIMESTAMP '2026-05-01 09:30', TIMESTAMP '2026-05-01 10:30');

      SELECT count(*) INTO stored FROM broadcast WHERE show_title = 'Zwischenruf';
      SELECT count(*) INTO rejected FROM rejected_broadcast WHERE show_title = 'Zwischenruf';
      RETURN stored = 0 AND rejected = 1;
    EXCEPTION WHEN others THEN
      RETURN false;
    END;
    $$ LANGUAGE plpgsql;

    CREATE FUNCTION probe_free_slot() RETURNS boolean AS $$
    DECLARE
      stored integer;
      rejected integer;
    BEGIN
      INSERT INTO broadcast (channel, show_title, starts_at, ends_at)
      VALUES ('Welle 1', 'Plattenkiste', TIMESTAMP '2026-05-01 10:30', TIMESTAMP '2026-05-01 11:30');

      SELECT count(*) INTO stored FROM broadcast WHERE show_title = 'Plattenkiste';
      SELECT count(*) INTO rejected FROM rejected_broadcast WHERE show_title = 'Plattenkiste';
      RETURN stored = 1 AND rejected = 0;
    EXCEPTION WHEN others THEN
      RETURN false;
    END;
    $$ LANGUAGE plpgsql;

    CREATE FUNCTION probe_other_channel() RETURNS boolean AS $$
    DECLARE
      stored integer;
    BEGIN
      INSERT INTO broadcast (channel, show_title, starts_at, ends_at)
      VALUES ('Welle 2', 'Frühschicht', TIMESTAMP '2026-05-01 09:00', TIMESTAMP '2026-05-01 10:00');

      SELECT count(*) INTO stored FROM broadcast WHERE show_title = 'Frühschicht';
      RETURN stored = 1;
    EXCEPTION WHEN others THEN
      RETURN false;
    END;
    $$ LANGUAGE plpgsql;

    CREATE FUNCTION probe_touching_slot() RETURNS boolean AS $$
    DECLARE
      stored integer;
    BEGIN
      INSERT INTO broadcast (channel, show_title, starts_at, ends_at)
      VALUES ('Welle 1', 'Kulturzeit', TIMESTAMP '2026-05-01 13:00', TIMESTAMP '2026-05-01 14:00');

      SELECT count(*) INTO stored FROM broadcast WHERE show_title = 'Kulturzeit';
      RETURN stored = 1;
    EXCEPTION WHEN others THEN
      RETURN false;
    END;
    $$ LANGUAGE plpgsql;
  `,
  starterSql: [
    'CREATE OR REPLACE FUNCTION skip_broadcast_clash() RETURNS trigger AS $$',
    'BEGIN',
    '  RETURN NEW;',
    'END;',
    '$$ LANGUAGE plpgsql;'
  ].join('\n'),
  hints: [
    {
      text: {
        de: 'Eine Zeile, die ein BEFORE-Row-Trigger abbricht, wird ohne Fehler übersprungen: NULL zurückzugeben verwirft genau diese Zeile, der Rest der Anweisung läuft weiter.',
        en: 'A row that a BEFORE row trigger cancels is skipped without an error: returning NULL drops exactly this row, the rest of the statement continues.'
      }
    },
    {
      text: {
        de: 'Die Regel bezieht sich auf mehrere Zeilen, deshalb kann sie kein CHECK abbilden — der Trigger muss die Tabelle selbst fragen, ob bereits ein überlappender Slot existiert.',
        en: 'The rule spans several rows, which is why no CHECK can carry it — the trigger has to ask the table itself whether an overlapping slot already exists.'
      }
    },
    {
      text: {
        de: 'Slots, die sich nur berühren, teilen sich nur eine Grenze: Der Vergleich mit < und > statt <= und >= hält sie aus der Überschneidung heraus.',
        en: 'Touching slots share only a boundary: comparing with < and > instead of <= and >= keeps them out of the overlap.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'trg_skip_broadcast_clash läuft BEFORE INSERT auf broadcast, für jede Zeile',
          en: 'trg_skip_broadcast_clash runs BEFORE INSERT on broadcast, for each row'
        },
        sql: "SELECT count(*) = 1 AS ok FROM pg_trigger AS t WHERE t.tgrelid = 'broadcast'::regclass AND t.tgname = 'trg_skip_broadcast_clash' AND pg_get_triggerdef(t.oid) ILIKE '%BEFORE INSERT%' AND pg_get_triggerdef(t.oid) ILIKE '%FOR EACH ROW%';"
      },
      {
        label: {
          de: 'Ein überlappender Slot wird nicht gespeichert, landet in rejected_broadcast und löst keinen Fehler aus',
          en: 'An overlapping slot is not stored, lands in rejected_broadcast and raises no error'
        },
        sql: 'SELECT probe_clashing_slot() AS ok;'
      },
      {
        label: {
          de: 'Ein freier Slot auf demselben Kanal wird gespeichert',
          en: 'A free slot on the same channel is stored'
        },
        sql: 'SELECT probe_free_slot() AS ok;'
      },
      {
        label: {
          de: 'Dasselbe Zeitfenster auf einem anderen Kanal wird gespeichert',
          en: 'The same time window on another channel is stored'
        },
        sql: 'SELECT probe_other_channel() AS ok;'
      },
      {
        label: {
          de: 'Ein Slot, der genau dann beginnt, wenn der vorherige endet, wird gespeichert',
          en: 'A slot that starts exactly when the previous one ends is stored'
        },
        sql: 'SELECT probe_touching_slot() AS ok;'
      },
      {
        label: {
          de: 'Für die akzeptierten Slots wurde nichts in rejected_broadcast geschrieben',
          en: 'Nothing was written to rejected_broadcast for the accepted slots'
        },
        sql: "SELECT count(*) = 0 AS ok FROM rejected_broadcast WHERE show_title IN ('Plattenkiste', 'Frühschicht', 'Kulturzeit');"
      }
    ]
  },
  tags: ['trigger', 'before-insert', 'return-null']
};
