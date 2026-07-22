import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'permissions-analyst-read-access',
  topic: ['permissions'],
  difficulty: 'Advanced',
  title: { de: 'Lesezugriff für Analysten', en: 'Read-only access for analysts' },
  prompt: {
    de: [
      'Analysten müssen die Tabelle `reports` lesen können, aber nicht mehr.',
      '',
      'Erstelle eine Rolle namens `analyst` und gib ihr SELECT-Zugriff auf `reports`.'
    ].join('\n'),
    en: [
      'Analysts need to read the `reports` table, but nothing more.',
      '',
      'Create a role named `analyst` and give it SELECT access on `reports`.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS reports;
    DROP ROLE IF EXISTS analyst;

    CREATE TABLE reports (
      id integer PRIMARY KEY,
      title text NOT NULL
    );

    INSERT INTO reports (id, title) VALUES
      (1, 'Q1 revenue'),
      (2, 'Q2 revenue');
  `,
  starterSql: 'CREATE ROLE analyst;',
  hints: [
    {
      text: {
        de: 'SELECT wird pro Tabelle vergeben: GRANT SELECT ON <Tabelle> TO <Rolle>.',
        en: 'SELECT is granted per table: GRANT SELECT ON <table> TO <role>.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: { de: 'Die Rolle "analyst" existiert', en: 'The role "analyst" exists' },
        sql: "SELECT count(*) > 0 AS ok FROM pg_roles WHERE rolname = 'analyst';"
      },
      {
        label: {
          de: 'analyst darf SELECT auf reports ausführen',
          en: 'analyst may SELECT from reports'
        },
        sql: "SELECT has_table_privilege('analyst', 'reports', 'SELECT') AS ok;"
      }
    ]
  },
  tags: ['role', 'grant', 'security']
};
