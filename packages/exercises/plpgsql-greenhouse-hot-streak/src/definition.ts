import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'plpgsql-greenhouse-hot-streak',
  topic: ['plpgsql', 'cursors'],
  difficulty: 'Profi',
  title: { de: 'Längste Hitzeserie eines Sensors', en: 'Longest hot streak of a sensor' },
  prompt: {
    de: [
      'Jeder Gewächshaussensor protokolliert stündlich seine Temperatur. Die Gärtner wollen wissen, wie lange',
      'ein Sensor zu warm blieb, ohne zwischendurch abzukühlen.',
      '',
      'Schreibe eine PL/pgSQL-Funktion `longest_hot_streak(p_sensor text, p_threshold numeric) RETURNS integer`.',
      '',
      'Sie gibt die Länge der längsten Folge aufeinanderfolgender Messwerte dieses Sensors zurück — sortiert nach',
      '`taken_at` —, deren Temperatur strikt über dem Schwellenwert liegt.',
      '',
      'Lies die Messwerte einzeln mit einem expliziten Cursor (`OPEN` / `FETCH` / `CLOSE`) und verlasse die',
      'Schleife mit `EXIT WHEN NOT FOUND`.',
      'Ein Sensor, der den Schwellenwert nie überschreitet, und ein unbekannter Sensor liefern beide 0.'
    ].join('\n'),
    en: [
      'Each greenhouse sensor logs its temperature every hour. The gardeners want to know how long',
      'a sensor stayed too warm without cooling down in between.',
      '',
      'Write a PL/pgSQL function `longest_hot_streak(p_sensor text, p_threshold numeric) RETURNS integer`.',
      '',
      'It returns the length of the longest run of consecutive readings of that sensor — ordered by',
      '`taken_at` — whose temperature is strictly above the threshold.',
      '',
      'Read the readings one by one with an explicit cursor (`OPEN` / `FETCH` / `CLOSE`) and leave the',
      'loop with `EXIT WHEN NOT FOUND`.',
      'A sensor that never gets above the threshold, and an unknown sensor, both yield 0.'
    ].join('\n')
  },
  seedSql: `
    DROP FUNCTION IF EXISTS longest_hot_streak(text, numeric);
    DROP TABLE IF EXISTS reading;

    CREATE TABLE reading (
      id integer PRIMARY KEY,
      sensor text NOT NULL,
      taken_at timestamp NOT NULL,
      celsius numeric NOT NULL
    );

    INSERT INTO reading (id, sensor, taken_at, celsius) VALUES
      (1, 'bed-1', '2026-06-01 06:00', 18.0),
      (2, 'bed-1', '2026-06-01 07:00', 24.0),
      (3, 'bed-1', '2026-06-01 08:00', 26.0),
      (4, 'bed-1', '2026-06-01 09:00', 22.0),
      (5, 'bed-1', '2026-06-01 10:00', 30.0),
      (6, 'bed-1', '2026-06-01 11:00', 31.0),
      (7, 'bed-1', '2026-06-01 12:00', 32.0),
      (8, 'bed-1', '2026-06-01 13:00', 19.0),
      (9, 'bed-2', '2026-06-01 06:00', 27.0),
      (10, 'bed-2', '2026-06-01 07:00', 28.0),
      (11, 'bed-3', '2026-06-01 06:00', 10.0);
  `,
  starterSql: [
    'CREATE OR REPLACE FUNCTION longest_hot_streak(p_sensor text, p_threshold numeric) RETURNS integer AS $longest_hot_streak$',
    'DECLARE',
    '  best integer := 0;',
    'BEGIN',
    '  RETURN best;',
    'END;',
    '$longest_hot_streak$ LANGUAGE plpgsql;'
  ].join('\n'),
  hints: [
    {
      text: {
        de: 'Ein Cursor kann eigene Parameter haben: Deklariere ihn mit einem Platzhalter und übergib den Sensor, wenn du ihn mit `OPEN` öffnest.',
        en: 'A cursor can take its own parameters: declare it with a placeholder and pass the sensor when you OPEN it.'
      }
    },
    {
      text: {
        de: 'Zwei Zähler reichen — einer für die Serie, in der du gerade steckst, einer für die beste bisher gesehene Serie. Ein Messwert, der nicht heiß genug ist, setzt nur den ersten zurück.',
        en: 'Two counters are enough — one for the run you are currently in, one for the best run seen so far. A reading that is not hot enough resets only the first one.'
      }
    },
    {
      text: {
        de: 'Die beste Serie muss gemerkt werden, während du noch mittendrin bist, denn der Cursor geht nie zurück.',
        en: 'The best run has to be remembered while you are still inside it, because the cursor never goes back.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'bed-1 bleibt bei drei Messwerten in Folge über 25',
          en: 'bed-1 stays above 25 for three readings in a row'
        },
        sql: "SELECT longest_hot_streak('bed-1', 25) = 3 AS ok;"
      },
      {
        label: {
          de: 'bed-1 über 21 ergibt eine Serie von sechs Messwerten',
          en: 'bed-1 above 21 gives a run of six readings'
        },
        sql: "SELECT longest_hot_streak('bed-1', 21) = 6 AS ok;"
      },
      {
        label: {
          de: 'Ein Schwellenwert, den niemand erreicht, ergibt 0',
          en: 'A threshold nobody reaches gives 0'
        },
        sql: "SELECT longest_hot_streak('bed-1', 40) = 0 AS ok;"
      },
      {
        label: {
          de: 'bed-2 ist bei beiden Messwerten heiß',
          en: 'bed-2 is hot for both of its readings'
        },
        sql: "SELECT longest_hot_streak('bed-2', 25) = 2 AS ok;"
      },
      {
        label: {
          de: 'Der Schwellenwert selbst zählt nicht als heiß',
          en: 'The threshold itself does not count as hot'
        },
        sql: "SELECT longest_hot_streak('bed-2', 27) = 1 AS ok;"
      },
      {
        label: { de: 'Ein kalter Sensor ergibt 0', en: 'A cold sensor gives 0' },
        sql: "SELECT longest_hot_streak('bed-3', 25) = 0 AS ok;"
      },
      {
        label: { de: 'Ein unbekannter Sensor ergibt 0', en: 'An unknown sensor gives 0' },
        sql: "SELECT longest_hot_streak('bed-9', 25) = 0 AS ok;"
      }
    ]
  },
  tags: ['cursor', 'fetch', 'loop']
};
