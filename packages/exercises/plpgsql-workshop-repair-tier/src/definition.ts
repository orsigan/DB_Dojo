import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'plpgsql-workshop-repair-tier',
  topic: ['plpgsql', 'control-flow'],
  difficulty: 'Advanced',
  title: { de: 'Einen Reparaturauftrag einstufen', en: 'Classify a repair job' },
  prompt: {
    de: [
      'Die Werkstatt berechnet Arbeitszeit mit 75,00 pro Stunde und schlägt die Teilekosten obendrauf.',
      'Jeder Auftrag wird danach einer Stufe zugeordnet.',
      '',
      'Schreibe eine PL/pgSQL-Funktion `repair_tier(p_job_id integer) RETURNS text`, die den Auftrag nachschlägt,',
      '`labour_hours * 75 + parts_cost` berechnet und die Summe mit einem `CASE` einstuft:',
      '',
      '- unter 200 -> `small`',
      '- 200 bis unter 800 -> `standard`',
      '- 800 und mehr -> `major`',
      '',
      'Wenn es keinen Auftrag mit dieser ID gibt, gib NULL zurück.'
    ].join('\n'),
    en: [
      'The workshop bills labour at 75.00 per hour and adds the parts cost on top.',
      'Every job is then filed under a tier.',
      '',
      'Write a PL/pgSQL function `repair_tier(p_job_id integer) RETURNS text` that looks up the job,',
      'computes `labour_hours * 75 + parts_cost` and classifies the total with a `CASE`:',
      '',
      '- below 200 -> `small`',
      '- 200 up to below 800 -> `standard`',
      '- 800 and above -> `major`',
      '',
      'If there is no job with that id, return NULL.'
    ].join('\n')
  },
  seedSql: `
    DROP FUNCTION IF EXISTS repair_tier(integer);
    DROP TABLE IF EXISTS repair_job;

    CREATE TABLE repair_job (
      id integer PRIMARY KEY,
      vehicle text NOT NULL,
      labour_hours numeric NOT NULL,
      parts_cost numeric NOT NULL
    );

    INSERT INTO repair_job (id, vehicle, labour_hours, parts_cost) VALUES
      (1, 'Golf', 1.0, 40.00),
      (2, 'Transit', 2.0, 50.00),
      (3, 'Vespa', 0.5, 20.00),
      (4, 'Sprinter', 8.0, 200.00),
      (5, 'Astra', 4.0, 100.00),
      (6, 'Ducato', 12.0, 500.00);
  `,
  starterSql: [
    'CREATE OR REPLACE FUNCTION repair_tier(p_job_id integer) RETURNS text AS $repair_tier$',
    'DECLARE',
    '  total numeric;',
    'BEGIN',
    '  RETURN NULL;',
    'END;',
    '$repair_tier$ LANGUAGE plpgsql;'
  ].join('\n'),
  hints: [
    {
      text: {
        de: 'Nach einem `SELECT ... INTO` auf eine fehlende Zeile bleibt die Variable einfach NULL — das reicht, um den unbekannten Auftrag zu erkennen.',
        en: 'After a SELECT ... INTO on a missing row the variable simply stays NULL — that is enough to detect the unknown job.'
      }
    },
    {
      text: {
        de: 'Ein searched `CASE` prüft seine Bedingungen von oben nach unten, wenn du die Bereiche von günstig nach teuer ordnest, bleibt jeder Zweig ein einzelner Vergleich.',
        en: 'A searched CASE evaluates its conditions top to bottom, so ordering the ranges from cheap to expensive keeps every branch to a single comparison.'
      }
    },
    {
      text: {
        de: 'Achte auf die beiden Grenzen: Genau 200 und genau 800 gehören jeweils zur teureren Stufe.',
        en: 'Mind the two boundaries: exactly 200 and exactly 800 each belong to the more expensive tier.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: { de: 'Ein Auftrag über 115,00 ist small', en: 'A 115.00 job is small' },
        sql: "SELECT repair_tier(1) = 'small' AS ok;"
      },
      {
        label: {
          de: 'Ein Auftrag über genau 200,00 ist standard',
          en: 'A job of exactly 200.00 is standard'
        },
        sql: "SELECT repair_tier(2) = 'standard' AS ok;"
      },
      {
        label: { de: 'Ein Auftrag über 57,50 ist small', en: 'A 57.50 job is small' },
        sql: "SELECT repair_tier(3) = 'small' AS ok;"
      },
      {
        label: {
          de: 'Ein Auftrag über genau 800,00 ist major',
          en: 'A job of exactly 800.00 is major'
        },
        sql: "SELECT repair_tier(4) = 'major' AS ok;"
      },
      {
        label: { de: 'Ein Auftrag über 400,00 ist standard', en: 'A 400.00 job is standard' },
        sql: "SELECT repair_tier(5) = 'standard' AS ok;"
      },
      {
        label: {
          de: 'Eine unbekannte Auftrags-ID liefert NULL',
          en: 'An unknown job id returns NULL'
        },
        sql: 'SELECT repair_tier(99) IS NULL AS ok;'
      },
      {
        label: { de: 'Genau zwei Aufträge sind major', en: 'Exactly two jobs are major' },
        sql: "SELECT count(*) = 2 AS ok FROM repair_job WHERE repair_tier(id) = 'major';"
      }
    ]
  },
  tags: ['case', 'select-into', 'function']
};
