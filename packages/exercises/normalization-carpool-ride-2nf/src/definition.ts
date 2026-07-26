import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'normalization-carpool-ride-2nf',
  topic: ['modelling', 'normalization'],
  difficulty: 'Advanced',
  title: {
    de: 'Mitfahrgelegenheit in die 2. Normalform bringen',
    en: 'Bring carpool rides into second normal form'
  },
  prompt: {
    de: [
      'Die Tabelle mitfahrt_roh liegt unnormalisiert vor. Jede Zeile beschreibt die Teilnahme eines Mitfahrers an einer Fahrt; der Schlüssel ist zusammengesetzt aus fahrtNr und mitfahrerId:',
      '',
      '  fahrtNr | ziel     | mitfahrerId | mitfahrerName',
      '  --------+----------+-------------+---------------',
      '  F1      | Hamburg  | P1          | Klein',
      '  F1      | Hamburg  | P2          | Roth',
      '  F2      | München  | P1          | Klein',
      '',
      'Schritt 1 — Zeichne die funktionalen Abhängigkeiten direkt in mitfahrt_roh ein.',
      'Trage nur die direkten Abhängigkeiten ein, keine transitiv ableitbaren.',
      '',
      'Schritt 2 — Zerlege die Tabelle in die 2. Normalform.',
      'Verwende die Tabellennamen fahrt, mitfahrer und mitfahrt, verteile die Spalten passend,',
      'markiere Primär- und Fremdschlüssel und verbinde jede Fremdschlüsselspalte mit der Spalte,',
      'auf die sie verweist.'
    ].join('\n'),
    en: [
      'The table ride_raw is unnormalised. Each row describes the participation of one passenger in a ride; the key is composed of rideNo and passengerId:',
      '',
      '  rideNo | destination | passengerId | passengerName',
      '  -------+-------------+-------------+---------------',
      '  R1     | Hamburg     | P1          | Owens',
      '  R1     | Hamburg     | P2          | Reed',
      '  R2     | Munich      | P1          | Owens',
      '',
      'Step 1 — Draw the functional dependencies straight into ride_raw.',
      'Only add the direct dependencies, not the ones derivable by transitivity.',
      '',
      'Step 2 — Decompose the table into second normal form.',
      'Use the table names ride, passenger and rideParticipation, distribute the columns,',
      'mark primary and foreign keys, and connect every foreign key column to the column',
      'it references.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Weder ziel noch mitfahrerName benötigen beide Schlüsselteile — beide sind partielle Abhängigkeiten von je einer Hälfte des Schlüssels, deshalb wandern beide hinaus.',
        en: 'Neither destination nor passengerName need both key parts — each is a partial dependency on a different half of the key, so both move out.'
      }
    },
    {
      text: {
        de: 'Was bleibt in der mittleren Tabelle übrig, wenn beide Spalten ausgelagert wurden? Nur die beiden Schlüsselspalten — die Verbindungstabelle kann eine reine Verknüpfungstabelle ohne eigene Attribute sein.',
        en: "What's left in the middle table once both columns have moved out? Just the two key columns — the junction table can be a pure linking table with no attributes of its own."
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
            name: 'mitfahrt_roh',
            aliases: ['ride_raw'],
            attributes: [
              { name: 'fahrtNr', aliases: ['rideNo'] },
              { name: 'ziel', aliases: ['destination'] },
              { name: 'mitfahrerId', aliases: ['passengerId'] },
              { name: 'mitfahrerName', aliases: ['passengerName'] }
            ]
          },
          {
            key: 'fahrt',
            kind: 'table',
            name: 'fahrt',
            aliases: ['ride'],
            attributes: [
              { name: 'fahrtNr', aliases: ['rideNo'], isPrimaryKey: true },
              { name: 'ziel', aliases: ['destination'] }
            ]
          },
          {
            key: 'mitfahrer',
            kind: 'table',
            name: 'mitfahrer',
            aliases: ['passenger'],
            attributes: [
              { name: 'mitfahrerId', aliases: ['passengerId'], isPrimaryKey: true },
              { name: 'mitfahrerName', aliases: ['passengerName'] }
            ]
          },
          {
            key: 'mitfahrt',
            kind: 'table',
            name: 'mitfahrt',
            aliases: ['rideParticipation'],
            attributes: [
              {
                name: 'fahrtNr',
                aliases: ['rideNo'],
                isPrimaryKey: true,
                isForeignKey: true
              },
              {
                name: 'mitfahrerId',
                aliases: ['passengerId'],
                isPrimaryKey: true,
                isForeignKey: true
              }
            ]
          }
        ],
        edges: [
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'fahrtNr',
            toAttribute: 'ziel'
          },
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'mitfahrerId',
            toAttribute: 'mitfahrerName'
          },
          {
            kind: 'foreign-key',
            from: 'mitfahrt',
            to: 'fahrt',
            fromAttribute: 'fahrtNr',
            toAttribute: 'fahrtNr'
          },
          {
            kind: 'foreign-key',
            from: 'mitfahrt',
            to: 'mitfahrer',
            fromAttribute: 'mitfahrerId',
            toAttribute: 'mitfahrerId'
          }
        ]
      }
    ]
  },
  tags: ['normalization', 'functional-dependency', '2nf']
};
