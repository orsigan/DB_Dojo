import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-media-library-generalization',
  topic: ['modelling', 'uml'],
  difficulty: 'Profi',
  title: {
    de: 'Mediathek mit Büchern und DVDs als Klassendiagramm',
    en: 'A media library with books and DVDs as a class diagram'
  },
  prompt: {
    de: [
      'Modelliere das folgende Szenario als UML-Klassendiagramm.',
      '',
      'Eine Mediathek verleiht Medien. Manche Medien sind Bücher mit einer Seitenzahl, andere sind',
      'DVDs mit einer Laufzeit in Minuten. Jedes Medium wird von höchstens einem Mitglied gleichzeitig',
      'ausgeliehen. Ein Mitglied kann mehrere Medien gleichzeitig ausleihen.',
      '',
      'Klassen und Attribute (Schlüssel als PK markieren):',
      '• Medium: medienId (PK), titel',
      '• Buch: seitenzahl',
      '• Dvd: laufzeit',
      '• Mitglied: mitgliedId (PK), name'
    ].join('\n'),
    en: [
      'Model the following scenario as a UML class diagram.',
      '',
      'A media library lends out media. Some media are books with a page count, others are DVDs',
      'with a runtime in minutes. Each medium is on loan to at most one member at a time. A member',
      'can borrow several media items at once.',
      '',
      'Classes and attributes (mark keys as PK):',
      '• Medium: mediaId (PK), title',
      '• Book: pageCount',
      '• DVD: runtime',
      '• Member: memberId (PK), name'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Buch und Dvd erben medienId/titel von Medium, statt sie zu wiederholen — genau das ist die Spezialfall-Beziehung.',
        en: "Buch and Dvd both inherit medienId/titel from Medium rather than repeating them — that's the special-case relationship."
      }
    },
    {
      text: {
        de: 'Achte bei der Ausleih-Assoziation auf die Richtung der Multiplizität: "ein Medium hat aktuell höchstens ein Mitglied" bedeutet 0..1 bei Mitglied, nicht bei Medium.',
        en: 'Careful with the loan association\'s multiplicity direction: "a medium currently has at most one member" places 0..1 next to Mitglied, not next to Medium.'
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'medium',
            kind: 'class',
            name: 'Medium',
            attributes: [
              { name: 'medienId', aliases: ['mediaId'], isPrimaryKey: true },
              { name: 'titel', aliases: ['title'] }
            ]
          },
          {
            key: 'buch',
            kind: 'class',
            name: 'Buch',
            aliases: ['Book'],
            attributes: [{ name: 'seitenzahl', aliases: ['pageCount'] }]
          },
          {
            key: 'dvd',
            kind: 'class',
            name: 'Dvd',
            aliases: ['DVD'],
            attributes: [{ name: 'laufzeit', aliases: ['runtime'] }]
          },
          {
            key: 'mitglied',
            kind: 'class',
            name: 'Mitglied',
            aliases: ['Member'],
            attributes: [
              { name: 'mitgliedId', aliases: ['memberId'], isPrimaryKey: true },
              { name: 'name' }
            ]
          }
        ],
        edges: [
          { kind: 'generalization', from: 'buch', to: 'medium' },
          { kind: 'generalization', from: 'dvd', to: 'medium' },
          {
            kind: 'association',
            from: 'mitglied',
            to: 'medium',
            fromMultiplicity: '0..1',
            toMultiplicity: '0..*'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'class-diagram', 'generalization', 'association']
};
