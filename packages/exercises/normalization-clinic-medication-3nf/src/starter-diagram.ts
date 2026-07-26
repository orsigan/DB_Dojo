import type { Diagram, Language } from '@db-dojo/core';

const columnNames = {
  de: {
    table: 'termin_roh',
    appointment: 'terminNr',
    patient: 'patientNr',
    patientName: 'patientName',
    medication: 'medikamentNr',
    dosage: 'dosis'
  },
  en: {
    table: 'appointment_raw',
    appointment: 'appointmentNo',
    patient: 'patientNo',
    patientName: 'patientName',
    medication: 'medicationNo',
    dosage: 'dosage'
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
          {
            id: 'raw-appointment',
            name: names.appointment,
            isPrimaryKey: false,
            isForeignKey: false
          },
          { id: 'raw-patient', name: names.patient, isPrimaryKey: false, isForeignKey: false },
          {
            id: 'raw-patient-name',
            name: names.patientName,
            isPrimaryKey: false,
            isForeignKey: false
          },
          {
            id: 'raw-medication',
            name: names.medication,
            isPrimaryKey: false,
            isForeignKey: false
          },
          { id: 'raw-dosage', name: names.dosage, isPrimaryKey: false, isForeignKey: false }
        ]
      }
    ],
    edges: []
  };
}
