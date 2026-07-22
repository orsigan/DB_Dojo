import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'ddl-vineyard-schema-migration',
  topic: ['ddl', 'alter-drop'],
  difficulty: 'Profi',
  title: {
    de: 'Das Erntebuch wird strenger',
    en: 'Tightening the harvest book'
  },
  prompt: {
    de: [
      'Das Weingut hat fünf Erntedatensätze in `harvest` und will die Tabelle aufräumen.',
      'Die fünf Datensätze müssen jeden Schritt überstehen, die Tabelle neu anzulegen ist also keine Option.',
      '',
      'Migriere die bestehende Tabelle so, dass danach gilt:',
      '',
      '- eine Spalte `quality_grade` vom Typ `smallint` existiert, nie NULL, mit Standardwert `3`;',
      '  die fünf gespeicherten Ernten tragen bereits die Note 3, ohne ein UPDATE von dir',
      '- eine Regel namens `chk_quality_grade` beschränkt `quality_grade` auf den Bereich 1 bis 5',
      '- die Regel `chk_harvest_year` existiert weiterhin unter genau diesem Namen, akzeptiert aber jetzt nur noch',
      '  Erntejahre von 1990 bis 2100 statt 1900 bis 2100',
      '- eine Regel namens `fk_harvest_parcel` lässt `parcel_code` `parcel (parcel_code)` referenzieren,',
      '  und eine Parzelle, die noch Ernten hat, kann nicht gelöscht werden',
      '- die überflüssige Spalte `legacy_note` ist verschwunden'
    ].join('\n'),
    en: [
      'The vineyard has five harvest records in `harvest` and wants the table cleaned up.',
      'The five records must survive every step, so recreating the table is not an option.',
      '',
      'Migrate the existing table so that afterwards:',
      '',
      '- a column `quality_grade` of type `smallint` exists, never NULL, defaulting to `3`;',
      '  the five stored harvests already carry the grade 3 without any UPDATE from you',
      '- a rule named `chk_quality_grade` restricts `quality_grade` to the range 1 to 5',
      '- the rule `chk_harvest_year` still exists under that very name, but now only accepts',
      '  picking years from 1990 to 2100 instead of 1900 to 2100',
      '- a rule named `fk_harvest_parcel` makes `parcel_code` reference `parcel (parcel_code)`,',
      '  and a parcel that still has harvests cannot be deleted',
      '- the obsolete column `legacy_note` is gone'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS harvest;
    DROP TABLE IF EXISTS parcel;
    DROP FUNCTION IF EXISTS statement_is_rejected(text);

    CREATE FUNCTION statement_is_rejected(statement text) RETURNS boolean AS $fn$
    BEGIN
      EXECUTE statement;
      RETURN false;
    EXCEPTION WHEN others THEN
      RETURN true;
    END;
    $fn$ LANGUAGE plpgsql;

    CREATE TABLE parcel (
      parcel_code char(4) PRIMARY KEY,
      grape varchar(20) NOT NULL,
      hectares numeric(5,2) NOT NULL
    );

    INSERT INTO parcel (parcel_code, grape, hectares) VALUES
      ('SUD1', 'Riesling', 2.40),
      ('SUD2', 'Riesling', 1.85),
      ('NOR1', 'Spaetburgunder', 3.10),
      ('WES1', 'Silvaner', 0.95);

    CREATE TABLE harvest (
      harvest_id integer PRIMARY KEY,
      parcel_code char(4) NOT NULL,
      picked_on date NOT NULL,
      kilograms integer NOT NULL,
      legacy_note text,
      CONSTRAINT chk_harvest_year CHECK (extract(year FROM picked_on) BETWEEN 1900 AND 2100)
    );

    INSERT INTO harvest (harvest_id, parcel_code, picked_on, kilograms, legacy_note) VALUES
      (1, 'SUD1', '2024-09-28', 4200, 'from the old book'),
      (2, 'SUD2', '2024-10-02', 3100, 'from the old book'),
      (3, 'NOR1', '2024-10-11', 5600, NULL),
      (4, 'SUD1', '2025-09-30', 4450, 'from the old book'),
      (5, 'WES1', '2025-10-05', 1750, NULL);
  `,
  starterSql:
    "SELECT column_name, data_type, is_nullable\nFROM information_schema.columns\nWHERE table_name = 'harvest'\nORDER BY ordinal_position;",
  hints: [
    {
      text: {
        de: 'Ein Constraint wird nie an Ort und Stelle bearbeitet. Du entfernst ihn über seinen Namen und legst die neue Version unter demselben Namen wieder an — genau deshalb bekommen Constraints überhaupt Namen.',
        en: 'A constraint is never edited in place. You take it away by its name and put the new version back under the same name — which is the whole reason for naming constraints in the first place.'
      }
    },
    {
      text: {
        de: 'Eine Spalte mit DEFAULT hinzuzufügen befüllt sofort jedes bestehende Tupel, sodass ein im selben Atemzug hinzugefügtes NOT NULL nicht mit den fünf gespeicherten Zeilen kollidiert.',
        en: 'Adding a column with a DEFAULT fills every existing tuple straight away, so a NOT NULL added in the same breath does not collide with the five stored rows.'
      }
    },
    {
      text: {
        de: 'Ein nachträglich hinzugefügter Fremdschlüssel wird gegen die bereits vorhandenen Daten geprüft — kontrolliere, dass jeder gespeicherte parcel_code wirklich in parcel existiert, bevor du erwartest, dass es klappt.',
        en: 'A foreign key added afterwards is validated against the data that is already there — check that every stored parcel_code really exists in parcel before you expect it to succeed.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'quality_grade ist ein smallint, lehnt NULL ab und hat den Standardwert 3',
          en: 'quality_grade is a smallint, rejects NULL and defaults to 3'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'harvest'
            AND column_name = 'quality_grade'
            AND data_type = 'smallint'
            AND is_nullable = 'NO'
            AND column_default LIKE '3%';
        `
      },
      {
        label: {
          de: 'Die fünf gespeicherten Ernten tragen bereits die Note 3',
          en: 'The five stored harvests already carry the grade 3'
        },
        sql: 'SELECT count(*) = 5 AND bool_and(quality_grade = 3) AS ok FROM harvest;'
      },
      {
        label: {
          de: 'Die überflüssige Spalte legacy_note ist verschwunden, der Rest der Tabelle ist unversehrt',
          en: 'The obsolete column legacy_note is gone, the rest of the table is intact'
        },
        sql: `
          SELECT array_agg(column_name::text ORDER BY column_name)
                 = ARRAY['harvest_id', 'kilograms', 'parcel_code', 'picked_on', 'quality_grade'] AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'harvest';
        `
      },
      {
        label: {
          de: 'Beide benannten CHECK-Regeln existieren auf harvest',
          en: 'Both named CHECK rules exist on harvest'
        },
        sql: `
          SELECT count(*) = 2 AS ok
          FROM pg_constraint
          WHERE conrelid = to_regclass('public.harvest')
            AND contype = 'c'
            AND conname IN ('chk_harvest_year', 'chk_quality_grade');
        `
      },
      {
        label: {
          de: 'fk_harvest_parcel referenziert parcel und verweigert das Löschen einer genutzten Parzelle',
          en: 'fk_harvest_parcel references parcel and refuses to let a used parcel go'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM pg_constraint
          WHERE conname = 'fk_harvest_parcel'
            AND contype = 'f'
            AND conrelid = to_regclass('public.harvest')
            AND confrelid = to_regclass('public.parcel')
            AND confdeltype IN ('r', 'a');
        `
      },
      {
        label: {
          de: 'Eine 1985 geerntete Ernte wird jetzt abgelehnt',
          en: 'A harvest picked in 1985 is now rejected'
        },
        sql: `
          SELECT statement_is_rejected(
            $q$INSERT INTO harvest (harvest_id, parcel_code, picked_on, kilograms)
               VALUES (91, 'SUD1', DATE '1985-10-01', 500)$q$
          ) AS ok;
        `
      },
      {
        label: {
          de: 'Eine Qualitätsnote von 6 wird abgelehnt',
          en: 'A quality grade of 6 is rejected'
        },
        sql: `
          SELECT statement_is_rejected(
            $q$INSERT INTO harvest (harvest_id, parcel_code, picked_on, kilograms, quality_grade)
               VALUES (92, 'SUD1', DATE '2025-10-01', 500, 6)$q$
          ) AS ok;
        `
      },
      {
        label: {
          de: 'Eine Ernte auf der unbekannten Parzelle ZZZ9 wird abgelehnt',
          en: 'A harvest on the unknown parcel ZZZ9 is rejected'
        },
        sql: `
          SELECT statement_is_rejected(
            $q$INSERT INTO harvest (harvest_id, parcel_code, picked_on, kilograms)
               VALUES (93, 'ZZZ9', DATE '2025-10-01', 500)$q$
          ) AS ok;
        `
      },
      {
        label: {
          de: 'Das Löschen von Parzelle NOR1, die noch eine Ernte hat, wird abgelehnt',
          en: 'Deleting parcel NOR1, which still has a harvest, is rejected'
        },
        sql: `
          SELECT statement_is_rejected(
            $q$DELETE FROM parcel WHERE parcel_code = 'NOR1'$q$
          ) AS ok;
        `
      },
      {
        label: {
          de: 'Eine 1995 geerntete Ernte wird akzeptiert und bekommt die Standardnote 3',
          en: 'A harvest picked in 1995 is accepted and gets the default grade 3'
        },
        sql: `
          WITH inserted AS (
            INSERT INTO harvest (harvest_id, parcel_code, picked_on, kilograms)
            VALUES (6, 'SUD1', DATE '1995-10-01', 2000)
            RETURNING quality_grade
          )
          SELECT quality_grade = 3 AS ok
          FROM inserted;
        `
      }
    ]
  },
  tags: ['alter-table', 'drop-constraint', 'migration', 'foreign-key']
};
