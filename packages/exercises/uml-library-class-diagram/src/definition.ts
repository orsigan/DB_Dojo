import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-library-class-diagram',
  topic: ['modelling', 'uml'],
  difficulty: 'Beginner',
  title: { de: 'Bibliothek als Klassendiagramm', en: 'A library as a class diagram' },
  prompt: {
    de: [
      'Zeichne den folgenden Ausschnitt als UML-Klassendiagramm. Verwende exakt die genannten Namen.',
      '',
      'Klassen und Attribute (Schlüssel als PK markieren):',
      '• Autor: autorId (PK), name',
      '• Buch: isbn (PK), titel',
      '• Exemplar: inventarnummer (PK), standort',
      '',
      'Beziehungen:',
      '• Autor — Buch: Assoziation. Multiplizität 1 bei Autor, 1..* bei Buch.',
      '• Buch — Exemplar: Komposition, das Ganze ist das Buch.',
      '  Multiplizität 1 bei Buch, 0..* bei Exemplar.'
    ].join('\n'),
    en: [
      'Draw the following excerpt as a UML class diagram. Use exactly the names given below.',
      '',
      'Classes and attributes (mark keys as PK):',
      '• Author: authorId (PK), name',
      '• Book: isbn (PK), title',
      '• Copy: inventoryNumber (PK), location',
      '',
      'Relationships:',
      '• Author — Book: association. Multiplicity 1 at Author, 1..* at Book.',
      '• Book — Copy: composition, the whole is the book.',
      '  Multiplicity 1 at Book, 0..* at Copy.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Die Komposition wird vom Ganzen zum Teil gezogen — die ausgefüllte Raute sitzt beim Buch.',
        en: 'A composition is drawn from the whole to the part — the filled diamond sits at Buch.'
      }
    },
    {
      text: {
        de: 'Ein Exemplar kann ohne sein Buch nicht existieren. Genau das unterscheidet Komposition von Aggregation.',
        en: 'A copy cannot exist without its book. That is exactly what separates composition from aggregation.'
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'autor',
            kind: 'class',
            name: 'Autor',
            aliases: ['Author'],
            attributes: [
              { name: 'autorId', aliases: ['authorId'], isPrimaryKey: true },
              { name: 'name' }
            ]
          },
          {
            key: 'buch',
            kind: 'class',
            name: 'Buch',
            aliases: ['Book'],
            attributes: [
              { name: 'isbn', isPrimaryKey: true },
              { name: 'titel', aliases: ['title'] }
            ]
          },
          {
            key: 'exemplar',
            kind: 'class',
            name: 'Exemplar',
            aliases: ['Copy'],
            attributes: [
              { name: 'inventarnummer', aliases: ['inventoryNumber'], isPrimaryKey: true },
              { name: 'standort', aliases: ['location'] }
            ]
          }
        ],
        edges: [
          {
            kind: 'association',
            from: 'autor',
            to: 'buch',
            fromMultiplicity: '1',
            toMultiplicity: '1..*'
          },
          {
            kind: 'composition',
            from: 'buch',
            to: 'exemplar',
            fromMultiplicity: '1',
            toMultiplicity: '0..*'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'class-diagram', 'composition']
};
