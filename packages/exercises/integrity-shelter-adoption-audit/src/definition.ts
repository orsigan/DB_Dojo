import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'integrity-shelter-adoption-audit',
  topic: ['integrity', 'triggers'],
  difficulty: 'Beginner',
  title: {
    de: 'Jede Vermittlung automatisch protokollieren',
    en: 'Log every adoption automatically'
  },
  prompt: {
    de: [
      'Das Tierheim muss nachweisen können, wann ein Tier das Haus verlassen hat.',
      'Jede Zeile, die in `adoption` eingefügt wird, bekommt ihren eigenen Eintrag in `adoption_audit`.',
      '',
      'Schreibe eine Trigger-Funktion `log_adoption()`, die die Spalten `adoption_id`, `animal_name`',
      'und `adopter` der neuen Zeile in `adoption_audit` einfügt.',
      'Hänge sie als Trigger namens `trg_log_adoption` ein, der AFTER INSERT ON `adoption` FOR EACH ROW läuft.',
      '',
      'Der Audit-Eintrag muss pro vermitteltem Tier einmal geschrieben werden, auch wenn ein',
      'INSERT-Statement mehrere Zeilen auf einmal einfügt.',
      'Ein AFTER-Row-Trigger ignoriert den Rückgabewert, NULL zurückzugeben ist also in Ordnung.'
    ].join('\n'),
    en: [
      'The animal shelter must be able to prove when an animal left the house.',
      'Every row inserted into `adoption` gets its own entry in `adoption_audit`.',
      '',
      'Write a trigger function `log_adoption()` that inserts the columns `adoption_id`, `animal_name`',
      'and `adopter` of the new row into `adoption_audit`.',
      'Attach it as a trigger named `trg_log_adoption` that runs AFTER INSERT ON `adoption` FOR EACH ROW.',
      '',
      'The audit entry must be written once per adopted animal, also when one INSERT statement adds several rows.',
      'An AFTER row trigger ignores the return value, so returning NULL is fine.'
    ].join('\n')
  },
  seedSql: `
    DROP TRIGGER IF EXISTS trg_log_adoption ON adoption;
    DROP FUNCTION IF EXISTS log_adoption();
    DROP FUNCTION IF EXISTS probe_single_adoption();
    DROP FUNCTION IF EXISTS probe_bulk_adoption();
    DROP TABLE IF EXISTS adoption_audit;
    DROP TABLE IF EXISTS adoption;

    CREATE TABLE adoption (
      id serial PRIMARY KEY,
      animal_name text NOT NULL,
      adopter text NOT NULL,
      adopted_on date NOT NULL
    );

    CREATE TABLE adoption_audit (
      id serial PRIMARY KEY,
      adoption_id integer NOT NULL,
      animal_name text NOT NULL,
      adopter text NOT NULL,
      logged_at timestamp NOT NULL DEFAULT now()
    );

    INSERT INTO adoption (animal_name, adopter, adopted_on) VALUES
      ('Pixel', 'Mila Grund', '2026-01-09'),
      ('Nugget', 'Sven Ahlers', '2026-01-15');

    CREATE FUNCTION probe_single_adoption() RETURNS boolean AS $$
    DECLARE
      new_id integer;
      logged integer;
    BEGIN
      INSERT INTO adoption (animal_name, adopter, adopted_on)
      VALUES ('Willow', 'Ines Roth', DATE '2026-02-02')
      RETURNING id INTO new_id;

      SELECT count(*) INTO logged
      FROM adoption_audit
      WHERE adoption_id = new_id AND animal_name = 'Willow' AND adopter = 'Ines Roth';

      RETURN logged = 1;
    END;
    $$ LANGUAGE plpgsql;

    CREATE FUNCTION probe_bulk_adoption() RETURNS boolean AS $$
    DECLARE
      logged integer;
    BEGIN
      INSERT INTO adoption (animal_name, adopter, adopted_on) VALUES
        ('Kastanie', 'Ruth Palm', DATE '2026-02-05'),
        ('Sirius', 'Ruth Palm', DATE '2026-02-05'),
        ('Fenja', 'Ruth Palm', DATE '2026-02-05');

      SELECT count(*) INTO logged FROM adoption_audit WHERE adopter = 'Ruth Palm';
      RETURN logged = 3;
    END;
    $$ LANGUAGE plpgsql;
  `,
  starterSql: [
    'CREATE OR REPLACE FUNCTION log_adoption() RETURNS trigger AS $$',
    'BEGIN',
    '  RETURN NULL;',
    'END;',
    '$$ LANGUAGE plpgsql;'
  ].join('\n'),
  hints: [
    {
      text: {
        de: 'Die gerade eingefügte Zeile steht in der Record-Variable NEW zur Verfügung — ihre id ist schon gefüllt, weil der Trigger AFTER der Schreiboperation läuft.',
        en: 'The row that was just inserted is available in the record variable NEW — its id is already filled in because the trigger runs AFTER the write.'
      }
    },
    {
      text: {
        de: 'FOR EACH ROW lässt die Funktion einmal pro betroffener Zeile laufen — genau das braucht ein Protokoll pro Tier.',
        en: 'FOR EACH ROW makes the function run once per affected row, which is what a per-animal protocol needs.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'trg_log_adoption läuft AFTER INSERT on adoption, für jede Zeile',
          en: 'trg_log_adoption runs AFTER INSERT on adoption, for each row'
        },
        sql: "SELECT count(*) = 1 AS ok FROM pg_trigger AS t WHERE t.tgrelid = 'adoption'::regclass AND t.tgname = 'trg_log_adoption' AND pg_get_triggerdef(t.oid) ILIKE '%AFTER INSERT%' AND pg_get_triggerdef(t.oid) ILIKE '%FOR EACH ROW%';"
      },
      {
        label: {
          de: 'Vermittlungen, die vor dem Trigger stattfanden, werden nicht rückwirkend protokolliert',
          en: 'Adoptions that happened before the trigger existed are not logged retroactively'
        },
        sql: "SELECT count(*) = 0 AS ok FROM adoption_audit WHERE animal_name IN ('Pixel', 'Nugget');"
      },
      {
        label: {
          de: 'Eine einzelne Vermittlung erzeugt genau einen Audit-Eintrag',
          en: 'A single adoption produces exactly one audit entry'
        },
        sql: 'SELECT probe_single_adoption() AS ok;'
      },
      {
        label: {
          de: 'Ein INSERT mit drei Tieren erzeugt drei Audit-Einträge',
          en: 'One INSERT with three animals produces three audit entries'
        },
        sql: 'SELECT probe_bulk_adoption() AS ok;'
      }
    ]
  },
  tags: ['trigger', 'after-insert', 'logging']
};
