import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-streaming-platform-relational-mapping',
  topic: ['modelling', 'relational'],
  difficulty: 'Ultra',
  title: {
    de: 'Eine Streaming-Plattform ins Relationenmodell überführen',
    en: 'Translate a streaming platform into the relational model'
  },
  prompt: {
    de: [
      'Gegeben ist dieses Klassendiagramm:',
      '',
      '  Inhalt (inhaltId, titel)',
      '  Film (laufzeit)',
      '  Serie (staffelnAnzahl)',
      '  Nutzer (nutzerId, name)',
      '',
      '  Inhalt generalisiert zu: Film, Serie',
      '  Nutzer 0..* —— 0..* Inhalt   mit Assoziationsklasse Bewertung (sterne, datum)',
      '',
      'Zeichne das zugehörige Relationenmodell als Tabellen:',
      '• Jede Tabelle bekommt ihre Spalten, Primärschlüssel als PK und Fremdschlüssel als FK markiert.',
      '• Film und Serie werden zu eigenen Tabellen mit den Namen film und serie.',
      '• Die m:n-Beziehung wird zu einer eigenen Tabelle mit dem Namen bewertung.',
      '• Verbinde jede Fremdschlüsselspalte mit der Spalte, auf die sie verweist.'
    ].join('\n'),
    en: [
      'You are given this class diagram:',
      '',
      '  Content (contentId, title)',
      '  Movie (runtime)',
      '  Series (seasonCount)',
      '  User (userId, name)',
      '',
      '  Content generalizes to: Movie, Series',
      '  User 0..* —— 0..* Content   with association class Rating (stars, date)',
      '',
      'Draw the matching relational model as tables:',
      '• Every table gets its columns; mark primary keys as PK and foreign keys as FK.',
      '• Movie and Series become their own tables, named film and serie.',
      '• The m:n relationship becomes a table of its own, named bewertung.',
      '• Connect every foreign key column to the column it references.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'film und serie teilen sich ihren Primärschlüssel mit inhalt, genau wie bei jeder anderen Abbildung einer gemeinsamen Oberklasse auf eigene Tabellen.',
        en: '`film`/`serie` share their primary key with `inhalt`, same technique as any table-per-subclass mapping.'
      }
    },
    {
      text: {
        de: 'Eine Assoziationsklasse mit mehr als einem Attribut wird trotzdem zu genau einer Verbindungstabelle — sterne und datum stehen einfach nebeneinander auf derselben Zeile mit zusammengesetztem Schlüssel.',
        en: 'An association class with more than one attribute still maps to exactly one junction table — `sterne` and `datum` simply sit side by side on the same composite-key row.'
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'inhalt',
            kind: 'table',
            name: 'inhalt',
            aliases: ['content'],
            attributes: [
              { name: 'inhaltId', aliases: ['contentId'], isPrimaryKey: true },
              { name: 'titel', aliases: ['title'] }
            ]
          },
          {
            key: 'film',
            kind: 'table',
            name: 'film',
            aliases: ['movie'],
            attributes: [
              { name: 'inhaltId', aliases: ['contentId'], isPrimaryKey: true, isForeignKey: true },
              { name: 'laufzeit', aliases: ['runtime'] }
            ]
          },
          {
            key: 'serie',
            kind: 'table',
            name: 'serie',
            aliases: ['series'],
            attributes: [
              { name: 'inhaltId', aliases: ['contentId'], isPrimaryKey: true, isForeignKey: true },
              { name: 'staffelnAnzahl', aliases: ['seasonCount'] }
            ]
          },
          {
            key: 'nutzer',
            kind: 'table',
            name: 'nutzer',
            aliases: ['user'],
            attributes: [
              { name: 'nutzerId', aliases: ['userId'], isPrimaryKey: true },
              { name: 'name' }
            ]
          },
          {
            key: 'bewertung',
            kind: 'table',
            name: 'bewertung',
            aliases: ['rating'],
            attributes: [
              { name: 'nutzerId', aliases: ['userId'], isPrimaryKey: true, isForeignKey: true },
              { name: 'inhaltId', aliases: ['contentId'], isPrimaryKey: true, isForeignKey: true },
              { name: 'sterne', aliases: ['stars'] },
              { name: 'datum', aliases: ['date'] }
            ]
          }
        ],
        edges: [
          {
            kind: 'foreign-key',
            from: 'film',
            to: 'inhalt',
            fromAttribute: 'inhaltId',
            toAttribute: 'inhaltId'
          },
          {
            kind: 'foreign-key',
            from: 'serie',
            to: 'inhalt',
            fromAttribute: 'inhaltId',
            toAttribute: 'inhaltId'
          },
          {
            kind: 'foreign-key',
            from: 'bewertung',
            to: 'nutzer',
            fromAttribute: 'nutzerId',
            toAttribute: 'nutzerId'
          },
          {
            kind: 'foreign-key',
            from: 'bewertung',
            to: 'inhalt',
            fromAttribute: 'inhaltId',
            toAttribute: 'inhaltId'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'relational-model', 'foreign-key', 'generalization-mapping', 'many-to-many']
};
