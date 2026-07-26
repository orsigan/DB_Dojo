import type { Diagram, Language } from '@db-dojo/core';

const columnNames = {
  de: {
    table: 'ausleihe_roh',
    employee: 'mitarbeiterNr',
    name: 'name',
    tool1: 'werkzeug1',
    tool2: 'werkzeug2',
    tool3: 'werkzeug3'
  },
  en: {
    table: 'checkout_raw',
    employee: 'employeeNo',
    name: 'name',
    tool1: 'tool1',
    tool2: 'tool2',
    tool3: 'tool3'
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
          { id: 'raw-employee', name: names.employee, isPrimaryKey: false, isForeignKey: false },
          { id: 'raw-name', name: names.name, isPrimaryKey: false, isForeignKey: false },
          { id: 'raw-tool1', name: names.tool1, isPrimaryKey: false, isForeignKey: false },
          { id: 'raw-tool2', name: names.tool2, isPrimaryKey: false, isForeignKey: false },
          { id: 'raw-tool3', name: names.tool3, isPrimaryKey: false, isForeignKey: false }
        ]
      }
    ],
    edges: []
  };
}
