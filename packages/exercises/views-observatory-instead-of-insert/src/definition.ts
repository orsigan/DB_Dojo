import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'views-observatory-instead-of-insert',
  topic: ['views', 'updatable'],
  difficulty: 'Ultra',
  title: {
    de: 'Eine Verbundsicht mit INSTEAD OF einfügbar machen',
    en: 'Making a join view insertable with INSTEAD OF'
  },
  prompt: {
    de: [
      'Eine Sternwarte teilt jede Messung auf zwei Tabellen auf: `observations` enthält, wann und',
      'mit welchem Teleskop sie aufgenommen wurde, `spectra` enthält die Spektraldaten unter demselben Schlüssel.',
      'Die Sicht `spectral_log` verbindet sie bereits, aber SQL-92 verweigert INSERTs auf eine Verbundsicht —',
      'das System kann nicht wissen, wie eine Sichtzeile auf zwei Basistabellen zu verteilen ist.',
      '',
      'Bring es ihm bei: Hänge einen INSTEAD OF INSERT-Trigger an `spectral_log`, dessen Triggerfunktion',
      'die Zeile in `observations` und `spectra` schreibt.',
      '',
      'Erfasse dann die neue Messung, indem du',
      "`(4, '2026-03-18', 'Meridian-2', 'infrared', 0.184)` über `spectral_log` einfügst."
    ].join('\n'),
    en: [
      'An observatory splits every measurement over two tables: `observations` holds when and',
      'with which telescope it was taken, `spectra` holds the spectral data under the same key.',
      'The view `spectral_log` already joins them, but SQL-92 refuses INSERTs on a join view —',
      'the system cannot know how to distribute one view row over two base tables.',
      '',
      'Teach it how: attach an INSTEAD OF INSERT trigger to `spectral_log` whose trigger function',
      'writes the row into `observations` and `spectra`.',
      '',
      'Then record the new measurement by inserting',
      "`(4, '2026-03-18', 'Meridian-2', 'infrared', 0.184)` through `spectral_log`."
    ].join('\n')
  },
  seedSql: `
    DROP VIEW IF EXISTS spectral_log CASCADE;
    DROP FUNCTION IF EXISTS spectral_log_insert();
    DROP TABLE IF EXISTS spectra;
    DROP TABLE IF EXISTS observations;

    CREATE TABLE observations (
      id integer PRIMARY KEY,
      observed_on date NOT NULL,
      telescope text NOT NULL
    );

    CREATE TABLE spectra (
      observation_id integer PRIMARY KEY REFERENCES observations (id),
      band text NOT NULL,
      redshift numeric NOT NULL
    );

    INSERT INTO observations (id, observed_on, telescope) VALUES
      (1, '2026-03-02', 'Meridian-2'),
      (2, '2026-03-05', 'Halberd'),
      (3, '2026-03-11', 'Meridian-2');

    INSERT INTO spectra (observation_id, band, redshift) VALUES
      (1, 'visible', 0.031),
      (2, 'ultraviolet', 0.412),
      (3, 'radio', 0.097);

    CREATE VIEW spectral_log AS
      SELECT o.id, o.observed_on, o.telescope, s.band, s.redshift
      FROM observations AS o
      JOIN spectra AS s ON s.observation_id = o.id;
  `,
  starterSql: `CREATE FUNCTION spectral_log_insert() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RETURN NEW;
END;
$$;`,
  hints: [
    {
      text: {
        de: 'Ein INSTEAD OF-Trigger ersetzt die scheiternde Standardaktion vollständig — die Zeile, die du in NEW erhältst, wird nirgends geschrieben, es sei denn, deine Funktion schreibt sie.',
        en: 'An INSTEAD OF trigger replaces the failing default action entirely — the row you receive in NEW is never written anywhere unless your function writes it.'
      }
    },
    {
      text: {
        de: 'Die übergeordnete Zeile muss existieren, bevor die untergeordnete existiert, sonst weist der Fremdschlüssel auf `spectra` das Insert zurück.',
        en: 'The parent row has to exist before the child row, otherwise the foreign key on `spectra` rejects the insert.'
      }
    },
    {
      text: {
        de: 'INSTEAD OF-Trigger sind immer FOR EACH ROW, und NEW zurückzugeben meldet die Zeile als erfolgreich eingefügt.',
        en: 'INSTEAD OF triggers are always FOR EACH ROW, and returning NEW is what reports the row as successfully inserted.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'Ein INSTEAD OF-Trigger sitzt auf spectral_log',
          en: 'An INSTEAD OF trigger sits on spectral_log'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM pg_trigger AS t
          JOIN pg_class AS c ON c.oid = t.tgrelid
          WHERE c.relname = 'spectral_log'
            AND NOT t.tgisinternal
            AND (t.tgtype & 64) <> 0;
        `
      },
      {
        label: {
          de: 'Der Beobachtungsteil der neuen Zeile landete in observations',
          en: 'The observation part of the new row landed in observations'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM observations
          WHERE id = 4 AND observed_on = DATE '2026-03-18' AND telescope = 'Meridian-2';
        `
      },
      {
        label: {
          de: 'Der Spektralteil der neuen Zeile landete in spectra',
          en: 'The spectral part of the new row landed in spectra'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM spectra
          WHERE observation_id = 4 AND band = 'infrared' AND redshift = 0.184;
        `
      },
      {
        label: {
          de: 'spectral_log listet jetzt vier Messungen',
          en: 'spectral_log now lists four measurements'
        },
        sql: 'SELECT count(*) = 4 AS ok FROM spectral_log;'
      },
      {
        label: {
          de: 'Die Basistabellen blieben konsistent',
          en: 'The base tables stayed consistent'
        },
        sql: `
          SELECT (SELECT count(*) FROM observations) = 4
             AND (SELECT count(*) FROM spectra) = 4
             AND NOT EXISTS (
               SELECT 1 FROM observations AS o
               LEFT JOIN spectra AS s ON s.observation_id = o.id
               WHERE s.observation_id IS NULL
             ) AS ok;
        `
      }
    ]
  },
  tags: ['instead-of-trigger', 'updatable-view', 'join']
};
