import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-vet-clinic-relational-mapping',
  topic: ['modelling', 'relational'],
  difficulty: 'Beginner',
  title: {
    de: 'Klassendiagramm einer Tierarztpraxis ins Relationenmodell überführen',
    en: 'Translate a vet clinic class diagram into the relational model'
  },
  prompt: {
    de: [
      'Gegeben ist dieses Klassendiagramm:',
      '',
      '  Tierhalter (halterId, name)',
      '  Haustier (tierId, name)',
      '',
      '  Tierhalter 1 —— 0..* Haustier',
      '',
      'Zeichne das zugehörige Relationenmodell als Tabellen:',
      '• Jede Tabelle bekommt ihre Spalten, Primärschlüssel als PK und Fremdschlüssel als FK markiert.',
      '• Verbinde jede Fremdschlüsselspalte mit der Spalte, auf die sie verweist.'
    ].join('\n'),
    en: [
      'You are given this class diagram:',
      '',
      '  PetOwner (ownerId, name)',
      '  Pet (petId, name)',
      '',
      '  PetOwner 1 —— 0..* Pet',
      '',
      'Draw the matching relational model as tables:',
      '• Every table gets its columns; mark primary keys as PK and foreign keys as FK.',
      '• Connect every foreign key column to the column it references.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Auch hier gilt: Eine 1:n-Beziehung wird nicht zu einer eigenen Tabelle.',
        en: 'The same rule applies here: a 1:n relationship does not become a table of its own.'
      }
    },
    {
      text: {
        de: 'Der Fremdschlüssel steht in der Tabelle auf der "viele"-Seite — hier also bei Haustier.',
        en: 'The foreign key lives in the table on the "many" side — here, in Haustier (Pet).'
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'tierhalter',
            kind: 'table',
            name: 'tierhalter',
            aliases: ['petOwner'],
            attributes: [
              { name: 'halterId', aliases: ['ownerId'], isPrimaryKey: true },
              { name: 'name' }
            ]
          },
          {
            key: 'haustier',
            kind: 'table',
            name: 'haustier',
            aliases: ['pet'],
            attributes: [
              { name: 'tierId', aliases: ['petId'], isPrimaryKey: true },
              { name: 'name' },
              { name: 'halterId', aliases: ['ownerId'], isForeignKey: true }
            ]
          }
        ],
        edges: [
          {
            kind: 'foreign-key',
            from: 'haustier',
            to: 'tierhalter',
            fromAttribute: 'halterId',
            toAttribute: 'halterId'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'relational-model', 'foreign-key']
};
