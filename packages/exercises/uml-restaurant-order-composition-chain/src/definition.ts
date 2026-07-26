import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-restaurant-order-composition-chain',
  topic: ['modelling', 'uml'],
  difficulty: 'Advanced',
  title: {
    de: 'Bestellung, Bestellposition und Gericht als Klassendiagramm',
    en: 'Order, order item and dish as a class diagram'
  },
  prompt: {
    de: [
      'Eine Bestellung in einem Restaurant besteht aus mehreren Bestellpositionen. Eine Bestellposition kann nicht ohne ihre Bestellung existieren und gehört immer zu genau einer Bestellung.',
      'Zusätzlich bezieht sich jede Bestellposition auf genau ein Gericht aus der Speisekarte; ein Gericht kann aber in vielen Bestellpositionen vorkommen.',
      '',
      'Klassen und Attribute (Schlüssel als PK markieren):',
      '• Bestellung: bestellNr (PK), tisch',
      '• Bestellposition: positionId (PK), anzahl',
      '• Gericht: gerichtId (PK), name',
      '',
      'Zeichne das passende Klassendiagramm mit exakt diesen Namen.'
    ].join('\n'),
    en: [
      'An order at a restaurant consists of several order items. An order item cannot exist without its order and always belongs to exactly one order.',
      'In addition, every order item refers to exactly one dish from the menu; a dish, however, can appear in many order items.',
      '',
      'Classes and attributes (mark keys as PK):',
      '• Order: orderNo (PK), tableNumber',
      '• OrderItem: itemId (PK), quantity',
      '• Dish: dishId (PK), name',
      '',
      'Draw the matching class diagram using exactly these names.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: '„besteht aus“ und „kann nicht ohne existieren“ bei Bestellung/Bestellposition ist das gleiche starke Ganzes-Teil-Signal wie bei einer Komposition.',
        en: '"consists of" plus "cannot exist without" for Bestellung/Bestellposition is the same strong whole-part signal as a composition.'
      }
    },
    {
      text: {
        de: 'Leite bei Bestellposition–Gericht beide Zahlen sorgfältig neu her: Zähle, wie viele Gerichte eine Bestellposition referenziert (diese Zahl steht bei Gericht), und wie viele Bestellpositionen sich auf ein Gericht beziehen können (diese Zahl steht bei Bestellposition).',
        en: 'For Bestellposition–Gericht, re-derive both numbers carefully: count how many dishes one order item references (that number sits next to Gericht), and how many order items can reference one dish (that number sits next to Bestellposition).'
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'bestellung',
            kind: 'class',
            name: 'Bestellung',
            aliases: ['Order'],
            attributes: [
              { name: 'bestellNr', aliases: ['orderNo'], isPrimaryKey: true },
              { name: 'tisch', aliases: ['tableNumber'] }
            ]
          },
          {
            key: 'bestellposition',
            kind: 'class',
            name: 'Bestellposition',
            aliases: ['OrderItem'],
            attributes: [
              { name: 'positionId', aliases: ['itemId'], isPrimaryKey: true },
              { name: 'anzahl', aliases: ['quantity'] }
            ]
          },
          {
            key: 'gericht',
            kind: 'class',
            name: 'Gericht',
            aliases: ['Dish'],
            attributes: [
              { name: 'gerichtId', aliases: ['dishId'], isPrimaryKey: true },
              { name: 'name' }
            ]
          }
        ],
        edges: [
          {
            kind: 'composition',
            from: 'bestellung',
            to: 'bestellposition',
            fromMultiplicity: '1',
            toMultiplicity: '0..*'
          },
          {
            kind: 'association',
            from: 'bestellposition',
            to: 'gericht',
            fromMultiplicity: '0..*',
            toMultiplicity: '1'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'class-diagram', 'composition', 'association']
};
