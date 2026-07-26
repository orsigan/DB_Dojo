import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-logistics-transport-relational-mapping',
  topic: ['modelling', 'relational'],
  difficulty: 'Ultra',
  title: {
    de: 'Ein Speditionsmodell ins Relationenmodell überführen',
    en: 'Translate a haulage model into the relational model'
  },
  prompt: {
    de: [
      'Gegeben ist dieses Klassendiagramm:',
      '',
      '  Fahrer (fahrerId, name)',
      '  Lkw (lkwId, kennzeichen)',
      '  Fahrt (fahrtId, datum)',
      '  Ladung (ladungId, gewicht)',
      '',
      '  Fahrer 0..1 —— 0..* Fahrer   ("vertritt" / "wird vertreten von")',
      '  Lkw 1 —— 0..* Fahrt',
      '  Fahrer 1 —— 0..* Fahrt',
      '  Fahrt 0..* —— 0..* Ladung   mit Assoziationsklasse Transportauftrag (preis)',
      '',
      'Zeichne das zugehörige Relationenmodell als Tabellen:',
      '• Jede Tabelle bekommt ihre Spalten, Primärschlüssel als PK und Fremdschlüssel als FK markiert.',
      '• Die Vertretungsbeziehung bleibt innerhalb der Tabelle fahrer, als Fremdschlüssel',
      '  vertretungId, der auf fahrerId verweist.',
      '• Die m:n-Beziehung wird zu einer eigenen Tabelle mit dem Namen transportauftrag.',
      '• Verbinde jede Fremdschlüsselspalte mit der Spalte, auf die sie verweist.'
    ].join('\n'),
    en: [
      'You are given this class diagram:',
      '',
      '  Driver (driverId, name)',
      '  Truck (truckId, licensePlate)',
      '  Trip (tripId, date)',
      '  Cargo (cargoId, weight)',
      '',
      '  Driver 0..1 —— 0..* Driver   ("substitutes for" / "is substituted by")',
      '  Truck 1 —— 0..* Trip',
      '  Driver 1 —— 0..* Trip',
      '  Trip 0..* —— 0..* Cargo   with association class ShippingOrder (price)',
      '',
      'Draw the matching relational model as tables:',
      '• Every table gets its columns; mark primary keys as PK and foreign keys as FK.',
      '• The substitution relationship stays within the fahrer table, as a foreign key',
      '  vertretungId referencing fahrerId.',
      '• The m:n relationship becomes a table of its own, named transportauftrag.',
      '• Connect every foreign key column to the column it references.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Die Selbstbeziehung bei Fahrer funktioniert genau wie jeder andere 1:n-Fremdschlüssel — sie zeigt nur auf den Primärschlüssel derselben Tabelle zurück.',
        en: "The self-reference on Fahrer works exactly like any other 1:n foreign key — it just points back into the same table's own primary key."
      }
    },
    {
      text: {
        de: 'fahrt bekommt zwei unabhängige Fremdschlüssel (zu lkw und zu fahrer), noch bevor der m:n-Teil mit ladung dazukommt — bilde jede Beziehung im Diagramm einzeln ab und kombiniere sie danach.',
        en: '`fahrt` ends up with two independent foreign keys (to `lkw` and to `fahrer`) before you even get to the many-to-many part with `ladung` — map each relationship in the diagram separately, then combine.'
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'fahrer',
            kind: 'table',
            name: 'fahrer',
            aliases: ['driver'],
            attributes: [
              { name: 'fahrerId', aliases: ['driverId'], isPrimaryKey: true },
              { name: 'name' },
              { name: 'vertretungId', aliases: ['substituteId'], isForeignKey: true }
            ]
          },
          {
            key: 'lkw',
            kind: 'table',
            name: 'lkw',
            aliases: ['truck'],
            attributes: [
              { name: 'lkwId', aliases: ['truckId'], isPrimaryKey: true },
              { name: 'kennzeichen', aliases: ['licensePlate'] }
            ]
          },
          {
            key: 'fahrt',
            kind: 'table',
            name: 'fahrt',
            aliases: ['trip'],
            attributes: [
              { name: 'fahrtId', aliases: ['tripId'], isPrimaryKey: true },
              { name: 'datum', aliases: ['date'] },
              { name: 'lkwId', aliases: ['truckId'], isForeignKey: true },
              { name: 'fahrerId', aliases: ['driverId'], isForeignKey: true }
            ]
          },
          {
            key: 'ladung',
            kind: 'table',
            name: 'ladung',
            aliases: ['cargo'],
            attributes: [
              { name: 'ladungId', aliases: ['cargoId'], isPrimaryKey: true },
              { name: 'gewicht', aliases: ['weight'] }
            ]
          },
          {
            key: 'transportauftrag',
            kind: 'table',
            name: 'transportauftrag',
            aliases: ['shippingOrder'],
            attributes: [
              { name: 'fahrtId', aliases: ['tripId'], isPrimaryKey: true, isForeignKey: true },
              { name: 'ladungId', aliases: ['cargoId'], isPrimaryKey: true, isForeignKey: true },
              { name: 'preis', aliases: ['price'] }
            ]
          }
        ],
        edges: [
          {
            kind: 'foreign-key',
            from: 'fahrer',
            to: 'fahrer',
            fromAttribute: 'vertretungId',
            toAttribute: 'fahrerId'
          },
          {
            kind: 'foreign-key',
            from: 'fahrt',
            to: 'lkw',
            fromAttribute: 'lkwId',
            toAttribute: 'lkwId'
          },
          {
            kind: 'foreign-key',
            from: 'fahrt',
            to: 'fahrer',
            fromAttribute: 'fahrerId',
            toAttribute: 'fahrerId'
          },
          {
            kind: 'foreign-key',
            from: 'transportauftrag',
            to: 'fahrt',
            fromAttribute: 'fahrtId',
            toAttribute: 'fahrtId'
          },
          {
            kind: 'foreign-key',
            from: 'transportauftrag',
            to: 'ladung',
            fromAttribute: 'ladungId',
            toAttribute: 'ladungId'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'relational-model', 'foreign-key', 'self-reference', 'many-to-many']
};
