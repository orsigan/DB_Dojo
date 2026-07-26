import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-person-passport',
  topic: ['modelling', 'uml'],
  difficulty: 'Beginner',
  title: { de: 'Personen und ihre Reisepässe', en: 'People and their passports' },
  prompt: {
    de: [
      'Zeichne die folgende Situation als UML-Klassendiagramm. Verwende exakt die genannten Namen.',
      '',
      'Im Bürgeramt wird verwaltet, wer einen Reisepass besitzt. Eine Person hat höchstens einen gültigen Reisepass. Jeder ausgestellte Reisepass gehört zu genau einer Person.',
      '',
      'Klassen und Attribute (Schlüssel als PK markieren):',
      '• Person: personId (PK), name',
      '• Reisepass: passNr (PK), gueltigBis'
    ].join('\n'),
    en: [
      'Draw the following situation as a UML class diagram. Use exactly the names given below.',
      '',
      'The registration office keeps track of who holds a passport. A person has at most one valid passport. Every issued passport belongs to exactly one person.',
      '',
      'Classes and attributes (mark keys as PK):',
      '• Person: personId (PK), name',
      '• Passport: passportNo (PK), validUntil'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Die Zahl neben einer Klasse gibt an, wie viele Objekte dieser Klasse zu einem Objekt auf der anderen Seite gehören — lies beide Sätze noch einmal mit dieser Regel im Kopf, bevor du die Multiplizitäten einträgst.',
        en: 'The number written next to a class tells you how many objects of that class belong to one object on the other side — re-read both sentences with that rule in mind before placing the multiplicities.'
      }
    },
    {
      text: {
        de: 'Ein Reisepass ist kein Teil einer Person im Sinne von Ganzes und Teil, auch wenn er ihr umgangssprachlich „gehört“ — hier reicht eine einfache Assoziation.',
        en: 'A passport is not part of a person in the whole/part sense, even though it colloquially "belongs" to them — a plain association is correct here.'
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'person',
            kind: 'class',
            name: 'Person',
            attributes: [{ name: 'personId', isPrimaryKey: true }, { name: 'name' }]
          },
          {
            key: 'reisepass',
            kind: 'class',
            name: 'Reisepass',
            aliases: ['Passport'],
            attributes: [
              { name: 'passNr', aliases: ['passportNo'], isPrimaryKey: true },
              { name: 'gueltigBis', aliases: ['validUntil'] }
            ]
          }
        ],
        edges: [
          {
            kind: 'association',
            from: 'person',
            to: 'reisepass',
            fromMultiplicity: '1',
            toMultiplicity: '0..1'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'class-diagram', 'association']
};
