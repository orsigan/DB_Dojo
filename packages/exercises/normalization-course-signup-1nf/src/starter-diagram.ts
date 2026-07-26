import type { Diagram, Language } from '@db-dojo/core';

const columnNames = {
  de: {
    table: 'teilnahme_roh',
    participant: 'teilnehmerNr',
    name: 'name',
    course1: 'kurs1',
    course2: 'kurs2'
  },
  en: {
    table: 'signup_raw',
    participant: 'participantNo',
    name: 'name',
    course1: 'course1',
    course2: 'course2'
  }
};

export function createStarterDiagram(language: Language): Diagram {
  const names = columnNames[language];

  return {
    nodes: [
      {
        id: 'raw-table',
        kind: 'table',
        name: names.table,
        x: 60,
        y: 60,
        attributes: [
          {
            id: 'raw-participant',
            name: names.participant,
            isPrimaryKey: false,
            isForeignKey: false
          },
          { id: 'raw-name', name: names.name, isPrimaryKey: false, isForeignKey: false },
          { id: 'raw-course1', name: names.course1, isPrimaryKey: false, isForeignKey: false },
          { id: 'raw-course2', name: names.course2, isPrimaryKey: false, isForeignKey: false }
        ]
      }
    ],
    edges: []
  };
}
