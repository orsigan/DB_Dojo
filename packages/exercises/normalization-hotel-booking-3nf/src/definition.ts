import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'normalization-hotel-booking-3nf',
  topic: ['modelling', 'normalization'],
  difficulty: 'Ultra',
  title: {
    de: 'Hotelbuchungen in die 3. Normalform bringen',
    en: 'Bring hotel bookings into third normal form'
  },
  prompt: {
    de: [
      'Die Tabelle buchung_roh liegt unnormalisiert vor. Eine Buchung kann mehrere Zimmer',
      'umfassen, daher besteht der Schlüssel aus buchungNr und zimmerNr zusammen:',
      '',
      '  buchungNr | gastNr | gastName | zimmerNr | zimmerKategorie | uebernachtungen',
      '  ----------+--------+----------+----------+-----------------+----------------',
      '  5001      | G1     | Berger   | 101      | Standard        |               3',
      '  5001      | G1     | Berger   | 102      | Suite           |               3',
      '  5002      | G2     | Roth     | 101      | Standard        |               2',
      '',
      'Schritt 1 — Zeichne die funktionalen Abhängigkeiten direkt in buchung_roh ein.',
      'Trage nur die direkten Abhängigkeiten ein, keine transitiv ableitbaren.',
      '',
      'Schritt 2 — Zerlege die Tabelle in die 3. Normalform.',
      'Verwende die Tabellennamen gast, buchung, zimmer und buchungszimmer, verteile die Spalten',
      'passend, markiere Primär- und Fremdschlüssel und verbinde jede Fremdschlüsselspalte',
      'mit der Spalte, auf die sie verweist.'
    ].join('\n'),
    en: [
      'The table booking_raw is unnormalised. A booking can cover several rooms, so its key is the',
      'combination of bookingNo and roomNo:',
      '',
      '  bookingNo | guestNo | guestName | roomNo | roomCategory | nights',
      '  ----------+---------+-----------+--------+--------------+-------',
      '  5001      | G1      | Berger    | 101    | Standard     |      3',
      '  5001      | G1      | Berger    | 102    | Suite        |      3',
      '  5002      | G2      | Roth      | 101    | Standard     |      2',
      '',
      'Step 1 — Draw the functional dependencies straight into booking_raw.',
      'Only add the direct dependencies, not the ones derivable by transitivity.',
      '',
      'Step 2 — Decompose the table into third normal form.',
      'Use the table names gast, buchung, zimmer and buchungszimmer, distribute the columns,',
      'mark primary and foreign keys, and connect every foreign key column to the column',
      'it references.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Es gibt zwei unabhängige transitive Ketten hier, eine über gastNr und eine über zimmerNr — finde und zeichne beide, bevor du dich für die Tabellen entscheidest.',
        en: 'There are two separate transitive chains here, one running through gastNr and one through zimmerNr — find and draw both before deciding on tables.'
      }
    },
    {
      text: {
        de: 'Nur uebernachtungen braucht wirklich beide Hälften des Schlüssels; alles andere ist schon zu gast oder zimmer gewandert, bevor du die Verbindungstabelle aufbaust.',
        en: 'Only uebernachtungen truly needs both halves of the key; everything else has already migrated to gast or zimmer by the time you build the junction table.'
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
            name: 'buchung_roh',
            aliases: ['booking_raw'],
            attributes: [
              { name: 'buchungNr', aliases: ['bookingNo'] },
              { name: 'gastNr', aliases: ['guestNo'] },
              { name: 'gastName', aliases: ['guestName'] },
              { name: 'zimmerNr', aliases: ['roomNo'] },
              { name: 'zimmerKategorie', aliases: ['roomCategory'] },
              { name: 'uebernachtungen', aliases: ['nights'] }
            ]
          },
          {
            key: 'gast',
            kind: 'table',
            name: 'gast',
            aliases: ['guest'],
            attributes: [
              { name: 'gastNr', aliases: ['guestNo'], isPrimaryKey: true },
              { name: 'gastName', aliases: ['guestName'] }
            ]
          },
          {
            key: 'buchung',
            kind: 'table',
            name: 'buchung',
            aliases: ['booking'],
            attributes: [
              { name: 'buchungNr', aliases: ['bookingNo'], isPrimaryKey: true },
              { name: 'gastNr', aliases: ['guestNo'], isForeignKey: true }
            ]
          },
          {
            key: 'zimmer',
            kind: 'table',
            name: 'zimmer',
            aliases: ['room'],
            attributes: [
              { name: 'zimmerNr', aliases: ['roomNo'], isPrimaryKey: true },
              { name: 'zimmerKategorie', aliases: ['roomCategory'] }
            ]
          },
          {
            key: 'buchungszimmer',
            kind: 'table',
            name: 'buchungszimmer',
            aliases: ['bookingRoom'],
            attributes: [
              {
                name: 'buchungNr',
                aliases: ['bookingNo'],
                isPrimaryKey: true,
                isForeignKey: true
              },
              { name: 'zimmerNr', aliases: ['roomNo'], isPrimaryKey: true, isForeignKey: true },
              { name: 'uebernachtungen', aliases: ['nights'] }
            ]
          }
        ],
        edges: [
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'buchungNr',
            toAttribute: 'gastNr'
          },
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'gastNr',
            toAttribute: 'gastName'
          },
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'zimmerNr',
            toAttribute: 'zimmerKategorie'
          },
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'buchungNr',
            additionalDeterminants: ['zimmerNr'],
            toAttribute: 'uebernachtungen'
          },
          {
            kind: 'foreign-key',
            from: 'buchung',
            to: 'gast',
            fromAttribute: 'gastNr',
            toAttribute: 'gastNr'
          },
          {
            kind: 'foreign-key',
            from: 'buchungszimmer',
            to: 'buchung',
            fromAttribute: 'buchungNr',
            toAttribute: 'buchungNr'
          },
          {
            kind: 'foreign-key',
            from: 'buchungszimmer',
            to: 'zimmer',
            fromAttribute: 'zimmerNr',
            toAttribute: 'zimmerNr'
          }
        ]
      }
    ]
  },
  tags: ['normalization', 'functional-dependency', '3nf']
};
