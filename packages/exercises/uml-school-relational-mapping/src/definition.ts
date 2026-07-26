import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-school-relational-mapping',
  topic: ['modelling', 'relational'],
  difficulty: 'Beginner',
  title: {
    de: 'Klassendiagramm einer Schule ins Relationenmodell überführen',
    en: 'Translate a school class diagram into the relational model'
  },
  prompt: {
    de: [
      'Gegeben ist dieses Klassendiagramm:',
      '',
      '  Lehrer (lehrerId, name)',
      '  Klasse (klassenId, stufe)',
      '  Schueler (schuelerId, name)',
      '',
      '  Lehrer 1 —— 0..* Klasse',
      '  Klasse 1 —— 0..* Schueler',
      '',
      'Zeichne das zugehörige Relationenmodell als Tabellen:',
      '• Jede Tabelle bekommt ihre Spalten, Primärschlüssel als PK und Fremdschlüssel als FK markiert.',
      '• Verbinde jede Fremdschlüsselspalte mit der Spalte, auf die sie verweist.'
    ].join('\n'),
    en: [
      'You are given this class diagram:',
      '',
      '  Teacher (teacherId, name)',
      '  SchoolClass (classId, grade)',
      '  Student (studentId, name)',
      '',
      '  Teacher 1 —— 0..* SchoolClass',
      '  SchoolClass 1 —— 0..* Student',
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
        de: 'Bilde jede 1:n-Beziehung unabhängig ab — die beiden Fremdschlüssel beeinflussen sich nicht gegenseitig.',
        en: 'Map each 1:n relationship independently — the two foreign keys do not interact with each other.'
      }
    },
    {
      text: {
        de: 'Klasse bekommt einen eigenen Fremdschlüssel, obwohl die Tabelle selbst auch von Schueler referenziert wird.',
        en: 'Klasse (SchoolClass) gets its own foreign key, even though the table itself is also referenced by Schueler (Student).'
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'lehrer',
            kind: 'table',
            name: 'lehrer',
            aliases: ['teacher'],
            attributes: [
              { name: 'lehrerId', aliases: ['teacherId'], isPrimaryKey: true },
              { name: 'name' }
            ]
          },
          {
            key: 'klasse',
            kind: 'table',
            name: 'klasse',
            aliases: ['schoolClass'],
            attributes: [
              { name: 'klassenId', aliases: ['classId'], isPrimaryKey: true },
              { name: 'stufe', aliases: ['grade'] },
              { name: 'lehrerId', aliases: ['teacherId'], isForeignKey: true }
            ]
          },
          {
            key: 'schueler',
            kind: 'table',
            name: 'schueler',
            aliases: ['student'],
            attributes: [
              { name: 'schuelerId', aliases: ['studentId'], isPrimaryKey: true },
              { name: 'name' },
              { name: 'klassenId', aliases: ['classId'], isForeignKey: true }
            ]
          }
        ],
        edges: [
          {
            kind: 'foreign-key',
            from: 'klasse',
            to: 'lehrer',
            fromAttribute: 'lehrerId',
            toAttribute: 'lehrerId'
          },
          {
            kind: 'foreign-key',
            from: 'schueler',
            to: 'klasse',
            fromAttribute: 'klassenId',
            toAttribute: 'klassenId'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'relational-model', 'foreign-key']
};
