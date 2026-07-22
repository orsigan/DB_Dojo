import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'permissions-public-opening-hours',
  topic: ['permissions'],
  difficulty: 'Beginner',
  title: { de: 'Öffnungszeiten für alle', en: 'Opening hours for everyone' },
  prompt: {
    de: [
      'Die Stadtbibliothek möchte, dass ihre Öffnungszeiten für jeden Datenbanknutzer lesbar sind — für die, die es heute schon gibt, und für die, die erst nächstes Jahr angelegt werden.',
      '',
      'Vergib SELECT auf `opening_hours` an alle Nutzer auf einmal, ohne eine einzelne Rolle zu nennen.',
      'Lesen genügt: Niemand darf die Tabelle ändern.',
      'Die Tabelle `member_addresses` bleibt vertraulich und darf für niemanden lesbar werden.'
    ].join('\n'),
    en: [
      'The city library wants its opening hours to be readable by every database user — the ones that exist today and the ones that will be created next year.',
      '',
      'Grant SELECT on `opening_hours` to all users at once, without naming a single role.',
      'Reading is enough: nobody may change the table.',
      'The table `member_addresses` stays confidential and must not become readable for anyone.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS opening_hours;
    DROP TABLE IF EXISTS member_addresses;
    DROP ROLE IF EXISTS visitor;
    DROP ROLE IF EXISTS press_visitor;
    DROP ROLE IF EXISTS volunteer;

    CREATE ROLE visitor;
    CREATE ROLE press_visitor;
    CREATE ROLE volunteer;

    CREATE TABLE opening_hours (
      weekday text PRIMARY KEY,
      opens time NOT NULL,
      closes time NOT NULL
    );

    CREATE TABLE member_addresses (
      member_id integer PRIMARY KEY,
      full_name text NOT NULL,
      street text NOT NULL,
      city text NOT NULL
    );

    INSERT INTO opening_hours (weekday, opens, closes) VALUES
      ('Monday', '09:00', '18:00'),
      ('Tuesday', '09:00', '18:00'),
      ('Wednesday', '09:00', '20:00'),
      ('Thursday', '09:00', '18:00'),
      ('Friday', '09:00', '16:00');

    INSERT INTO member_addresses (member_id, full_name, street, city) VALUES
      (1, 'Nora Feldkamp', 'Ahornweg 4', 'Bremen'),
      (2, 'Ilias Petrou', 'Kanalstrasse 17', 'Bremen'),
      (3, 'Wanda Broich', 'Am Deich 2', 'Vegesack');
  `,
  starterSql: 'GRANT SELECT ON opening_hours TO visitor;',
  hints: [
    {
      text: {
        de: 'PUBLIC ist keine Rolle, die du anlegen musst — es ist der eingebaute Sammelempfänger, der für jeden aktuellen und zukünftigen Nutzer steht.',
        en: 'PUBLIC is not a role you have to create — it is the built-in catch-all grantee that stands for every current and future user.'
      }
    },
    {
      text: {
        de: 'Ein an PUBLIC vergebenes Recht kommt zu den persönlichen Rechten einer Rolle hinzu, sodass eine Rolle die Tabelle lesen kann, obwohl ihr nie direkt etwas gewährt wurde.',
        en: 'A privilege handed to PUBLIC is added on top of the personal privileges of a role, so a role can read the table even though nothing was ever granted to it directly.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'opening_hours trägt ein SELECT-Recht für PUBLIC',
          en: 'opening_hours carries a SELECT privilege for PUBLIC'
        },
        sql: `
          SELECT EXISTS (
            SELECT 1
            FROM pg_class AS c
            CROSS JOIN LATERAL aclexplode(c.relacl) AS a
            WHERE c.relname = 'opening_hours'
              AND a.grantee = 0
              AND a.privilege_type = 'SELECT'
          ) AS ok;
        `
      },
      {
        label: {
          de: 'volunteer kann opening_hours ohne eigenes Grant lesen',
          en: 'volunteer can read opening_hours without a grant of its own'
        },
        sql: "SELECT has_table_privilege('volunteer', 'opening_hours', 'SELECT') AS ok;"
      },
      {
        label: {
          de: 'press_visitor kann opening_hours ebenfalls lesen',
          en: 'press_visitor can read opening_hours as well'
        },
        sql: "SELECT has_table_privilege('press_visitor', 'opening_hours', 'SELECT') AS ok;"
      },
      {
        label: {
          de: 'opening_hours bleibt für alle nur lesbar',
          en: 'opening_hours stays read-only for everyone'
        },
        sql: `
          SELECT NOT has_table_privilege('press_visitor', 'opening_hours', 'INSERT')
             AND NOT has_table_privilege('volunteer', 'opening_hours', 'UPDATE')
             AND NOT has_table_privilege('visitor', 'opening_hours', 'DELETE') AS ok;
        `
      },
      {
        label: {
          de: 'member_addresses bleibt vertraulich',
          en: 'member_addresses remains confidential'
        },
        sql: `
          SELECT NOT has_table_privilege('press_visitor', 'member_addresses', 'SELECT')
             AND NOT has_table_privilege('volunteer', 'member_addresses', 'SELECT') AS ok;
        `
      }
    ]
  },
  tags: ['grant', 'public', 'select']
};
