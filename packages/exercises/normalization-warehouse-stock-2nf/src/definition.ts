import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'normalization-warehouse-stock-2nf',
  topic: ['modelling', 'normalization'],
  difficulty: 'Advanced',
  title: {
    de: 'Lagerbestand in die 2. Normalform bringen',
    en: 'Bring warehouse stock into second normal form'
  },
  prompt: {
    de: [
      'Die Tabelle lagerbestand_roh liegt unnormalisiert vor. Jede Zeile beschreibt den Bestand eines Artikels in einem Lager; der Schlüssel ist zusammengesetzt aus lagerId und artikelNr:',
      '',
      '  lagerId | artikelNr | artikelBezeichnung | menge',
      '  --------+-----------+---------------------+------',
      '  L1      | A-10      | Schraube            |  120',
      '  L2      | A-10      | Schraube            |   45',
      '  L1      | A-20      | Mutter              |  300',
      '',
      'Schritt 1 — Zeichne die funktionalen Abhängigkeiten direkt in lagerbestand_roh ein.',
      'Trage nur die direkten Abhängigkeiten ein, keine transitiv ableitbaren.',
      '',
      'Schritt 2 — Zerlege die Tabelle in die 2. Normalform.',
      'Verwende die Tabellennamen artikel und lagerbestand, verteile die Spalten passend,',
      'markiere Primär- und Fremdschlüssel und verbinde jede Fremdschlüsselspalte mit der Spalte,',
      'auf die sie verweist.',
      '',
      'Eine eigene Tabelle für Lager ist nicht Teil der Aufgabe.'
    ].join('\n'),
    en: [
      'The table stock_raw is unnormalised. Each row describes the stock of one article in one warehouse; the key is composed of warehouseId and articleNo:',
      '',
      '  warehouseId | articleNo | articleName | quantity',
      '  ------------+-----------+-------------+---------',
      '  W1          | A-10      | Bolt        |     120',
      '  W2          | A-10      | Bolt        |      45',
      '  W1          | A-20      | Nut         |     300',
      '',
      'Step 1 — Draw the functional dependencies straight into stock_raw.',
      'Only add the direct dependencies, not the ones derivable by transitivity.',
      '',
      'Step 2 — Decompose the table into second normal form.',
      'Use the table names article and stock, distribute the columns,',
      'mark primary and foreign keys, and connect every foreign key column to the column',
      'it references.',
      '',
      'A separate table for warehouses is not part of this exercise.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'artikelBezeichnung braucht zur Bestimmung nur artikelNr — es spielt keine Rolle, in welchem Lager man nachsieht, das ist die partielle Abhängigkeit, die die 2. Normalform verletzt.',
        en: "artikelBezeichnung only needs artikelNr to be determined — it doesn't care which lagerId you're looking at, that's the partial dependency breaking 2NF."
      }
    },
    {
      text: {
        de: 'menge braucht wirklich beide Teile des Schlüssels gemeinsam, deshalb bleibt es in der Tabelle mit dem zusammengesetzten Schlüssel.',
        en: 'menge genuinely needs both parts of the key together, so it stays in the table with the composite key.'
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
            name: 'lagerbestand_roh',
            aliases: ['stock_raw'],
            attributes: [
              { name: 'lagerId', aliases: ['warehouseId'] },
              { name: 'artikelNr', aliases: ['articleNo'] },
              { name: 'artikelBezeichnung', aliases: ['articleName'] },
              { name: 'menge', aliases: ['quantity'] }
            ]
          },
          {
            key: 'artikel',
            kind: 'table',
            name: 'artikel',
            aliases: ['article'],
            attributes: [
              { name: 'artikelNr', aliases: ['articleNo'], isPrimaryKey: true },
              { name: 'artikelBezeichnung', aliases: ['articleName'] }
            ]
          },
          {
            key: 'lagerbestand',
            kind: 'table',
            name: 'lagerbestand',
            aliases: ['stock'],
            attributes: [
              { name: 'lagerId', aliases: ['warehouseId'], isPrimaryKey: true },
              {
                name: 'artikelNr',
                aliases: ['articleNo'],
                isPrimaryKey: true,
                isForeignKey: true
              },
              { name: 'menge', aliases: ['quantity'] }
            ]
          }
        ],
        edges: [
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'artikelNr',
            toAttribute: 'artikelBezeichnung'
          },
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'lagerId',
            additionalDeterminants: ['artikelNr'],
            toAttribute: 'menge'
          },
          {
            kind: 'foreign-key',
            from: 'lagerbestand',
            to: 'artikel',
            fromAttribute: 'artikelNr',
            toAttribute: 'artikelNr'
          }
        ]
      }
    ]
  },
  tags: ['normalization', 'functional-dependency', '2nf']
};
