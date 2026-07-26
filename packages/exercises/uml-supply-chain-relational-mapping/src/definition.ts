import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-supply-chain-relational-mapping',
  topic: ['modelling', 'relational'],
  difficulty: 'Profi',
  title: {
    de: 'Lieferanten und Lagerbewegungen ins Relationenmodell überführen',
    en: 'Translate a supply chain into the relational model'
  },
  prompt: {
    de: [
      'Gegeben ist dieses Klassendiagramm:',
      '',
      '  Lieferant (lieferantId, name)',
      '  Artikel (artikelId, bezeichnung)',
      '  Lagerbewegung (bewegungId, menge, datum)',
      '',
      '  Lieferant 0..* —— 0..* Artikel   mit Assoziationsklasse Lieferpreis (preis)',
      '  Artikel 1 —— 0..* Lagerbewegung',
      '',
      'Zeichne das zugehörige Relationenmodell als Tabellen:',
      '• Jede Tabelle bekommt ihre Spalten, Primärschlüssel als PK und Fremdschlüssel als FK markiert.',
      '• Die m:n-Beziehung wird zu einer eigenen Tabelle mit dem Namen lieferpreis.',
      '• Verbinde jede Fremdschlüsselspalte mit der Spalte, auf die sie verweist.'
    ].join('\n'),
    en: [
      'You are given this class diagram:',
      '',
      '  Supplier (supplierId, name)',
      '  Article (articleId, name)',
      '  StockMovement (movementId, quantity, date)',
      '',
      '  Supplier 0..* —— 0..* Article   with association class SupplyPrice (price)',
      '  Article 1 —— 0..* StockMovement',
      '',
      'Draw the matching relational model as tables:',
      '• Every table gets its columns; mark primary keys as PK and foreign keys as FK.',
      '• The m:n relationship becomes a table of its own, named lieferpreis.',
      '• Connect every foreign key column to the column it references.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'preis hängt vom Paar aus Lieferant und Artikel ab, nicht von einem der beiden allein — ein anderer Lieferant kann für denselben Artikel einen anderen Preis verlangen, deshalb gehört es auf die Verbindungstabelle.',
        en: 'preis depends on the supplier-article pair, not on either alone — a different supplier can charge a different price for the same article, so it belongs on the junction table.'
      }
    },
    {
      text: {
        de: 'Lagerbewegung hat mit der m:n-Beziehung nichts zu tun — sie ist ein ganz gewöhnliches 1:n von Artikel aus.',
        en: "Lagerbewegung is unrelated to the m:n — it's a completely ordinary 1:n off of Artikel."
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'lieferant',
            kind: 'table',
            name: 'lieferant',
            aliases: ['supplier'],
            attributes: [
              { name: 'lieferantId', aliases: ['supplierId'], isPrimaryKey: true },
              { name: 'name' }
            ]
          },
          {
            key: 'artikel',
            kind: 'table',
            name: 'artikel',
            aliases: ['article'],
            attributes: [
              { name: 'artikelId', aliases: ['articleId'], isPrimaryKey: true },
              { name: 'bezeichnung', aliases: ['name'] }
            ]
          },
          {
            key: 'lieferpreis',
            kind: 'table',
            name: 'lieferpreis',
            aliases: ['supplyPrice'],
            attributes: [
              {
                name: 'lieferantId',
                aliases: ['supplierId'],
                isPrimaryKey: true,
                isForeignKey: true
              },
              {
                name: 'artikelId',
                aliases: ['articleId'],
                isPrimaryKey: true,
                isForeignKey: true
              },
              { name: 'preis', aliases: ['price'] }
            ]
          },
          {
            key: 'lagerbewegung',
            kind: 'table',
            name: 'lagerbewegung',
            aliases: ['stockMovement'],
            attributes: [
              { name: 'bewegungId', aliases: ['movementId'], isPrimaryKey: true },
              { name: 'menge', aliases: ['quantity'] },
              { name: 'datum', aliases: ['date'] },
              { name: 'artikelId', aliases: ['articleId'], isForeignKey: true }
            ]
          }
        ],
        edges: [
          {
            kind: 'foreign-key',
            from: 'lieferpreis',
            to: 'lieferant',
            fromAttribute: 'lieferantId',
            toAttribute: 'lieferantId'
          },
          {
            kind: 'foreign-key',
            from: 'lieferpreis',
            to: 'artikel',
            fromAttribute: 'artikelId',
            toAttribute: 'artikelId'
          },
          {
            kind: 'foreign-key',
            from: 'lagerbewegung',
            to: 'artikel',
            fromAttribute: 'artikelId',
            toAttribute: 'artikelId'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'relational-model', 'foreign-key', 'many-to-many']
};
