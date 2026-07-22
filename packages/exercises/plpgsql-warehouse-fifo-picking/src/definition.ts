import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'plpgsql-warehouse-fifo-picking',
  topic: ['plpgsql', 'cursors'],
  difficulty: 'Ultra',
  title: { de: 'FIFO-Kommissionierliste', en: 'FIFO picking list' },
  prompt: {
    de: [
      'Das Lager führt jeden Artikel in mehreren Chargen. Ein Auftrag wird immer zuerst aus der ältesten Charge kommissioniert,',
      'und eine Charge kann sich auf mehrere Aufträge aufteilen.',
      '',
      'Schreibe eine PL/pgSQL-Funktion',
      '`pick_order(p_sku text, p_quantity integer) RETURNS TABLE(lot_id integer, taken integer)`',
      'die die Kommissionierliste für einen Auftrag erzeugt:',
      '',
      '- durchlaufe die Chargen dieses Artikels mit einem Cursor, älteste `received_on` zuerst',
      '- entnimm jeder Charge so viel, wie noch fehlt, höchstens aber, was die Charge enthält',
      '- gib pro Charge, die tatsächlich beiträgt, eine Zeile zurück, in Kommissionierreihenfolge',
      '- höre auf, sobald der Auftrag vollständig ist; eine Charge, die nichts beiträgt, wird nicht aufgeführt',
      '- eine Menge von 0 liefert keine Zeilen',
      '',
      'Wenn die Chargen nicht zur angefragten Menge reichen, brich mit `RAISE EXCEPTION` ab — eine Kommissionierliste,',
      'die zu kurz ist, ist schlimmer als gar keine.',
      'Die Funktion meldet nur; sie darf `stock_lot` nicht verändern.'
    ].join('\n'),
    en: [
      'The warehouse stores each article in several lots. An order is always picked oldest lot first,',
      'and a lot may be split across several orders.',
      '',
      'Write a PL/pgSQL function',
      '`pick_order(p_sku text, p_quantity integer) RETURNS TABLE(lot_id integer, taken integer)`',
      'that produces the picking list for one order:',
      '',
      '- walk the lots of that article with a cursor, oldest `received_on` first',
      '- take as much from each lot as is still missing, at most what the lot holds',
      '- return one row per lot that actually contributes, in picking order',
      '- stop as soon as the order is complete; a lot that contributes nothing is not listed',
      '- a quantity of 0 returns no rows',
      '',
      'If the lots do not add up to the requested quantity, abort with `RAISE EXCEPTION` — a picking',
      'list that is short is worse than none.',
      'The function only reports; it must not change `stock_lot`.'
    ].join('\n')
  },
  seedSql: `
    DROP FUNCTION IF EXISTS pick_order(text, integer);
    DROP FUNCTION IF EXISTS statement_fails(text);
    DROP TABLE IF EXISTS stock_lot;

    CREATE TABLE stock_lot (
      id integer PRIMARY KEY,
      sku text NOT NULL,
      received_on date NOT NULL,
      quantity integer NOT NULL
    );

    INSERT INTO stock_lot (id, sku, received_on, quantity) VALUES
      (1, 'BOLT-8', '2026-01-05', 40),
      (2, 'BOLT-8', '2026-01-12', 25),
      (3, 'BOLT-8', '2026-02-01', 60),
      (4, 'NUT-8', '2026-01-20', 10);

    CREATE FUNCTION statement_fails(statement text) RETURNS boolean AS $statement_fails$
    BEGIN
      EXECUTE statement;
      RETURN false;
    EXCEPTION WHEN others THEN
      RETURN true;
    END;
    $statement_fails$ LANGUAGE plpgsql;
  `,
  starterSql: [
    'CREATE OR REPLACE FUNCTION pick_order(p_sku text, p_quantity integer)',
    'RETURNS TABLE(lot_id integer, taken integer) AS $pick_order$',
    'DECLARE',
    '  remaining integer := p_quantity;',
    'BEGIN',
    '  RETURN;',
    'END;',
    '$pick_order$ LANGUAGE plpgsql;'
  ].join('\n'),
  hints: [
    {
      text: {
        de: 'Führe die noch fehlende Menge in einer Variable mit: Sie entscheidet, wie viel die aktuelle Charge beiträgt und wann der Durchlauf zu Ende ist.',
        en: 'Carry the still missing quantity in a variable: it decides how much the current lot contributes and when the walk is over.'
      }
    },
    {
      text: {
        de: 'Mit `RETURN NEXT` ausgegebene Zeilen werden nur geliefert, wenn die Funktion normal endet — eine danach ausgelöste Exception verwirft die ganze Liste, genau das braucht ein zu kurzer Auftrag.',
        en: 'Rows handed out with RETURN NEXT are only delivered when the function ends normally — an exception raised afterwards throws the whole list away, which is exactly what a short order needs.'
      }
    },
    {
      text: {
        de: 'Zwei verschiedene Gründe beenden die Schleife: Der Auftrag ist vollständig, oder die Chargen sind ausgegangen. Nur einer davon ist ein Fehler.',
        en: 'Two different reasons end the loop: the order is complete, or the lots ran out. Only one of them is an error.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'Ein Auftrag über 50 wird aus zwei Chargen kommissioniert',
          en: 'An order of 50 is picked from two lots'
        },
        sql: "SELECT count(*) = 2 AS ok FROM pick_order('BOLT-8', 50);"
      },
      {
        label: {
          de: 'Die älteste Charge kommt zuerst und gibt alle ihre 40 Stück',
          en: 'The oldest lot comes first and gives all its 40 pieces'
        },
        sql: "SELECT lot_id = 1 AND taken = 40 AS ok FROM pick_order('BOLT-8', 50) LIMIT 1;"
      },
      {
        label: {
          de: 'Die kommissionierten Mengen summieren sich auf den Auftrag',
          en: 'The picked quantities add up to the order'
        },
        sql: "SELECT sum(taken) = 50 AS ok FROM pick_order('BOLT-8', 50);"
      },
      {
        label: {
          de: 'Ein Auftrag über genau eine Charge listet keine zweite auf',
          en: 'An order of exactly one lot does not list a second one'
        },
        sql: "SELECT count(*) = 1 AS ok FROM pick_order('BOLT-8', 40);"
      },
      {
        label: {
          de: 'Ein Auftrag über alle Chargen listet alle drei auf',
          en: 'An order over all lots lists all three'
        },
        sql: "SELECT count(*) = 3 AND sum(taken) = 125 AS ok FROM pick_order('BOLT-8', 125);"
      },
      {
        label: {
          de: 'Eine Menge von 0 liefert keine Zeilen',
          en: 'A quantity of 0 returns no rows'
        },
        sql: "SELECT count(*) = 0 AS ok FROM pick_order('NUT-8', 0);"
      },
      {
        label: {
          de: 'Ein Stück zu viel bricht mit einem Fehler ab',
          en: 'One piece too many aborts with an error'
        },
        sql: "SELECT statement_fails('SELECT * FROM pick_order(''BOLT-8'', 126)') AS ok;"
      },
      {
        label: {
          de: 'Ein Artikel ohne jede Charge bricht mit einem Fehler ab',
          en: 'An article without any lot aborts with an error'
        },
        sql: "SELECT statement_fails('SELECT * FROM pick_order(''GHOST-1'', 1)') AS ok;"
      },
      {
        label: {
          de: 'Der Bestand selbst blieb unverändert',
          en: 'The stock itself was left untouched'
        },
        sql: 'SELECT sum(quantity) = 135 AS ok FROM stock_lot;'
      }
    ]
  },
  tags: ['cursor', 'returns-table', 'raise-exception', 'fifo']
};
