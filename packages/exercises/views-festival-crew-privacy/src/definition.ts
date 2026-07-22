import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'views-festival-crew-privacy',
  topic: ['views'],
  difficulty: 'Advanced',
  title: {
    de: 'Eine Datenschutz-Sicht für die Festival-Crew',
    en: 'A privacy view for the festival crew'
  },
  prompt: {
    de: [
      'Der Freiwilligenkoordinator eines Musikfestivals braucht eine Schichtliste, und diese Liste wird',
      'ausgedruckt und an die Backstage-Wand gepinnt. Zahlungsdetails und Privatadressen dürfen niemals',
      'das Büro verlassen, und Crew-Mitglieder, die ihre Zustimmung verweigert haben, dürfen gar nicht erst gelistet werden.',
      '',
      'Erstelle eine Sicht namens `crew_roster` auf `crew`, die genau die Spalten',
      '`full_name`, `stage_role`, `shift_start` und `shift_end` offenlegt, und nur die Zeilen, bei denen',
      '`publish_consent` wahr ist.',
      'Die Spalten `day_fee`, `iban` und `home_address` dürfen über die Sicht nicht erreichbar sein.'
    ].join('\n'),
    en: [
      'The volunteer coordinator of a music festival needs a shift list, and that list will be',
      'printed and pinned to the backstage wall. Payment details and home addresses must never',
      'leave the office, and crew members who withheld their consent must not be listed at all.',
      '',
      'Create a view named `crew_roster` over `crew` that exposes exactly the columns',
      '`full_name`, `stage_role`, `shift_start` and `shift_end`, and only the rows where',
      '`publish_consent` is true.',
      'The columns `day_fee`, `iban` and `home_address` must not be reachable through the view.'
    ].join('\n')
  },
  seedSql: `
    DROP VIEW IF EXISTS crew_roster;
    DROP TABLE IF EXISTS crew;

    CREATE TABLE crew (
      id integer PRIMARY KEY,
      full_name text NOT NULL,
      stage_role text NOT NULL,
      shift_start time NOT NULL,
      shift_end time NOT NULL,
      day_fee numeric NOT NULL,
      iban text NOT NULL,
      home_address text NOT NULL,
      publish_consent boolean NOT NULL
    );

    INSERT INTO crew (id, full_name, stage_role, shift_start, shift_end, day_fee, iban, home_address, publish_consent) VALUES
      (1, 'Juno Faerber', 'Stage hand', '08:00', '16:00', 180.00, 'DE12500105170648489890', 'Ackerweg 4, Bremen', true),
      (2, 'Kwame Osei', 'Front of house', '14:00', '23:00', 260.00, 'DE44500105175407324931', 'Lindenring 22, Kiel', true),
      (3, 'Selma Rautio', 'Monitor engineer', '13:00', '22:00', 240.00, 'DE89370400440532013000', 'Hafenstrasse 9, Rostock', false),
      (4, 'Bo Lindqvist', 'Rigger', '06:00', '14:00', 300.00, 'DE02120300000000202051', 'Talgasse 17, Erfurt', true),
      (5, 'Nadia Cerny', 'Backline tech', '15:00', '23:30', 210.00, 'DE02100500000054540402', 'Muehlenweg 3, Jena', false),
      (6, 'Theo Marchetti', 'Stage hand', '16:00', '23:59', 180.00, 'DE72500105176987654321', 'Domplatz 1, Passau', true);
  `,
  starterSql: 'CREATE VIEW crew_roster AS\nSELECT full_name, stage_role, day_fee\nFROM crew;',
  hints: [
    {
      text: {
        de: 'Attribute verbergen und Zeilen verbergen sind zwei verschiedene Aufgaben: Die SELECT-Liste entscheidet, welche Spalten existieren, die WHERE-Klausel entscheidet, welche Zeilen existieren.',
        en: 'Hiding attributes and hiding rows are two different jobs: the SELECT list decides which columns exist, the WHERE clause decides which rows exist.'
      }
    },
    {
      text: {
        de: 'Eine Sicht ist die Einheit, auf der Zugriffsrechte vergeben werden — das hilft aber nur, wenn die sensiblen Spalten von vornherein in der Sichtdefinition fehlen.',
        en: 'A view is the unit that access rights are granted on — that only helps if the sensitive columns are absent from the view definition in the first place.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: { de: 'crew_roster existiert als Sicht', en: 'crew_roster exists as a view' },
        sql: "SELECT count(*) = 1 AS ok FROM pg_views WHERE schemaname = 'public' AND viewname = 'crew_roster';"
      },
      {
        label: {
          de: 'Sie legt genau die vier erlaubten Spalten offen',
          en: 'It exposes exactly the four permitted columns'
        },
        sql: `
          SELECT count(*) = 4 AND bool_and(column_name IN ('full_name', 'stage_role', 'shift_start', 'shift_end')) AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'crew_roster';
        `
      },
      {
        label: {
          de: 'Keine Zahlungs- oder Adressspalte sickert durch',
          en: 'No payment or address column leaks through'
        },
        sql: `
          SELECT count(*) = 0 AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'crew_roster'
            AND column_name IN ('day_fee', 'iban', 'home_address', 'id', 'publish_consent');
        `
      },
      {
        label: {
          de: 'Nur Crew-Mitglieder mit Zustimmung sind gelistet',
          en: 'Only crew members who consented are listed'
        },
        sql: `
          WITH expected AS (
            SELECT full_name, stage_role, shift_start, shift_end
            FROM crew
            WHERE publish_consent
          )
          SELECT NOT EXISTS (
            SELECT * FROM expected
            EXCEPT
            SELECT full_name, stage_role, shift_start, shift_end FROM crew_roster
          ) AND NOT EXISTS (
            SELECT full_name, stage_role, shift_start, shift_end FROM crew_roster
            EXCEPT
            SELECT * FROM expected
          ) AS ok;
        `
      },
      {
        label: {
          de: 'Die Liste hat genau vier Einträge',
          en: 'The roster has exactly four entries'
        },
        sql: 'SELECT count(*) = 4 AS ok FROM crew_roster;'
      }
    ]
  },
  tags: ['create-view', 'privacy', 'projection', 'selection']
};
