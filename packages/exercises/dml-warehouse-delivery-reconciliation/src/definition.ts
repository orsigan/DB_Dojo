import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'dml-warehouse-delivery-reconciliation',
  topic: ['dml', 'insert'],
  difficulty: 'Ultra',
  title: {
    de: 'Lieferschein mit dem Lagerbestand abgleichen',
    en: 'Reconcile a delivery note against the inventory'
  },
  prompt: {
    de: [
      'Ein Lieferschein ist eingetroffen und muss in `inventory` verbucht werden. In einem Dokument treffen drei Fälle aufeinander:',
      '',
      '- das Teil ist bereits vorrätig und es wurde etwas geliefert — addiere `delivered_quantity` zu `quantity` und setze `last_moved` auf das `note_date`',
      '- das Teil ist bereits vorrätig, aber der Lieferschein sagt `0` — der Lieferant hat es ausgelistet, also entferne das Teil aus dem Bestand',
      '- das Teil ist noch nicht vorrätig und es wurde etwas geliefert — füge es mit der gelieferten Menge und dem `note_date` hinzu',
      '',
      'Ein Teil, das weder vorrätig noch geliefert ist, geht uns schlicht nichts an.',
      'Teile, die der Lieferschein gar nicht erwähnt, behalten ihre Menge und ihr `last_moved`-Datum.',
      '',
      'All das lässt sich in einer einzigen Anweisung erledigen, die den Lieferschein einmal durchgeht — drei separate Anweisungen',
      'müssten sorgfältig geordnet werden, damit sie sich nicht gegenseitig ins Gehege kommen.'
    ].join('\n'),
    en: [
      'A delivery note has arrived and has to be booked into `inventory`. Three cases meet in one document:',
      '',
      '- the part is already stocked and something was delivered — add `delivered_quantity` to `quantity` and set `last_moved` to the `note_date`',
      '- the part is already stocked but the note says `0` — the supplier discontinued it, so remove the part from the inventory',
      '- the part is not stocked yet and something was delivered — add it with the delivered quantity and the `note_date`',
      '',
      'A part that is neither stocked nor delivered is simply not our business.',
      'Parts that the note does not mention at all keep their quantity and their `last_moved` date.',
      '',
      'All of this can be done in a single statement that walks the note once — three separate statements',
      'would have to be ordered carefully so they do not see each other’s work.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS delivery_note;
    DROP TABLE IF EXISTS inventory;

    CREATE TABLE inventory (
      part_no text PRIMARY KEY,
      description text NOT NULL,
      quantity integer NOT NULL,
      last_moved date NOT NULL
    );

    CREATE TABLE delivery_note (
      part_no text PRIMARY KEY,
      description text NOT NULL,
      delivered_quantity integer NOT NULL,
      note_date date NOT NULL
    );

    INSERT INTO inventory (part_no, description, quantity, last_moved) VALUES
      ('BRK-100', 'Brake pad set', 40, '2026-01-08'),
      ('FLT-220', 'Oil filter', 12, '2026-01-08'),
      ('BLT-310', 'Timing belt', 7, '2025-12-19'),
      ('SPK-045', 'Spark plug', 88, '2026-01-02');

    INSERT INTO delivery_note (part_no, description, delivered_quantity, note_date) VALUES
      ('BRK-100', 'Brake pad set', 25, '2026-02-14'),
      ('FLT-220', 'Oil filter', 0, '2026-02-14'),
      ('WPR-500', 'Wiper blade', 60, '2026-02-14'),
      ('GSK-018', 'Head gasket', 0, '2026-02-14');
  `,
  starterSql:
    'SELECT d.part_no, d.delivered_quantity, i.quantity AS stocked\nFROM delivery_note AS d\nLEFT JOIN inventory AS i ON i.part_no = d.part_no\nORDER BY d.part_no;',
  hints: [
    {
      text: {
        de: 'Neben INSERT, UPDATE und DELETE als getrennten Anweisungen bietet SQL eine, die eine Quellrelation mit einem Ziel verbindet und dann pro Zeile entscheidet, was damit zu tun ist.',
        en: 'Beyond INSERT, UPDATE and DELETE as separate statements, SQL offers one that joins a source relation onto a target and then decides per row what to do with it.'
      }
    },
    {
      text: {
        de: 'Die Zweige werden in der Reihenfolge geprüft, in der du sie schreibst, und der erste, dessen Bedingung zutrifft, gewinnt — daher muss der Auslistungsfall vor dem allgemeinen Update stehen.',
        en: 'The branches are tried in the order you write them, and the first one whose condition holds wins — so the discontinued case has to be listed before the general update.'
      }
    },
    {
      text: {
        de: 'Ein Zweig darf zusätzlich zu matched oder unmatched noch eine weitere Bedingung tragen — so bewirkt das nicht vorrätige Teil mit einer Lieferung von null am Ende gar nichts.',
        en: 'A branch may carry an extra condition on top of matched or unmatched, which is how the unstocked part with a delivery of zero ends up doing nothing at all.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'Der Lagerbestand enthält genau vier Teile',
          en: 'The inventory holds exactly four parts'
        },
        sql: 'SELECT count(*) = 4 AS ok FROM inventory;'
      },
      {
        label: {
          de: 'Die gelieferten Bremsbeläge wurden eingebucht und das Wischerblatt wurde angelegt',
          en: 'The delivered brake pads were booked in and the wiper blade was created'
        },
        sql: `
          SELECT count(*) = 2 AS ok
          FROM inventory
          WHERE (part_no = 'BRK-100' AND quantity = 65 AND last_moved = DATE '2026-02-14')
             OR (part_no = 'WPR-500' AND description = 'Wiper blade' AND quantity = 60 AND last_moved = DATE '2026-02-14');
        `
      },
      {
        label: {
          de: 'Der ausgelistete Ölfilter ist verschwunden und die Zylinderkopfdichtung wurde nie angelegt',
          en: 'The discontinued oil filter is gone and the head gasket was never created'
        },
        sql: "SELECT count(*) = 0 AS ok FROM inventory WHERE part_no IN ('FLT-220', 'GSK-018');"
      },
      {
        label: {
          de: 'Die Teile, die der Lieferschein nicht erwähnt, sind unverändert',
          en: 'The parts the note does not mention are untouched'
        },
        sql: `
          SELECT count(*) = 2 AS ok
          FROM inventory
          WHERE (part_no = 'BLT-310' AND quantity = 7 AND last_moved = DATE '2025-12-19')
             OR (part_no = 'SPK-045' AND quantity = 88 AND last_moved = DATE '2026-01-02');
        `
      },
      {
        label: {
          de: 'Der Lieferschein selbst wurde nicht verändert',
          en: 'The delivery note itself was not modified'
        },
        sql: 'SELECT count(*) = 4 AND sum(delivered_quantity) = 85 AS ok FROM delivery_note;'
      }
    ]
  },
  tags: ['merge', 'upsert', 'reconciliation']
};
