import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-orders-relational-mapping',
  topic: ['modelling', 'relational'],
  difficulty: 'Advanced',
  title: {
    de: 'Klassendiagramm ins Relationenmodell überführen',
    en: 'Translate a class diagram into the relational model'
  },
  prompt: {
    de: [
      'Gegeben ist dieses Klassendiagramm:',
      '',
      '  Kunde (kundenNr, name)',
      '  Bestellung (bestellNr, datum)',
      '  Artikel (artikelNr, bezeichnung)',
      '',
      '  Kunde 1 —— 0..* Bestellung',
      '  Bestellung 0..* —— 0..* Artikel   mit Assoziationsklasse Position (menge)',
      '',
      'Zeichne das zugehörige Relationenmodell als Tabellen:',
      '• Jede Tabelle bekommt ihre Spalten, Primärschlüssel als PK und Fremdschlüssel als FK markiert.',
      '• Die m:n-Beziehung wird zu einer eigenen Tabelle mit dem Namen position.',
      '• Verbinde jede Fremdschlüsselspalte mit der Spalte, auf die sie verweist.'
    ].join('\n'),
    en: [
      'You are given this class diagram:',
      '',
      '  Customer (customerNo, name)',
      '  Order (orderNo, date)',
      '  Article (articleNo, description)',
      '',
      '  Customer 1 —— 0..* Order',
      '  Order 0..* —— 0..* Article   with association class Position (quantity)',
      '',
      'Draw the matching relational model as tables:',
      '• Every table gets its columns; mark primary keys as PK and foreign keys as FK.',
      '• The m:n relationship becomes a table of its own, named position.',
      '• Connect every foreign key column to the column it references.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Eine 1:n-Beziehung braucht keine eigene Tabelle — der Fremdschlüssel wandert auf die n-Seite.',
        en: 'A 1:n relationship needs no table of its own — the foreign key moves to the n side.'
      }
    },
    {
      text: {
        de: 'Der Schlüssel von position ist zusammengesetzt: bestellNr und artikelNr sind zugleich PK und FK.',
        en: 'The key of position is composite: bestellNr and artikelNr are both PK and FK.'
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'kunde',
            kind: 'table',
            name: 'kunde',
            aliases: ['customer'],
            attributes: [
              { name: 'kundenNr', aliases: ['customerNo'], isPrimaryKey: true },
              { name: 'name' }
            ]
          },
          {
            key: 'bestellung',
            kind: 'table',
            name: 'bestellung',
            aliases: ['order', 'orders'],
            attributes: [
              { name: 'bestellNr', aliases: ['orderNo'], isPrimaryKey: true },
              { name: 'datum', aliases: ['date'] },
              { name: 'kundenNr', aliases: ['customerNo'], isForeignKey: true }
            ]
          },
          {
            key: 'artikel',
            kind: 'table',
            name: 'artikel',
            aliases: ['article'],
            attributes: [
              { name: 'artikelNr', aliases: ['articleNo'], isPrimaryKey: true },
              { name: 'bezeichnung', aliases: ['description'] }
            ]
          },
          {
            key: 'position',
            kind: 'table',
            name: 'position',
            aliases: ['bestellposition', 'orderItem'],
            attributes: [
              {
                name: 'bestellNr',
                aliases: ['orderNo'],
                isPrimaryKey: true,
                isForeignKey: true
              },
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
            kind: 'foreign-key',
            from: 'bestellung',
            to: 'kunde',
            fromAttribute: 'kundenNr',
            toAttribute: 'kundenNr'
          },
          {
            kind: 'foreign-key',
            from: 'position',
            to: 'bestellung',
            fromAttribute: 'bestellNr',
            toAttribute: 'bestellNr'
          },
          {
            kind: 'foreign-key',
            from: 'position',
            to: 'artikel',
            fromAttribute: 'artikelNr',
            toAttribute: 'artikelNr'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'relational-model', 'foreign-key']
};
