import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'uml-repair-shop-relational-mapping',
  topic: ['modelling', 'relational'],
  difficulty: 'Advanced',
  title: {
    de: 'Werkstattauftrag ins Relationenmodell überführen',
    en: 'Translate a repair shop order into the relational model'
  },
  prompt: {
    de: [
      'Gegeben ist dieses Klassendiagramm:',
      '',
      '  Auftrag (auftragId, datum)',
      '  Aufgabe (aufgabeId, beschreibung)',
      '  Handwerker (handwerkerId, name)',
      '',
      '  Auftrag 1 —— 0..* Aufgabe',
      '  Aufgabe 0..* —— 0..* Handwerker',
      '',
      'Zeichne das zugehörige Relationenmodell als Tabellen:',
      '• Jede Tabelle bekommt ihre Spalten, Primärschlüssel als PK und Fremdschlüssel als FK markiert.',
      '• Die m:n-Beziehung wird zu einer eigenen Tabelle mit dem Namen aufgabe_handwerker.',
      '• Verbinde jede Fremdschlüsselspalte mit der Spalte, auf die sie verweist.'
    ].join('\n'),
    en: [
      'You are given this class diagram:',
      '',
      '  Order (orderId, date)',
      '  Task (taskId, description)',
      '  Worker (workerId, name)',
      '',
      '  Order 1 —— 0..* Task',
      '  Task 0..* —— 0..* Worker',
      '',
      'Draw the matching relational model as tables:',
      '• Every table gets its columns; mark primary keys as PK and foreign keys as FK.',
      '• The m:n relationship becomes a table of its own, named aufgabe_handwerker.',
      '• Connect every foreign key column to the column it references.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Behandle jede Beziehung einzeln: Bilde zuerst die 1:n-Beziehung ab (Aufgabe erhält einen einfachen Fremdschlüssel), dann die m:n-Beziehung (eine neue Verbindungstabelle, unabhängig von Auftrag).',
        en: 'Handle each relationship independently — map the 1:n first (Aufgabe gets a plain foreign key), then the m:n (a fresh junction table, unrelated to Auftrag).'
      }
    },
    {
      text: {
        de: 'Der zusammengesetzte Schlüssel von aufgabe_handwerker hat nichts mit auftragId zu tun — lass den früheren Fremdschlüssel nicht dorthin durchsickern.',
        en: "aufgabe_handwerker's composite key has nothing to do with auftragId — don't let the earlier foreign key leak into it."
      }
    }
  ],
  grading: {
    kind: 'diagram',
    solutions: [
      {
        nodes: [
          {
            key: 'auftrag',
            kind: 'table',
            name: 'auftrag',
            aliases: ['order'],
            attributes: [
              { name: 'auftragId', aliases: ['orderId'], isPrimaryKey: true },
              { name: 'datum', aliases: ['date'] }
            ]
          },
          {
            key: 'aufgabe',
            kind: 'table',
            name: 'aufgabe',
            aliases: ['task'],
            attributes: [
              { name: 'aufgabeId', aliases: ['taskId'], isPrimaryKey: true },
              { name: 'beschreibung', aliases: ['description'] },
              { name: 'auftragId', aliases: ['orderId'], isForeignKey: true }
            ]
          },
          {
            key: 'handwerker',
            kind: 'table',
            name: 'handwerker',
            aliases: ['worker'],
            attributes: [
              { name: 'handwerkerId', aliases: ['workerId'], isPrimaryKey: true },
              { name: 'name' }
            ]
          },
          {
            key: 'aufgabe_handwerker',
            kind: 'table',
            name: 'aufgabe_handwerker',
            aliases: ['task_worker'],
            attributes: [
              {
                name: 'aufgabeId',
                aliases: ['taskId'],
                isPrimaryKey: true,
                isForeignKey: true
              },
              {
                name: 'handwerkerId',
                aliases: ['workerId'],
                isPrimaryKey: true,
                isForeignKey: true
              }
            ]
          }
        ],
        edges: [
          {
            kind: 'foreign-key',
            from: 'aufgabe',
            to: 'auftrag',
            fromAttribute: 'auftragId',
            toAttribute: 'auftragId'
          },
          {
            kind: 'foreign-key',
            from: 'aufgabe_handwerker',
            to: 'aufgabe',
            fromAttribute: 'aufgabeId',
            toAttribute: 'aufgabeId'
          },
          {
            kind: 'foreign-key',
            from: 'aufgabe_handwerker',
            to: 'handwerker',
            fromAttribute: 'handwerkerId',
            toAttribute: 'handwerkerId'
          }
        ]
      }
    ]
  },
  tags: ['uml', 'relational-model', 'foreign-key', 'many-to-many']
};
