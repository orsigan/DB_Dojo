import type { Diagram, Language } from '@db-dojo/core';

const columnNames = {
  de: {
    table: 'bestellung_roh',
    order: 'bestellNr',
    customer: 'kundenNr',
    customerName: 'kundenName',
    article: 'artikelNr',
    quantity: 'menge'
  },
  en: {
    table: 'orders_raw',
    order: 'orderNo',
    customer: 'customerNo',
    customerName: 'customerName',
    article: 'articleNo',
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
          { id: 'raw-order', name: names.order, isPrimaryKey: false, isForeignKey: false },
          { id: 'raw-customer', name: names.customer, isPrimaryKey: false, isForeignKey: false },
          {
            id: 'raw-customer-name',
            name: names.customerName,
            isPrimaryKey: false,
            isForeignKey: false
          },
          { id: 'raw-article', name: names.article, isPrimaryKey: false, isForeignKey: false },
          { id: 'raw-quantity', name: names.quantity, isPrimaryKey: false, isForeignKey: false }
        ]
      }
    ],
    edges: []
  };
}
