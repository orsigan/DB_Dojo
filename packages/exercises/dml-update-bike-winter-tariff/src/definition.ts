import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'dml-update-bike-winter-tariff',
  topic: ['dml', 'update'],
  difficulty: 'Advanced',
  title: {
    de: 'Wintertarif für die Lyon-Flotte',
    en: 'Winter tariff for the Lyon fleet'
  },
  prompt: {
    de: [
      'Der Verleiher stellt seine Lyon-Flotte auf den Wintertarif um.',
      '',
      'Setze für jedes Fahrrad, das an einer Station in der Stadt `Lyon` steht, `daily_rate` auf `9.50`',
      'und `status` auf `seasonal` — auch für Fahrräder, die sich gerade in der Werkstatt befinden.',
      '',
      'Fahrräder in anderen Städten behalten sowohl ihren Tarif als auch ihren Status.',
      'Finde die Lyon-Stationen über `stations`; schreibe ihre IDs nicht direkt in die WHERE-Klausel.'
    ].join('\n'),
    en: [
      'The rental company puts its Lyon fleet on the winter tariff.',
      '',
      'For every bike parked at a station in the city `Lyon`, set `daily_rate` to `9.50`',
      'and `status` to `seasonal` — including bikes that are currently in the workshop.',
      '',
      'Bikes in other cities keep both their rate and their status.',
      'Find the Lyon stations through `stations`; do not paste their ids into the WHERE clause.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS bikes;
    DROP TABLE IF EXISTS stations;

    CREATE TABLE stations (
      id integer PRIMARY KEY,
      name text NOT NULL,
      city text NOT NULL
    );

    CREATE TABLE bikes (
      id integer PRIMARY KEY,
      station_id integer NOT NULL REFERENCES stations (id),
      model text NOT NULL,
      daily_rate numeric NOT NULL,
      status text NOT NULL
    );

    INSERT INTO stations (id, name, city) VALUES
      (1, 'Gare Part-Dieu', 'Lyon'),
      (2, 'Vieux Port', 'Marseille'),
      (3, 'Bellecour', 'Lyon'),
      (4, 'Capitole', 'Toulouse');

    INSERT INTO bikes (id, station_id, model, daily_rate, status) VALUES
      (1, 1, 'Roadster 3', 14.00, 'available'),
      (2, 1, 'Cargo XL', 22.00, 'available'),
      (3, 2, 'Roadster 3', 14.00, 'available'),
      (4, 3, 'City Lite', 11.50, 'repair'),
      (5, 3, 'Cargo XL', 22.00, 'available'),
      (6, 4, 'City Lite', 11.50, 'available');
  `,
  starterSql:
    'SELECT b.id, b.model, b.daily_rate, s.city\nFROM bikes AS b\nJOIN stations AS s ON s.id = b.station_id\nORDER BY b.id;',
  hints: [
    {
      text: {
        de: 'Ein Subselect darf auf der rechten Seite von IN stehen und die Menge der Stations-IDs liefern, die zu Lyon gehören.',
        en: 'A subselect may stand on the right-hand side of IN and deliver the set of station ids that belong to Lyon.'
      }
    },
    {
      text: {
        de: 'Eine SET-Klausel kann mehrere Spalten gleichzeitig zuweisen, getrennt durch Kommas.',
        en: 'One SET clause can assign several columns at once, separated by commas.'
      }
    },
    {
      text: {
        de: 'Die Aufgabe verlangt jedes Fahrrad an diesen Stationen — eine Bedingung auf `status` würde das Fahrrad in der Werkstatt stillschweigend überspringen.',
        en: 'The task says every bike at those stations — a condition on `status` would silently skip the bike in the workshop.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'Alle vier Lyon-Fahrräder haben den Saisontarif',
          en: 'All four Lyon bikes are on the seasonal tariff'
        },
        sql: `
          SELECT count(*) = 4 AS ok
          FROM bikes
          WHERE id IN (1, 2, 4, 5) AND daily_rate = 9.50 AND status = 'seasonal';
        `
      },
      {
        label: {
          de: 'Die Fahrräder in Marseille und Toulouse sind unverändert',
          en: 'The Marseille and Toulouse bikes are untouched'
        },
        sql: `
          SELECT count(*) = 2 AS ok
          FROM bikes
          WHERE (id = 3 AND daily_rate = 14.00 AND status = 'available')
             OR (id = 6 AND daily_rate = 11.50 AND status = 'available');
        `
      },
      {
        label: {
          de: 'Kein Fahrrad und keine Station wurde hinzugefügt oder entfernt',
          en: 'No bike or station was added or removed'
        },
        sql: 'SELECT (SELECT count(*) FROM bikes) = 6 AND (SELECT count(*) FROM stations) = 4 AS ok;'
      }
    ]
  },
  tags: ['update', 'subquery', 'in']
};
