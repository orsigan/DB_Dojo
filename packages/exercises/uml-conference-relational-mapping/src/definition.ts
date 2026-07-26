import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-conference-relational-mapping',
  topic: ['modelling', 'relational'],
  difficulty: 'Advanced',
  title: {
    de: 'Konferenz-Teilnahme ins Relationenmodell überführen',
    en: 'Translate conference attendance into the relational model'
  },
  prompt: {
    de: [
      'Gegeben ist dieses Klassendiagramm:',
      '',
      '  Teilnehmer (teilnehmerId, name)',
      '  Vortrag (vortragId, titel)',
      '',
      '  Teilnehmer 0..* —— 0..* Vortrag',
      '',
      'Zeichne das zugehörige Relationenmodell als Tabellen:',
      '• Jede Tabelle bekommt ihre Spalten, Primärschlüssel als PK und Fremdschlüssel als FK markiert.',
      '• Die m:n-Beziehung wird zu einer eigenen Tabelle mit dem Namen teilnahme.',
      '• Verbinde jede Fremdschlüsselspalte mit der Spalte, auf die sie verweist.'
    ].join('\n'),
    en: [
      'You are given this class diagram:',
      '',
      '  Attendee (attendeeId, name)',
      '  Talk (talkId, title)',
      '',
      '  Attendee 0..* —— 0..* Talk',
      '',
      'Draw the matching relational model as tables:',
      '• Every table gets its columns; mark primary keys as PK and foreign keys as FK.',
      '• The m:n relationship becomes a table of its own, named teilnahme.',
      '• Connect every foreign key column to the column it references.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Eine m:n-Beziehung wird immer zu einer eigenen Tabelle.',
        en: 'A many-to-many relationship always becomes a table of its own.'
      }
    },
    {
      text: {
        de: 'Auch ohne eigenes zusätzliches Attribut existiert die Verbindungstabelle trotzdem — ihr einziger Zweck ist es, die beiden Fremdschlüssel zu halten, die zusammen ihren zusammengesetzten Primärschlüssel bilden.',
        en: 'Even without any extra attribute of its own, the junction table still exists — its whole purpose is to hold the two foreign keys, which together form its composite primary key.'
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'teilnehmer',
            kind: 'table',
            name: 'teilnehmer',
            aliases: ['attendee'],
            attributes: [
              { name: 'teilnehmerId', aliases: ['attendeeId'], isPrimaryKey: true },
              { name: 'name' }
            ]
          },
          {
            key: 'vortrag',
            kind: 'table',
            name: 'vortrag',
            aliases: ['talk'],
            attributes: [
              { name: 'vortragId', aliases: ['talkId'], isPrimaryKey: true },
              { name: 'titel', aliases: ['title'] }
            ]
          },
          {
            key: 'teilnahme',
            kind: 'table',
            name: 'teilnahme',
            aliases: ['attendance'],
            attributes: [
              {
                name: 'teilnehmerId',
                aliases: ['attendeeId'],
                isPrimaryKey: true,
                isForeignKey: true
              },
              {
                name: 'vortragId',
                aliases: ['talkId'],
                isPrimaryKey: true,
                isForeignKey: true
              }
            ]
          }
        ],
        edges: [
          {
            kind: 'foreign-key',
            from: 'teilnahme',
            to: 'teilnehmer',
            fromAttribute: 'teilnehmerId',
            toAttribute: 'teilnehmerId'
          },
          {
            kind: 'foreign-key',
            from: 'teilnahme',
            to: 'vortrag',
            fromAttribute: 'vortragId',
            toAttribute: 'vortragId'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'relational-model', 'foreign-key', 'many-to-many']
};
