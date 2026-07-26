import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-esports-tournament-model',
  topic: ['modelling', 'uml'],
  difficulty: 'Ultra',
  title: {
    de: 'Ein E-Sport-Turnier als Klassendiagramm',
    en: 'An esports tournament as a class diagram'
  },
  prompt: {
    de: [
      'Ein Turnier besteht aus mehreren Matches; ein Match existiert nicht unabhängig von seinem',
      'Turnier und gehört immer zu genau einem Turnier.',
      '',
      'An einem Match nehmen mehrere Teams teil, und ein Team tritt im Laufe eines Turniers in',
      'mehreren Matches an. Für jeden Auftritt eines Teams in einem Match wird die erzielte',
      'Platzierung festgehalten.',
      '',
      'Teams bestehen aus mehreren Spielern; ein Spieler gehört fest zu genau einem Team.',
      '',
      'Klassen und Attribute (Schlüssel als PK markieren):',
      '• Turnier: turnierId (PK), name',
      '• Match: matchId (PK), runde',
      '• Team: teamId (PK), name',
      '• Spieler: spielerId (PK), name'
    ].join('\n'),
    en: [
      'A tournament consists of several matches; a match does not exist independently of its',
      'tournament and always belongs to exactly one tournament.',
      '',
      'Several teams take part in a match, and over the course of a tournament a team competes in',
      'several matches. For every appearance of a team in a match, the ranking achieved is recorded.',
      '',
      'Teams consist of several players; a player belongs firmly to exactly one team.',
      '',
      'Classes and attributes (mark keys as PK):',
      '• Tournament: tournamentId (PK), name',
      '• Match: matchId (PK), round',
      '• Team: teamId (PK), name',
      '• Player: playerId (PK), name'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Platzierung hängt von der konkreten Paarung Team-in-diesem-Match ab, nicht vom Team allein (anderes Ergebnis pro Match) oder vom Match allein (anderes Ergebnis pro Team) — sie gehört an die m:n-Linie.',
        en: 'Platzierung depends on the specific team-in-a-specific-match pairing, not on the team alone (different result each match) or the match alone (different result per team) — attach it to the many-to-many line.'
      }
    },
    {
      text: {
        de: 'Team/Spieler ist eine ganz gewöhnliche Beziehung hier, unabhängig von der Ganzes-Teil-Beziehung und der m:n-Beziehung im übrigen Diagramm.',
        en: 'Team/Spieler is a completely ordinary association here, separate from the composition and the association class elsewhere in the diagram.'
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'turnier',
            kind: 'class',
            name: 'Turnier',
            aliases: ['Tournament'],
            attributes: [
              { name: 'turnierId', aliases: ['tournamentId'], isPrimaryKey: true },
              { name: 'name' }
            ]
          },
          {
            key: 'match',
            kind: 'class',
            name: 'Match',
            attributes: [
              { name: 'matchId', isPrimaryKey: true },
              { name: 'runde', aliases: ['round'] }
            ]
          },
          {
            key: 'team',
            kind: 'class',
            name: 'Team',
            attributes: [{ name: 'teamId', isPrimaryKey: true }, { name: 'name' }]
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
          },
          {
            key: 'ergebnis',
            kind: 'association-class',
            name: 'Ergebnis',
            aliases: ['Result'],
            attributes: [{ name: 'platzierung', aliases: ['ranking'] }]
          }
        ],
        edges: [
          {
            kind: 'composition',
            from: 'turnier',
            to: 'match',
            fromMultiplicity: '1',
            toMultiplicity: '0..*'
          },
          {
            kind: 'association',
            from: 'team',
            to: 'spieler',
            fromMultiplicity: '1',
            toMultiplicity: '0..*'
          },
          {
            kind: 'association',
            from: 'match',
            to: 'team',
            fromMultiplicity: '0..*',
            toMultiplicity: '0..*',
            associationClass: 'ergebnis'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'class-diagram', 'composition', 'association-class']
};
