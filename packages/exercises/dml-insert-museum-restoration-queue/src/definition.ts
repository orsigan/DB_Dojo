import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'dml-insert-museum-restoration-queue',
  topic: ['dml', 'insert'],
  difficulty: 'Profi',
  title: {
    de: 'Artefakte zur Restaurierung einplanen',
    en: 'Schedule artifacts for restoration'
  },
  prompt: {
    de: [
      'Das Restaurierungsteam führt seine Arbeitsliste in `restoration_queue`, die bereits einen Eintrag enthält.',
      '',
      'Füge jedes Artefakt hinzu, das mindestens zwei Zustandsberichte mit Schweregrad `3` oder schlechter hat.',
      'Speichere für jedes davon:',
      '- `artifact_id` und `name` des Artefakts',
      '- `worst_severity` — der höchste Schweregrad über *alle* seine Berichte',
      '- `report_count` — wie viele Berichte es insgesamt hat',
      '',
      'Ein Artefakt, das bereits auf der Arbeitsliste steht, muss genau so bleiben, wie es ist,',
      'auch wenn seine gespeicherten Zahlen nicht mehr zu den Berichten passen.'
    ].join('\n'),
    en: [
      'The conservation team keeps its worklist in `restoration_queue`, which already holds one entry.',
      '',
      'Add every artifact that has at least two condition reports of severity `3` or worse.',
      'For each of them store:',
      '- `artifact_id` and `name` of the artifact',
      '- `worst_severity` — the highest severity across *all* of its reports',
      '- `report_count` — how many reports it has in total',
      '',
      'An artifact that is already on the worklist must be left exactly as it stands,',
      'even if its stored numbers no longer match the reports.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS restoration_queue;
    DROP TABLE IF EXISTS condition_reports;
    DROP TABLE IF EXISTS artifacts;

    CREATE TABLE artifacts (
      id integer PRIMARY KEY,
      name text NOT NULL,
      gallery text NOT NULL
    );

    CREATE TABLE condition_reports (
      id integer PRIMARY KEY,
      artifact_id integer NOT NULL REFERENCES artifacts (id),
      reported_on date NOT NULL,
      severity integer NOT NULL
    );

    CREATE TABLE restoration_queue (
      artifact_id integer PRIMARY KEY REFERENCES artifacts (id),
      name text NOT NULL,
      worst_severity integer NOT NULL,
      report_count integer NOT NULL
    );

    INSERT INTO artifacts (id, name, gallery) VALUES
      (1, 'Bronze Mirror', 'Asia'),
      (2, 'Cedar Mask', 'Africa'),
      (3, 'Glass Amphora', 'Antiquity'),
      (4, 'Silk Scroll', 'Asia'),
      (5, 'Iron Astrolabe', 'Antiquity');

    INSERT INTO condition_reports (id, artifact_id, reported_on, severity) VALUES
      (1, 1, '2026-01-12', 4),
      (2, 1, '2026-02-03', 3),
      (3, 1, '2026-02-27', 1),
      (4, 2, '2026-01-30', 5),
      (5, 2, '2026-03-11', 2),
      (6, 3, '2026-01-05', 3),
      (7, 3, '2026-01-22', 3),
      (8, 3, '2026-02-14', 5),
      (9, 3, '2026-03-02', 2),
      (10, 4, '2026-02-08', 2),
      (11, 4, '2026-03-19', 1),
      (12, 5, '2026-01-17', 4),
      (13, 5, '2026-02-25', 4);

    INSERT INTO restoration_queue (artifact_id, name, worst_severity, report_count) VALUES
      (5, 'Iron Astrolabe', 2, 1);
  `,
  starterSql:
    'SELECT artifact_id, count(*) AS report_count, max(severity) AS worst_severity\nFROM condition_reports\nGROUP BY artifact_id\nORDER BY artifact_id;',
  hints: [
    {
      text: {
        de: 'Die Bedingung, die entscheidet, wer auf die Liste kommt, betrifft eine Gruppe, nicht eine einzelne Zeile — dafür ist HAVING da, während WHERE vor der Gruppierung ausgeführt wird.',
        en: 'The condition that decides who joins the list is about a group, not about a single row — that is what HAVING is for, while WHERE runs before the grouping.'
      }
    },
    {
      text: {
        de: 'Nur die *Zählung* wird auf schwere Berichte eingeschränkt; `worst_severity` und `report_count` betrachten weiterhin jeden Bericht. Ein aggregierter FILTER erlaubt es, beides in einer gruppierten Anfrage zu vereinen.',
        en: 'Only the *count* is restricted to severe reports; `worst_severity` and `report_count` still look at every report. An aggregate FILTER lets you keep both in one grouped query.'
      }
    },
    {
      text: {
        de: 'Artefakte auszuschließen, die bereits eingereiht sind, ist eine zweite Bedingung auf der Quellanfrage — NOT EXISTS gegen `restoration_queue` verhindert eine Verletzung des Primärschlüssels.',
        en: 'Excluding artifacts that are already queued is a second condition on the source query — NOT EXISTS against `restoration_queue` keeps the primary key from being violated.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'Die Arbeitsliste enthält genau drei Artefakte',
          en: 'The worklist holds exactly three artifacts'
        },
        sql: 'SELECT count(*) = 3 AS ok FROM restoration_queue;'
      },
      {
        label: {
          de: 'Bronze Mirror und Glass Amphora wurden mit den richtigen Summen eingereiht',
          en: 'Bronze Mirror and Glass Amphora were queued with the right totals'
        },
        sql: `
          SELECT count(*) = 2 AS ok
          FROM restoration_queue
          WHERE (artifact_id = 1 AND name = 'Bronze Mirror' AND worst_severity = 4 AND report_count = 3)
             OR (artifact_id = 3 AND name = 'Glass Amphora' AND worst_severity = 5 AND report_count = 4);
        `
      },
      {
        label: {
          de: 'Der bereits vorhandene Eintrag behält seine alten Zahlen',
          en: 'The entry that was already on the list keeps its old numbers'
        },
        sql: `
          SELECT count(*) = 1 AS ok
          FROM restoration_queue
          WHERE artifact_id = 5 AND name = 'Iron Astrolabe' AND worst_severity = 2 AND report_count = 1;
        `
      },
      {
        label: {
          de: 'Cedar Mask und Silk Scroll blieben von der Liste ausgeschlossen',
          en: 'Cedar Mask and Silk Scroll stayed off the list'
        },
        sql: 'SELECT count(*) = 0 AS ok FROM restoration_queue WHERE artifact_id IN (2, 4);'
      },
      {
        label: {
          de: 'Kein Zustandsbericht wurde verändert',
          en: 'No condition report was changed'
        },
        sql: `
          SELECT count(*) = 13 AND sum(severity) = 39 AS ok
          FROM condition_reports;
        `
      }
    ]
  },
  tags: ['insert-select', 'aggregation', 'not-exists']
};
