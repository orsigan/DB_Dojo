import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'integrity-substation-status-log',
  topic: ['integrity', 'triggers'],
  difficulty: 'Profi',
  title: {
    de: 'Statusänderungen mit einer WHEN-Klausel protokollieren',
    en: 'Log status changes with a WHEN clause'
  },
  prompt: {
    de: [
      'Der Netzbetreiber schreibt einen Protokolleintrag, sobald ein Umspannwerk seinen `status`',
      'ändert. Die Spalte `load_mw` dagegen wird alle paar Sekunden aktualisiert und darf niemals',
      'einen Protokolleintrag erzeugen.',
      '',
      'Schreibe eine Trigger-Funktion `log_status_change()`, die eine Zeile in `status_change_log`',
      'einfügt mit `substation_id`, `old_status` und `new_status` des geänderten Umspannwerks.',
      'Die Funktion selbst entscheidet nicht, ob sie laufen soll — sie protokolliert nur.',
      '',
      'Hänge sie als Trigger namens `trg_log_status_change` ein, der AFTER UPDATE ON `substation`',
      'FOR EACH ROW läuft und eine WHEN-Klausel trägt, die ihn nur feuern lässt, wenn sich der Status',
      'tatsächlich geändert hat. Denselben Status erneut zu schreiben ist keine Änderung.'
    ].join('\n'),
    en: [
      'The grid operator writes a protocol entry whenever a substation changes its `status`.',
      'The `load_mw` column, on the other hand, is updated every few seconds and must never produce',
      'a protocol entry.',
      '',
      'Write a trigger function `log_status_change()` that inserts one row into `status_change_log`',
      'with `substation_id`, `old_status` and `new_status` of the changed substation.',
      'The function itself does not decide whether it should run — it only logs.',
      '',
      'Attach it as a trigger named `trg_log_status_change` that runs AFTER UPDATE ON `substation`',
      'FOR EACH ROW and carries a WHEN clause that lets it fire only if the status really changed.',
      'Writing the same status again is not a change.'
    ].join('\n')
  },
  seedSql: `
    DROP TRIGGER IF EXISTS trg_log_status_change ON substation;
    DROP FUNCTION IF EXISTS log_status_change();
    DROP FUNCTION IF EXISTS probe_status_change();
    DROP FUNCTION IF EXISTS probe_load_change();
    DROP FUNCTION IF EXISTS probe_same_status();
    DROP TABLE IF EXISTS status_change_log;
    DROP TABLE IF EXISTS substation;

    CREATE TABLE substation (
      id serial PRIMARY KEY,
      name text NOT NULL,
      status text NOT NULL,
      load_mw numeric NOT NULL
    );

    CREATE TABLE status_change_log (
      id serial PRIMARY KEY,
      substation_id integer NOT NULL,
      old_status text NOT NULL,
      new_status text NOT NULL,
      changed_at timestamp NOT NULL DEFAULT now()
    );

    INSERT INTO substation (name, status, load_mw) VALUES
      ('Nordkreuz', 'online', 128.5),
      ('Seehafen', 'online', 94.0),
      ('Talwerk', 'offline', 0.0);

    CREATE FUNCTION probe_status_change() RETURNS boolean AS $$
    DECLARE
      logged integer;
    BEGIN
      UPDATE substation SET status = 'maintenance' WHERE name = 'Nordkreuz';

      SELECT count(*) INTO logged
      FROM status_change_log AS l
      JOIN substation AS s ON s.id = l.substation_id
      WHERE s.name = 'Nordkreuz' AND l.old_status = 'online' AND l.new_status = 'maintenance';

      RETURN logged = 1;
    END;
    $$ LANGUAGE plpgsql;

    CREATE FUNCTION probe_load_change() RETURNS boolean AS $$
    DECLARE
      logged integer;
    BEGIN
      UPDATE substation SET load_mw = load_mw + 12.5 WHERE name = 'Seehafen';

      SELECT count(*) INTO logged
      FROM status_change_log AS l
      JOIN substation AS s ON s.id = l.substation_id
      WHERE s.name = 'Seehafen';

      RETURN logged = 0;
    END;
    $$ LANGUAGE plpgsql;

    CREATE FUNCTION probe_same_status() RETURNS boolean AS $$
    DECLARE
      logged integer;
    BEGIN
      UPDATE substation SET status = 'offline' WHERE name = 'Talwerk';

      SELECT count(*) INTO logged
      FROM status_change_log AS l
      JOIN substation AS s ON s.id = l.substation_id
      WHERE s.name = 'Talwerk';

      RETURN logged = 0;
    END;
    $$ LANGUAGE plpgsql;
  `,
  starterSql: [
    'CREATE OR REPLACE FUNCTION log_status_change() RETURNS trigger AS $$',
    'BEGIN',
    '  RETURN NULL;',
    'END;',
    '$$ LANGUAGE plpgsql;'
  ].join('\n'),
  hints: [
    {
      text: {
        de: 'WHEN (Bedingung) wird ausgewertet, bevor die Funktion überhaupt aufgerufen wird — der Trigger bleibt für jede nicht passende Zeile still, was günstiger ist, als die Funktion zu starten und gleich wieder zu verlassen.',
        en: 'WHEN (condition) is evaluated before the function is called at all — the trigger stays silent for every row that does not match, which is cheaper than starting the function and leaving it again.'
      }
    },
    {
      text: {
        de: 'Ein Status kann in anderen Tabellen derselben Form NULL sein, vergleiche also mit IS DISTINCT FROM statt <>, das NULL ergeben und nie feuern würde.',
        en: 'A status may be NULL in other tables of the same shape, so compare with IS DISTINCT FROM rather than <>, which would yield NULL and never fire.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'trg_log_status_change läuft AFTER UPDATE on substation, für jede Zeile',
          en: 'trg_log_status_change runs AFTER UPDATE on substation, for each row'
        },
        sql: "SELECT count(*) = 1 AS ok FROM pg_trigger AS t WHERE t.tgrelid = 'substation'::regclass AND t.tgname = 'trg_log_status_change' AND pg_get_triggerdef(t.oid) ILIKE '%AFTER UPDATE%' AND pg_get_triggerdef(t.oid) ILIKE '%FOR EACH ROW%';"
      },
      {
        label: {
          de: 'Die Trigger-Definition trägt eine WHEN-Klausel',
          en: 'The trigger definition carries a WHEN clause'
        },
        sql: "SELECT count(*) = 1 AS ok FROM pg_trigger AS t WHERE t.tgrelid = 'substation'::regclass AND t.tgname = 'trg_log_status_change' AND pg_get_triggerdef(t.oid) ILIKE '%WHEN (%';"
      },
      {
        label: {
          de: 'Eine echte Statusänderung wird einmal mit altem und neuem Status protokolliert',
          en: 'A real status change is logged once with old and new status'
        },
        sql: 'SELECT probe_status_change() AS ok;'
      },
      {
        label: {
          de: 'Nur load_mw zu aktualisieren schreibt keinen Protokolleintrag',
          en: 'Updating only load_mw writes no protocol entry'
        },
        sql: 'SELECT probe_load_change() AS ok;'
      },
      {
        label: {
          de: 'Denselben Status erneut zu schreiben schreibt keinen Protokolleintrag',
          en: 'Writing the same status again writes no protocol entry'
        },
        sql: 'SELECT probe_same_status() AS ok;'
      }
    ]
  },
  tags: ['trigger', 'when-clause', 'after-update', 'logging']
};
