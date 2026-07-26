import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-university-course-prerequisites',
  topic: ['modelling', 'uml'],
  difficulty: 'Ultra',
  title: {
    de: 'Kursvoraussetzungen als Klassendiagramm',
    en: 'Course prerequisites as a class diagram'
  },
  prompt: {
    de: [
      'Manche Kurse setzen den erfolgreichen Abschluss eines anderen Kurses voraus. Ein Kurs kann',
      'Voraussetzung für mehrere andere Kurse sein, benötigt selbst aber höchstens einen direkten',
      'Vorgängerkurs.',
      '',
      'Zusätzlich wird jeder Kurs von genau einem Fachbereich angeboten, ein Fachbereich bietet',
      'mehrere Kurse an.',
      '',
      'Klassen und Attribute (Schlüssel als PK markieren):',
      '• Kurs: kursNr (PK), titel',
      '• Fachbereich: fachbereichId (PK), name'
    ].join('\n'),
    en: [
      'Some courses require the successful completion of another course as a prerequisite. A course',
      'can be a prerequisite for several other courses, but itself needs at most one direct',
      'predecessor course.',
      '',
      'In addition, every course is offered by exactly one department, and a department offers',
      'several courses.',
      '',
      'Classes and attributes (mark keys as PK):',
      '• Course: courseNo (PK), title',
      '• Department: departmentId (PK), name'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Eine Klasse kann eine Beziehung zu sich selbst haben — zeichne die Linie von Kurs zurück zu Kurs.',
        en: 'A class can have a relationship with itself — draw the line from Kurs back to Kurs.'
      }
    },
    {
      text: {
        de: 'Bestimme beide Enden sorgfältig: "höchstens einen direkten Vorgängerkurs" bezieht sich darauf, wie viele Vorgängerkurse ein Kurs hat, "Voraussetzung für mehrere andere" darauf, wie viele Nachfolgekurse ein Kurs hat — beide Zahlen sitzen auf derselben Rückschleife, je eine an einem Ende.',
        en: 'Re-derive both ends carefully: "at most one direct predecessor course" is about how many predecessor courses one course has, and "prerequisite for several others" is about how many successor courses one course has — both numbers sit on the same self-loop, one at each end.'
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'kurs',
            kind: 'class',
            name: 'Kurs',
            aliases: ['Course'],
            attributes: [
              { name: 'kursNr', aliases: ['courseNo'], isPrimaryKey: true },
              { name: 'titel', aliases: ['title'] }
            ]
          },
          {
            key: 'fachbereich',
            kind: 'class',
            name: 'Fachbereich',
            aliases: ['Department'],
            attributes: [
              { name: 'fachbereichId', aliases: ['departmentId'], isPrimaryKey: true },
              { name: 'name' }
            ]
          }
        ],
        edges: [
          {
            kind: 'association',
            from: 'kurs',
            to: 'kurs',
            fromMultiplicity: '0..1',
            toMultiplicity: '0..*'
          },
          {
            kind: 'association',
            from: 'fachbereich',
            to: 'kurs',
            fromMultiplicity: '1',
            toMultiplicity: '0..*'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'class-diagram', 'association', 'self-reference']
};
