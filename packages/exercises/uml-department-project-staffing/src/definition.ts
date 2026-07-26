import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-department-project-staffing',
  topic: ['modelling', 'uml'],
  difficulty: 'Profi',
  title: {
    de: 'Abteilungen, Projekte und Mitarbeit als Klassendiagramm',
    en: 'Departments, projects and staffing as a class diagram'
  },
  prompt: {
    de: [
      'Modelliere das folgende Szenario als UML-Klassendiagramm.',
      '',
      'In einem Unternehmen gehört jeder Mitarbeiter zu genau einer Abteilung, während eine Abteilung',
      'mehrere Mitarbeiter beschäftigt. Jede Abteilung verantwortet mehrere Projekte, und jedes Projekt',
      'ist genau einer Abteilung zugeordnet. Mitarbeiter arbeiten gleichzeitig an mehreren Projekten mit,',
      'und an einem Projekt sind mehrere Mitarbeiter beteiligt. Für jede solche Mitarbeit wird zusätzlich',
      'festgehalten, welche Rolle die jeweilige Person in diesem Projekt einnimmt.',
      '',
      'Klassen und Attribute (Schlüssel als PK markieren):',
      '• Mitarbeiter: personalNr (PK), name',
      '• Abteilung: abteilungId (PK), bezeichnung',
      '• Projekt: projektNr (PK), titel'
    ].join('\n'),
    en: [
      'Model the following scenario as a UML class diagram.',
      '',
      'At this company every employee belongs to exactly one department, while a department employs',
      'several employees. Each department is responsible for several projects, and every project belongs',
      'to exactly one department. Employees work on several projects at the same time, and several',
      'employees contribute to any given project. For every such collaboration, the role the person',
      'plays on that particular project is recorded as well.',
      '',
      'Classes and attributes (mark keys as PK):',
      '• Employee: staffId (PK), name',
      '• Department: departmentId (PK), designation',
      '• Project: projectNo (PK), title'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Die Rolle ist keine Eigenschaft des Mitarbeiters (sie wechselt je nach Projekt) und auch keine Eigenschaft des Projekts (verschiedene Personen können dort unterschiedliche Rollen haben) — sie gehört zur Paarung aus Mitarbeiter und Projekt. Hänge dafür eine Klasse an diese Verbindungslinie.',
        en: "The role isn't a property of the employee (it changes per project) nor of the project (different people can have different roles on it) — it belongs to the pairing of employee and project. Attach a class to that connecting line."
      }
    },
    {
      text: {
        de: 'Die Beziehungen Mitarbeiter–Abteilung und Abteilung–Projekt sind beide einfache 1:n-Beziehungen; nur zwischen Mitarbeiter und Projekt liegt eine m:n-Beziehung mit dem zusätzlichen Attribut vor.',
        en: 'The Mitarbeiter–Abteilung and Abteilung–Projekt relationships are both plain 1:n; only Mitarbeiter–Projekt is many-to-many with the extra attribute.'
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
            kind: 'class',
            name: 'Mitarbeiter',
            aliases: ['Employee'],
            attributes: [
              { name: 'personalNr', aliases: ['staffId'], isPrimaryKey: true },
              { name: 'name' }
            ]
          },
          {
            key: 'abteilung',
            kind: 'class',
            name: 'Abteilung',
            aliases: ['Department'],
            attributes: [
              { name: 'abteilungId', aliases: ['departmentId'], isPrimaryKey: true },
              { name: 'bezeichnung', aliases: ['designation'] }
            ]
          },
          {
            key: 'projekt',
            kind: 'class',
            name: 'Projekt',
            aliases: ['Project'],
            attributes: [
              { name: 'projektNr', aliases: ['projectNo'], isPrimaryKey: true },
              { name: 'titel', aliases: ['title'] }
            ]
          },
          {
            key: 'mitarbeit',
            kind: 'association-class',
            name: 'Mitarbeit',
            aliases: ['Assignment'],
            attributes: [{ name: 'rolle', aliases: ['role'] }]
          }
        ],
        edges: [
          {
            kind: 'association',
            from: 'abteilung',
            to: 'mitarbeiter',
            fromMultiplicity: '1',
            toMultiplicity: '0..*'
          },
          {
            kind: 'association',
            from: 'abteilung',
            to: 'projekt',
            fromMultiplicity: '1',
            toMultiplicity: '0..*'
          },
          {
            kind: 'association',
            from: 'mitarbeiter',
            to: 'projekt',
            fromMultiplicity: '0..*',
            toMultiplicity: '0..*',
            associationClass: 'mitarbeit'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'class-diagram', 'association-class', 'many-to-many']
};
