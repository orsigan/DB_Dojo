import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'normalization-carworkshop-invoice-3nf',
  topic: ['modelling', 'normalization'],
  difficulty: 'Ultra',
  title: {
    de: 'Werkstattrechnungen in die 3. Normalform bringen',
    en: 'Bring workshop invoices into third normal form'
  },
  prompt: {
    de: [
      'Die Tabelle rechnung_roh liegt unnormalisiert vor. Eine Rechnung kann mehrere Teile',
      'umfassen, daher besteht der Schlüssel aus rechnungNr und teilNr zusammen:',
      '',
      '  rechnungNr | kundeNr | kundeName | teilNr | teilBezeichnung | menge',
      '  -----------+---------+-----------+--------+-----------------+------',
      '  7001       | K1      | Vogel     | T-10   | Bremsbelag      |     2',
      '  7001       | K1      | Vogel     | T-20   | Ölfilter        |     1',
      '  7002       | K2      | Lang      | T-10   | Bremsbelag      |     4',
      '',
      'Schritt 1 — Zeichne die funktionalen Abhängigkeiten direkt in rechnung_roh ein.',
      'Trage nur die direkten Abhängigkeiten ein, keine transitiv ableitbaren.',
      '',
      'Schritt 2 — Zerlege die Tabelle in die 3. Normalform.',
      'Verwende die Tabellennamen kunde, rechnung, teil und rechnungsposition, verteile die Spalten',
      'passend, markiere Primär- und Fremdschlüssel und verbinde jede Fremdschlüsselspalte',
      'mit der Spalte, auf die sie verweist.'
    ].join('\n'),
    en: [
      'The table invoice_raw is unnormalised. An invoice can cover several parts, so its key is the',
      'combination of invoiceNo and partNo:',
      '',
      '  invoiceNo | customerNo | customerName | partNo | partName    | quantity',
      '  ----------+------------+--------------+--------+-------------+---------',
      '  7001      | K1         | Vogel        | T-10   | brake pad   |        2',
      '  7001      | K1         | Vogel        | T-20   | oil filter  |        1',
      '  7002      | K2         | Lang         | T-10   | brake pad   |        4',
      '',
      'Step 1 — Draw the functional dependencies straight into invoice_raw.',
      'Only add the direct dependencies, not the ones derivable by transitivity.',
      '',
      'Step 2 — Decompose the table into third normal form.',
      'Use the table names kunde, rechnung, teil and rechnungsposition, distribute the columns,',
      'mark primary and foreign keys, and connect every foreign key column to the column',
      'it references.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Auch hier gibt es zwei unabhängige transitive Ketten, eine über kundeNr und eine über teilNr — finde und zeichne beide, bevor du dich für die Tabellen entscheidest.',
        en: 'Here too there are two separate transitive chains, one running through kundeNr and one through teilNr — find and draw both before deciding on tables.'
      }
    },
    {
      text: {
        de: 'Nur menge braucht wirklich beide Hälften des Schlüssels; kundeName und teilBezeichnung sind schon zu kunde bzw. teil gewandert, bevor du die Verbindungstabelle aufbaust.',
        en: 'Only menge truly needs both halves of the key; kundeName and teilBezeichnung have already migrated to kunde and teil respectively by the time you build the junction table.'
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
            name: 'rechnung_roh',
            aliases: ['invoice_raw'],
            attributes: [
              { name: 'rechnungNr', aliases: ['invoiceNo'] },
              { name: 'kundeNr', aliases: ['customerNo'] },
              { name: 'kundeName', aliases: ['customerName'] },
              { name: 'teilNr', aliases: ['partNo'] },
              { name: 'teilBezeichnung', aliases: ['partName'] },
              { name: 'menge', aliases: ['quantity'] }
            ]
          },
          {
            key: 'kunde',
            kind: 'table',
            name: 'kunde',
            aliases: ['customer'],
            attributes: [
              { name: 'kundeNr', aliases: ['customerNo'], isPrimaryKey: true },
              { name: 'kundeName', aliases: ['customerName'] }
            ]
          },
          {
            key: 'rechnung',
            kind: 'table',
            name: 'rechnung',
            aliases: ['invoice'],
            attributes: [
              { name: 'rechnungNr', aliases: ['invoiceNo'], isPrimaryKey: true },
              { name: 'kundeNr', aliases: ['customerNo'], isForeignKey: true }
            ]
          },
          {
            key: 'teil',
            kind: 'table',
            name: 'teil',
            aliases: ['part'],
            attributes: [
              { name: 'teilNr', aliases: ['partNo'], isPrimaryKey: true },
              { name: 'teilBezeichnung', aliases: ['partName'] }
            ]
          },
          {
            key: 'rechnungsposition',
            kind: 'table',
            name: 'rechnungsposition',
            aliases: ['invoiceItem'],
            attributes: [
              {
                name: 'rechnungNr',
                aliases: ['invoiceNo'],
                isPrimaryKey: true,
                isForeignKey: true
              },
              { name: 'teilNr', aliases: ['partNo'], isPrimaryKey: true, isForeignKey: true },
              { name: 'menge', aliases: ['quantity'] }
            ]
          }
        ],
        edges: [
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'rechnungNr',
            toAttribute: 'kundeNr'
          },
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'kundeNr',
            toAttribute: 'kundeName'
          },
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'teilNr',
            toAttribute: 'teilBezeichnung'
          },
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'rechnungNr',
            additionalDeterminants: ['teilNr'],
            toAttribute: 'menge'
          },
          {
            kind: 'foreign-key',
            from: 'rechnung',
            to: 'kunde',
            fromAttribute: 'kundeNr',
            toAttribute: 'kundeNr'
          },
          {
            kind: 'foreign-key',
            from: 'rechnungsposition',
            to: 'rechnung',
            fromAttribute: 'rechnungNr',
            toAttribute: 'rechnungNr'
          },
          {
            kind: 'foreign-key',
            from: 'rechnungsposition',
            to: 'teil',
            fromAttribute: 'teilNr',
            toAttribute: 'teilNr'
          }
        ]
      }
    ]
  },
  tags: ['normalization', 'functional-dependency', '3nf']
};
