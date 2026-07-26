import type { Diagram, Language } from '@db-dojo/core';

const columnNames = {
  de: {
    table: 'anzeige_roh',
    listing: 'anzeigeNr',
    title: 'titel',
    phone1: 'telefon1',
    phone2: 'telefon2'
  },
  en: {
    table: 'listing_raw',
    listing: 'listingNo',
    title: 'title',
    phone1: 'phone1',
    phone2: 'phone2'
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
          { id: 'raw-listing', name: names.listing, isPrimaryKey: false, isForeignKey: false },
          { id: 'raw-title', name: names.title, isPrimaryKey: false, isForeignKey: false },
          { id: 'raw-phone1', name: names.phone1, isPrimaryKey: false, isForeignKey: false },
          { id: 'raw-phone2', name: names.phone2, isPrimaryKey: false, isForeignKey: false }
        ]
      }
    ],
    edges: []
  };
}
