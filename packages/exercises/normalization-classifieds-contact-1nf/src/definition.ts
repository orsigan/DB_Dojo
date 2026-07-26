import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'normalization-classifieds-contact-1nf',
  topic: ['modelling', 'normalization'],
  difficulty: 'Beginner',
  title: {
    de: 'Kleinanzeigen in die 1. Normalform bringen',
    en: 'Bring classifieds listings into first normal form'
  },
  prompt: {
    de: [
      'Die Tabelle anzeige_roh liegt unnormalisiert vor:',
      '',
      '  anzeigeNr | titel        | telefon1     | telefon2',
      '  ----------+--------------+--------------+-------------',
      '  501       | Fahrrad      | 0170-1111111 | 0170-2222222',
      '  502       | Sofa         | 0170-3333333 |',
      '  503       | Bücherregal  | 0170-4444444 | 0170-5555555',
      '',
      'Ein Verkäufer kann eine oder zwei Telefonnummern angeben — die Tabelle sieht dafür zwei feste',
      'Spalten vor, von denen eine oft leer bleibt.',
      '',
      'Zerlege die Tabelle in zwei Tabellen: anzeige und kontakt.',
      'Verteile die Spalten passend, markiere Primär- und Fremdschlüssel und verbinde jede',
      'Fremdschlüsselspalte mit der Spalte, auf die sie verweist.'
    ].join('\n'),
    en: [
      'The table listing_raw is unnormalised:',
      '',
      '  listingNo | title      | phone1       | phone2',
      '  ----------+------------+--------------+-------------',
      '  501       | Bicycle    | 0170-1111111 | 0170-2222222',
      '  502       | Sofa       | 0170-3333333 |',
      '  503       | Bookshelf  | 0170-4444444 | 0170-5555555',
      '',
      'A seller can list one or two phone numbers — the table provides two fixed columns for that,',
      'one of which is often left empty.',
      '',
      'Decompose the table into two tables: listing and contact.',
      'Distribute the columns accordingly, mark primary and foreign keys, and connect every',
      'foreign key column to the column it references.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Ein Verkäufer kann null, eine oder zwei Telefonnummern hinterlegen — eine feste Spaltenzahl kann eine variable Anzahl von Werten nicht sauber abbilden.',
        en: 'A seller can have zero, one, or two phone numbers on file — a fixed number of columns cannot cleanly represent a variable number of values.'
      }
    },
    {
      text: {
        de: 'Der Schlüssel von kontakt ist zusammengesetzt: pro Anzeige-Telefonnummer-Kombination gibt es eine Zeile.',
        en: 'The key of kontakt is composite: there is one row per listing-phone-number combination.'
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
            name: 'anzeige_roh',
            aliases: ['listing_raw'],
            attributes: [
              { name: 'anzeigeNr', aliases: ['listingNo'] },
              { name: 'titel', aliases: ['title'] },
              { name: 'telefon1', aliases: ['phone1'] },
              { name: 'telefon2', aliases: ['phone2'] }
            ]
          },
          {
            key: 'anzeige',
            kind: 'table',
            name: 'anzeige',
            aliases: ['listing'],
            attributes: [
              { name: 'anzeigeNr', aliases: ['listingNo'], isPrimaryKey: true },
              { name: 'titel', aliases: ['title'] }
            ]
          },
          {
            key: 'kontakt',
            kind: 'table',
            name: 'kontakt',
            aliases: ['contact'],
            attributes: [
              {
                name: 'anzeigeNr',
                aliases: ['listingNo'],
                isPrimaryKey: true,
                isForeignKey: true
              },
              { name: 'telefonnummer', aliases: ['phoneNumber'], isPrimaryKey: true }
            ]
          }
        ],
        edges: [
          {
            kind: 'foreign-key',
            from: 'kontakt',
            to: 'anzeige',
            fromAttribute: 'anzeigeNr',
            toAttribute: 'anzeigeNr'
          }
        ]
      }
    ]
  },
  tags: ['normalization', '1nf']
};
