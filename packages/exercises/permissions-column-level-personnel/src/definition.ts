import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'permissions-column-level-personnel',
  topic: ['permissions'],
  difficulty: 'Advanced',
  title: {
    de: 'Spaltengenauer Zugriff für die Personalabteilung',
    en: 'Column-level access for the HR desk'
  },
  prompt: {
    de: [
      'Die Personalabteilung hält die Kontaktdaten der Personalakte aktuell. Gehaltsdaten gehen sie nichts an.',
      '',
      'Die Rolle `hr_assistant` existiert bereits. Auf der Tabelle `employees` benötigt sie:',
      '- SELECT auf die Spalten `id`, `full_name`, `department` und `work_email`,',
      '- UPDATE auf die Spalten `department` und `work_email`.',
      '',
      'Die Spalten `salary` und `bank_account` müssen unsichtbar bleiben, und `hr_assistant` darf am Ende kein Recht besitzen, das die gesamte Tabelle abdeckt.'
    ].join('\n'),
    en: [
      'The HR desk keeps the contact details of the personnel file up to date. Pay data is none of their business.',
      '',
      'The role `hr_assistant` already exists. On the table `employees` it needs:',
      '- SELECT on the columns `id`, `full_name`, `department` and `work_email`,',
      '- UPDATE on the columns `department` and `work_email`.',
      '',
      'The columns `salary` and `bank_account` must stay invisible, and `hr_assistant` must not end up with a privilege that covers the whole table.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS employees;
    DROP ROLE IF EXISTS hr_assistant;

    CREATE ROLE hr_assistant;

    CREATE TABLE employees (
      id integer PRIMARY KEY,
      full_name text NOT NULL,
      department text NOT NULL,
      work_email text NOT NULL,
      salary numeric(10, 2) NOT NULL,
      bank_account text NOT NULL
    );

    INSERT INTO employees (id, full_name, department, work_email, salary, bank_account) VALUES
      (1, 'Marisol Vega', 'Logistics', 'vega@example.org', 4100.00, 'DE02120300000000202051'),
      (2, 'Tobias Ehlert', 'Logistics', 'ehlert@example.org', 3850.00, 'DE02500105170137075030'),
      (3, 'Priya Ramanathan', 'Controlling', 'ramanathan@example.org', 5600.00, 'DE02100500000054540402'),
      (4, 'Jonas Kirchner', 'Facility', 'kirchner@example.org', 3200.00, 'DE02300209000106531065');
  `,
  starterSql: 'GRANT SELECT (id, full_name) ON employees TO hr_assistant;',
  hints: [
    {
      text: {
        de: 'Ein Recht lässt sich auf einzelne Spalten einschränken, indem man sie in Klammern direkt nach dem Rechtenamen aufzählt.',
        en: 'A privilege can be narrowed down to single columns by listing them in parentheses directly after the privilege name.'
      }
    },
    {
      text: {
        de: 'Ein tabellenweites GRANT SELECT würde salary und bank_account stillschweigend einschließen — genau dafür gibt es Spaltenrechte.',
        en: 'A table-wide GRANT SELECT would silently include salary and bank_account — column privileges exist exactly to avoid that.'
      }
    },
    {
      text: {
        de: 'has_table_privilege meldet nur dann true, wenn ein Recht jede Spalte abdeckt — ein rein spaltenbasiertes Grant lässt die Antwort auf Tabellenebene also false.',
        en: 'has_table_privilege only reports true when a privilege covers every column, so a purely column-based grant leaves the table-level answer false.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'hr_assistant darf die vier Kontaktspalten lesen',
          en: 'hr_assistant may read the four contact columns'
        },
        sql: `
          SELECT has_column_privilege('hr_assistant', 'employees', 'id', 'SELECT')
             AND has_column_privilege('hr_assistant', 'employees', 'full_name', 'SELECT')
             AND has_column_privilege('hr_assistant', 'employees', 'department', 'SELECT')
             AND has_column_privilege('hr_assistant', 'employees', 'work_email', 'SELECT') AS ok;
        `
      },
      {
        label: {
          de: 'hr_assistant darf department und work_email ändern',
          en: 'hr_assistant may update department and work_email'
        },
        sql: `
          SELECT has_column_privilege('hr_assistant', 'employees', 'department', 'UPDATE')
             AND has_column_privilege('hr_assistant', 'employees', 'work_email', 'UPDATE') AS ok;
        `
      },
      {
        label: {
          de: 'salary und bank_account bleiben unsichtbar',
          en: 'salary and bank_account stay invisible'
        },
        sql: `
          SELECT NOT has_column_privilege('hr_assistant', 'employees', 'salary', 'SELECT')
             AND NOT has_column_privilege('hr_assistant', 'employees', 'bank_account', 'SELECT') AS ok;
        `
      },
      {
        label: {
          de: 'Namen und IDs können nicht überschrieben werden',
          en: 'names and ids cannot be rewritten'
        },
        sql: `
          SELECT NOT has_column_privilege('hr_assistant', 'employees', 'full_name', 'UPDATE')
             AND NOT has_column_privilege('hr_assistant', 'employees', 'id', 'UPDATE') AS ok;
        `
      },
      {
        label: {
          de: 'kein Recht deckt die gesamte employees-Tabelle ab',
          en: 'no privilege covers the whole employees table'
        },
        sql: `
          SELECT NOT has_table_privilege('hr_assistant', 'employees', 'SELECT')
             AND NOT has_table_privilege('hr_assistant', 'employees', 'UPDATE')
             AND NOT has_table_privilege('hr_assistant', 'employees', 'DELETE') AS ok;
        `
      }
    ]
  },
  tags: ['grant', 'column-privileges', 'privacy']
};
