import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-cinema-screening-relational-mapping',
  topic: ['modelling', 'relational'],
  difficulty: 'Profi',
  title: {
    de: 'Kinovorstellungen ins Relationenmodell überführen',
    en: 'Translate cinema screenings into the relational model'
  },
  prompt: {
    de: [
      'Gegeben ist dieses Klassendiagramm:',
      '',
      '  Kino (kinoId, name)',
      '  Vorstellung (vorstellungId, uhrzeit)',
      '  Kunde (kundeId, name)',
      '',
      '  Kino 1 —— 0..* Vorstellung',
      '  Vorstellung 0..* —— 0..* Kunde   mit Assoziationsklasse Buchung (sitzplatz)',
      '',
      'Zeichne das zugehörige Relationenmodell als Tabellen:',
      '• Jede Tabelle bekommt ihre Spalten, Primärschlüssel als PK und Fremdschlüssel als FK markiert.',
      '• Die m:n-Beziehung wird zu einer eigenen Tabelle mit dem Namen buchung.',
      '• Verbinde jede Fremdschlüsselspalte mit der Spalte, auf die sie verweist.'
    ].join('\n'),
    en: [
      'You are given this class diagram:',
      '',
      '  Cinema (cinemaId, name)',
      '  Screening (screeningId, time)',
      '  Customer (customerId, name)',
      '',
      '  Cinema 1 —— 0..* Screening',
      '  Screening 0..* —— 0..* Customer   with association class Booking (seat)',
      '',
      'Draw the matching relational model as tables:',
      '• Every table gets its columns; mark primary keys as PK and foreign keys as FK.',
      '• The m:n relationship becomes a table of its own, named buchung.',
      '• Connect every foreign key column to the column it references.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Bilde die beiden Beziehungen unabhängig voneinander ab: Kino/Vorstellung ist zuerst ein ganz gewöhnliches 1:n.',
        en: 'Map the two relationships independently: Kino/Vorstellung is a plain 1:n first.'
      }
    },
    {
      text: {
        de: 'Die Assoziationsklasse Buchung wird zu einer Tabelle wie jede andere m:n-Verbindungstabelle auch — ihr eigenes Attribut (sitzplatz) reist einfach in derselben Zeile mit zusammengesetztem Schlüssel mit.',
        en: 'The association class Buchung becomes a table exactly like any m:n junction table — its own attribute (sitzplatz) just rides along on the same composite-key row.'
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'kino',
            kind: 'table',
            name: 'kino',
            aliases: ['cinema'],
            attributes: [
              { name: 'kinoId', aliases: ['cinemaId'], isPrimaryKey: true },
              { name: 'name' }
            ]
          },
          {
            key: 'vorstellung',
            kind: 'table',
            name: 'vorstellung',
            aliases: ['screening'],
            attributes: [
              { name: 'vorstellungId', aliases: ['screeningId'], isPrimaryKey: true },
              { name: 'uhrzeit', aliases: ['time'] },
              { name: 'kinoId', aliases: ['cinemaId'], isForeignKey: true }
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
            key: 'buchung',
            kind: 'table',
            name: 'buchung',
            aliases: ['booking'],
            attributes: [
              {
                name: 'vorstellungId',
                aliases: ['screeningId'],
                isPrimaryKey: true,
                isForeignKey: true
              },
              {
                name: 'kundeId',
                aliases: ['customerId'],
                isPrimaryKey: true,
                isForeignKey: true
              },
              { name: 'sitzplatz', aliases: ['seat'] }
            ]
          }
        ],
        edges: [
          {
            kind: 'foreign-key',
            from: 'vorstellung',
            to: 'kino',
            fromAttribute: 'kinoId',
            toAttribute: 'kinoId'
          },
          {
            kind: 'foreign-key',
            from: 'buchung',
            to: 'vorstellung',
            fromAttribute: 'vorstellungId',
            toAttribute: 'vorstellungId'
          },
          {
            kind: 'foreign-key',
            from: 'buchung',
            to: 'kunde',
            fromAttribute: 'kundeId',
            toAttribute: 'kundeId'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'relational-model', 'foreign-key', 'many-to-many']
};
