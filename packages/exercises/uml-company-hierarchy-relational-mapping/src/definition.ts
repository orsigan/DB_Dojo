import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-company-hierarchy-relational-mapping',
  topic: ['modelling', 'relational'],
  difficulty: 'Advanced',
  title: {
    de: 'Mitarbeiterhierarchie ins Relationenmodell überführen',
    en: 'Translate an employee hierarchy into the relational model'
  },
  prompt: {
    de: [
      'Gegeben ist dieses Klassendiagramm:',
      '',
      '  Mitarbeiter (mitarbeiterId, name)',
      '',
      '  Mitarbeiter 0..1 —— 0..* Mitarbeiter',
      '',
      'Ein Mitarbeiter kann mehrere andere Mitarbeiter leiten. Umgekehrt hat jeder Mitarbeiter unter den übrigen Mitarbeitern höchstens einen, der ihn leitet.',
      '',
      'Zeichne das zugehörige Relationenmodell:',
      '• Es entsteht eine einzige Tabelle mitarbeiter mit ihren Spalten.',
      '• Ergänze eine Fremdschlüsselspalte mit dem Namen leitungId, die auf den leitenden Mitarbeiter verweist.',
      '• Markiere Primär- und Fremdschlüssel und verbinde die Fremdschlüsselspalte mit der Spalte, auf die sie verweist.'
    ].join('\n'),
    en: [
      'You are given this class diagram:',
      '',
      '  Employee (employeeId, name)',
      '',
      '  Employee 0..1 —— 0..* Employee',
      '',
      'An employee can manage several other employees. Conversely, every employee has at most one manager among the other employees.',
      '',
      'Draw the matching relational model:',
      '• The result is a single table employee with its columns.',
      '• Add a foreign key column named managerId that points to the managing employee.',
      '• Mark primary and foreign keys, and connect the foreign key column to the column it references.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Die Beziehung besteht zwischen Mitarbeiter und sich selbst — es gibt trotzdem nur eine Tabelle, sie bekommt lediglich einen Fremdschlüssel, der auf ihren eigenen Primärschlüssel zurückverweist.',
        en: 'The relationship is between Mitarbeiter and itself — there is still only one table, it just gets a foreign key that points back into its own primary key.'
      }
    },
    {
      text: {
        de: 'Benenne die Fremdschlüsselspalte nicht mitarbeiterId, sondern anders (z. B. leitungId), damit sie sich von dem Primärschlüssel unterscheidet, aus dem ihre Werte stammen.',
        en: 'Name the foreign key column something other than mitarbeiterId (e.g. leitungId), so it is distinguishable from the primary key it copies from.'
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'mitarbeiter',
            kind: 'table',
            name: 'mitarbeiter',
            aliases: ['employee'],
            attributes: [
              { name: 'mitarbeiterId', aliases: ['employeeId'], isPrimaryKey: true },
              { name: 'name' },
              { name: 'leitungId', aliases: ['managerId'], isForeignKey: true }
            ]
          }
        ],
        edges: [
          {
            kind: 'foreign-key',
            from: 'mitarbeiter',
            to: 'mitarbeiter',
            fromAttribute: 'leitungId',
            toAttribute: 'mitarbeiterId'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'relational-model', 'foreign-key', 'self-reference']
};
