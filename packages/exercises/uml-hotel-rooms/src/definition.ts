import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-hotel-rooms',
  topic: ['modelling', 'uml'],
  difficulty: 'Beginner',
  title: { de: 'Hotel und seine Zimmer', en: 'A hotel and its rooms' },
  prompt: {
    de: [
      'Zeichne die folgende Situation als UML-Klassendiagramm. Verwende exakt die genannten Namen.',
      '',
      'Ein Hotel besteht aus mehreren Zimmern. Ohne sein Hotel kann ein Zimmer nicht existieren, und jedes Zimmer gehört stets zu genau einem Hotel.',
      '',
      'Klassen und Attribute (Schlüssel als PK markieren):',
      '• Hotel: hotelId (PK), name',
      '• Zimmer: zimmerNr (PK), kategorie'
    ].join('\n'),
    en: [
      'Draw the following situation as a UML class diagram. Use exactly the names given below.',
      '',
      'A hotel consists of several rooms. A room cannot exist without its hotel, and each room always belongs to exactly one hotel.',
      '',
      'Classes and attributes (mark keys as PK):',
      '• Hotel: hotelId (PK), name',
      '• Room: roomNo (PK), category'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: '„besteht aus“ zusammen mit „kann ohne … nicht existieren“ ist die stärkste Form einer Ganzes-Teil-Beziehung — das ist eine Komposition, keine einfache Assoziation.',
        en: '"consists of" combined with "cannot exist without" is the strongest possible whole/part statement — that is a composition, not a plain association.'
      }
    },
    {
      text: {
        de: 'Die ausgefüllte Raute sitzt beim Hotel, dem Ganzen.',
        en: 'The filled diamond sits at Hotel, the whole.'
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'hotel',
            kind: 'class',
            name: 'Hotel',
            attributes: [{ name: 'hotelId', isPrimaryKey: true }, { name: 'name' }]
          },
          {
            key: 'zimmer',
            kind: 'class',
            name: 'Zimmer',
            aliases: ['Room'],
            attributes: [
              { name: 'zimmerNr', aliases: ['roomNo'], isPrimaryKey: true },
              { name: 'kategorie', aliases: ['category'] }
            ]
          }
        ],
        edges: [
          {
            kind: 'composition',
            from: 'hotel',
            to: 'zimmer',
            fromMultiplicity: '1',
            toMultiplicity: '0..*'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'class-diagram', 'composition']
};
