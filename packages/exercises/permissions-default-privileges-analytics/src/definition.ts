import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'permissions-default-privileges-analytics',
  topic: ['permissions'],
  difficulty: 'Ultra',
  title: {
    de: 'Rechte für Tabellen, die es noch gar nicht gibt',
    en: 'Privileges for tables that do not exist yet'
  },
  prompt: {
    de: [
      'Das BI-Team wirft fast jede Woche eine neue Tabelle ins Schema `analytics`, und jedes Mal muss jemand daran denken, ein GRANT nachzuziehen. Löse das einmal, statt es wöchentlich zu wiederholen.',
      'Die Rolle `report_reader` existiert bereits und besitzt noch keine Rechte.',
      '',
      'Stelle sicher, dass `report_reader`:',
      '- das Schema `analytics` erreichen kann,',
      '- SELECT auf die dort heute schon vorhandenen Tabellen ausführen darf (`analytics.daily_sales`, `analytics.stock_levels`),',
      '- und SELECT auf jede Tabelle ausführen darf, die ab jetzt in `analytics` angelegt wird, ohne dass jemand ein weiteres GRANT ausführt.',
      '',
      'Nur lesend, und ausschließlich innerhalb von `analytics` — das Schema `staging` bleibt tabu.'
    ].join('\n'),
    en: [
      'The BI team drops a new table into the `analytics` schema almost every week, and every time somebody has to remember to re-run a GRANT. Solve that once instead of weekly.',
      'The role `report_reader` already exists and holds nothing.',
      '',
      'Make sure that `report_reader`:',
      '- can reach the schema `analytics`,',
      '- may SELECT from the tables that live there today (`analytics.daily_sales`, `analytics.stock_levels`),',
      '- and may SELECT from every table created in `analytics` from now on, without anybody running another GRANT.',
      '',
      'Reading only, and strictly inside `analytics` — the schema `staging` stays off limits.'
    ].join('\n')
  },
  seedSql: `
    DROP FUNCTION IF EXISTS future_table_is_readable();
    DROP SCHEMA IF EXISTS analytics CASCADE;
    DROP SCHEMA IF EXISTS staging CASCADE;

    DO $seed$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'report_reader') THEN
        EXECUTE 'DROP OWNED BY report_reader';
      END IF;
    END
    $seed$;

    DROP ROLE IF EXISTS report_reader;

    CREATE ROLE report_reader;
    CREATE SCHEMA analytics;
    CREATE SCHEMA staging;

    CREATE TABLE analytics.daily_sales (
      sold_on date PRIMARY KEY,
      revenue numeric(12, 2) NOT NULL,
      orders integer NOT NULL
    );

    CREATE TABLE analytics.stock_levels (
      sku text PRIMARY KEY,
      warehouse text NOT NULL,
      quantity integer NOT NULL
    );

    CREATE TABLE staging.raw_events (
      id integer PRIMARY KEY,
      payload text NOT NULL
    );

    INSERT INTO analytics.daily_sales (sold_on, revenue, orders) VALUES
      ('2026-06-01', 18420.55, 214),
      ('2026-06-02', 15990.00, 187),
      ('2026-06-03', 22310.40, 256);

    INSERT INTO analytics.stock_levels (sku, warehouse, quantity) VALUES
      ('KB-2210', 'Bremen', 340),
      ('KB-2211', 'Bremen', 12),
      ('MS-0044', 'Leipzig', 908);

    INSERT INTO staging.raw_events (id, payload) VALUES
      (1, '{"kind":"click"}'),
      (2, '{"kind":"purchase"}');

    CREATE FUNCTION future_table_is_readable() RETURNS boolean AS $probe$
    DECLARE
      readable boolean;
    BEGIN
      DROP TABLE IF EXISTS analytics.next_weeks_report;
      CREATE TABLE analytics.next_weeks_report (id integer);
      readable := has_table_privilege('report_reader', 'analytics.next_weeks_report', 'SELECT');
      DROP TABLE analytics.next_weeks_report;
      RETURN readable;
    END
    $probe$ LANGUAGE plpgsql;
  `,
  starterSql: 'GRANT USAGE ON SCHEMA analytics TO report_reader;',
  hints: [
    {
      text: {
        de: 'Ein normales GRANT wirkt immer nur auf Objekte, die im Moment seiner Ausführung bereits existieren — eine Tabelle von morgen kann es nie erreichen.',
        en: 'A plain GRANT always acts on objects that exist at the moment it runs — it can never reach a table that will be created tomorrow.'
      }
    },
    {
      text: {
        de: 'PostgreSQL führt eine zweite, separate Liste von Rechten, die automatisch angewendet werden, sobald ein neues Objekt eines bestimmten Typs in einem Schema angelegt wird. Diese Liste zu ändern ist eine eigene Anweisung, kein GRANT.',
        en: 'PostgreSQL keeps a second, separate list of privileges that are applied automatically whenever a new object of a given kind is created in a schema. Changing that list is a statement of its own, not a GRANT.'
      }
    },
    {
      text: {
        de: 'Diese automatischen Rechte werden pro erstellender Rolle und pro Schema hinterlegt — sie greifen also nur für Objekte, die dieselbe Rolle im genannten Schema anlegt.',
        en: 'Those automatic privileges are recorded per creating role and per schema, so they only take effect for objects created by the same role in the schema you named.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'report_reader darf das Schema analytics betreten',
          en: 'report_reader may enter the analytics schema'
        },
        sql: "SELECT has_schema_privilege('report_reader', 'analytics', 'USAGE') AS ok;"
      },
      {
        label: {
          de: 'report_reader darf die bereits vorhandenen Tabellen lesen',
          en: 'report_reader may read the tables that already existed'
        },
        sql: `
          SELECT has_table_privilege('report_reader', 'analytics.daily_sales', 'SELECT')
             AND has_table_privilege('report_reader', 'analytics.stock_levels', 'SELECT') AS ok;
        `
      },
      {
        label: {
          de: 'Eine ab jetzt in analytics angelegte Tabelle ist lesbar, ohne dass ein weiteres GRANT nötig ist',
          en: 'A table created in analytics from now on is readable without another GRANT'
        },
        sql: 'SELECT future_table_is_readable() AS ok;'
      },
      {
        label: {
          de: 'Das automatische Recht ist für das Schema analytics hinterlegt',
          en: 'The automatic privilege is registered for the analytics schema'
        },
        sql: `
          SELECT EXISTS (
            SELECT 1
            FROM pg_default_acl AS d
            JOIN pg_namespace AS n ON n.oid = d.defaclnamespace
            CROSS JOIN LATERAL aclexplode(d.defaclacl) AS a
            WHERE n.nspname = 'analytics'
              AND d.defaclobjtype = 'r'
              AND a.grantee = 'report_reader'::regrole::oid
              AND a.privilege_type = 'SELECT'
          ) AS ok;
        `
      },
      {
        label: { de: 'report_reader bleibt reine Leserolle', en: 'report_reader stays read-only' },
        sql: `
          SELECT NOT has_table_privilege('report_reader', 'analytics.daily_sales', 'INSERT')
             AND NOT has_table_privilege('report_reader', 'analytics.daily_sales', 'UPDATE')
             AND NOT has_table_privilege('report_reader', 'analytics.stock_levels', 'DELETE')
             AND NOT has_schema_privilege('report_reader', 'analytics', 'CREATE') AS ok;
        `
      },
      {
        label: { de: 'Das Schema staging bleibt tabu', en: 'The staging schema stays off limits' },
        sql: `
          SELECT NOT has_schema_privilege('report_reader', 'staging', 'USAGE')
             AND NOT has_table_privilege('report_reader', 'staging.raw_events', 'SELECT') AS ok;
        `
      }
    ]
  },
  tags: ['default-privileges', 'schema', 'grant', 'automation']
};
