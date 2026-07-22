import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'permissions-revoke-intern-write',
  topic: ['permissions'],
  difficulty: 'Beginner',
  title: {
    de: 'Ein Praktikum auf Lesezugriff zurückstutzen',
    en: 'Trimming an intern back to read-only'
  },
  prompt: {
    de: [
      'Beim Onboarding wurde dem Praktikanten in der Buchhaltung ALL PRIVILEGES auf `invoices` eingeräumt. Das war zu großzügig.',
      '',
      'Nimm die Rechte zurück, sodass die Rolle `intern` am Ende nur noch SELECT auf `invoices` besitzt und sonst gar nichts.',
      'Lösche die Rolle nicht und rühre `payroll_runs` nicht an.'
    ].join('\n'),
    en: [
      'During onboarding the accounting intern was handed ALL PRIVILEGES on `invoices`. That was too generous.',
      '',
      'Take the privileges back so that the role `intern` ends up holding SELECT on `invoices` and nothing else at all.',
      'Do not drop the role and do not touch `payroll_runs`.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS invoices;
    DROP TABLE IF EXISTS payroll_runs;
    DROP ROLE IF EXISTS intern;

    CREATE ROLE intern;

    CREATE TABLE invoices (
      id integer PRIMARY KEY,
      customer text NOT NULL,
      amount numeric(10, 2) NOT NULL,
      issued_on date NOT NULL,
      paid boolean NOT NULL DEFAULT false
    );

    CREATE TABLE payroll_runs (
      id integer PRIMARY KEY,
      period text NOT NULL,
      gross_total numeric(12, 2) NOT NULL
    );

    INSERT INTO invoices (id, customer, amount, issued_on, paid) VALUES
      (1, 'Nordwind GmbH', 1240.00, '2026-01-14', true),
      (2, 'Seebruecke AG', 380.50, '2026-02-03', false),
      (3, 'Halden & Sohn', 7620.00, '2026-02-19', false);

    INSERT INTO payroll_runs (id, period, gross_total) VALUES
      (1, '2026-01', 184300.00),
      (2, '2026-02', 186950.00);

    GRANT ALL PRIVILEGES ON invoices TO intern;
  `,
  starterSql: [
    'SELECT grantee, privilege_type',
    'FROM information_schema.role_table_grants',
    "WHERE table_name = 'invoices';"
  ].join('\n'),
  hints: [
    {
      text: {
        de: 'REVOKE ALL PRIVILEGES räumt in einer Anweisung alles ab — danach kannst du das eine Recht zurückgeben, das bestehen bleiben soll.',
        en: 'REVOKE ALL PRIVILEGES clears the slate in one statement — afterwards you can hand back the single privilege that is supposed to remain.'
      }
    },
    {
      text: {
        de: 'INSERT, UPDATE und DELETE aufzuzählen reicht nicht: ALL PRIVILEGES auf einer Tabelle umfasst auch TRUNCATE, REFERENCES und TRIGGER.',
        en: 'Listing INSERT, UPDATE and DELETE is not enough: ALL PRIVILEGES on a table also covers TRUNCATE, REFERENCES and TRIGGER.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'intern existiert noch und darf invoices lesen',
          en: 'intern still exists and may read invoices'
        },
        sql: "SELECT has_table_privilege('intern', 'invoices', 'SELECT') AS ok;"
      },
      {
        label: {
          de: 'intern kann invoices nicht mehr ändern',
          en: 'intern can no longer change invoices'
        },
        sql: `
          SELECT NOT has_table_privilege('intern', 'invoices', 'INSERT')
             AND NOT has_table_privilege('intern', 'invoices', 'UPDATE')
             AND NOT has_table_privilege('intern', 'invoices', 'DELETE')
             AND NOT has_table_privilege('intern', 'invoices', 'TRUNCATE') AS ok;
        `
      },
      {
        label: {
          de: 'SELECT ist das einzige Recht, das intern auf invoices besitzt',
          en: 'SELECT is the only privilege intern holds on invoices'
        },
        sql: `
          SELECT count(*) = 1 AND bool_and(a.privilege_type = 'SELECT') AS ok
          FROM pg_class AS c
          CROSS JOIN LATERAL aclexplode(c.relacl) AS a
          WHERE c.relname = 'invoices'
            AND a.grantee = 'intern'::regrole::oid;
        `
      },
      {
        label: { de: 'payroll_runs wurde nicht angetastet', en: 'payroll_runs was left alone' },
        sql: "SELECT NOT has_table_privilege('intern', 'payroll_runs', 'SELECT') AS ok;"
      }
    ]
  },
  tags: ['revoke', 'privileges', 'accounting']
};
