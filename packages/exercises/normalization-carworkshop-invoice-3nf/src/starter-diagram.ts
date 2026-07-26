import type { Diagram, Language } from '@db-dojo/core';

const columnNames = {
  de: {
    table: 'rechnung_roh',
    invoice: 'rechnungNr',
    customer: 'kundeNr',
    customerName: 'kundeName',
    part: 'teilNr',
    partName: 'teilBezeichnung',
    quantity: 'menge'
  },
  en: {
    table: 'invoice_raw',
    invoice: 'invoiceNo',
    customer: 'customerNo',
    customerName: 'customerName',
    part: 'partNo',
    partName: 'partName',
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
          { id: 'raw-invoice', name: names.invoice, isPrimaryKey: false, isForeignKey: false },
          { id: 'raw-customer', name: names.customer, isPrimaryKey: false, isForeignKey: false },
          {
            id: 'raw-customer-name',
            name: names.customerName,
            isPrimaryKey: false,
            isForeignKey: false
          },
          { id: 'raw-part', name: names.part, isPrimaryKey: false, isForeignKey: false },
          { id: 'raw-part-name', name: names.partName, isPrimaryKey: false, isForeignKey: false },
          { id: 'raw-quantity', name: names.quantity, isPrimaryKey: false, isForeignKey: false }
        ]
      }
    ],
    edges: []
  };
}
