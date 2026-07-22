import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'plpgsql-ferry-crossing-manifest',
  topic: ['plpgsql', 'functions'],
  difficulty: 'Advanced',
  title: { de: 'Überfahrtsmanifest für eine Route', en: 'Crossing manifest for a route' },
  prompt: {
    de: [
      'Die Fährgesellschaft möchte ein Manifest pro Route: eine Zeile pro Überfahrt mit den gebuchten und den',
      'noch freien Plätzen.',
      '',
      'Schreibe eine PL/pgSQL-Funktion',
      '`crossing_manifest(p_route text) RETURNS TABLE(departure timestamp, seats_booked integer, seats_free integer)`.',
      '',
      'Durchlaufe die Überfahrten der Route mit einer `FOR ... IN <query> LOOP`, sortiert nach Abfahrtszeit,',
      'und gib mit `RETURN NEXT` eine Zeile pro Überfahrt zurück.',
      '',
      'Eine Überfahrt ohne Buchung zählt als 0 gebuchte Plätze.',
      'Eine unbekannte Route liefert überhaupt keine Zeilen.'
    ].join('\n'),
    en: [
      'The ferry operator wants a manifest per route: one line per crossing with the booked and the',
      'still free seats.',
      '',
      'Write a PL/pgSQL function',
      '`crossing_manifest(p_route text) RETURNS TABLE(departure timestamp, seats_booked integer, seats_free integer)`.',
      '',
      'Walk the crossings of the route with a `FOR ... IN <query> LOOP`, ordered by departure time,',
      'and hand back one row per crossing with `RETURN NEXT`.',
      '',
      'A crossing without any booking counts as 0 booked seats.',
      'An unknown route returns no rows at all.'
    ].join('\n')
  },
  seedSql: `
    DROP FUNCTION IF EXISTS crossing_manifest(text);
    DROP TABLE IF EXISTS booking;
    DROP TABLE IF EXISTS crossing;

    CREATE TABLE crossing (
      id integer PRIMARY KEY,
      route text NOT NULL,
      departs timestamp NOT NULL,
      capacity integer NOT NULL
    );

    CREATE TABLE booking (
      id integer PRIMARY KEY,
      crossing_id integer NOT NULL REFERENCES crossing (id),
      seats integer NOT NULL
    );

    INSERT INTO crossing (id, route, departs, capacity) VALUES
      (1, 'Dover-Calais', '2026-03-01 08:00', 100),
      (2, 'Dover-Calais', '2026-03-01 14:00', 100),
      (3, 'Dover-Calais', '2026-03-01 20:00', 80),
      (4, 'Hull-Rotterdam', '2026-03-02 21:00', 200);

    INSERT INTO booking (id, crossing_id, seats) VALUES
      (1, 1, 30),
      (2, 1, 25),
      (3, 2, 60),
      (4, 2, 40),
      (5, 4, 10);
  `,
  starterSql: [
    'CREATE OR REPLACE FUNCTION crossing_manifest(p_route text)',
    'RETURNS TABLE(departure timestamp, seats_booked integer, seats_free integer) AS $crossing_manifest$',
    'BEGIN',
    '  RETURN;',
    'END;',
    '$crossing_manifest$ LANGUAGE plpgsql;'
  ].join('\n'),
  hints: [
    {
      text: {
        de: 'Die in `RETURNS TABLE` genannten Spalten sind im Rumpf ganz normale Variablen — weise sie zu, und `RETURN NEXT` hängt die aktuellen Werte an das Ergebnis an.',
        en: 'The columns named in RETURNS TABLE are ordinary variables inside the body — assign them and then RETURN NEXT appends the current values to the result.'
      }
    },
    {
      text: {
        de: 'Eine `record`-Variable passt sich an das an, was die Schleifenanfrage selektiert, sodass du capacity und id daraus lesen kannst, ohne einen Typ zu deklarieren.',
        en: 'A record variable adapts to whatever the loop query selects, so you can pick capacity and id from it without declaring a type.'
      }
    },
    {
      text: {
        de: '`sum()` über eine leere Menge ist NULL, nicht 0 — eine Überfahrt ohne Buchungen muss trotzdem mit null auftauchen.',
        en: 'sum() over an empty set is NULL, not 0 — a crossing without bookings still has to show up with zero.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'Die Route Dover-Calais hat drei Überfahrten',
          en: 'The route Dover-Calais has three crossings'
        },
        sql: "SELECT count(*) = 3 AS ok FROM crossing_manifest('Dover-Calais');"
      },
      {
        label: {
          de: 'Die früheste Überfahrt kommt zuerst und zeigt 55 gebucht, 45 frei',
          en: 'The earliest crossing comes first and shows 55 booked, 45 free'
        },
        sql: "SELECT seats_booked = 55 AND seats_free = 45 AS ok FROM crossing_manifest('Dover-Calais') LIMIT 1;"
      },
      {
        label: {
          de: 'Die ausgebuchte Überfahrt hat 0 freie Plätze',
          en: 'The fully booked crossing has 0 free seats'
        },
        sql: "SELECT seats_free = 0 AS ok FROM crossing_manifest('Dover-Calais') WHERE departure = '2026-03-01 14:00';"
      },
      {
        label: {
          de: 'Eine Überfahrt ohne Buchungen zeigt 0 gebucht und 80 frei',
          en: 'A crossing without bookings shows 0 booked and 80 free'
        },
        sql: "SELECT seats_booked = 0 AND seats_free = 80 AS ok FROM crossing_manifest('Dover-Calais') WHERE departure = '2026-03-01 20:00';"
      },
      {
        label: { de: 'Andere Routen werden nicht vermischt', en: 'Other routes are not mixed in' },
        sql: "SELECT count(*) = 1 AND min(seats_booked) = 10 AS ok FROM crossing_manifest('Hull-Rotterdam');"
      },
      {
        label: {
          de: 'Eine unbekannte Route liefert keine Zeilen',
          en: 'An unknown route returns no rows'
        },
        sql: "SELECT count(*) = 0 AS ok FROM crossing_manifest('Nowhere-Island');"
      }
    ]
  },
  tags: ['returns-table', 'for-loop', 'return-next']
};
