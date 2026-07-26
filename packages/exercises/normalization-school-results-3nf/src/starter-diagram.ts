import type { Diagram, Language } from '@db-dojo/core';

const columnNames = {
  de: {
    table: 'ergebnis_roh',
    student: 'schuelerNr',
    studentName: 'schuelerName',
    subject: 'fachNr',
    subjectName: 'fachName',
    points: 'punkte'
  },
  en: {
    table: 'result_raw',
    student: 'studentNo',
    studentName: 'studentName',
    subject: 'subjectNo',
    subjectName: 'subjectName',
    points: 'points'
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
          { id: 'raw-student', name: names.student, isPrimaryKey: false, isForeignKey: false },
          {
            id: 'raw-student-name',
            name: names.studentName,
            isPrimaryKey: false,
            isForeignKey: false
          },
          { id: 'raw-subject', name: names.subject, isPrimaryKey: false, isForeignKey: false },
          {
            id: 'raw-subject-name',
            name: names.subjectName,
            isPrimaryKey: false,
            isForeignKey: false
          },
          { id: 'raw-points', name: names.points, isPrimaryKey: false, isForeignKey: false }
        ]
      }
    ],
    edges: []
  };
}
