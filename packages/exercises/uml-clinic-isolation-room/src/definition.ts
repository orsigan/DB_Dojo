import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-clinic-isolation-room',
  topic: ['modelling', 'uml'],
  difficulty: 'Advanced',
  title: {
    de: 'Patient und Isolationszimmer als Klassendiagramm',
    en: 'Patient and isolation room as a class diagram'
  },
  prompt: {
    de: [
      'In einer Klinik-Station wird für Patienten mit Isolationspflicht jeweils ein eigenes Zimmer reserviert.',
      'Ein solches Zimmer ist zu jedem Zeitpunkt höchstens einem Patienten zugeordnet. Ein Patient mit Isolationspflicht hat genau ein eigenes Zimmer.',
      '',
      'Klassen und Attribute (Schlüssel als PK markieren):',
      '• Patient: patientId (PK), name',
      '• Isolationszimmer: zimmerNr (PK), station',
      '',
      'Zeichne das passende Klassendiagramm mit exakt diesen Namen.'
    ].join('\n'),
    en: [
      'In a hospital ward, patients requiring isolation are each assigned their own room.',
      'Such a room is assigned to at most one patient at any given time. A patient requiring isolation has exactly one room of their own.',
      '',
      'Classes and attributes (mark keys as PK):',
      '• Patient: patientId (PK), name',
      '• IsolationRoom: roomNo (PK), ward',
      '',
      'Draw the matching class diagram using exactly these names.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Erinnerung an die Platzierungsregel: Die Zahl neben einer Klasse zählt, wie viele Instanzen dieser Klasse zu einer Instanz auf der anderen Seite gehören.',
        en: 'Reminder of the placement rule: the number next to a class counts instances of that class per one instance on the other side.'
      }
    },
    {
      text: {
        de: 'Lies „Zimmer höchstens einem Patienten zugeordnet“ genau: Diese Aussage betrifft, wie viele Patienten zu einem Zimmer gehören — sie steht also bei Patient, nicht bei Zimmer. Genau diese Falle testet die Aufgabe.',
        en: 'Re-read "room assigned to at most one patient" carefully — that fact is about how many patients pair with one room, so it belongs on the Patient end, not the room end. That is exactly the trap this exercise tests.'
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'patient',
            kind: 'class',
            name: 'Patient',
            attributes: [{ name: 'patientId', isPrimaryKey: true }, { name: 'name' }]
          },
          {
            key: 'isolationszimmer',
            kind: 'class',
            name: 'Isolationszimmer',
            aliases: ['IsolationRoom'],
            attributes: [
              { name: 'zimmerNr', aliases: ['roomNo'], isPrimaryKey: true },
              { name: 'station', aliases: ['ward'] }
            ]
          }
        ],
        edges: [
          {
            kind: 'association',
            from: 'patient',
            to: 'isolationszimmer',
            fromMultiplicity: '0..1',
            toMultiplicity: '1'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'class-diagram', 'association', 'multiplicity']
};
