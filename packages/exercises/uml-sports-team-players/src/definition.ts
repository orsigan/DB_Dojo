import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-sports-team-players',
  topic: ['modelling', 'uml'],
  difficulty: 'Beginner',
  title: { de: 'Mannschaft und ihre Spieler', en: 'A sports team and its players' },
  prompt: {
    de: [
      'Zeichne die folgende Situation als UML-Klassendiagramm. Verwende exakt die genannten Namen.',
      '',
      'Eine Mannschaft setzt sich aus mehreren Spielern zusammen. Ein Spieler existiert aber auch unabhängig von seiner Mannschaft weiter — etwa als Vereinsmitglied —, falls er die Mannschaft wechselt oder pausiert. Aktuell spielt jeder Spieler in genau einer Mannschaft.',
      '',
      'Klassen und Attribute (Schlüssel als PK markieren):',
      '• Mannschaft: mannschaftId (PK), name',
      '• Spieler: spielerId (PK), name'
    ].join('\n'),
    en: [
      'Draw the following situation as a UML class diagram. Use exactly the names given below.',
      '',
      'A team is made up of several players. A player, however, continues to exist independently of their team — for example as a club member — if they change teams or take a break. Currently, every player plays on exactly one team.',
      '',
      'Classes and attributes (mark keys as PK):',
      '• Team: teamId (PK), name',
      '• Player: playerId (PK), name'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Im Unterschied zu einer Aufgabe wie „Hotel und Zimmer“ überlebt der Teil (Spieler) hier auch ohne das Ganze (Mannschaft) — das schließt eine Komposition aus, die Ganzes-Teil-Idee bleibt aber bestehen: gesucht ist die Beziehung mit der nicht ausgefüllten Raute.',
        en: 'Unlike a "hotel and rooms" style situation, the part (Spieler/Player) here survives without the whole (Mannschaft/Team) — that rules out composition, but the whole/part idea still applies: what you need is the relationship with the hollow diamond.'
      }
    },
    {
      text: {
        de: '„existiert unabhängig weiter“ ist die Formulierung, auf die es ankommt.',
        en: '"continues to exist independently" is the key phrase to watch for.'
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'mannschaft',
            kind: 'class',
            name: 'Mannschaft',
            aliases: ['Team'],
            attributes: [
              { name: 'mannschaftId', aliases: ['teamId'], isPrimaryKey: true },
              { name: 'name' }
            ]
          },
          {
            key: 'spieler',
            kind: 'class',
            name: 'Spieler',
            aliases: ['Player'],
            attributes: [
              { name: 'spielerId', aliases: ['playerId'], isPrimaryKey: true },
              { name: 'name' }
            ]
          }
        ],
        edges: [
          {
            kind: 'aggregation',
            from: 'mannschaft',
            to: 'spieler',
            fromMultiplicity: '1',
            toMultiplicity: '0..*'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'class-diagram', 'aggregation']
};
