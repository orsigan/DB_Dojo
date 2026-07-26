import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-hospital-staff-model',
  topic: ['modelling', 'uml'],
  difficulty: 'Profi',
  title: {
    de: 'Krankenhaus, Stationen und Personal als Klassendiagramm',
    en: 'A hospital, its wards and staff as a class diagram'
  },
  prompt: {
    de: [
      'Modelliere das folgende Szenario als UML-Klassendiagramm.',
      '',
      'Ein Krankenhaus gliedert sich in mehrere Stationen, die ohne ihr Krankenhaus nicht existieren.',
      'Ärzte und Pflegekräfte sind beides Personal des Krankenhauses und teilen sich eine',
      'Personalnummer sowie einen Namen; nur Ärzte besitzen zusätzlich ein Fachgebiet, nur',
      'Pflegekräfte eine Schichtzugehörigkeit. Jeder Arzt ist genau einer Station fest zugeordnet,',
      'eine Station beschäftigt mehrere Ärzte.',
      '',
      'Klassen und Attribute (Schlüssel als PK markieren):',
      '• Krankenhaus: khId (PK), name',
      '• Station: stationId (PK), name',
      '• Personal: personalNr (PK), name',
      '• Arzt: fachgebiet',
      '• Pflegekraft: schicht'
    ].join('\n'),
    en: [
      'Model the following scenario as a UML class diagram.',
      '',
      'A hospital is organized into several wards, which cannot exist without their hospital.',
      'Doctors and nurses are both hospital staff and share a staff number and a name; only doctors',
      'additionally have a specialty, and only nurses have a shift assignment. Every doctor is',
      'permanently assigned to exactly one ward, and a ward employs several doctors.',
      '',
      'Classes and attributes (mark keys as PK):',
      '• Hospital: hospitalId (PK), name',
      '• Ward: wardId (PK), name',
      '• Staff: staffId (PK), name',
      '• Doctor: specialty',
      '• Nurse: shift'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Zwei getrennte Ideen stecken in diesem Diagramm: Krankenhaus/Station ist eine Ganzes-Teil-Beziehung (eine Station kann nicht für sich allein existieren), während Arzt/Pflegekraft beide Spezialfälle einer gemeinsamen Personal-Klasse sind. Verwechsle die beiden Techniken nicht.',
        en: "Two separate ideas live in this diagram: Krankenhaus/Station is whole-part (and a Station can't exist on its own), while Arzt/Pflegekraft are both special cases of one shared Personal class. Don't mix the two techniques up."
      }
    },
    {
      text: {
        de: 'Die Verbindung von Arzt zu Station ist eine ganz gewöhnliche Assoziation — widerstehe dem Drang, auch dort eine Raute oder ein Dreieck anzubringen.',
        en: "Arzt's link to Station is a completely ordinary association — resist the urge to force a diamond or triangle onto it too."
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
          { kind: 'generalization', from: 'arzt', to: 'personal' },
          { kind: 'generalization', from: 'pflegekraft', to: 'personal' },
          {
            kind: 'association',
            from: 'station',
            to: 'arzt',
            fromMultiplicity: '1',
            toMultiplicity: '0..*'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'class-diagram', 'composition', 'generalization']
};
