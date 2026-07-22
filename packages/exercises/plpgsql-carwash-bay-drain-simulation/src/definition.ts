import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'plpgsql-carwash-bay-drain-simulation',
  topic: ['plpgsql', 'control-flow'],
  difficulty: 'Beginner',
  title: { de: 'Waschplätze zuweisen', en: 'Assign the wash bays' },
  prompt: {
    de: [
      'Die Waschstraße hat vier Waschplätze, aber sieben Autos warten bereits in der Schlange.',
      'Jedes Auto in `wash_queue` hat noch kein `bay_assigned`.',
      '',
      'Führe einen anonymen `DO`-Block aus, der mit einer `WHILE`-Schleife Plätze vergibt:',
      'Solange es noch ein unzugewiesenes Auto UND einen freien Platz (1 bis 4) gibt, weise dem',
      'am längsten wartenden Auto (kleinste `position` ohne `bay_assigned`) den nächsten freien',
      'Platz zu.',
      '',
      'Da mehr Autos als Plätze da sind, laufen die Plätze zuerst aus — die letzten Autos in der',
      'Schlange bleiben ohne `bay_assigned`, und genau das erwarten wir am Ende.'
    ].join('\n'),
    en: [
      'The car wash has four bays, but seven cars are already waiting in the queue.',
      'Every car in `wash_queue` still has no `bay_assigned`.',
      '',
      'Run an anonymous `DO` block that assigns bays with a `WHILE` loop: as long as there is',
      'still an unassigned car AND a free bay (1 to 4), assign the next free bay to the',
      'longest-waiting car (smallest `position` with no `bay_assigned`).',
      '',
      'Since there are more cars than bays, the bays run out first — the last cars in the queue',
      'stay without a `bay_assigned`, and that is exactly what we expect at the end.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS wash_queue;

    CREATE TABLE wash_queue (
      position integer PRIMARY KEY,
      plate text NOT NULL,
      bay_assigned integer
    );

    INSERT INTO wash_queue (position, plate) VALUES
      (1, 'B-CW 101'),
      (2, 'M-CW 202'),
      (3, 'K-CW 303'),
      (4, 'F-CW 404'),
      (5, 'S-CW 505'),
      (6, 'HH-CW 606'),
      (7, 'L-CW 707');
  `,
  starterSql: [
    'DO $bays$',
    'DECLARE',
    '  bay_number integer := 1;',
    'BEGIN',
    "  RAISE NOTICE 'no cars assigned yet';",
    'END $bays$;'
  ].join('\n'),
  hints: [
    {
      text: {
        de: 'Hier gibt es zwei Abbruchbedingungen, die unabhängig voneinander eintreten können: keine freien Plätze mehr, oder keine unzugewiesenen Autos mehr. Eine `FOR`-Schleife kennt nur eine feste Ober- und Untergrenze — eine `WHILE`-Schleife kann beide Bedingungen gleichzeitig prüfen.',
        en: 'There are two stop conditions here that can occur independently: no bays left, or no unassigned cars left. A FOR loop only knows a fixed lower and upper bound — a WHILE loop can check both conditions at once.'
      }
    },
    {
      text: {
        de: 'Zähle `bay_number` selbst hoch (z. B. mit `:=` am Ende der Schleife) und prüfe in der `WHILE`-Bedingung sowohl `bay_number <= 4` als auch, ob per `EXISTS` noch ein unzugewiesenes Auto existiert.',
        en: 'Count `bay_number` up yourself (e.g. with `:=` at the end of the loop) and check both `bay_number <= 4` and, via `EXISTS`, whether an unassigned car still exists in the WHILE condition.'
      }
    },
    {
      text: {
        de: 'Um im Schleifenrumpf das am längsten wartende unzugewiesene Auto zu finden, hilft eine Unterabfrage: `SELECT position FROM wash_queue WHERE bay_assigned IS NULL ORDER BY position LIMIT 1` — das Ergebnis per `SELECT ... INTO` in eine Variable holen und dann per `UPDATE` verwenden.',
        en: 'To find the longest-waiting unassigned car inside the loop body, a subquery helps: `SELECT position FROM wash_queue WHERE bay_assigned IS NULL ORDER BY position LIMIT 1` — fetch the result into a variable with `SELECT ... INTO` and then use it in an `UPDATE`.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'Das erste Auto in der Schlange bekommt Platz 1',
          en: 'The first car in the queue gets bay 1'
        },
        sql: 'SELECT bay_assigned = 1 AS ok FROM wash_queue WHERE position = 1;'
      },
      {
        label: {
          de: 'Das vierte Auto bekommt den letzten freien Platz, 4',
          en: 'The fourth car gets the last free bay, 4'
        },
        sql: 'SELECT bay_assigned = 4 AS ok FROM wash_queue WHERE position = 4;'
      },
      {
        label: {
          de: 'Das fünfte Auto bleibt ohne Platz, da alle vier Plätze schon vergeben sind',
          en: 'The fifth car stays without a bay, since all four bays are already taken'
        },
        sql: 'SELECT bay_assigned IS NULL AS ok FROM wash_queue WHERE position = 5;'
      },
      {
        label: {
          de: 'Kein Waschplatz wurde doppelt vergeben',
          en: 'No wash bay was assigned twice'
        },
        sql: 'SELECT count(DISTINCT bay_assigned) = count(bay_assigned) AS ok FROM wash_queue;'
      },
      {
        label: {
          de: 'Keine zugewiesene Platznummer liegt außerhalb von 1 bis 4',
          en: 'No assigned bay number falls outside 1 to 4'
        },
        sql: 'SELECT count(*) = 0 AS ok FROM wash_queue WHERE bay_assigned IS NOT NULL AND (bay_assigned < 1 OR bay_assigned > 4);'
      }
    ]
  },
  tags: ['do-block', 'while-loop', 'control-flow']
};
