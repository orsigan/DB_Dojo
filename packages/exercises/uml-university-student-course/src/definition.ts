import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-university-student-course',
  topic: ['modelling', 'uml'],
  difficulty: 'Advanced',
  title: {
    de: 'Studierende und Kurse als Klassendiagramm',
    en: 'Students and courses as a class diagram'
  },
  prompt: {
    de: [
      'An der Universität belegt jeder Studierende gleichzeitig mehrere Kurse. Umgekehrt wird jeder Kurs von mehreren Studierenden besucht.',
      '',
      'Klassen und Attribute (Schlüssel als PK markieren):',
      '• Studierender: matrikelNr (PK), name',
      '• Kurs: kursNr (PK), titel',
      '',
      'Zeichne das passende Klassendiagramm mit exakt diesen Namen.'
    ].join('\n'),
    en: [
      'At the university, every student is enrolled in several courses at the same time. Conversely, every course is attended by several students.',
      '',
      'Classes and attributes (mark keys as PK):',
      '• Student: studentId (PK), name',
      '• Course: courseNo (PK), title',
      '',
      'Draw the matching class diagram using exactly these names.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Auf beiden Seiten können mehrere Objekte gleichzeitig vorkommen — das macht daraus eine m:n-Assoziation, trotzdem nur eine einfache Linie (keine Raute, kein Dreieck).',
        en: 'Both sides can occur multiple times at once — that makes this a many-to-many association, still just a plain line (no diamond, no triangle).'
      }
    },
    {
      text: {
        de: 'Bei einer einfachen Assoziation spielt die Richtung keine Rolle; wichtig ist nur, dass auf beiden Seiten 0..* steht.',
        en: 'Direction does not matter for a plain association; only getting 0..* on both ends matters here.'
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'studierender',
            kind: 'class',
            name: 'Studierender',
            aliases: ['Student'],
            attributes: [
              { name: 'matrikelNr', aliases: ['studentId'], isPrimaryKey: true },
              { name: 'name' }
            ]
          },
          {
            key: 'kurs',
            kind: 'class',
            name: 'Kurs',
            aliases: ['Course'],
            attributes: [
              { name: 'kursNr', aliases: ['courseNo'], isPrimaryKey: true },
              { name: 'titel', aliases: ['title'] }
            ]
          }
        ],
        edges: [
          {
            kind: 'association',
            from: 'studierender',
            to: 'kurs',
            fromMultiplicity: '0..*',
            toMultiplicity: '0..*'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'class-diagram', 'association', 'many-to-many']
};
