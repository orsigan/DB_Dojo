import type { Diagram, Language } from '@db-dojo/core';

const columnNames = {
  de: {
    table: 'buchung_roh',
    booking: 'buchungNr',
    guest: 'gastNr',
    guestName: 'gastName',
    room: 'zimmerNr',
    roomCategory: 'zimmerKategorie',
    nights: 'uebernachtungen'
  },
  en: {
    table: 'booking_raw',
    booking: 'bookingNo',
    guest: 'guestNo',
    guestName: 'guestName',
    room: 'roomNo',
    roomCategory: 'roomCategory',
    nights: 'nights'
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
          { id: 'raw-booking', name: names.booking, isPrimaryKey: false, isForeignKey: false },
          { id: 'raw-guest', name: names.guest, isPrimaryKey: false, isForeignKey: false },
          { id: 'raw-guest-name', name: names.guestName, isPrimaryKey: false, isForeignKey: false },
          { id: 'raw-room', name: names.room, isPrimaryKey: false, isForeignKey: false },
          {
            id: 'raw-room-category',
            name: names.roomCategory,
            isPrimaryKey: false,
            isForeignKey: false
          },
          { id: 'raw-nights', name: names.nights, isPrimaryKey: false, isForeignKey: false }
        ]
      }
    ],
    edges: []
  };
}
