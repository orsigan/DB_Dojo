import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'sql-cinema-weekly-box-office-rank',
  topic: ['sql', 'window-functions'],
  difficulty: 'Advanced',
  title: { de: 'Wöchentliche Kinocharts', en: 'Weekly box office chart' },
  prompt: {
    de: [
      'Die Kinokette erstellt jede Woche eine Bestenliste ihrer Filme nach Einspielergebnis (revenue).',
      '',
      'Gib die Spalten `week_no`, `movie` und `rank` zurück, sortiert nach `week_no`, `rank` und `movie`.',
      'Der Rang wird pro Woche neu vergeben, mit dem höchsten Einspielergebnis zuerst.',
      'Filme mit exakt gleichem Einspielergebnis in derselben Woche teilen sich den Rang, und der nächste Rang wird dabei übersprungen — verwende RANK(), nicht DENSE_RANK().'
    ].join('\n'),
    en: [
      'The cinema chain publishes a weekly chart of its movies ranked by box-office revenue.',
      '',
      'Return the columns `week_no`, `movie` and `rank`, ordered by `week_no`, `rank` and `movie`.',
      'The rank restarts for every week, with the highest revenue first.',
      'Movies with exactly the same revenue in the same week share a rank, and the next rank is skipped — use RANK(), not DENSE_RANK().'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS box_office;

    CREATE TABLE box_office (
      id integer PRIMARY KEY,
      movie text NOT NULL,
      week_no integer NOT NULL,
      revenue numeric NOT NULL
    );

    INSERT INTO box_office (id, movie, week_no, revenue) VALUES
      (1, 'Nebula Drift', 1, 500000),
      (2, 'Starlight Heist', 1, 500000),
      (3, 'Iron Orbit', 1, 300000),
      (4, 'Velvet Static', 1, 200000),
      (5, 'Nebula Drift', 2, 400000),
      (6, 'Starlight Heist', 2, 350000),
      (7, 'Iron Orbit', 2, 350000),
      (8, 'Velvet Static', 2, 100000),
      (9, 'Nebula Drift', 3, 600000),
      (10, 'Starlight Heist', 3, 450000),
      (11, 'Iron Orbit', 3, 300000),
      (12, 'Velvet Static', 3, 150000);
  `,
  starterSql: 'SELECT week_no, movie, revenue\nFROM box_office\nORDER BY week_no;',
  hints: [
    {
      text: {
        de: 'PARTITION BY week_no sorgt dafür, dass die Rangvergabe in jeder Woche wieder bei 1 beginnt, statt fortlaufend über alle Zeilen zu zählen.',
        en: 'PARTITION BY week_no makes the ranking start over at 1 in every week, instead of counting continuously across all rows.'
      }
    },
    {
      text: {
        de: 'RANK() OVER (PARTITION BY week_no ORDER BY revenue DESC) vergibt bei einem Gleichstand denselben Rang an beide Zeilen — der nächste Film bekommt dann Rang 3 statt Rang 2 (eine Lücke entsteht). DENSE_RANK() würde diese Lücke schließen; hier ist genau das Verhalten von RANK() gefragt.',
        en: "RANK() OVER (PARTITION BY week_no ORDER BY revenue DESC) gives tied rows the same rank, and the next movie then jumps to rank 3 instead of 2 (a gap appears). DENSE_RANK() would close that gap; this exercise specifically wants RANK()'s behavior."
      }
    },
    {
      text: {
        de: 'Da sich Ties den Rang teilen, brauchst du für eine eindeutige Sortierung eine dritte Sortierspalte: ORDER BY week_no, rank, movie.',
        en: 'Since tied rows share a rank, you need a third sort column for a deterministic order: ORDER BY week_no, rank, movie.'
      }
    }
  ],
  grading: {
    kind: 'result-equals',
    ordered: true,
    expectedSql: `
      SELECT
        week_no,
        movie,
        RANK() OVER (PARTITION BY week_no ORDER BY revenue DESC) AS rank
      FROM box_office
      ORDER BY week_no, rank, movie;
    `
  },
  tags: ['window-functions', 'rank', 'partition-by']
};
