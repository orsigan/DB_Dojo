import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-airline-booking-association-class',
  topic: ['modelling', 'uml'],
  difficulty: 'Profi',
  title: {
    de: 'Flüge und Buchungen als Klassendiagramm',
    en: 'Flights and bookings as a class diagram'
  },
  prompt: {
    de: [
      'Modelliere das folgende Szenario als UML-Klassendiagramm.',
      '',
      'Ein Flug wird von mehreren Passagieren gebucht, und ein Passagier bucht im Laufe der Zeit',
      'mehrere Flüge. Zu jeder Buchung werden außerdem eine Sitzplatznummer und der Buchungsstatus',
      'festgehalten.',
      '',
      'Klassen und Attribute (Schlüssel als PK markieren):',
      '• Flug: flugNr (PK), datum',
      '• Passagier: passagierId (PK), name'
    ].join('\n'),
    en: [
      'Model the following scenario as a UML class diagram.',
      '',
      'A flight is booked by several passengers, and over time a passenger books several flights.',
      'For each booking, a seat number and the booking status are recorded as well.',
      '',
      'Classes and attributes (mark keys as PK):',
      '• Flight: flightNo (PK), date',
      '• Passenger: passengerId (PK), name'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Sitzplatz und Status beschreiben weder den Flug (viele Passagiere, viele Sitzplätze) noch den Passagier (viele Flüge, viele Sitzplätze) für sich allein — sie ergeben nur pro Flug-Passagier-Paar Sinn.',
        en: "Seat number and status don't describe the flight (many passengers, many seats) or the passenger (many flights, many seats) on their own — they only make sense per flight-passenger pair."
      }
    },
    {
      text: {
        de: 'Hänge die zusätzliche Klasse direkt an die m:n-Verbindungslinie an.',
        en: 'Attach the extra class directly to the many-to-many connecting line.'
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'flug',
            kind: 'class',
            name: 'Flug',
            aliases: ['Flight'],
            attributes: [
              { name: 'flugNr', aliases: ['flightNo'], isPrimaryKey: true },
              { name: 'datum', aliases: ['date'] }
            ]
          },
          {
            key: 'passagier',
            kind: 'class',
            name: 'Passagier',
            aliases: ['Passenger'],
            attributes: [
              { name: 'passagierId', aliases: ['passengerId'], isPrimaryKey: true },
              { name: 'name' }
            ]
          },
          {
            key: 'buchung',
            kind: 'association-class',
            name: 'Buchung',
            aliases: ['Booking'],
            attributes: [{ name: 'sitzplatz', aliases: ['seat'] }, { name: 'status' }]
          }
        ],
        edges: [
          {
            kind: 'association',
            from: 'flug',
            to: 'passagier',
            fromMultiplicity: '0..*',
            toMultiplicity: '0..*',
            associationClass: 'buchung'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'class-diagram', 'association-class', 'many-to-many']
};
