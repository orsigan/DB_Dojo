import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'permissions-view-shields-drafts',
  topic: ['permissions'],
  difficulty: 'Advanced',
  title: { de: 'Eine Sicht als Datenschutzfilter', en: 'A view as a privacy filter' },
  prompt: {
    de: [
      'Ein Syndication-Partner veröffentlicht Artikel der Redaktion weiter. Unveröffentlichte Entwürfe, E-Mail-Adressen der Autoren und interne Redaktionsnotizen dürfen ihn nie erreichen.',
      'Tabellenrechte allein können das nicht abbilden: Sie wirken pro Tabelle, nicht pro Zeile oder Spalte.',
      '',
      'Erstelle eine Sicht `published_articles`, die genau die Spalten `id`, `headline` und `body` (in dieser Reihenfolge) liefert und nur die Zeilen, bei denen `published` true ist.',
      'Vergib SELECT auf diese Sicht an die bestehende Rolle `syndication_partner` — nur lesend.',
      'Die Rolle darf kein Recht auf die Tabelle `articles` selbst erhalten.'
    ].join('\n'),
    en: [
      'A syndication partner republishes articles of the newsroom. Unpublished drafts, author e-mail addresses and internal editorial notes must never reach them.',
      'Table privileges alone cannot express that: they work per table, not per row or column.',
      '',
      'Create a view `published_articles` that returns exactly the columns `id`, `headline` and `body` (in that order) and only the rows where `published` is true.',
      'Grant SELECT on that view to the existing role `syndication_partner` — reading only.',
      'The role must not receive any privilege on the table `articles` itself.'
    ].join('\n')
  },
  seedSql: `
    DROP VIEW IF EXISTS published_articles;
    DROP TABLE IF EXISTS articles;
    DROP ROLE IF EXISTS syndication_partner;

    CREATE ROLE syndication_partner;

    CREATE TABLE articles (
      id integer PRIMARY KEY,
      headline text NOT NULL,
      body text NOT NULL,
      author_email text NOT NULL,
      editor_notes text,
      published boolean NOT NULL DEFAULT false
    );

    INSERT INTO articles (id, headline, body, author_email, editor_notes, published) VALUES
      (1, 'Harbour bridge reopens', 'After four months the bridge carries traffic again.', 'weiss@example.org', 'checked with city council', true),
      (2, 'Council budget leaked', 'Draft figures suggest a deficit.', 'okonkwo@example.org', 'HOLD - legal review pending', false),
      (3, 'New tram line approved', 'Line 9 will run from spring 2027.', 'weiss@example.org', NULL, true),
      (4, 'Interview: the new curator', 'A long read about the museum.', 'brandt@example.org', 'needs photo', false),
      (5, 'Storm damage report', 'Roughly 200 trees were lost.', 'brandt@example.org', NULL, true);
  `,
  starterSql: 'SELECT id, headline, body\nFROM articles\nWHERE published;',
  hints: [
    {
      text: {
        de: 'Eine Sicht schränkt Spalten und Zeilen gleichzeitig ein; der Leser sieht immer nur ihr Ergebnis, nie die dahinterliegende Tabelle.',
        en: 'A view restricts columns and rows at the same time; the reader only ever sees its result, never the table underneath.'
      }
    },
    {
      text: {
        de: 'Lesen durch eine Sicht benötigt kein Recht auf die Basistabelle — der Sicht-Eigentümer stellt den Zugriff bereit, und genau das macht die Sicht zu einem Datenschutzinstrument.',
        en: 'Reading through a view needs no privilege on the base table — the view owner supplies the access, which is exactly what makes the view a privacy instrument.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'Die Sicht published_articles existiert',
          en: 'The view published_articles exists'
        },
        sql: "SELECT count(*) = 1 AS ok FROM pg_views WHERE schemaname = 'public' AND viewname = 'published_articles';"
      },
      {
        label: {
          de: 'Sie zeigt genau id, headline und body',
          en: 'It exposes exactly id, headline and body'
        },
        sql: `
          SELECT array_agg(column_name::text ORDER BY ordinal_position) = ARRAY['id', 'headline', 'body'] AS ok
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'published_articles';
        `
      },
      {
        label: {
          de: 'Sie zeigt jeden veröffentlichten Artikel und keinen Entwurf',
          en: 'It shows every published article and no draft'
        },
        sql: `
          SELECT (SELECT count(*) FROM published_articles) = (SELECT count(*) FROM articles WHERE published)
             AND NOT EXISTS (
               SELECT 1
               FROM published_articles AS p
               JOIN articles AS a ON a.id = p.id
               WHERE NOT a.published
             ) AS ok;
        `
      },
      {
        label: {
          de: 'syndication_partner darf die Sicht lesen',
          en: 'syndication_partner may read the view'
        },
        sql: "SELECT has_table_privilege('syndication_partner', 'published_articles', 'SELECT') AS ok;"
      },
      {
        label: {
          de: 'syndication_partner kann nicht durch die Sicht schreiben',
          en: 'syndication_partner cannot write through the view'
        },
        sql: `
          SELECT NOT has_table_privilege('syndication_partner', 'published_articles', 'INSERT')
             AND NOT has_table_privilege('syndication_partner', 'published_articles', 'UPDATE')
             AND NOT has_table_privilege('syndication_partner', 'published_articles', 'DELETE') AS ok;
        `
      },
      {
        label: {
          de: 'syndication_partner besitzt kein Recht auf articles',
          en: 'syndication_partner has no privilege on articles'
        },
        sql: `
          SELECT NOT has_table_privilege('syndication_partner', 'articles', 'SELECT')
             AND NOT has_column_privilege('syndication_partner', 'articles', 'headline', 'SELECT')
             AND NOT has_column_privilege('syndication_partner', 'articles', 'editor_notes', 'SELECT') AS ok;
        `
      }
    ]
  },
  tags: ['view', 'grant', 'privacy']
};
