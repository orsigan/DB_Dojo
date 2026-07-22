import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'permissions-lawfirm-self-service-timesheet',
  topic: ['permissions'],
  difficulty: 'Advanced',
  title: { de: 'Der eigene Stundenzettel', en: 'Your own timesheet, and only that' },
  prompt: {
    de: [
      'In der Kanzlei tragen alle Anwältinnen und Anwälte ihre abrechenbaren Stunden in die gemeinsame Tabelle `timesheet` ein.',
      'Direkter Zugriff auf `timesheet` soll niemand erhalten: Jede Person darf nur ihre eigenen Einträge sehen und neue Einträge für sich selbst anlegen, aber weder fremde Zeilen einsehen noch irgendeinen bestehenden Eintrag ändern oder löschen — auch nicht ihren eigenen.',
      '',
      'Ergänze die View `my_timesheet` um einen Filter auf die aufrufende Person und vergib darauf genau die Rechte, die ein solches Self-Service-Formular braucht — an PUBLIC, ohne einzelne Rollen zu benennen.',
      'Die Basistabelle `timesheet` bleibt für PUBLIC vollständig unzugänglich.'
    ].join('\n'),
    en: [
      'At the firm, every lawyer logs their own billable hours into the shared table `timesheet`.',
      "Nobody should get direct access to `timesheet`: each person may see only their own entries and add new entries for themselves, but never view another lawyer's rows or change or delete any existing entry — not even their own.",
      '',
      'Extend the view `my_timesheet` with a filter on the calling person and grant it exactly the privileges such a self-service form needs — to PUBLIC, without naming a single role.',
      'The base table `timesheet` stays completely inaccessible to PUBLIC.'
    ].join('\n')
  },
  seedSql: `
    DROP VIEW IF EXISTS my_timesheet;
    DROP TABLE IF EXISTS timesheet;

    CREATE TABLE timesheet (
      id integer PRIMARY KEY,
      lawyer text NOT NULL,
      logged_on date NOT NULL,
      hours numeric(4, 2) NOT NULL,
      matter text NOT NULL
    );

    INSERT INTO timesheet (id, lawyer, logged_on, hours, matter) VALUES
      (1, 'j.wagner', '2026-07-06', 3.50, 'Meyer ./. Bornholm AG'),
      (2, 'j.wagner', '2026-07-07', 2.00, 'Vertragspruefung Delta GmbH'),
      (3, 'l.hartig', '2026-07-06', 5.25, 'Nachlass Ostermann'),
      (4, 'l.hartig', '2026-07-08', 1.75, 'Beratung Steuerrecht'),
      (5, 's.brenner', '2026-07-07', 4.00, 'Fusion Nordwind und Kessler');
  `,
  starterSql: 'CREATE VIEW my_timesheet AS SELECT * FROM timesheet;',
  hints: [
    {
      text: {
        de: 'CURRENT_USER in der View-Definition sorgt dafür, dass eine einzige View für jede Anwältin und jeden Anwalt andere Zeilen zeigt — abhängig davon, wer die Abfrage gerade stellt.',
        en: 'CURRENT_USER inside the view definition means one single view definition shows different rows to every lawyer — depending on who happens to be running the query.'
      }
    },
    {
      text: {
        de: 'Die Rechte gehören auf die View, nicht auf `timesheet`: GRANT SELECT, INSERT ... TO PUBLIC macht `my_timesheet` zum einzigen Zugangsweg, während die Basistabelle für PUBLIC gesperrt bleibt.',
        en: 'The privileges belong on the view, not on `timesheet`: GRANT SELECT, INSERT ... TO PUBLIC makes `my_timesheet` the only way in, while the base table stays locked for PUBLIC.'
      }
    },
    {
      text: {
        de: 'UPDATE und DELETE einfach aus dem GRANT wegzulassen ist es, was bestehende Einträge aus Sicht aller anderen unveränderlich macht — einmal erfasst, bleibt ein Eintrag über diese View für niemanden bearbeitbar oder löschbar.',
        en: "Simply leaving UPDATE and DELETE out of the grant is what makes existing entries immutable from everyone else's point of view — once logged, an entry stays unchangeable and undeletable through this view for anyone."
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'Die View my_timesheet existiert',
          en: 'The view my_timesheet exists'
        },
        sql: "SELECT EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'my_timesheet') AS ok;"
      },
      {
        label: {
          de: 'my_timesheet filtert auf CURRENT_USER',
          en: 'my_timesheet filters on CURRENT_USER'
        },
        sql: "SELECT pg_get_viewdef('my_timesheet', true) ILIKE '%current_user%' AS ok;"
      },
      {
        label: {
          de: 'PUBLIC darf my_timesheet lesen',
          en: 'PUBLIC may read my_timesheet'
        },
        sql: `
          SELECT EXISTS (
            SELECT 1
            FROM pg_class AS c
            CROSS JOIN LATERAL aclexplode(c.relacl) AS a
            WHERE c.relname = 'my_timesheet'
              AND a.grantee = 0
              AND a.privilege_type = 'SELECT'
          ) AS ok;
        `
      },
      {
        label: {
          de: 'PUBLIC darf eigene Einträge in my_timesheet anlegen',
          en: 'PUBLIC may add its own entries through my_timesheet'
        },
        sql: `
          SELECT EXISTS (
            SELECT 1
            FROM pg_class AS c
            CROSS JOIN LATERAL aclexplode(c.relacl) AS a
            WHERE c.relname = 'my_timesheet'
              AND a.grantee = 0
              AND a.privilege_type = 'INSERT'
          ) AS ok;
        `
      },
      {
        label: {
          de: 'PUBLIC darf über my_timesheet weder ändern noch löschen',
          en: 'PUBLIC may neither update nor delete through my_timesheet'
        },
        sql: `
          SELECT NOT EXISTS (
            SELECT 1
            FROM pg_class AS c
            CROSS JOIN LATERAL aclexplode(c.relacl) AS a
            WHERE c.relname = 'my_timesheet'
              AND a.grantee = 0
              AND a.privilege_type IN ('UPDATE', 'DELETE')
          ) AS ok;
        `
      },
      {
        label: {
          de: 'timesheet selbst trägt kein Recht für PUBLIC',
          en: 'timesheet itself carries no privilege for PUBLIC'
        },
        sql: `
          SELECT NOT EXISTS (
            SELECT 1
            FROM pg_class AS c
            CROSS JOIN LATERAL aclexplode(c.relacl) AS a
            WHERE c.relname = 'timesheet'
              AND a.grantee = 0
          ) AS ok;
        `
      }
    ]
  },
  tags: ['current-user', 'view', 'grant', 'public', 'row-level']
};
