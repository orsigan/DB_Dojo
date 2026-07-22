import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'permissions-grant-option-audit-chain',
  topic: ['permissions'],
  difficulty: 'Profi',
  title: { de: 'Das Recht auf Weitergabe delegieren', en: 'Delegating the right to grant' },
  prompt: {
    de: [
      'Die externe Prüfung des Zahlungssystems leitet `audit_lead`, der das Team besetzt, ohne jedes Mal die DBA zu fragen.',
      'Beide Rollen existieren bereits und besitzen noch keine Rechte.',
      '',
      'Gib `audit_lead` SELECT auf `transactions` zusammen mit dem Recht, dieses Recht weiterzugeben.',
      'Wechsle dann selbst in die Rolle `audit_lead` und vergib einfaches SELECT auf `transactions` an `audit_junior` — der Junior muss lesen können, darf das Recht aber an niemanden weitergeben.',
      'Kehre am Ende zu deiner eigenen Identität zurück.'
    ].join('\n'),
    en: [
      'The external audit of the payment system is led by `audit_lead`, who staffs the team without asking the DBA every time.',
      'Both roles already exist and hold no privileges yet.',
      '',
      'Give `audit_lead` SELECT on `transactions` together with the right to pass that privilege on.',
      'Then act as `audit_lead` yourself and grant plain SELECT on `transactions` to `audit_junior` — the junior must be able to read, but must not be able to hand the privilege on to anyone else.',
      'Finish by returning to your own identity.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS transactions;
    DROP ROLE IF EXISTS audit_lead;
    DROP ROLE IF EXISTS audit_junior;

    CREATE ROLE audit_lead;
    CREATE ROLE audit_junior;

    CREATE TABLE transactions (
      id integer PRIMARY KEY,
      booked_on date NOT NULL,
      account text NOT NULL,
      amount numeric(12, 2) NOT NULL,
      reference text NOT NULL
    );

    INSERT INTO transactions (id, booked_on, account, amount, reference) VALUES
      (1, '2026-01-08', 'DE44 5001 0517 0001', -1250.00, 'rent january'),
      (2, '2026-01-09', 'DE44 5001 0517 0001', 4300.00, 'salary'),
      (3, '2026-01-22', 'DE44 5001 0517 0002', -89.90, 'office supplies'),
      (4, '2026-02-02', 'DE44 5001 0517 0002', -1250.00, 'rent february');
  `,
  starterSql: 'GRANT SELECT ON transactions TO audit_lead;',
  hints: [
    {
      text: {
        de: 'WITH GRANT OPTION macht aus einem Empfänger einen Grantor; ohne diese Klausel darf eine Rolle ein Recht nutzen, aber nie weitergeben.',
        en: 'WITH GRANT OPTION is what turns a receiver into a grantor; without it a role may use a privilege but never pass it on.'
      }
    },
    {
      text: {
        de: 'PGlite führt alles über eine einzige Verbindung aus, daher versetzt dich SET ROLE vorübergehend in eine andere Rolle — ein in diesem Zustand ausgeführtes GRANT wird mit dieser Rolle als Grantor protokolliert. RESET ROLE bringt dich zurück.',
        en: 'PGlite runs everything through a single connection, so SET ROLE is how you temporarily act as another role — a GRANT issued in that state is recorded with that role as its grantor. RESET ROLE takes you back.'
      }
    },
    {
      text: {
        de: 'Lässt du beim zweiten GRANT einfach WITH GRANT OPTION weg, stoppt die Weitergabekette genau beim Junior.',
        en: 'Simply leaving WITH GRANT OPTION off the second grant is what makes the delegation chain stop at the junior.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'audit_lead darf transactions lesen und das Recht weitergeben',
          en: 'audit_lead may read transactions and pass that privilege on'
        },
        sql: "SELECT has_table_privilege('audit_lead', 'transactions', 'SELECT WITH GRANT OPTION') AS ok;"
      },
      {
        label: {
          de: 'audit_junior darf transactions lesen',
          en: 'audit_junior may read transactions'
        },
        sql: "SELECT has_table_privilege('audit_junior', 'transactions', 'SELECT') AS ok;"
      },
      {
        label: {
          de: 'Der Junior hat sein Recht von audit_lead erhalten, nicht vom Tabelleneigentümer',
          en: 'The junior received its privilege from audit_lead, not from the table owner'
        },
        sql: `
          SELECT EXISTS (
            SELECT 1
            FROM pg_class AS c
            CROSS JOIN LATERAL aclexplode(c.relacl) AS a
            WHERE c.relname = 'transactions'
              AND a.grantee = 'audit_junior'::regrole::oid
              AND a.grantor = 'audit_lead'::regrole::oid
              AND a.privilege_type = 'SELECT'
          ) AS ok;
        `
      },
      {
        label: {
          de: 'Die Weitergabekette stoppt bei audit_junior',
          en: 'The delegation chain stops at audit_junior'
        },
        sql: "SELECT NOT has_table_privilege('audit_junior', 'transactions', 'SELECT WITH GRANT OPTION') AS ok;"
      },
      {
        label: {
          de: 'Keiner der beiden Prüfer darf die Buchungen ändern',
          en: 'Neither auditor may change the bookings'
        },
        sql: `
          SELECT NOT has_table_privilege('audit_lead', 'transactions', 'UPDATE')
             AND NOT has_table_privilege('audit_junior', 'transactions', 'UPDATE')
             AND NOT has_table_privilege('audit_junior', 'transactions', 'DELETE') AS ok;
        `
      },
      {
        label: {
          de: 'Die Sitzung läuft wieder unter ihrer ursprünglichen Identität',
          en: 'The session runs under its original identity again'
        },
        sql: 'SELECT current_user = session_user AS ok;'
      }
    ]
  },
  tags: ['grant-option', 'delegation', 'set-role']
};
