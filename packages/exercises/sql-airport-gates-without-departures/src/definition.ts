import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'sql-airport-gates-without-departures',
  topic: ['sql', 'joins'],
  difficulty: 'Advanced',
  title: { de: 'Gates, die ungenutzt blieben', en: 'Gates that stayed idle' },
  prompt: {
    de: [
      'Die Flugleitung überprüft den 2026-06-01 und will wissen, welche Gates an diesem Tag nie genutzt wurden.',
      '',
      'Ein Gate gilt als ungenutzt, wenn für dieses Datum kein Abflug an ihm geplant ist.',
      'Gates, die nur an anderen Tagen genutzt werden, gelten ebenfalls als ungenutzt, genauso wie Gates ganz ohne Abflüge.',
      '',
      'Gib `code` und `terminal` zurück, sortiert nach `code`.'
    ].join('\n'),
    en: [
      'Ground control reviews the day of 2026-06-01 and wants to know which gates were never used.',
      '',
      'A gate counts as idle when no departure is scheduled at it on that date.',
      'Gates that are only used on other dates are idle as well, and so are gates without any departure at all.',
      '',
      'Return `code` and `terminal`, ordered by `code`.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS departures;
    DROP TABLE IF EXISTS gates;

    CREATE TABLE gates (
      id integer PRIMARY KEY,
      code text NOT NULL,
      terminal text NOT NULL
    );

    CREATE TABLE departures (
      id integer PRIMARY KEY,
      gate_id integer NOT NULL REFERENCES gates (id),
      flight_no text NOT NULL,
      departs_on date NOT NULL
    );

    INSERT INTO gates (id, code, terminal) VALUES
      (1, 'A1', 'T1'),
      (2, 'A2', 'T1'),
      (3, 'B1', 'T2'),
      (4, 'B2', 'T2'),
      (5, 'C1', 'T3');

    INSERT INTO departures (id, gate_id, flight_no, departs_on) VALUES
      (1, 1, 'LH 401', '2026-06-01'),
      (2, 1, 'LH 887', '2026-06-01'),
      (3, 3, 'AF 122', '2026-06-02'),
      (4, 4, 'BA 908', '2026-06-01'),
      (5, 5, 'KL 317', '2026-05-31');
  `,
  starterSql: 'SELECT g.code, g.terminal\nFROM gates AS g;',
  hints: [
    {
      text: {
        de: 'Ein Inner Join kann immer nur Gates zeigen, die tatsächlich einen Abflug haben — die gesuchten Gates sind genau die, die dabei herausfallen.',
        en: 'An inner join can only ever show gates that do have a departure — the gates you are looking for are exactly the ones it drops.'
      }
    },
    {
      text: {
        de: 'Bei einem Outer Join gehört die Datumseinschränkung in die ON-Bedingung: Steht sie in WHERE, werden die aufgefüllten Zeilen wieder herausgefiltert, bevor du sie erkennen kannst.',
        en: 'With an outer join the date restriction belongs into the ON condition: put it into WHERE and the padded rows are filtered away again before you can recognise them.'
      }
    },
    {
      text: {
        de: 'Ein Gate ohne Partner wird mit Nullwerten aufgefüllt — daran erkennst du die Nicht-Treffer.',
        en: 'A gate without a partner is padded with null values, which is what makes the non-matches detectable.'
      }
    }
  ],
  grading: {
    kind: 'result-equals',
    ordered: true,
    expectedSql: `
      SELECT g.code, g.terminal
      FROM gates AS g
      LEFT OUTER JOIN departures AS d
        ON d.gate_id = g.id AND d.departs_on = DATE '2026-06-01'
      WHERE d.id IS NULL
      ORDER BY g.code;
    `
  },
  tags: ['outer-join', 'anti-join', 'null']
};
