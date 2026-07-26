import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'normalization-consulting-assignment-2nf',
  topic: ['modelling', 'normalization'],
  difficulty: 'Advanced',
  title: {
    de: 'Projekteinsätze in die 2. Normalform bringen',
    en: 'Bring project assignments into second normal form'
  },
  prompt: {
    de: [
      'Die Tabelle einsatz_roh liegt unnormalisiert vor. Jede Zeile beschreibt den Einsatz eines Mitarbeiters in einem Projekt; der Schlüssel ist zusammengesetzt aus projektNr und mitarbeiterNr:',
      '',
      '  projektNr | mitarbeiterNr | mitarbeiterName | stunden',
      '  ----------+---------------+------------------+--------',
      '  P1        | M1            | Bauer            |     40',
      '  P1        | M2            | Vogel            |     25',
      '  P2        | M1            | Bauer            |     15',
      '',
      'Schritt 1 — Zeichne die funktionalen Abhängigkeiten direkt in einsatz_roh ein.',
      'Trage nur die direkten Abhängigkeiten ein, keine transitiv ableitbaren.',
      '',
      'Schritt 2 — Zerlege die Tabelle in die 2. Normalform.',
      'Verwende die Tabellennamen mitarbeiter und einsatz, verteile die Spalten passend,',
      'markiere Primär- und Fremdschlüssel und verbinde jede Fremdschlüsselspalte mit der Spalte,',
      'auf die sie verweist.',
      '',
      'Eine eigene Tabelle für Projekt ist nicht Teil der Aufgabe.'
    ].join('\n'),
    en: [
      "The table assignment_raw is unnormalised. Each row describes one employee's assignment to one project; the key is composed of projectNo and employeeNo:",
      '',
      '  projectNo | employeeNo | employeeName | hours',
      '  ----------+------------+--------------+------',
      '  P1        | E1         | Baker        |   40',
      '  P1        | E2         | Fields       |   25',
      '  P2        | E1         | Baker        |   15',
      '',
      'Step 1 — Draw the functional dependencies straight into assignment_raw.',
      'Only add the direct dependencies, not the ones derivable by transitivity.',
      '',
      'Step 2 — Decompose the table into second normal form.',
      'Use the table names employee and assignment, distribute the columns,',
      'mark primary and foreign keys, and connect every foreign key column to the column',
      'it references.',
      '',
      'A separate table for projects is not part of this exercise.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'mitarbeiterName braucht zur Bestimmung nur mitarbeiterNr — es spielt keine Rolle, um welches Projekt es geht, das ist die partielle Abhängigkeit, die die 2. Normalform verletzt.',
        en: "mitarbeiterName only needs mitarbeiterNr to be determined — it doesn't matter which project is involved, that's the partial dependency breaking 2NF."
      }
    },
    {
      text: {
        de: 'stunden braucht wirklich beide Teile des Schlüssels gemeinsam, deshalb bleibt es in der Tabelle mit dem zusammengesetzten Schlüssel.',
        en: 'stunden genuinely needs both parts of the key together, so it stays in the table with the composite key.'
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
            name: 'einsatz_roh',
            aliases: ['assignment_raw'],
            attributes: [
              { name: 'projektNr', aliases: ['projectNo'] },
              { name: 'mitarbeiterNr', aliases: ['employeeNo'] },
              { name: 'mitarbeiterName', aliases: ['employeeName'] },
              { name: 'stunden', aliases: ['hours'] }
            ]
          },
          {
            key: 'mitarbeiter',
            kind: 'table',
            name: 'mitarbeiter',
            aliases: ['employee'],
            attributes: [
              { name: 'mitarbeiterNr', aliases: ['employeeNo'], isPrimaryKey: true },
              { name: 'mitarbeiterName', aliases: ['employeeName'] }
            ]
          },
          {
            key: 'einsatz',
            kind: 'table',
            name: 'einsatz',
            aliases: ['assignment'],
            attributes: [
              { name: 'projektNr', aliases: ['projectNo'], isPrimaryKey: true },
              {
                name: 'mitarbeiterNr',
                aliases: ['employeeNo'],
                isPrimaryKey: true,
                isForeignKey: true
              },
              { name: 'stunden', aliases: ['hours'] }
            ]
          }
        ],
        edges: [
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'mitarbeiterNr',
            toAttribute: 'mitarbeiterName'
          },
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'projektNr',
            additionalDeterminants: ['mitarbeiterNr'],
            toAttribute: 'stunden'
          },
          {
            kind: 'foreign-key',
            from: 'einsatz',
            to: 'mitarbeiter',
            fromAttribute: 'mitarbeiterNr',
            toAttribute: 'mitarbeiterNr'
          }
        ]
      }
    ]
  },
  tags: ['normalization', 'functional-dependency', '2nf']
};
