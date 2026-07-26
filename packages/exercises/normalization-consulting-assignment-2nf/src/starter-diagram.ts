import type { Diagram, Language } from '@db-dojo/core';

const columnNames = {
  de: {
    table: 'einsatz_roh',
    project: 'projektNr',
    employee: 'mitarbeiterNr',
    employeeName: 'mitarbeiterName',
    hours: 'stunden'
  },
  en: {
    table: 'assignment_raw',
    project: 'projectNo',
    employee: 'employeeNo',
    employeeName: 'employeeName',
    hours: 'hours'
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
          { id: 'raw-project', name: names.project, isPrimaryKey: false, isForeignKey: false },
          { id: 'raw-employee', name: names.employee, isPrimaryKey: false, isForeignKey: false },
          {
            id: 'raw-employee-name',
            name: names.employeeName,
            isPrimaryKey: false,
            isForeignKey: false
          },
          { id: 'raw-hours', name: names.hours, isPrimaryKey: false, isForeignKey: false }
        ]
      }
    ],
    edges: []
  };
}
