import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-insurance-policy-model',
  topic: ['modelling', 'uml'],
  difficulty: 'Ultra',
  title: {
    de: 'Versicherungspolicen als Klassendiagramm',
    en: 'Insurance policies as a class diagram'
  },
  prompt: {
    de: [
      'Eine Versicherungsgesellschaft verwaltet Policen. Jede Police wird von genau einem Kunden',
      'abgeschlossen, ein Kunde kann mehrere Policen abschließen.',
      '',
      'Policen gliedern sich in Kfz-Policen mit einem amtlichen Kennzeichen und Hausrat-Policen mit',
      'einer Wohnflächenangabe.',
      '',
      'Zu einer Police können mehrere Schäden gemeldet werden; ein Schaden existiert nicht',
      'unabhängig von seiner Police und gehört immer zu genau einer Police.',
      '',
      'Jeder Schaden wird von genau einem Sachbearbeiter bearbeitet, ein Sachbearbeiter bearbeitet',
      'mehrere Schäden.',
      '',
      'Klassen und Attribute (Schlüssel als PK markieren):',
      '• Kunde: kundeId (PK), name',
      '• Police: policeId (PK), beginn',
      '• KfzPolice: kennzeichen',
      '• HausratPolice: wohnflaeche',
      '• Schaden: schadenId (PK), datum',
      '• Sachbearbeiter: sachbearbeiterId (PK), name'
    ].join('\n'),
    en: [
      'An insurance company manages policies. Every policy is taken out by exactly one customer, and',
      'a customer can take out several policies.',
      '',
      'Policies split into car policies with an official license plate and home-contents policies',
      'with a living-area figure.',
      '',
      'Several claims can be filed against a policy; a claim does not exist independently of its',
      'policy and always belongs to exactly one policy.',
      '',
      'Every claim is handled by exactly one case handler, and a case handler handles several claims.',
      '',
      'Classes and attributes (mark keys as PK):',
      '• Customer: customerId (PK), name',
      '• Policy: policyId (PK), startDate',
      '• CarPolicy: licensePlate',
      '• HomePolicy: livingArea',
      '• Claim: claimId (PK), date',
      '• CaseHandler: handlerId (PK), name'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Vier eigenständige Beziehungen stecken hier drin — nimm sie einzeln: Kunde/Police ist eine gewöhnliche Beziehung, KfzPolice/HausratPolice sind Sonderfälle von Police, Police/Schaden ist Ganzes-Teil, und Sachbearbeiter/Schaden ist wieder eine gewöhnliche Beziehung.',
        en: 'Four separate relationships live here — tackle them one at a time: Kunde/Police is a plain association, KfzPolice/HausratPolice are special cases of Police, Police/Schaden is whole-part, and Sachbearbeiter/Schaden is another plain association.'
      }
    },
    {
      text: {
        de: '"existiert nicht unabhängig" ist das Signal für die Beziehung zwischen Police und Schaden — verwechsle es nicht mit den gewöhnlichen Beziehungen im übrigen Diagramm.',
        en: '"does not exist independently" is the signal for the Police/Schaden relationship — do not confuse it with the plain associations elsewhere in the same diagram.'
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'kunde',
            kind: 'class',
            name: 'Kunde',
            aliases: ['Customer'],
            attributes: [
              { name: 'kundeId', aliases: ['customerId'], isPrimaryKey: true },
              { name: 'name' }
            ]
          },
          {
            key: 'police',
            kind: 'class',
            name: 'Police',
            aliases: ['Policy'],
            attributes: [
              { name: 'policeId', aliases: ['policyId'], isPrimaryKey: true },
              { name: 'beginn', aliases: ['startDate'] }
            ]
          },
          {
            key: 'kfzpolice',
            kind: 'class',
            name: 'KfzPolice',
            aliases: ['CarPolicy'],
            attributes: [{ name: 'kennzeichen', aliases: ['licensePlate'] }]
          },
          {
            key: 'hausratpolice',
            kind: 'class',
            name: 'HausratPolice',
            aliases: ['HomePolicy'],
            attributes: [{ name: 'wohnflaeche', aliases: ['livingArea'] }]
          },
          {
            key: 'schaden',
            kind: 'class',
            name: 'Schaden',
            aliases: ['Claim'],
            attributes: [
              { name: 'schadenId', aliases: ['claimId'], isPrimaryKey: true },
              { name: 'datum', aliases: ['date'] }
            ]
          },
          {
            key: 'sachbearbeiter',
            kind: 'class',
            name: 'Sachbearbeiter',
            aliases: ['CaseHandler'],
            attributes: [
              { name: 'sachbearbeiterId', aliases: ['handlerId'], isPrimaryKey: true },
              { name: 'name' }
            ]
          }
        ],
        edges: [
          {
            kind: 'association',
            from: 'kunde',
            to: 'police',
            fromMultiplicity: '1',
            toMultiplicity: '0..*'
          },
          { kind: 'generalization', from: 'kfzpolice', to: 'police' },
          { kind: 'generalization', from: 'hausratpolice', to: 'police' },
          {
            kind: 'composition',
            from: 'police',
            to: 'schaden',
            fromMultiplicity: '1',
            toMultiplicity: '0..*'
          },
          {
            kind: 'association',
            from: 'sachbearbeiter',
            to: 'schaden',
            fromMultiplicity: '1',
            toMultiplicity: '0..*'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'class-diagram', 'generalization', 'composition', 'association']
};
