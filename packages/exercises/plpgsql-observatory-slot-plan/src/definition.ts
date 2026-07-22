import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'plpgsql-observatory-slot-plan',
  topic: ['plpgsql', 'functions'],
  difficulty: 'Profi',
  title: {
    de: 'Eine Beobachtung in Teleskop-Zeitblöcke aufteilen',
    en: 'Split an observation into telescope slots'
  },
  prompt: {
    de: [
      'Teleskopzeit wird in Blöcken von 45 Minuten vergeben. Die Planung muss wissen, wie viele',
      'volle Blöcke eine Anfrage füllt und wie viele Minuten übrig bleiben.',
      '',
      'Schreibe eine PL/pgSQL-Funktion mit zwei OUT-Parametern:',
      '`plan_session(p_request_id integer, OUT slots integer, OUT leftover integer)`.',
      '',
      'Schlage die angefragten Minuten in `observation_request` nach und ziehe in einer `WHILE`-Schleife',
      'jeweils 45 Minuten ab, wobei du die vollen Blöcke zählst; was übrig bleibt, ist der Rest.',
      '',
      'Bei einer unbekannten Anfrage-ID bleiben beide OUT-Parameter NULL.',
      'Rufe sie auf mit `SELECT * FROM plan_session(1);`'
    ].join('\n'),
    en: [
      'Telescope time is handed out in blocks of 45 minutes. The scheduler needs to know how many',
      'full blocks a request fills and how many minutes are left over.',
      '',
      'Write a PL/pgSQL function with two OUT parameters:',
      '`plan_session(p_request_id integer, OUT slots integer, OUT leftover integer)`.',
      '',
      'Look the requested minutes up in `observation_request` and take 45 minutes away in a `WHILE`',
      'loop, counting the full blocks; whatever is left is the leftover.',
      '',
      'For an unknown request id both OUT parameters stay NULL.',
      'Call it as `SELECT * FROM plan_session(1);`'
    ].join('\n')
  },
  seedSql: `
    DROP FUNCTION IF EXISTS plan_session(integer);
    DROP TABLE IF EXISTS observation_request;

    CREATE TABLE observation_request (
      id integer PRIMARY KEY,
      target text NOT NULL,
      minutes integer NOT NULL
    );

    INSERT INTO observation_request (id, target, minutes) VALUES
      (1, 'M31 Andromeda', 150),
      (2, 'Orion Nebula', 45),
      (3, 'Vega', 44),
      (4, 'Comet 12P', 0),
      (5, 'Ring Nebula', 180);
  `,
  starterSql: [
    'CREATE OR REPLACE FUNCTION plan_session(p_request_id integer, OUT slots integer, OUT leftover integer)',
    'AS $plan_session$',
    'DECLARE',
    '  total integer;',
    'BEGIN',
    '  RETURN;',
    'END;',
    '$plan_session$ LANGUAGE plpgsql;'
  ].join('\n'),
  hints: [
    {
      text: {
        de: 'OUT-Parameter ersetzen die `RETURNS`-Klausel: Sie sind schon deklariert, du weist ihnen nur Werte zu, und ein einfaches `RETURN` gibt sie zurück.',
        en: 'OUT parameters replace the RETURNS clause: they are already declared, you only assign them and a bare RETURN hands them back.'
      }
    },
    {
      text: {
        de: 'Beide OUT-Parameter unangetastet zu lassen ist genau das NULL-Ergebnis, das die unbekannte ID braucht — entscheide also früh, ob die Suche überhaupt etwas gefunden hat.',
        en: 'Leaving both OUT parameters untouched is exactly the NULL result the unknown id needs — so decide early whether the lookup found anything.'
      }
    },
    {
      text: {
        de: 'Die Schleifenbedingung entscheidet über die Grenze: Eine Anfrage von genau 45 Minuten muss als ein voller Block mit nichts übrig zählen.',
        en: 'The loop condition decides the boundary: a request of exactly 45 minutes must count as one full block with nothing left.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: '150 Minuten sind 3 Blöcke mit 15 Minuten Rest',
          en: '150 minutes are 3 blocks with 15 minutes left'
        },
        sql: 'SELECT slots = 3 AND leftover = 15 AS ok FROM plan_session(1);'
      },
      {
        label: {
          de: 'Genau 45 Minuten sind ein voller Block',
          en: 'Exactly 45 minutes are one full block'
        },
        sql: 'SELECT slots = 1 AND leftover = 0 AS ok FROM plan_session(2);'
      },
      {
        label: { de: '44 Minuten füllen keinen Block', en: '44 minutes do not fill a block' },
        sql: 'SELECT slots = 0 AND leftover = 44 AS ok FROM plan_session(3);'
      },
      {
        label: {
          de: 'Eine Anfrage über 0 Minuten ergibt 0 und 0',
          en: 'A request of 0 minutes gives 0 and 0'
        },
        sql: 'SELECT slots = 0 AND leftover = 0 AS ok FROM plan_session(4);'
      },
      {
        label: { de: '180 Minuten sind genau 4 Blöcke', en: '180 minutes are exactly 4 blocks' },
        sql: 'SELECT slots = 4 AND leftover = 0 AS ok FROM plan_session(5);'
      },
      {
        label: {
          de: 'Eine unbekannte Anfrage lässt beide OUT-Parameter NULL',
          en: 'An unknown request leaves both OUT parameters NULL'
        },
        sql: 'SELECT slots IS NULL AND leftover IS NULL AS ok FROM plan_session(99);'
      },
      {
        label: {
          de: 'Jede Anfrage in der Tabelle lässt sich verplanen',
          en: 'Every request in the table can be planned'
        },
        sql: 'SELECT sum(p.slots) = 8 AS ok FROM observation_request AS r, plan_session(r.id) AS p;'
      }
    ]
  },
  tags: ['out-parameter', 'while', 'select-into']
};
