import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'sql-marathon-top-finishers',
  topic: ['sql', 'select'],
  difficulty: 'Beginner',
  title: { de: 'Die drei schnellsten Marathonläufer', en: 'Top three marathon finishers' },
  prompt: {
    de: [
      'Der Stadtmarathon ist gelaufen und die Rennleitung braucht die Bestenliste für die Siegerehrung.',
      '',
      'Gib die drei schnellsten Läufer zurück: die Spalten `runner_name` und `finish_seconds`,',
      'sortiert vom schnellsten zum langsamsten.'
    ].join('\n'),
    en: [
      'The city marathon is done and race control needs the leaderboard for the award ceremony.',
      '',
      'Return the three fastest runners: the columns `runner_name` and `finish_seconds`,',
      'ordered from fastest to slowest.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS finishers;

    CREATE TABLE finishers (
      id integer PRIMARY KEY,
      runner_name text NOT NULL,
      finish_seconds integer NOT NULL
    );

    INSERT INTO finishers (id, runner_name, finish_seconds) VALUES
      (1, 'Nora Vidmar', 8340),
      (2, 'Iggy Cole', 8120),
      (3, 'Petra Sung', 8600),
      (4, 'Marco Ilic', 8215),
      (5, 'Dana Frei', 8175),
      (6, 'Leo Bantu', 8340),
      (7, 'Sara Nkemi', 8210),
      (8, 'Tomas Reyes', 8450);
  `,
  starterSql: 'SELECT runner_name, finish_seconds\nFROM finishers\nLIMIT 3;',
  hints: [
    {
      text: {
        de: 'LIMIT schneidet einfach die ersten Zeilen ab, die bei der Anfrage ankommen — ohne ORDER BY ist das die Speicherreihenfolge, nicht die Zielzeit.',
        en: 'LIMIT simply cuts off the first rows that arrive in the query — without ORDER BY that is storage order, not finish time.'
      }
    },
    {
      text: {
        de: 'Wenn zwei Läufer genau dieselbe Zeit hätten, wäre nicht eindeutig, wer von beiden unter die Top 3 fällt — hier sind die ersten drei Zeiten aber alle verschieden.',
        en: 'If two runners shared the exact same time, it would be unclear which of them belongs in the top 3 — here the first three times are all distinct, though.'
      }
    }
  ],
  grading: {
    kind: 'result-equals',
    ordered: true,
    expectedSql: `
      SELECT f.runner_name, f.finish_seconds
      FROM finishers AS f
      ORDER BY f.finish_seconds ASC
      LIMIT 3;
    `
  },
  tags: ['limit', 'order-by', 'top-n']
};
