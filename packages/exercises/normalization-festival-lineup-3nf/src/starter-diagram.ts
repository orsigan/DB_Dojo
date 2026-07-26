import type { Diagram, Language } from '@db-dojo/core';

const columnNames = {
  de: {
    table: 'auftritt_roh',
    stage: 'buehneNr',
    timeSlot: 'zeitslot',
    band: 'bandNr',
    bandName: 'bandName',
    duration: 'dauer'
  },
  en: {
    table: 'performance_raw',
    stage: 'stageNo',
    timeSlot: 'timeSlot',
    band: 'bandNo',
    bandName: 'bandName',
    duration: 'duration'
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
          { id: 'raw-stage', name: names.stage, isPrimaryKey: false, isForeignKey: false },
          { id: 'raw-time-slot', name: names.timeSlot, isPrimaryKey: false, isForeignKey: false },
          { id: 'raw-band', name: names.band, isPrimaryKey: false, isForeignKey: false },
          { id: 'raw-band-name', name: names.bandName, isPrimaryKey: false, isForeignKey: false },
          { id: 'raw-duration', name: names.duration, isPrimaryKey: false, isForeignKey: false }
        ]
      }
    ],
    edges: []
  };
}
