import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-fleet-vehicle-generalization',
  topic: ['modelling', 'uml'],
  difficulty: 'Advanced',
  title: { de: 'Fuhrpark als Klassendiagramm', en: 'A vehicle fleet as a class diagram' },
  prompt: {
    de: [
      'Ein Fuhrparkbetreiber verwaltet seine Fahrzeuge in einem gemeinsamen Modell. Jedes Fahrzeug hat ein Kennzeichen und eine Marke.',
      'Personenwagen sind Fahrzeuge, für die zusätzlich die Sitzplatzzahl gespeichert wird. Lastwagen sind Fahrzeuge, für die stattdessen die Ladekapazität in Tonnen gespeichert wird.',
      'Jedes Fahrzeug im Bestand ist entweder ein Personenwagen oder ein Lastwagen.',
      '',
      'Klassen und Attribute (Schlüssel als PK markieren):',
      '• Fahrzeug: kennzeichen (PK), marke',
      '• Personenwagen: sitzplaetze',
      '• Lastwagen: ladekapazitaet',
      '',
      'Zeichne das passende Klassendiagramm mit exakt diesen Namen.'
    ].join('\n'),
    en: [
      'A fleet operator manages its vehicles in a shared model. Every vehicle has a license plate and a brand.',
      'Cars are vehicles for which the number of seats is also stored. Trucks are vehicles for which the load capacity in tons is stored instead.',
      'Every vehicle in the fleet is either a car or a truck.',
      '',
      'Classes and attributes (mark keys as PK):',
      '• Vehicle: licensePlate (PK), brand',
      '• Car: seats',
      '• Truck: loadCapacity',
      '',
      'Draw the matching class diagram using exactly these names.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Personenwagen und Lastwagen sind beides Spezialfälle von Fahrzeug, die dessen Attribute erben — das ist eine Generalisierungs-/Vererbungsbeziehung, keine Assoziation.',
        en: 'Car and Truck are both special cases of Vehicle that inherit its attributes — that is a generalization/inheritance relationship, not an association.'
      }
    },
    {
      text: {
        de: 'Der Pfeil mit dem leeren Dreieck zeigt nach oben zur gemeinsamen Oberklasse Fahrzeug.',
        en: 'The hollow triangle arrow points up to the shared superclass Vehicle.'
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
            kind: 'class',
            name: 'Fahrzeug',
            aliases: ['Vehicle'],
            attributes: [
              { name: 'kennzeichen', aliases: ['licensePlate'], isPrimaryKey: true },
              { name: 'marke', aliases: ['brand'] }
            ]
          },
          {
            key: 'personenwagen',
            kind: 'class',
            name: 'Personenwagen',
            aliases: ['Car'],
            attributes: [{ name: 'sitzplaetze', aliases: ['seats'] }]
          },
          {
            key: 'lastwagen',
            kind: 'class',
            name: 'Lastwagen',
            aliases: ['Truck'],
            attributes: [{ name: 'ladekapazitaet', aliases: ['loadCapacity'] }]
          }
        ],
        edges: [
          { kind: 'generalization', from: 'personenwagen', to: 'fahrzeug' },
          { kind: 'generalization', from: 'lastwagen', to: 'fahrzeug' }
        ]
      }
    ]
  },
  tags: ['uml', 'class-diagram', 'generalization']
};
