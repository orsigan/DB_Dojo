import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-zoo-keeper-animals',
  topic: ['modelling', 'uml'],
  difficulty: 'Beginner',
  title: { de: 'Tierpfleger und ihre Tiere', en: 'Zoo keepers and their animals' },
  prompt: {
    de: [
      'Zeichne die folgende Situation als UML-Klassendiagramm. Verwende exakt die genannten Namen.',
      '',
      'Im Zoo betreut jeder Tierpfleger mehrere Tiere gleichzeitig. Jedes Tier hat aber immer genau einen festen Tierpfleger, der sich um es kümmert.',
      '',
      'Klassen und Attribute (Schlüssel als PK markieren):',
      '• Tierpfleger: pflegerId (PK), name',
      '• Tier: tierId (PK), art'
    ].join('\n'),
    en: [
      'Draw the following situation as a UML class diagram. Use exactly the names given below.',
      '',
      'At the zoo, each keeper looks after several animals at the same time. Each animal, however, always has exactly one fixed keeper who takes care of it.',
      '',
      'Classes and attributes (mark keys as PK):',
      '• Keeper: keeperId (PK), name',
      '• Animal: animalId (PK), species'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Ein Tier ist nicht Teil eines Tierpflegers im Sinne von Ganzes und Teil — eine einfache Assoziation reicht hier aus, keine Raute nötig.',
        en: 'An animal is not part of a keeper in the whole/part sense — a plain association is enough here, no diamond needed.'
      }
    },
    {
      text: {
        de: '„jeder … mehrere“ zeigt die *-Seite bei Tier, „immer genau einen“ die 1-Seite bei Tierpfleger.',
        en: '"each … several" points to the * side at Tier (Animal); "always exactly one" points to the 1 side at Tierpfleger (Keeper).'
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'tierpfleger',
            kind: 'class',
            name: 'Tierpfleger',
            aliases: ['Keeper'],
            attributes: [
              { name: 'pflegerId', aliases: ['keeperId'], isPrimaryKey: true },
              { name: 'name' }
            ]
          },
          {
            key: 'tier',
            kind: 'class',
            name: 'Tier',
            aliases: ['Animal'],
            attributes: [
              { name: 'tierId', aliases: ['animalId'], isPrimaryKey: true },
              { name: 'art', aliases: ['species'] }
            ]
          }
        ],
        edges: [
          {
            kind: 'association',
            from: 'tierpfleger',
            to: 'tier',
            fromMultiplicity: '1',
            toMultiplicity: '0..*'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'class-diagram', 'association']
};
