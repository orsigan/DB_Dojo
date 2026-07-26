import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'normalization-clinic-medication-3nf',
  topic: ['modelling', 'normalization'],
  difficulty: 'Profi',
  title: {
    de: 'Termine und Verordnungen in die 3. Normalform bringen',
    en: 'Bring appointments and prescriptions into third normal form'
  },
  prompt: {
    de: [
      'Die Tabelle termin_roh liegt unnormalisiert vor:',
      '',
      '  terminNr | patientNr | patientName | medikamentNr | dosis',
      '  ---------+-----------+-------------+--------------+------------',
      '  T1       | P1        | Bauer       | M-10         | 1x täglich',
      '  T1       | P1        | Bauer       | M-20         | 2x täglich',
      '  T2       | P2        | Krüger      | M-10         | 1x täglich',
      '',
      'Schritt 1 — Zeichne die funktionalen Abhängigkeiten direkt in termin_roh ein.',
      'Trage nur die direkten Abhängigkeiten ein, keine transitiv ableitbaren.',
      '',
      'Schritt 2 — Zerlege die Tabelle in die 3. Normalform.',
      'Verwende die Tabellennamen patient, termin und verordnung, verteile die Spalten',
      'passend, markiere Primär- und Fremdschlüssel und verbinde jede Fremdschlüsselspalte',
      'mit der Spalte, auf die sie verweist.',
      '',
      'Eine eigene Tabelle für Medikamente ist nicht Teil der Aufgabe.'
    ].join('\n'),
    en: [
      'The table appointment_raw is unnormalised:',
      '',
      '  appointmentNo | patientNo | patientName | medicationNo | dosage',
      '  --------------+-----------+-------------+--------------+------------',
      '  T1            | P1        | Baker       | M-10         | once daily',
      '  T1            | P1        | Baker       | M-20         | twice daily',
      '  T2            | P2        | Kruger      | M-10         | once daily',
      '',
      'Step 1 — Draw the functional dependencies straight into appointment_raw.',
      'Only add the direct dependencies, not the ones derivable by transitivity.',
      '',
      'Step 2 — Decompose the table into third normal form.',
      'Use the table names patient, appointment and prescription, distribute the columns,',
      'mark primary and foreign keys, and connect every foreign key column to the column',
      'it references.',
      '',
      'A separate table for medications is not part of this exercise.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'patientName hängt nicht direkt von terminNr ab, sondern von patientNr — genau diese transitive Abhängigkeit verletzt die 3. Normalform.',
        en: 'patientName does not depend on terminNr directly but on patientNr — that transitive dependency is what breaks 3NF, exactly as with kundenName in the reference example.'
      }
    },
    {
      text: {
        de: 'Der Schlüssel von verordnung ist zusammengesetzt: dosis hängt von terminNr und medikamentNr gemeinsam ab.',
        en: 'The key of verordnung is composite: dosis needs both terminNr and medikamentNr together.'
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'raw',
            kind: 'table',
            name: 'termin_roh',
            aliases: ['appointment_raw'],
            attributes: [
              { name: 'terminNr', aliases: ['appointmentNo'] },
              { name: 'patientNr', aliases: ['patientNo'] },
              { name: 'patientName', aliases: ['patientName'] },
              { name: 'medikamentNr', aliases: ['medicationNo'] },
              { name: 'dosis', aliases: ['dosage'] }
            ]
          },
          {
            key: 'patient',
            kind: 'table',
            name: 'patient',
            attributes: [
              { name: 'patientNr', aliases: ['patientNo'], isPrimaryKey: true },
              { name: 'patientName', aliases: ['patientName'] }
            ]
          },
          {
            key: 'termin',
            kind: 'table',
            name: 'termin',
            aliases: ['appointment'],
            attributes: [
              { name: 'terminNr', aliases: ['appointmentNo'], isPrimaryKey: true },
              { name: 'patientNr', aliases: ['patientNo'], isForeignKey: true }
            ]
          },
          {
            key: 'verordnung',
            kind: 'table',
            name: 'verordnung',
            aliases: ['prescription'],
            attributes: [
              {
                name: 'terminNr',
                aliases: ['appointmentNo'],
                isPrimaryKey: true,
                isForeignKey: true
              },
              { name: 'medikamentNr', aliases: ['medicationNo'], isPrimaryKey: true },
              { name: 'dosis', aliases: ['dosage'] }
            ]
          }
        ],
        edges: [
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'terminNr',
            toAttribute: 'patientNr'
          },
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'patientNr',
            toAttribute: 'patientName'
          },
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'terminNr',
            additionalDeterminants: ['medikamentNr'],
            toAttribute: 'dosis'
          },
          {
            kind: 'foreign-key',
            from: 'termin',
            to: 'patient',
            fromAttribute: 'patientNr',
            toAttribute: 'patientNr'
          },
          {
            kind: 'foreign-key',
            from: 'verordnung',
            to: 'termin',
            fromAttribute: 'terminNr',
            toAttribute: 'terminNr'
          }
        ]
      }
    ]
  },
  tags: ['normalization', 'functional-dependency', '3nf']
};
