import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'integrity-postal-sorting-stats',
  topic: ['integrity', 'triggers'],
  difficulty: 'Advanced',
  title: {
    de: 'Die Paketstatistik einmal pro Statement auffrischen',
    en: 'Refresh the parcel statistics once per statement'
  },
  prompt: {
    de: [
      'Das Sortierzentrum liest sein Dashboard aus der einzigen Zeile von `parcel_stats`, statt die',
      'ganze Tabelle `parcel` zu durchsuchen. Diese Zeile muss aufgefrischt werden, sobald Pakete',
      'eingebucht werden.',
      '',
      'Schreibe eine Trigger-Funktion `refresh_parcel_stats()`, die die Zeile mit `id = 1` von',
      '`parcel_stats` aktualisiert:',
      '',
      '- `refresh_count` wird um genau 1 erhöht,',
      '- `parcel_count` wird auf die aktuelle Zeilenanzahl in `parcel` gesetzt,',
      '- `total_weight_g` wird auf die aktuelle Summe von `parcel.weight_g` gesetzt.',
      '',
      'Hänge sie als Trigger namens `trg_refresh_parcel_stats` ein, der AFTER INSERT ON `parcel`',
      'FOR EACH STATEMENT läuft — ein INSERT, das zwölf Pakete einbucht, muss die Zeile einmal',
      'auffrischen, nicht zwölfmal. Ein Statement-Trigger hat keine NEW-Zeile zum Nachschauen,',
      'lies die Summen also aus der Tabelle selbst.'
    ].join('\n'),
    en: [
      'The sorting centre reads its dashboard from the single row of `parcel_stats` instead of',
      'scanning the whole `parcel` table. That row has to be refreshed whenever parcels are booked in.',
      '',
      'Write a trigger function `refresh_parcel_stats()` that updates the row with `id = 1` of `parcel_stats`:',
      '',
      '- `refresh_count` is raised by exactly 1,',
      '- `parcel_count` is set to the current number of rows in `parcel`,',
      '- `total_weight_g` is set to the current sum of `parcel.weight_g`.',
      '',
      'Attach it as a trigger named `trg_refresh_parcel_stats` that runs AFTER INSERT ON `parcel`',
      'FOR EACH STATEMENT — one INSERT that books in twelve parcels must refresh the row once, not twelve times.',
      'A statement trigger has no NEW row to look at, so read the totals from the table itself.'
    ].join('\n')
  },
  seedSql: `
    DROP TRIGGER IF EXISTS trg_refresh_parcel_stats ON parcel;
    DROP FUNCTION IF EXISTS refresh_parcel_stats();
    DROP FUNCTION IF EXISTS probe_bulk_intake();
    DROP FUNCTION IF EXISTS probe_stats_totals();
    DROP TABLE IF EXISTS parcel_stats;
    DROP TABLE IF EXISTS parcel;

    CREATE TABLE parcel (
      id serial PRIMARY KEY,
      tracking_code text NOT NULL,
      destination text NOT NULL,
      weight_g integer NOT NULL
    );

    CREATE TABLE parcel_stats (
      id integer PRIMARY KEY,
      refresh_count integer NOT NULL,
      parcel_count integer NOT NULL,
      total_weight_g integer NOT NULL
    );

    INSERT INTO parcel (tracking_code, destination, weight_g) VALUES
      ('DE-1001', 'Rostock', 800),
      ('DE-1002', 'Kassel', 1500),
      ('DE-1003', 'Ulm', 350);

    INSERT INTO parcel_stats (id, refresh_count, parcel_count, total_weight_g) VALUES
      (1, 0, 3, 2650);

    CREATE FUNCTION probe_bulk_intake() RETURNS boolean AS $$
    DECLARE
      refreshes_before integer;
      refreshes_after integer;
    BEGIN
      SELECT refresh_count INTO refreshes_before FROM parcel_stats WHERE id = 1;

      INSERT INTO parcel (tracking_code, destination, weight_g) VALUES
        ('DE-2001', 'Trier', 400),
        ('DE-2002', 'Trier', 950),
        ('DE-2003', 'Görlitz', 120);

      SELECT refresh_count INTO refreshes_after FROM parcel_stats WHERE id = 1;
      RETURN refreshes_after = refreshes_before + 1;
    END;
    $$ LANGUAGE plpgsql;

    CREATE FUNCTION probe_stats_totals() RETURNS boolean AS $$
    DECLARE
      counted_ok boolean;
    BEGIN
      INSERT INTO parcel (tracking_code, destination, weight_g) VALUES ('DE-3001', 'Aachen', 2000);

      SELECT s.parcel_count = (SELECT count(*) FROM parcel)
         AND s.total_weight_g = (SELECT sum(p.weight_g) FROM parcel AS p)
      INTO counted_ok
      FROM parcel_stats AS s
      WHERE s.id = 1;

      RETURN counted_ok;
    END;
    $$ LANGUAGE plpgsql;
  `,
  starterSql: [
    'CREATE OR REPLACE FUNCTION refresh_parcel_stats() RETURNS trigger AS $$',
    'BEGIN',
    '  RETURN NULL;',
    'END;',
    '$$ LANGUAGE plpgsql;'
  ].join('\n'),
  hints: [
    {
      text: {
        de: 'Ein INSERT-Statement kann viele Zeilen tragen. FOR EACH ROW würde die Funktion pro Zeile ausführen, FOR EACH STATEMENT genau einmal — was ein Zähler der Auffrischungen sichtbar macht.',
        en: 'One INSERT statement can carry many rows. FOR EACH ROW would run the function per row, FOR EACH STATEMENT exactly once — which is what a counter of refreshes makes visible.'
      }
    },
    {
      text: {
        de: 'NEW und OLD sind nur in Row-Triggern gefüllt; ein Statement-Trigger muss die Tabelle nach der benötigten Summe abfragen.',
        en: 'NEW and OLD are only filled in row triggers; a statement trigger has to query the table for the aggregate it needs.'
      }
    },
    {
      text: {
        de: 'Der Rückgabewert eines AFTER Triggers wird ignoriert, die Funktion kann also einfach NULL zurückgeben.',
        en: 'The return value of an AFTER trigger is ignored, so the function can simply return NULL.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'trg_refresh_parcel_stats läuft AFTER INSERT on parcel, für jedes Statement',
          en: 'trg_refresh_parcel_stats runs AFTER INSERT on parcel, for each statement'
        },
        sql: "SELECT count(*) = 1 AS ok FROM pg_trigger AS t WHERE t.tgrelid = 'parcel'::regclass AND t.tgname = 'trg_refresh_parcel_stats' AND pg_get_triggerdef(t.oid) ILIKE '%AFTER INSERT%' AND pg_get_triggerdef(t.oid) ILIKE '%FOR EACH STATEMENT%';"
      },
      {
        label: {
          de: 'Ein INSERT mit drei Paketen erhöht refresh_count um genau 1',
          en: 'One INSERT with three parcels raises refresh_count by exactly 1'
        },
        sql: 'SELECT probe_bulk_intake() AS ok;'
      },
      {
        label: {
          de: 'parcel_count und total_weight_g stimmen nach der Auffrischung mit der Tabelle überein',
          en: 'parcel_count and total_weight_g match the table after the refresh'
        },
        sql: 'SELECT probe_stats_totals() AS ok;'
      },
      {
        label: {
          de: 'Die Statistik-Zeile wurde mindestens einmal aufgefrischt',
          en: 'The statistics row was refreshed at least once'
        },
        sql: 'SELECT refresh_count > 0 AS ok FROM parcel_stats WHERE id = 1;'
      }
    ]
  },
  tags: ['trigger', 'for-each-statement', 'aggregation']
};
