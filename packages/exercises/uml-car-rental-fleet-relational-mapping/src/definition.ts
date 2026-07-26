import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-car-rental-fleet-relational-mapping',
  topic: ['modelling', 'relational'],
  difficulty: 'Profi',
  title: {
    de: 'Fuhrpark und Vermietungen ins Relationenmodell überführen',
    en: 'Translate a rental fleet into the relational model'
  },
  prompt: {
    de: [
      'Gegeben ist dieses Klassendiagramm:',
      '',
      '  Fahrzeug (fahrzeugId, kennzeichen)',
      '  Kunde (kundeId, name)',
      '  Vermietung (vermietungId, von, bis)',
      '',
      '  Fahrzeug generalisiert zu: PKW (sitzplaetze), Transporter (nutzlast)',
      '  Vermietung 0..* —— 1 Fahrzeug',
      '  Vermietung 0..* —— 1 Kunde',
      '',
      'Zeichne das zugehörige Relationenmodell als Tabellen:',
      '• Jede Tabelle bekommt ihre Spalten, Primärschlüssel als PK und Fremdschlüssel als FK markiert.',
      '• PKW und Transporter werden zu eigenen Tabellen, die ihren Primärschlüssel von Fahrzeug übernehmen.',
      '• Verbinde jede Fremdschlüsselspalte mit der Spalte, auf die sie verweist.'
    ].join('\n'),
    en: [
      'You are given this class diagram:',
      '',
      '  Vehicle (vehicleId, licensePlate)',
      '  Customer (customerId, name)',
      '  Rental (rentalId, from, to)',
      '',
      '  Vehicle generalizes to: Car (seats), Van (payload)',
      '  Rental 0..* —— 1 Vehicle',
      '  Rental 0..* —— 1 Customer',
      '',
      'Draw the matching relational model as tables:',
      '• Every table gets its columns; mark primary keys as PK and foreign keys as FK.',
      '• Car and Van each become their own table, sharing their primary key with Vehicle.',
      '• Connect every foreign key column to the column it references.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Jede Unterklasse bekommt eine eigene Tabelle mit demselben Primärschlüssel wie Fahrzeug — diese gemeinsame Id-Spalte ist in pkw/transporter zugleich PK und FK.',
        en: 'Each subclass gets its own table sharing the same primary key as Fahrzeug — that shared id column is both PK and FK in pkw/transporter.'
      }
    },
    {
      text: {
        de: 'Vermietung ist eine ganz normale Entität mit zwei gewöhnlichen Fremdschlüsseln — sie ist keine m:n-Verbindungstabelle (die Beziehung ist zweimal 1:n, nicht m:n).',
        en: "Vermietung is a normal entity with two ordinary foreign keys — it isn't a many-to-many junction table (this relationship is 1:n twice over, not m:n)."
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'fahrzeug',
            kind: 'table',
            name: 'fahrzeug',
            aliases: ['vehicle'],
            attributes: [
              { name: 'fahrzeugId', aliases: ['vehicleId'], isPrimaryKey: true },
              { name: 'kennzeichen', aliases: ['licensePlate'] }
            ]
          },
          {
            key: 'pkw',
            kind: 'table',
            name: 'pkw',
            aliases: ['car'],
            attributes: [
              {
                name: 'fahrzeugId',
                aliases: ['vehicleId'],
                isPrimaryKey: true,
                isForeignKey: true
              },
              { name: 'sitzplaetze', aliases: ['seats'] }
            ]
          },
          {
            key: 'transporter',
            kind: 'table',
            name: 'transporter',
            aliases: ['van'],
            attributes: [
              {
                name: 'fahrzeugId',
                aliases: ['vehicleId'],
                isPrimaryKey: true,
                isForeignKey: true
              },
              { name: 'nutzlast', aliases: ['payload'] }
            ]
          },
          {
            key: 'kunde',
            kind: 'table',
            name: 'kunde',
            aliases: ['customer'],
            attributes: [
              { name: 'kundeId', aliases: ['customerId'], isPrimaryKey: true },
              { name: 'name' }
            ]
          },
          {
            key: 'vermietung',
            kind: 'table',
            name: 'vermietung',
            aliases: ['rental'],
            attributes: [
              { name: 'vermietungId', aliases: ['rentalId'], isPrimaryKey: true },
              { name: 'von', aliases: ['from'] },
              { name: 'bis', aliases: ['to'] },
              { name: 'fahrzeugId', aliases: ['vehicleId'], isForeignKey: true },
              { name: 'kundeId', aliases: ['customerId'], isForeignKey: true }
            ]
          }
        ],
        edges: [
          {
            kind: 'foreign-key',
            from: 'pkw',
            to: 'fahrzeug',
            fromAttribute: 'fahrzeugId',
            toAttribute: 'fahrzeugId'
          },
          {
            kind: 'foreign-key',
            from: 'transporter',
            to: 'fahrzeug',
            fromAttribute: 'fahrzeugId',
            toAttribute: 'fahrzeugId'
          },
          {
            kind: 'foreign-key',
            from: 'vermietung',
            to: 'fahrzeug',
            fromAttribute: 'fahrzeugId',
            toAttribute: 'fahrzeugId'
          },
          {
            kind: 'foreign-key',
            from: 'vermietung',
            to: 'kunde',
            fromAttribute: 'kundeId',
            toAttribute: 'kundeId'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'relational-model', 'foreign-key', 'generalization-mapping']
};
