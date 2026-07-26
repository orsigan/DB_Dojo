import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-cinema-relational-mapping',
  topic: ['modelling', 'relational'],
  difficulty: 'Beginner',
  title: {
    de: 'Klassendiagramm eines Kinos ins Relationenmodell überführen',
    en: 'Translate a cinema class diagram into the relational model'
  },
  prompt: {
    de: [
      'Gegeben ist dieses Klassendiagramm:',
      '',
      '  Kino (kinoId, name)',
      '  Saal (saalId, sitzplaetze)',
      '',
      '  Kino 1 —— 0..* Saal',
      '',
      'Zeichne das zugehörige Relationenmodell als Tabellen:',
      '• Jede Tabelle bekommt ihre Spalten, Primärschlüssel als PK und Fremdschlüssel als FK markiert.',
      '• Verbinde jede Fremdschlüsselspalte mit der Spalte, auf die sie verweist.'
    ].join('\n'),
    en: [
      'You are given this class diagram:',
      '',
      '  Cinema (cinemaId, name)',
      '  Hall (hallId, seats)',
      '',
      '  Cinema 1 —— 0..* Hall',
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
        de: 'Eine 1:n-Beziehung braucht nie eine eigene Tabelle.',
        en: 'A 1:n relationship never needs a table of its own.'
      }
    },
    {
      text: {
        de: 'Der Fremdschlüssel wandert immer auf die "viele"-Seite der Beziehung.',
        en: 'The foreign key always moves to the "many" side of the relationship.'
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'kino',
            kind: 'table',
            name: 'kino',
            aliases: ['cinema'],
            attributes: [
              { name: 'kinoId', aliases: ['cinemaId'], isPrimaryKey: true },
              { name: 'name' }
            ]
          },
          {
            key: 'saal',
            kind: 'table',
            name: 'saal',
            aliases: ['hall', 'screen'],
            attributes: [
              { name: 'saalId', aliases: ['hallId'], isPrimaryKey: true },
              { name: 'sitzplaetze', aliases: ['seats'] },
              { name: 'kinoId', aliases: ['cinemaId'], isForeignKey: true }
            ]
          }
        ],
        edges: [
          {
            kind: 'foreign-key',
            from: 'saal',
            to: 'kino',
            fromAttribute: 'kinoId',
            toAttribute: 'kinoId'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'relational-model', 'foreign-key']
};
