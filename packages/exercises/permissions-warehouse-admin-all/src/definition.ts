import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'permissions-warehouse-admin-all',
  topic: ['permissions'],
  difficulty: 'Advanced',
  title: { de: 'Ein Login-Konto für das Lager', en: 'A login account for the warehouse' },
  prompt: {
    de: [
      'Das Logistikzentrum bekommt ein eigenes Datenbankkonto. Es muss sich selbstständig anmelden können — nicht nur als Bündel von Rechten existieren.',
      '',
      'Erstelle ein Login-Konto namens `warehouse_admin`.',
      'Auf `shipments` übernimmt es vollständig: gib ihm jedes Recht, das die Tabelle bietet.',
      'Die Frachtführer-Stammdaten in `carriers` werden von der Einkaufsabteilung gepflegt, daher darf `warehouse_admin` sie nur lesen.'
    ].join('\n'),
    en: [
      'The logistics centre gets its own database account. It must be able to connect on its own — not just exist as a bundle of privileges.',
      '',
      'Create a login account named `warehouse_admin`.',
      'On `shipments` it takes over completely: give it every privilege the table offers.',
      'The carrier master data in `carriers` is maintained by the purchasing department, so `warehouse_admin` may only read it.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS shipments;
    DROP TABLE IF EXISTS carriers;
    DROP ROLE IF EXISTS warehouse_admin;

    CREATE TABLE carriers (
      id integer PRIMARY KEY,
      name text NOT NULL,
      hub text NOT NULL
    );

    CREATE TABLE shipments (
      id integer PRIMARY KEY,
      carrier_id integer NOT NULL REFERENCES carriers (id),
      tracking_code text NOT NULL UNIQUE,
      dispatched_on date NOT NULL,
      weight_kg numeric(8, 2) NOT NULL
    );

    INSERT INTO carriers (id, name, hub) VALUES
      (1, 'Nordfracht', 'Hamburg'),
      (2, 'Alpenlogistik', 'Rosenheim'),
      (3, 'Rheinkurier', 'Duisburg');

    INSERT INTO shipments (id, carrier_id, tracking_code, dispatched_on, weight_kg) VALUES
      (1, 1, 'NF-88120', '2026-04-02', 312.50),
      (2, 1, 'NF-88121', '2026-04-02', 18.00),
      (3, 2, 'AL-40093', '2026-04-03', 940.75),
      (4, 3, 'RK-11207', '2026-04-05', 64.20);
  `,
  starterSql: 'CREATE USER warehouse_admin;',
  hints: [
    {
      text: {
        de: 'CREATE USER ist nichts anderes als CREATE ROLE mit dem LOGIN-Attribut — eine Rolle ohne dieses Attribut kann Rechte besitzen, sich aber nie anmelden.',
        en: 'CREATE USER is nothing but CREATE ROLE with the LOGIN attribute — a role created without it can hold privileges but can never connect.'
      }
    },
    {
      text: {
        de: 'ALL PRIVILEGES steht als Platzhalter für jedes Recht, das für den Objekttyp sinnvoll ist, was bei einer Tabelle auch TRUNCATE, REFERENCES und TRIGGER einschließt.',
        en: 'ALL PRIVILEGES is a placeholder for every privilege that makes sense for the object type, which for a table also includes TRUNCATE, REFERENCES and TRIGGER.'
      }
    },
    {
      text: {
        de: 'Zwei Objekte, zwei unterschiedliche Bedürfnisse: Der Platzhalter passt für die eine Tabelle und ist für die andere klar falsch.',
        en: 'Two objects, two different needs: the placeholder is right for one table and clearly wrong for the other.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'warehouse_admin existiert und darf sich anmelden',
          en: 'warehouse_admin exists and may log in'
        },
        sql: "SELECT count(*) = 1 AS ok FROM pg_roles WHERE rolname = 'warehouse_admin' AND rolcanlogin;"
      },
      {
        label: {
          de: 'warehouse_admin besitzt jedes Recht auf shipments',
          en: 'warehouse_admin holds every privilege on shipments'
        },
        sql: `
          SELECT has_table_privilege('warehouse_admin', 'shipments', 'SELECT')
             AND has_table_privilege('warehouse_admin', 'shipments', 'INSERT')
             AND has_table_privilege('warehouse_admin', 'shipments', 'UPDATE')
             AND has_table_privilege('warehouse_admin', 'shipments', 'DELETE')
             AND has_table_privilege('warehouse_admin', 'shipments', 'TRUNCATE')
             AND has_table_privilege('warehouse_admin', 'shipments', 'REFERENCES')
             AND has_table_privilege('warehouse_admin', 'shipments', 'TRIGGER') AS ok;
        `
      },
      {
        label: {
          de: 'warehouse_admin darf die Frachtführer-Stammdaten lesen',
          en: 'warehouse_admin may read the carrier master data'
        },
        sql: "SELECT has_table_privilege('warehouse_admin', 'carriers', 'SELECT') AS ok;"
      },
      {
        label: {
          de: 'warehouse_admin darf die Frachtführer-Stammdaten nicht ändern',
          en: 'warehouse_admin may not change the carrier master data'
        },
        sql: `
          SELECT NOT has_table_privilege('warehouse_admin', 'carriers', 'INSERT')
             AND NOT has_table_privilege('warehouse_admin', 'carriers', 'UPDATE')
             AND NOT has_table_privilege('warehouse_admin', 'carriers', 'DELETE')
             AND NOT has_table_privilege('warehouse_admin', 'carriers', 'TRUNCATE') AS ok;
        `
      }
    ]
  },
  tags: ['create-user', 'all-privileges', 'grant']
};
