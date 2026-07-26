import type { Diagram, Language } from '@db-dojo/core';

const columnNames = {
  de: {
    table: 'lagerbestand_roh',
    warehouse: 'lagerId',
    article: 'artikelNr',
    articleName: 'artikelBezeichnung',
    quantity: 'menge'
  },
  en: {
    table: 'stock_raw',
    warehouse: 'warehouseId',
    article: 'articleNo',
    articleName: 'articleName',
    quantity: 'quantity'
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
          { id: 'raw-warehouse', name: names.warehouse, isPrimaryKey: false, isForeignKey: false },
          { id: 'raw-article', name: names.article, isPrimaryKey: false, isForeignKey: false },
          {
            id: 'raw-article-name',
            name: names.articleName,
            isPrimaryKey: false,
            isForeignKey: false
          },
          { id: 'raw-quantity', name: names.quantity, isPrimaryKey: false, isForeignKey: false }
        ]
      }
    ],
    edges: []
  };
}
