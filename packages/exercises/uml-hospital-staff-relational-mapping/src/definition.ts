import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-hospital-staff-relational-mapping',
  topic: ['modelling', 'relational'],
  difficulty: 'Ultra',
  title: {
    de: 'Personal und Patienten ins Relationenmodell überführen',
    en: 'Translate staff and patients into the relational model'
  },
  prompt: {
    de: [
      'Gegeben ist dieses Klassendiagramm:',
      '',
      '  Personal (personalNr, name)',
      '  Arzt (fachgebiet)',
      '  Pflegekraft (schicht)',
      '  Patient (patientId, name)',
      '',
      '  Personal generalisiert zu: Arzt, Pflegekraft',
      '  Arzt 0..* —— 0..* Patient   mit Assoziationsklasse Behandlung (datum)',
      '',
      'Zeichne das zugehörige Relationenmodell als Tabellen:',
      '• Jede Tabelle bekommt ihre Spalten, Primärschlüssel als PK und Fremdschlüssel als FK markiert.',
      '• Arzt und Pflegekraft werden zu eigenen Tabellen mit den Namen arzt und pflegekraft.',
      '• Die m:n-Beziehung wird zu einer eigenen Tabelle mit dem Namen behandlung.',
      '• Verbinde jede Fremdschlüsselspalte mit der Spalte, auf die sie verweist.'
    ].join('\n'),
    en: [
      'You are given this class diagram:',
      '',
      '  Staff (staffId, name)',
      '  Doctor (specialty)',
      '  Nurse (shift)',
      '  Patient (patientId, name)',
      '',
      '  Staff generalizes to: Doctor, Nurse',
      '  Doctor 0..* —— 0..* Patient   with association class Treatment (date)',
      '',
      'Draw the matching relational model as tables:',
      '• Every table gets its columns; mark primary keys as PK and foreign keys as FK.',
      '• Doctor and Nurse become their own tables, named arzt and pflegekraft.',
      '• The m:n relationship becomes a table of its own, named behandlung.',
      '• Connect every foreign key column to the column it references.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'arzt und pflegekraft verwenden personalNr jeweils als eigenen Primärschlüssel, der zugleich Fremdschlüssel zurück zu personal ist — so wird eine gemeinsame Oberklasse auf Tabellen abgebildet.',
        en: '`arzt` and `pflegekraft` both reuse `personalNr` as their own primary key, which is also a foreign key back to `personal` — that is how a shared-superclass relationship maps to tables.'
      }
    },
    {
      text: {
        de: 'Der Fremdschlüssel von behandlung auf der Arzt-Seite zeigt auf arzt.personalNr, nicht direkt auf personal — die Beziehung bestand speziell zwischen Arzt und Patient, nicht zwischen allen Personal und Patient.',
        en: "`behandlung`'s foreign key to the doctor side points at `arzt.personalNr`, not at `personal` directly — the association was between Arzt and Patient specifically, not between all Personal and Patient."
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'personal',
            kind: 'table',
            name: 'personal',
            aliases: ['staff'],
            attributes: [
              { name: 'personalNr', aliases: ['staffId'], isPrimaryKey: true },
              { name: 'name' }
            ]
          },
          {
            key: 'arzt',
            kind: 'table',
            name: 'arzt',
            aliases: ['doctor'],
            attributes: [
              {
                name: 'personalNr',
                aliases: ['staffId'],
                isPrimaryKey: true,
                isForeignKey: true
              },
              { name: 'fachgebiet', aliases: ['specialty'] }
            ]
          },
          {
            key: 'pflegekraft',
            kind: 'table',
            name: 'pflegekraft',
            aliases: ['nurse'],
            attributes: [
              {
                name: 'personalNr',
                aliases: ['staffId'],
                isPrimaryKey: true,
                isForeignKey: true
              },
              { name: 'schicht', aliases: ['shift'] }
            ]
          },
          {
            key: 'patient',
            kind: 'table',
            name: 'patient',
            attributes: [{ name: 'patientId', isPrimaryKey: true }, { name: 'name' }]
          },
          {
            key: 'behandlung',
            kind: 'table',
            name: 'behandlung',
            aliases: ['treatment'],
            attributes: [
              {
                name: 'personalNr',
                aliases: ['staffId'],
                isPrimaryKey: true,
                isForeignKey: true
              },
              { name: 'patientId', isPrimaryKey: true, isForeignKey: true },
              { name: 'datum', aliases: ['date'] }
            ]
          }
        ],
        edges: [
          {
            kind: 'foreign-key',
            from: 'arzt',
            to: 'personal',
            fromAttribute: 'personalNr',
            toAttribute: 'personalNr'
          },
          {
            kind: 'foreign-key',
            from: 'pflegekraft',
            to: 'personal',
            fromAttribute: 'personalNr',
            toAttribute: 'personalNr'
          },
          {
            kind: 'foreign-key',
            from: 'behandlung',
            to: 'arzt',
            fromAttribute: 'personalNr',
            toAttribute: 'personalNr'
          },
          {
            kind: 'foreign-key',
            from: 'behandlung',
            to: 'patient',
            fromAttribute: 'patientId',
            toAttribute: 'patientId'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'relational-model', 'foreign-key', 'generalization-mapping', 'many-to-many']
};
