import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'normalization-orders-3nf',
  topic: ['modelling', 'normalization'],
  difficulty: 'Profi',
  title: {
    de: 'Bestellungen in die 3. Normalform bringen',
    en: 'Bring orders into third normal form'
  },
  prompt: {
    de: [
      'Die Tabelle bestellung_roh liegt unnormalisiert vor:',
      '',
      '  bestellNr | kundenNr | kundenName | artikelNr | menge',
      '  ----------+----------+------------+-----------+------',
      '  1001      | K1       | Meier      | A-10      |     2',
      '  1001      | K1       | Meier      | A-20      |     1',
      '  1002      | K2       | Schulz     | A-10      |     5',
      '',
      'Schritt 1 — Zeichne die funktionalen Abhängigkeiten direkt in bestellung_roh ein.',
      'Trage nur die direkten Abhängigkeiten ein, keine transitiv ableitbaren.',
      '',
      'Schritt 2 — Zerlege die Tabelle in die 3. Normalform.',
      'Verwende die Tabellennamen kunde, bestellung und bestellposition, verteile die Spalten',
      'passend, markiere Primär- und Fremdschlüssel und verbinde jede Fremdschlüsselspalte',
      'mit der Spalte, auf die sie verweist.',
      '',
      'Eine eigene Tabelle für Artikel ist nicht Teil der Aufgabe.'
    ].join('\n'),
    en: [
      'The table orders_raw is unnormalised:',
      '',
      '  orderNo | customerNo | customerName | articleNo | quantity',
      '  --------+------------+--------------+-----------+---------',
      '  1001    | C1         | Miller       | A-10      |        2',
      '  1001    | C1         | Miller       | A-20      |        1',
      '  1002    | C2         | Shaw         | A-10      |        5',
      '',
      'Step 1 — Draw the functional dependencies straight into orders_raw.',
      'Only add the direct dependencies, not the ones derivable by transitivity.',
      '',
      'Step 2 — Decompose the table into third normal form.',
      'Use the table names customer, orders and orderItem, distribute the columns,',
      'mark primary and foreign keys, and connect every foreign key column to the column',
      'it references.',
      '',
      'A separate table for articles is not part of this exercise.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Der Schlüssel von bestellung_roh ist zusammengesetzt: menge hängt von bestellNr und artikelNr gemeinsam ab.',
        en: 'The key of bestellung_roh is composite: menge depends on bestellNr and artikelNr together.'
      }
    },
    {
      text: {
        de: 'kundenName hängt nicht direkt von bestellNr ab, sondern von kundenNr — genau diese transitive Abhängigkeit verletzt die 3. Normalform.',
        en: 'kundenName does not depend on bestellNr directly but on kundenNr — that transitive dependency is what breaks 3NF.'
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'raw',
            kind: 'table',
            name: 'bestellung_roh',
            aliases: ['orders_raw'],
            attributes: [
              { name: 'bestellNr', aliases: ['orderNo'] },
              { name: 'kundenNr', aliases: ['customerNo'] },
              { name: 'kundenName', aliases: ['customerName'] },
              { name: 'artikelNr', aliases: ['articleNo'] },
              { name: 'menge', aliases: ['quantity'] }
            ]
          },
          {
            key: 'kunde',
            kind: 'table',
            name: 'kunde',
            aliases: ['customer'],
            attributes: [
              { name: 'kundenNr', aliases: ['customerNo'], isPrimaryKey: true },
              { name: 'kundenName', aliases: ['customerName'] }
            ]
          },
          {
            key: 'bestellung',
            kind: 'table',
            name: 'bestellung',
            aliases: ['orders', 'order'],
            attributes: [
              { name: 'bestellNr', aliases: ['orderNo'], isPrimaryKey: true },
              { name: 'kundenNr', aliases: ['customerNo'], isForeignKey: true }
            ]
          },
          {
            key: 'bestellposition',
            kind: 'table',
            name: 'bestellposition',
            aliases: ['position', 'orderItem'],
            attributes: [
              {
                name: 'bestellNr',
                aliases: ['orderNo'],
                isPrimaryKey: true,
                isForeignKey: true
              },
              { name: 'artikelNr', aliases: ['articleNo'], isPrimaryKey: true },
              { name: 'menge', aliases: ['quantity'] }
            ]
          }
        ],
        edges: [
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'bestellNr',
            toAttribute: 'kundenNr'
          },
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'kundenNr',
            toAttribute: 'kundenName'
          },
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'bestellNr',
            additionalDeterminants: ['artikelNr'],
            toAttribute: 'menge'
          },
          {
            kind: 'foreign-key',
            from: 'bestellung',
            to: 'kunde',
            fromAttribute: 'kundenNr',
            toAttribute: 'kundenNr'
          },
          {
            kind: 'foreign-key',
            from: 'bestellposition',
            to: 'bestellung',
            fromAttribute: 'bestellNr',
            toAttribute: 'bestellNr'
          }
        ]
      }
    ]
  },
  tags: ['normalization', 'functional-dependency', '3nf']
};
