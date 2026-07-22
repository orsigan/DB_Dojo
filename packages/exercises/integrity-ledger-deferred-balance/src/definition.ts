import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'integrity-ledger-deferred-balance',
  topic: ['integrity', 'triggers'],
  difficulty: 'Ultra',
  title: {
    de: 'Einen Buchungssatz am Ende der Transaktion ausgleichen',
    en: 'Balance a ledger entry at the end of the transaction'
  },
  prompt: {
    de: [
      'In der doppelten Buchführung müssen sich die Zeilen eines `journal_entry` zu null aufsummieren.',
      'Ein gewöhnlicher AFTER ROW Trigger kann das nicht durchsetzen: Er feuert, nachdem die erste',
      'Zeile geschrieben wurde, wenn die Gegenbuchung noch nicht da ist, und würde jeden korrekten',
      'Buchungssatz ablehnen.',
      '',
      'Die Regel muss also am Ende der Transaktion geprüft werden, nicht nach jedem Statement.',
      'PostgreSQL bietet dafür genau CREATE CONSTRAINT TRIGGER: einen Row-Trigger, der',
      'DEFERRABLE INITIALLY DEFERRED sein kann, sodass alle seine ausstehenden Aufrufe bei COMMIT laufen.',
      '',
      'Schreibe eine Trigger-Funktion `enforce_entry_balance()`, die `amount_cents` aller Zeilen',
      'summiert, die zum betroffenen Buchungssatz gehören, und mit RAISE EXCEPTION eine Ausnahme',
      'auslöst, falls die Summe nicht 0 ist. INSERT, UPDATE und DELETE müssen alle abgedeckt sein,',
      'lies den Buchungssatz also aus `NEW`, wenn vorhanden, sonst aus `OLD`.',
      '',
      'Hänge sie mit CREATE CONSTRAINT TRIGGER als `trg_entry_balance` AFTER INSERT OR UPDATE OR',
      'DELETE ON `journal_line`, DEFERRABLE INITIALLY DEFERRED, FOR EACH ROW ein.'
    ].join('\n'),
    en: [
      'In double-entry bookkeeping the lines of one `journal_entry` must add up to zero.',
      'An ordinary AFTER ROW trigger cannot enforce that: it fires after the first line is written,',
      'when the counter booking is not there yet, and would reject every correct entry.',
      '',
      'The rule therefore has to be checked at the end of the transaction, not after each statement.',
      'PostgreSQL offers CREATE CONSTRAINT TRIGGER for exactly this: a row trigger that can be',
      'DEFERRABLE INITIALLY DEFERRED, so all its pending calls run at COMMIT.',
      '',
      'Write a trigger function `enforce_entry_balance()` that sums `amount_cents` of all lines',
      'belonging to the affected entry and raises an exception with RAISE EXCEPTION if the sum is',
      'not 0. INSERT, UPDATE and DELETE all have to be covered, so read the entry from `NEW` when',
      'it is there and from `OLD` otherwise.',
      '',
      'Attach it with CREATE CONSTRAINT TRIGGER as `trg_entry_balance` AFTER INSERT OR UPDATE OR',
      'DELETE ON `journal_line`, DEFERRABLE INITIALLY DEFERRED, FOR EACH ROW.'
    ].join('\n')
  },
  seedSql: `
    DROP TRIGGER IF EXISTS trg_entry_balance ON journal_line;
    DROP FUNCTION IF EXISTS enforce_entry_balance();
    DROP FUNCTION IF EXISTS probe_balanced_entry();
    DROP FUNCTION IF EXISTS probe_unbalanced_entry();
    DROP FUNCTION IF EXISTS probe_unbalancing_delete();
    DROP TABLE IF EXISTS journal_line;
    DROP TABLE IF EXISTS journal_entry;

    CREATE TABLE journal_entry (
      id integer PRIMARY KEY,
      memo text NOT NULL,
      booked_on date NOT NULL
    );

    CREATE TABLE journal_line (
      id serial PRIMARY KEY,
      entry_id integer NOT NULL REFERENCES journal_entry (id),
      account text NOT NULL,
      amount_cents integer NOT NULL
    );

    INSERT INTO journal_entry (id, memo, booked_on) VALUES
      (1, 'Office rent', '2026-06-01'),
      (2, 'Client invoice', '2026-06-03');

    INSERT INTO journal_line (entry_id, account, amount_cents) VALUES
      (1, 'expenses', 120000),
      (1, 'bank', -120000),
      (2, 'bank', 480000),
      (2, 'revenue', -480000);

    CREATE FUNCTION probe_balanced_entry() RETURNS boolean AS $$
    BEGIN
      INSERT INTO journal_entry (id, memo, booked_on) VALUES (10, 'Balanced probe', DATE '2026-06-10');
      INSERT INTO journal_line (entry_id, account, amount_cents) VALUES (10, 'expenses', 90000);
      INSERT INTO journal_line (entry_id, account, amount_cents) VALUES (10, 'bank', -90000);
      SET CONSTRAINTS ALL IMMEDIATE;
      RETURN true;
    EXCEPTION WHEN others THEN
      RETURN false;
    END;
    $$ LANGUAGE plpgsql;

    CREATE FUNCTION probe_unbalanced_entry() RETURNS boolean AS $$
    BEGIN
      INSERT INTO journal_entry (id, memo, booked_on) VALUES (20, 'Broken probe', DATE '2026-06-11');
      INSERT INTO journal_line (entry_id, account, amount_cents) VALUES (20, 'expenses', 70000);
      INSERT INTO journal_line (entry_id, account, amount_cents) VALUES (20, 'bank', -60000);
      SET CONSTRAINTS ALL IMMEDIATE;
      RETURN false;
    EXCEPTION WHEN others THEN
      RETURN true;
    END;
    $$ LANGUAGE plpgsql;

    CREATE FUNCTION probe_unbalancing_delete() RETURNS boolean AS $$
    BEGIN
      DELETE FROM journal_line WHERE entry_id = 1 AND account = 'bank';
      SET CONSTRAINTS ALL IMMEDIATE;
      RETURN false;
    EXCEPTION WHEN others THEN
      RETURN true;
    END;
    $$ LANGUAGE plpgsql;
  `,
  starterSql: [
    'CREATE OR REPLACE FUNCTION enforce_entry_balance() RETURNS trigger AS $$',
    'BEGIN',
    '  RETURN NULL;',
    'END;',
    '$$ LANGUAGE plpgsql;'
  ].join('\n'),
  hints: [
    {
      text: {
        de: 'Ein Constraint-Trigger ist der einzige Trigger, der aufgeschoben werden kann — genau das erlaubt es, eine Regel über mehrere Zeilen hinweg erst zu prüfen, wenn die ganze Buchung geschrieben ist.',
        en: 'A constraint trigger is the only trigger that can be deferred — that is what allows a rule spanning several rows to be checked once the whole booking is written.'
      }
    },
    {
      text: {
        de: 'Bei DELETE gibt es kein NEW und bei INSERT kein OLD; coalesce(NEW.entry_id, OLD.entry_id) nimmt, was gefüllt ist.',
        en: 'On DELETE there is no NEW and on INSERT there is no OLD; coalesce(NEW.entry_id, OLD.entry_id) picks whichever is filled.'
      }
    },
    {
      text: {
        de: 'Der Rückgabewert eines AFTER Triggers wird ignoriert, die Funktion muss also nur auslösen oder still bleiben.',
        en: 'The return value of an AFTER trigger is ignored, so the function only has to raise or stay silent.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'trg_entry_balance ist ein aufgeschobener Constraint-Trigger auf journal_line, für jede Zeile',
          en: 'trg_entry_balance is a deferred constraint trigger on journal_line, for each row'
        },
        sql: "SELECT count(*) = 1 AS ok FROM pg_trigger AS t WHERE t.tgrelid = 'journal_line'::regclass AND t.tgname = 'trg_entry_balance' AND pg_get_triggerdef(t.oid) ILIKE '%CONSTRAINT TRIGGER%' AND pg_get_triggerdef(t.oid) ILIKE '%INITIALLY DEFERRED%' AND pg_get_triggerdef(t.oid) ILIKE '%FOR EACH ROW%';"
      },
      {
        label: {
          de: 'Der Trigger reagiert auf INSERT, UPDATE und DELETE',
          en: 'The trigger reacts to INSERT, UPDATE and DELETE'
        },
        sql: "SELECT pg_get_triggerdef(t.oid) ILIKE '%INSERT%' AND pg_get_triggerdef(t.oid) ILIKE '%UPDATE%' AND pg_get_triggerdef(t.oid) ILIKE '%DELETE%' AS ok FROM pg_trigger AS t WHERE t.tgrelid = 'journal_line'::regclass AND t.tgname = 'trg_entry_balance';"
      },
      {
        label: {
          de: 'Eine Buchung, deren Zeilen sich zu null aufsummieren, geht durch, obwohl die erste Zeile allein es nicht tut',
          en: 'A booking whose lines add up to zero goes through, although the first line alone does not'
        },
        sql: 'SELECT probe_balanced_entry() AS ok;'
      },
      {
        label: {
          de: 'Eine Buchung, deren Zeilen sich nicht zu null aufsummieren, wird abgelehnt',
          en: 'A booking whose lines do not add up to zero is rejected'
        },
        sql: 'SELECT probe_unbalanced_entry() AS ok;'
      },
      {
        label: {
          de: 'Eine einzelne Zeile einer ausgeglichenen Buchung zu löschen wird abgelehnt',
          en: 'Deleting a single line of a balanced booking is rejected'
        },
        sql: 'SELECT probe_unbalancing_delete() AS ok;'
      }
    ]
  },
  tags: ['trigger', 'constraint-trigger', 'deferrable', 'transaction']
};
