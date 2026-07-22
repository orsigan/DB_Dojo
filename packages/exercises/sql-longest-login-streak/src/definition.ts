import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'sql-longest-login-streak',
  topic: ['sql', 'window-functions'],
  difficulty: 'Ultra',
  title: { de: 'Längste Login-Serie', en: 'Longest login streak' },
  prompt: {
    de: [
      'Finde für jeden Nutzer die längste Serie aufeinanderfolgender Kalendertage, an denen er sich eingeloggt hat.',
      '',
      'Gib die Spalten `name` und `longest_streak` zurück, sortiert nach `name`.',
      'Mehrere Logins am selben Tag zählen als ein Tag.',
      'Nutzer, die sich nie eingeloggt haben, müssen trotzdem erscheinen, mit einer Serie von 0.'
    ].join('\n'),
    en: [
      'For every user, find the longest run of consecutive calendar days on which they logged in.',
      '',
      'Return the columns `name` and `longest_streak`, ordered by `name`.',
      'Several logins on the same day count as one day.',
      'Users who never logged in must still appear, with a streak of 0.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS logins;
    DROP TABLE IF EXISTS users;

    CREATE TABLE users (
      id integer PRIMARY KEY,
      name text NOT NULL
    );

    CREATE TABLE logins (
      id integer PRIMARY KEY,
      user_id integer NOT NULL REFERENCES users (id),
      logged_at timestamp NOT NULL
    );

    INSERT INTO users (id, name) VALUES
      (1, 'Alice'),
      (2, 'Bob'),
      (3, 'Carol'),
      (4, 'Dana');

    INSERT INTO logins (id, user_id, logged_at) VALUES
      (1, 1, '2026-01-01 08:15'),
      (2, 1, '2026-01-02 09:00'),
      (3, 1, '2026-01-02 21:40'),
      (4, 1, '2026-01-03 07:05'),
      (5, 1, '2026-01-07 12:30'),
      (6, 2, '2026-01-01 10:00'),
      (7, 2, '2026-01-02 10:00'),
      (8, 2, '2026-01-10 18:20'),
      (9, 2, '2026-01-11 18:25'),
      (10, 2, '2026-01-12 19:00'),
      (11, 2, '2026-01-13 08:45'),
      (12, 3, '2026-01-09 11:11');
  `,
  starterSql: 'SELECT u.name\nFROM users AS u;',
  hints: [
    {
      text: {
        de: 'Reduziere die Zeitstempel zunächst auf eindeutige Tage — logged_at::date entfernt die Uhrzeit, DISTINCT entfernt die doppelten Logins.',
        en: 'Reduce the timestamps to distinct days first — logged_at::date removes the time of day, DISTINCT removes the duplicate logins.'
      }
    },
    {
      text: {
        de: 'Zieht man row_number() OVER (PARTITION BY user_id ORDER BY day) vom Tag ab, ergibt sich für jeden Tag einer zusammenhängenden Serie derselbe Wert — dieser Wert ist der Gruppenschlüssel.',
        en: 'Subtracting row_number() OVER (PARTITION BY user_id ORDER BY day) from the day gives the same value for every day of a consecutive run — that value is the group key.'
      }
    },
    {
      text: {
        de: 'Zähle die Zeilen pro Gruppenschlüssel, um die Länge jeder Serie zu erhalten, nimm das Maximum pro Nutzer und verbinde mit LEFT JOIN zurück auf users, damit Dana ihre 0 behält.',
        en: 'Count the rows per group key to get each streak length, take the maximum per user, and LEFT JOIN back onto users so Dana keeps a 0.'
      }
    }
  ],
  grading: {
    kind: 'result-equals',
    ordered: true,
    expectedSql: `
      WITH login_days AS (
        SELECT DISTINCT l.user_id, l.logged_at::date AS day
        FROM logins AS l
      ),
      runs AS (
        SELECT
          d.user_id,
          d.day - (row_number() OVER (PARTITION BY d.user_id ORDER BY d.day))::integer AS run_key
        FROM login_days AS d
      ),
      streaks AS (
        SELECT r.user_id, count(*) AS streak
        FROM runs AS r
        GROUP BY r.user_id, r.run_key
      )
      SELECT u.name, coalesce(max(s.streak), 0) AS longest_streak
      FROM users AS u
      LEFT JOIN streaks AS s ON s.user_id = u.id
      GROUP BY u.name
      ORDER BY u.name;
    `
  },
  tags: ['window-function', 'gaps-and-islands', 'aggregation']
};
