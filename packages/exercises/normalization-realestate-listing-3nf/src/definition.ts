import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'normalization-realestate-listing-3nf',
  topic: ['modelling', 'normalization'],
  difficulty: 'Profi',
  title: {
    de: 'Inserate und Besichtigungen in die 3. Normalform bringen',
    en: 'Bring listings and viewings into third normal form'
  },
  prompt: {
    de: [
      'Die Tabelle inserat_roh liegt unnormalisiert vor:',
      '',
      '  inseratNr | maklerNr | maklerName | besichtigungNr | besichtigungsDatum',
      '  ----------+----------+------------+----------------+--------------------',
      '  I1        | M1       | Vogel      | B1             | 2026-03-01',
      '  I1        | M1       | Vogel      | B2             | 2026-03-08',
      '  I2        | M2       | Wolf       | B1             | 2026-03-03',
      '',
      'Schritt 1 — Zeichne die funktionalen Abhängigkeiten direkt in inserat_roh ein.',
      'Trage nur die direkten Abhängigkeiten ein, keine transitiv ableitbaren.',
      '',
      'Schritt 2 — Zerlege die Tabelle in die 3. Normalform.',
      'Verwende die Tabellennamen makler, inserat und besichtigung, verteile die Spalten',
      'passend, markiere Primär- und Fremdschlüssel und verbinde jede Fremdschlüsselspalte',
      'mit der Spalte, auf die sie verweist.',
      '',
      'Eine eigene Tabelle für Objekte ist nicht Teil der Aufgabe.'
    ].join('\n'),
    en: [
      'The table listing_raw is unnormalised:',
      '',
      '  listingNo | agentNo | agentName | viewingNo | viewingDate',
      '  ----------+---------+-----------+-----------+-------------',
      '  I1        | M1      | Fowler    | B1        | 2026-03-01',
      '  I1        | M1      | Fowler    | B2        | 2026-03-08',
      '  I2        | M2      | Wolff     | B1        | 2026-03-03',
      '',
      'Step 1 — Draw the functional dependencies straight into listing_raw.',
      'Only add the direct dependencies, not the ones derivable by transitivity.',
      '',
      'Step 2 — Decompose the table into third normal form.',
      'Use the table names agent, listing and viewing, distribute the columns,',
      'mark primary and foreign keys, and connect every foreign key column to the column',
      'it references.',
      '',
      'A separate table for properties is not part of this exercise.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'maklerName hängt nicht direkt von inseratNr ab, sondern von maklerNr — genau diese transitive Abhängigkeit verletzt die 3. Normalform.',
        en: 'maklerName does not depend on inseratNr directly but on maklerNr — that transitive dependency is what breaks 3NF.'
      }
    },
    {
      text: {
        de: 'Der Schlüssel von besichtigung ist zusammengesetzt: besichtigungsDatum hängt von inseratNr und besichtigungNr gemeinsam ab.',
        en: 'The key of besichtigung is composite: besichtigungsDatum needs both inseratNr and besichtigungNr together.'
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
            name: 'inserat_roh',
            aliases: ['listing_raw'],
            attributes: [
              { name: 'inseratNr', aliases: ['listingNo'] },
              { name: 'maklerNr', aliases: ['agentNo'] },
              { name: 'maklerName', aliases: ['agentName'] },
              { name: 'besichtigungNr', aliases: ['viewingNo'] },
              { name: 'besichtigungsDatum', aliases: ['viewingDate'] }
            ]
          },
          {
            key: 'makler',
            kind: 'table',
            name: 'makler',
            aliases: ['agent'],
            attributes: [
              { name: 'maklerNr', aliases: ['agentNo'], isPrimaryKey: true },
              { name: 'maklerName', aliases: ['agentName'] }
            ]
          },
          {
            key: 'inserat',
            kind: 'table',
            name: 'inserat',
            aliases: ['listing'],
            attributes: [
              { name: 'inseratNr', aliases: ['listingNo'], isPrimaryKey: true },
              { name: 'maklerNr', aliases: ['agentNo'], isForeignKey: true }
            ]
          },
          {
            key: 'besichtigung',
            kind: 'table',
            name: 'besichtigung',
            aliases: ['viewing'],
            attributes: [
              {
                name: 'inseratNr',
                aliases: ['listingNo'],
                isPrimaryKey: true,
                isForeignKey: true
              },
              { name: 'besichtigungNr', aliases: ['viewingNo'], isPrimaryKey: true },
              { name: 'besichtigungsDatum', aliases: ['viewingDate'] }
            ]
          }
        ],
        edges: [
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'inseratNr',
            toAttribute: 'maklerNr'
          },
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'maklerNr',
            toAttribute: 'maklerName'
          },
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'inseratNr',
            additionalDeterminants: ['besichtigungNr'],
            toAttribute: 'besichtigungsDatum'
          },
          {
            kind: 'foreign-key',
            from: 'inserat',
            to: 'makler',
            fromAttribute: 'maklerNr',
            toAttribute: 'maklerNr'
          },
          {
            kind: 'foreign-key',
            from: 'besichtigung',
            to: 'inserat',
            fromAttribute: 'inseratNr',
            toAttribute: 'inseratNr'
          }
        ]
      }
    ]
  },
  tags: ['normalization', 'functional-dependency', '3nf']
};
