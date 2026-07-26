import type { Diagram, Language } from '@db-dojo/core';

const columnNames = {
  de: {
    table: 'mitfahrt_roh',
    ride: 'fahrtNr',
    destination: 'ziel',
    passenger: 'mitfahrerId',
    passengerName: 'mitfahrerName'
  },
  en: {
    table: 'ride_raw',
    ride: 'rideNo',
    destination: 'destination',
    passenger: 'passengerId',
    passengerName: 'passengerName'
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
          { id: 'raw-ride', name: names.ride, isPrimaryKey: false, isForeignKey: false },
          {
            id: 'raw-destination',
            name: names.destination,
            isPrimaryKey: false,
            isForeignKey: false
          },
          {
            id: 'raw-passenger',
            name: names.passenger,
            isPrimaryKey: false,
            isForeignKey: false
          },
          {
            id: 'raw-passenger-name',
            name: names.passengerName,
            isPrimaryKey: false,
            isForeignKey: false
          }
        ]
      }
    ],
    edges: []
  };
}
