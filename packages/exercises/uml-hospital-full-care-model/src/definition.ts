import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-hospital-full-care-model',
  topic: ['modelling', 'uml'],
  difficulty: 'Ultra',
  title: {
    de: 'Ein Krankenhaus als Klassendiagramm',
    en: 'A hospital as a class diagram'
  },
  prompt: {
    de: [
      'Ein Krankenhaus gliedert sich in mehrere Stationen; eine Station existiert nicht ohne ihr',
      'Krankenhaus und gehört immer zu genau einem Krankenhaus. Jede Station besteht aus mehreren',
      'Zimmern, ein Zimmer gehört immer zu genau einer Station und ist ohne sie nicht denkbar.',
      '',
      'Ärzte und Pflegekräfte sind beides Personal des Krankenhauses mit einer Personalnummer und',
      'einem Namen; nur Ärzte haben zusätzlich ein Fachgebiet, nur Pflegekräfte eine',
      'Schichtzugehörigkeit.',
      '',
      'Ein Arzt betreut mehrere Patienten, ein Patient wird von mehreren Ärzten betreut. Für jede',
      'Betreuung eines Patienten durch einen Arzt wird das Datum der letzten Untersuchung festgehalten.',
      '',
      'Klassen und Attribute (Schlüssel als PK markieren):',
      '• Krankenhaus: khId (PK), name',
      '• Station: stationId (PK), name',
      '• Zimmer: zimmerNr (PK)',
      '• Personal: personalNr (PK), name',
      '• Arzt: fachgebiet',
      '• Pflegekraft: schicht',
      '• Patient: patientId (PK), name'
    ].join('\n'),
    en: [
      'A hospital is organised into several wards; a ward does not exist without its hospital and',
      'always belongs to exactly one hospital. Each ward consists of several rooms, and a room always',
      'belongs to exactly one ward and is unthinkable without it.',
      '',
      'Doctors and nurses are both hospital staff with a staff number and a name; only doctors have an',
      'additional specialty, and only nurses have a shift assignment.',
      '',
      'A doctor cares for several patients, and a patient is cared for by several doctors. For every',
      'instance of a doctor caring for a patient, the date of the last examination is recorded.',
      '',
      'Classes and attributes (mark keys as PK):',
      '• Hospital: hospitalId (PK), name',
      '• Ward: wardId (PK), name',
      '• Room: roomNo (PK)',
      '• Staff: staffId (PK), name',
      '• Doctor: specialty',
      '• Nurse: shift',
      '• Patient: patientId (PK), name'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Es stecken drei unabhängige Techniken in diesem Diagramm: zwei Ganzes-Teil-Ketten (Krankenhaus→Station→Zimmer), ein gemeinsamer Oberklassenfall (Arzt/Pflegekraft unter Personal) und eine m:n-Beziehung mit eigenem Attribut (Arzt–Patient). Baue sie nacheinander auf.',
        en: 'There are three independent techniques stacked in this diagram: two whole-part chains (Krankenhaus→Station→Zimmer), one shared-superclass pair (Arzt/Pflegekraft under Personal), and one many-to-many pairing with its own attribute (Arzt–Patient). Build them one relationship at a time.'
      }
    },
    {
      text: {
        de: 'letzteUntersuchung gehört weder allein zu Arzt noch allein zu Patient — es ist spezifisch für die Betreuung eines bestimmten Patienten durch einen bestimmten Arzt und gehört daher an die verbindende Linie, nicht an eine der beiden Klassen.',
        en: 'lastExamination belongs to neither Arzt nor Patient alone — it is specific to one doctor caring for one patient, so it attaches to that connecting line, not to either class.'
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'krankenhaus',
            kind: 'class',
            name: 'Krankenhaus',
            aliases: ['Hospital'],
            attributes: [
              { name: 'khId', aliases: ['hospitalId'], isPrimaryKey: true },
              { name: 'name' }
            ]
          },
          {
            key: 'station',
            kind: 'class',
            name: 'Station',
            aliases: ['Ward'],
            attributes: [
              { name: 'stationId', aliases: ['wardId'], isPrimaryKey: true },
              { name: 'name' }
            ]
          },
          {
            key: 'zimmer',
            kind: 'class',
            name: 'Zimmer',
            aliases: ['Room'],
            attributes: [{ name: 'zimmerNr', aliases: ['roomNo'], isPrimaryKey: true }]
          },
          {
            key: 'personal',
            kind: 'class',
            name: 'Personal',
            aliases: ['Staff'],
            attributes: [
              { name: 'personalNr', aliases: ['staffId'], isPrimaryKey: true },
              { name: 'name' }
            ]
          },
          {
            key: 'arzt',
            kind: 'class',
            name: 'Arzt',
            aliases: ['Doctor'],
            attributes: [{ name: 'fachgebiet', aliases: ['specialty'] }]
          },
          {
            key: 'pflegekraft',
            kind: 'class',
            name: 'Pflegekraft',
            aliases: ['Nurse'],
            attributes: [{ name: 'schicht', aliases: ['shift'] }]
          },
          {
            key: 'patient',
            kind: 'class',
            name: 'Patient',
            attributes: [{ name: 'patientId', isPrimaryKey: true }, { name: 'name' }]
          },
          {
            key: 'betreuung',
            kind: 'association-class',
            name: 'Betreuung',
            aliases: ['Care'],
            attributes: [{ name: 'letzteUntersuchung', aliases: ['lastExamination'] }]
          }
        ],
        edges: [
          {
            kind: 'composition',
            from: 'krankenhaus',
            to: 'station',
            fromMultiplicity: '1',
            toMultiplicity: '0..*'
          },
          {
            kind: 'composition',
            from: 'station',
            to: 'zimmer',
            fromMultiplicity: '1',
            toMultiplicity: '0..*'
          },
          { kind: 'generalization', from: 'arzt', to: 'personal' },
          { kind: 'generalization', from: 'pflegekraft', to: 'personal' },
          {
            kind: 'association',
            from: 'arzt',
            to: 'patient',
            fromMultiplicity: '0..*',
            toMultiplicity: '0..*',
            associationClass: 'betreuung'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'class-diagram', 'composition', 'generalization', 'association-class']
};
