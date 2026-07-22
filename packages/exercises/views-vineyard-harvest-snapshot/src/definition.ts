import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'views-vineyard-harvest-snapshot',
  topic: ['views'],
  difficulty: 'Profi',
  title: {
    de: 'Eine materialisierte Ernte-Momentaufnahme aktualisieren',
    en: 'Refreshing a materialized harvest snapshot'
  },
  prompt: {
    de: [
      'Eine Weinkooperative berechnet ihre Erntesummen vorab in der materialisierten Sicht',
      '`harvest_totals` (`vineyard`, `total_kilos`). Drei verspätete Anlieferungen wurden gebucht, nachdem',
      'diese Momentaufnahme erstellt wurde, daher sind die gespeicherten Zahlen veraltet — eine materialisierte Sicht',
      'folgt ihren Basistabellen nicht von selbst.',
      '',
      'Tu zwei Dinge:',
      '1. Bring `harvest_totals` wieder in Einklang mit dem aktuellen Inhalt von `deliveries`.',
      '2. Erstelle eine materialisierte Sicht namens `heavy_vineyards` mit den Spalten `vineyard` und',
      '   `total_kilos`, die nur die Weinberge enthält, die insgesamt mehr als 5000 Kilo angeliefert haben.',
      '',
      'Ändere keine Zeile in `deliveries`.'
    ].join('\n'),
    en: [
      'A wine cooperative precomputes its harvest totals in the materialized view',
      '`harvest_totals` (`vineyard`, `total_kilos`). Three late deliveries were booked after',
      'that snapshot was taken, so the stored numbers are out of date — a materialized view',
      'does not follow its base tables on its own.',
      '',
      'Do two things:',
      '1. Bring `harvest_totals` back in line with the current contents of `deliveries`.',
      '2. Create a materialized view named `heavy_vineyards` with the columns `vineyard` and',
      '   `total_kilos`, holding only the vineyards that delivered more than 5000 kilos in total.',
      '',
      'Do not change any row in `deliveries`.'
    ].join('\n')
  },
  seedSql: `
    DROP MATERIALIZED VIEW IF EXISTS heavy_vineyards;
    DROP MATERIALIZED VIEW IF EXISTS harvest_totals;
    DROP TABLE IF EXISTS deliveries;

    CREATE TABLE deliveries (
      id integer PRIMARY KEY,
      vineyard text NOT NULL,
      grape text NOT NULL,
      kilos numeric NOT NULL,
      delivered_on date NOT NULL
    );

    INSERT INTO deliveries (id, vineyard, grape, kilos, delivered_on) VALUES
      (1, 'Steinberg', 'Riesling', 3200, '2026-09-12'),
      (2, 'Steinberg', 'Silvaner', 1900, '2026-09-14'),
      (3, 'Kalkgrund', 'Riesling', 2600, '2026-09-13'),
      (4, 'Rebhang', 'Spaetburgunder', 5400, '2026-09-15'),
      (5, 'Rebhang', 'Riesling', 900, '2026-09-16'),
      (6, 'Tannenfeld', 'Mueller-Thurgau', 2100, '2026-09-17');

    CREATE MATERIALIZED VIEW harvest_totals AS
      SELECT vineyard, sum(kilos) AS total_kilos
      FROM deliveries
      GROUP BY vineyard;

    INSERT INTO deliveries (id, vineyard, grape, kilos, delivered_on) VALUES
      (7, 'Kalkgrund', 'Spaetburgunder', 3100, '2026-09-20'),
      (8, 'Tannenfeld', 'Riesling', 800, '2026-09-21'),
      (9, 'Steinberg', 'Riesling', 1500, '2026-09-22');
  `,
  starterSql: 'SELECT * FROM harvest_totals;',
  hints: [
    {
      text: {
        de: 'Eine materialisierte Sicht hält eine gespeicherte Kopie ihres Ergebnisses vor — deshalb ist sie schnell, und deshalb veraltet sie.',
        en: 'A materialized view keeps a stored copy of its result — that is why it is fast, and why it goes stale.'
      }
    },
    {
      text: {
        de: 'Das Aktualisieren einer materialisierten Sicht ist eine einzige Anweisung; du löschst und erstellst sie niemals neu, nur um die Zahlen zu aktualisieren.',
        en: 'Refreshing a materialized view is a single statement; you never drop and recreate it just to update the numbers.'
      }
    },
    {
      text: {
        de: 'Kalkgrund überschreitet die 5000-Kilo-Marke erst, wenn die verspäteten Anlieferungen mitgezählt werden — baue `heavy_vineyards` daher aus `deliveries`, nicht aus der veralteten Momentaufnahme.',
        en: 'Kalkgrund only crosses the 5000 kilo mark once the late deliveries are counted, so build `heavy_vineyards` from `deliveries`, not from the stale snapshot.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'harvest_totals ist weiterhin eine materialisierte Sicht',
          en: 'harvest_totals is still a materialized view'
        },
        sql: "SELECT count(*) = 1 AS ok FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'harvest_totals';"
      },
      {
        label: {
          de: 'harvest_totals stimmt jetzt mit den aktuellen deliveries überein',
          en: 'harvest_totals now matches the current deliveries'
        },
        sql: `
          WITH expected AS (
            SELECT vineyard, sum(kilos) AS total_kilos
            FROM deliveries
            GROUP BY vineyard
          )
          SELECT NOT EXISTS (
            SELECT * FROM expected
            EXCEPT
            SELECT vineyard, total_kilos FROM harvest_totals
          ) AND NOT EXISTS (
            SELECT vineyard, total_kilos FROM harvest_totals
            EXCEPT
            SELECT * FROM expected
          ) AS ok;
        `
      },
      {
        label: {
          de: 'heavy_vineyards ist eine materialisierte Sicht',
          en: 'heavy_vineyards is a materialized view'
        },
        sql: "SELECT count(*) = 1 AS ok FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'heavy_vineyards';"
      },
      {
        label: {
          de: 'heavy_vineyards enthält die drei Weinberge über 5000 Kilo',
          en: 'heavy_vineyards holds the three vineyards above 5000 kilos'
        },
        sql: `
          WITH expected AS (
            SELECT vineyard, sum(kilos) AS total_kilos
            FROM deliveries
            GROUP BY vineyard
            HAVING sum(kilos) > 5000
          )
          SELECT NOT EXISTS (
            SELECT * FROM expected
            EXCEPT
            SELECT vineyard, total_kilos FROM heavy_vineyards
          ) AND NOT EXISTS (
            SELECT vineyard, total_kilos FROM heavy_vineyards
            EXCEPT
            SELECT * FROM expected
          ) AS ok;
        `
      },
      {
        label: {
          de: 'Die Tabelle deliveries blieb unangetastet',
          en: 'The deliveries table was left untouched'
        },
        sql: 'SELECT count(*) = 9 AND sum(kilos) = 21500 AS ok FROM deliveries;'
      }
    ]
  },
  tags: ['materialized-view', 'refresh', 'aggregation']
};
