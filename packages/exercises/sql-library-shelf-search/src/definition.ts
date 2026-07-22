import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'sql-library-shelf-search',
  topic: ['sql', 'where'],
  difficulty: 'Beginner',
  title: { de: 'Bücher, die noch im Regal stehen', en: 'Books still on the shelf' },
  prompt: {
    de: [
      'Der Lesesaal braucht eine Liste der Bücher, die ein Besucher tatsächlich mitnehmen kann.',
      '',
      'Ein Buch ist verfügbar, wenn es nie als verloren gemeldet wurde — das ist der Fall, wenn `lost_on` keinen Wert enthält.',
      'Behalte von diesen Büchern die, die entweder in einem Geschichtsregal stehen — `shelf_code` beginnt mit `HIST` —',
      'oder deren Autorenname `Meyer` enthält.',
      '',
      'Gib `title` und `author` zurück, sortiert nach `title`.'
    ].join('\n'),
    en: [
      'The reading room needs a list of books a visitor can actually pick up.',
      '',
      'A book is available when it has never been reported lost, which is the case when `lost_on` holds no value.',
      'From those books, keep the ones that either sit on a history shelf — `shelf_code` starts with `HIST` —',
      'or were written by an author whose name contains `Meyer`.',
      '',
      'Return `title` and `author`, ordered by `title`.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS books;

    CREATE TABLE books (
      id integer PRIMARY KEY,
      title text NOT NULL,
      author text NOT NULL,
      shelf_code text NOT NULL,
      lost_on date
    );

    INSERT INTO books (id, title, author, shelf_code, lost_on) VALUES
      (1, 'Bronze Age Trade Routes', 'Ines Meyer', 'HIST-04', NULL),
      (2, 'Cold Fusion Diaries', 'Paul Renner', 'SCI-11', NULL),
      (3, 'Dockside Chronicles', 'Ute Hartmann', 'HIST-12', NULL),
      (4, 'Empires of Salt', 'Karl Meyerhoff', 'GEO-02', NULL),
      (5, 'Fossils and Folklore', 'Ana Sole', 'HIST-01', '2026-02-03'),
      (6, 'Gardening by Moon', 'Ines Meyer', 'BOT-07', '2026-01-09'),
      (7, 'Harbour Law', 'Tom Meyer', 'LAW-03', NULL),
      (8, 'Ice Roads', 'Rita Vogel', 'HST-09', NULL);
  `,
  starterSql: 'SELECT title, author\nFROM books\nWHERE lost_on IS NULL;',
  hints: [
    {
      text: {
        de: 'Ein fehlender Wert ist niemals gleich irgendetwas, nicht einmal sich selbst — nur IS NULL / IS NOT NULL kann darauf prüfen.',
        en: 'A missing value is never equal to anything, not even to itself — only IS NULL / IS NOT NULL can test for it.'
      }
    },
    {
      text: {
        de: 'AND bindet stärker als OR, daher brauchen die beiden alternativen Bedingungen für Regal und Autor Klammern um sich herum.',
        en: 'AND binds tighter than OR, so the two alternative shelf and author conditions need parentheses around them.'
      }
    },
    {
      text: {
        de: 'In einem LIKE-Muster steht % für beliebig viele Zeichen und _ für genau eines — achte darauf, wo du sie platzierst.',
        en: 'In a LIKE pattern % stands for any number of characters and _ for exactly one — mind where you place them.'
      }
    }
  ],
  grading: {
    kind: 'result-equals',
    ordered: true,
    expectedSql: `
      SELECT b.title, b.author
      FROM books AS b
      WHERE b.lost_on IS NULL
        AND (b.shelf_code LIKE 'HIST%' OR b.author LIKE '%Meyer%')
      ORDER BY b.title;
    `
  },
  tags: ['where', 'like', 'null']
};
