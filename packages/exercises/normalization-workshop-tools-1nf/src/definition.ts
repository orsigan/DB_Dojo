import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'normalization-workshop-tools-1nf',
  topic: ['modelling', 'normalization'],
  difficulty: 'Beginner',
  title: {
    de: 'Werkzeugausleihe in die 1. Normalform bringen',
    en: 'Bring tool checkouts into first normal form'
  },
  prompt: {
    de: [
      'Die Tabelle ausleihe_roh liegt unnormalisiert vor:',
      '',
      '  mitarbeiterNr | name  | werkzeug1     | werkzeug2 | werkzeug3',
      '  --------------+-------+---------------+-----------+----------',
      '  10            | Klein | Bohrmaschine  | Säge      |',
      '  11            | Wolf  | Hammer        |           |',
      '  12            | Roth  | Akkuschrauber | Zange     | Säge',
      '',
      'Jeder Mitarbeiter kann aktuell bis zu drei Werkzeuge ausgeliehen haben — die Tabelle sieht',
      'dafür drei feste Spalten vor, die je nach Mitarbeiter unterschiedlich weit gefüllt sind.',
      '',
      'Zerlege die Tabelle in zwei Tabellen: mitarbeiter und ausleihe.',
      'Verteile die Spalten passend, markiere Primär- und Fremdschlüssel und verbinde jede',
      'Fremdschlüsselspalte mit der Spalte, auf die sie verweist.'
    ].join('\n'),
    en: [
      'The table checkout_raw is unnormalised:',
      '',
      '  employeeNo | name  | tool1       | tool2  | tool3',
      '  -----------+-------+-------------+--------+-------',
      '  10         | Klein | Drill       | Saw    |',
      '  11         | Wolf  | Hammer      |        |',
      '  12         | Roth  | Screwdriver | Pliers | Saw',
      '',
      'Each employee can currently have up to three tools checked out — the table provides three',
      'fixed columns for that, filled to a different degree depending on the employee.',
      '',
      'Decompose the table into two tables: employee and checkout.',
      'Distribute the columns accordingly, mark primary and foreign keys, and connect every',
      'foreign key column to the column it references.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Ein Mitarbeiter kann aktuell null bis drei Werkzeuge ausgeliehen haben — eine feste Spaltenzahl kann das nicht sauber abbilden.',
        en: 'An employee can currently have anywhere from zero to three tools checked out — a fixed number of columns cannot represent that cleanly.'
      }
    },
    {
      text: {
        de: 'Die leeren Felder bei werkzeug2/werkzeug3 sind selbst schon ein Symptom desselben Problems — genau wie bei den anderen Zerlegungsaufgaben ist der Schlüssel von ausleihe zusammengesetzt.',
        en: 'The empty werkzeug2/werkzeug3 slots are themselves already a symptom of the same problem — just as in the other decomposition exercises, the key of ausleihe is composite.'
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
            name: 'ausleihe_roh',
            aliases: ['checkout_raw'],
            attributes: [
              { name: 'mitarbeiterNr', aliases: ['employeeNo'] },
              { name: 'name' },
              { name: 'werkzeug1', aliases: ['tool1'] },
              { name: 'werkzeug2', aliases: ['tool2'] },
              { name: 'werkzeug3', aliases: ['tool3'] }
            ]
          },
          {
            key: 'mitarbeiter',
            kind: 'table',
            name: 'mitarbeiter',
            aliases: ['employee'],
            attributes: [
              { name: 'mitarbeiterNr', aliases: ['employeeNo'], isPrimaryKey: true },
              { name: 'name' }
            ]
          },
          {
            key: 'ausleihe',
            kind: 'table',
            name: 'ausleihe',
            aliases: ['checkout'],
            attributes: [
              {
                name: 'mitarbeiterNr',
                aliases: ['employeeNo'],
                isPrimaryKey: true,
                isForeignKey: true
              },
              { name: 'werkzeug', aliases: ['tool'], isPrimaryKey: true }
            ]
          }
        ],
        edges: [
          {
            kind: 'foreign-key',
            from: 'ausleihe',
            to: 'mitarbeiter',
            fromAttribute: 'mitarbeiterNr',
            toAttribute: 'mitarbeiterNr'
          }
        ]
      }
    ]
  },
  tags: ['normalization', '1nf']
};
