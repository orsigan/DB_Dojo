import type { Diagram, Language } from '@db-dojo/core';

const columnNames = {
  de: {
    table: 'inserat_roh',
    listing: 'inseratNr',
    agent: 'maklerNr',
    agentName: 'maklerName',
    viewing: 'besichtigungNr',
    viewingDate: 'besichtigungsDatum'
  },
  en: {
    table: 'listing_raw',
    listing: 'listingNo',
    agent: 'agentNo',
    agentName: 'agentName',
    viewing: 'viewingNo',
    viewingDate: 'viewingDate'
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
          { id: 'raw-agent', name: names.agent, isPrimaryKey: false, isForeignKey: false },
          { id: 'raw-agent-name', name: names.agentName, isPrimaryKey: false, isForeignKey: false },
          { id: 'raw-viewing', name: names.viewing, isPrimaryKey: false, isForeignKey: false },
          {
            id: 'raw-viewing-date',
            name: names.viewingDate,
            isPrimaryKey: false,
            isForeignKey: false
          }
        ]
      }
    ],
    edges: []
  };
}
