import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'normalization-course-signup-1nf',
  topic: ['modelling', 'normalization'],
  difficulty: 'Beginner',
  title: {
    de: 'Kursanmeldungen in die 1. Normalform bringen',
    en: 'Bring course signups into first normal form'
  },
  prompt: {
    de: [
      'Die Tabelle teilnahme_roh liegt unnormalisiert vor:',
      '',
      '  teilnehmerNr | name    | kurs1          | kurs2',
      '  -------------+---------+----------------+------',
      '  100          | Bauer   | SQL            | UML',
      '  101          | Fischer | SQL            |',
      '  102          | Horn    | Normalisierung | SQL',
      '',
      'Für jeden zusätzlich belegten Kurs bräuchte man im Prinzip eine weitere Spalte — je nachdem,',
      'wie viele Kurse ein Teilnehmer belegt. Eine feste Anzahl an Spalten kann das nicht sauber abbilden.',
      '',
      'Zerlege die Tabelle in zwei Tabellen: teilnehmer und kursbelegung.',
      'Verteile die Spalten passend, markiere Primär- und Fremdschlüssel und verbinde jede',
      'Fremdschlüsselspalte mit der Spalte, auf die sie verweist.'
    ].join('\n'),
    en: [
      'The table signup_raw is unnormalised:',
      '',
      '  participantNo | name    | course1       | course2',
      '  --------------+---------+---------------+--------',
      '  100           | Bauer   | SQL           | UML',
      '  101           | Fischer | SQL           |',
      '  102           | Horn    | Normalization | SQL',
      '',
      'For every additional course a participant signs up for, there would in principle be another',
      'column — depending on how many courses that participant takes. A fixed number of columns',
      'cannot represent that cleanly.',
      '',
      'Decompose the table into two tables: participant and courseEnrollment.',
      'Distribute the columns accordingly, mark primary and foreign keys, and connect every',
      'foreign key column to the column it references.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Ein Teilnehmer kann für eine unterschiedliche Anzahl an Kursen angemeldet sein — eine feste Spaltenzahl kann das nie sauber abbilden.',
        en: 'A participant can be signed up for a varying number of courses — a fixed number of columns can never represent that cleanly.'
      }
    },
    {
      text: {
        de: 'Der Schlüssel von kursbelegung ist zusammengesetzt: pro Teilnehmer-Kurs-Kombination gibt es eine Zeile, beide Spalten zusammen bilden den Primärschlüssel.',
        en: 'The key of kursbelegung is composite: there is one row per participant-course combination, so both columns together form the primary key.'
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
            name: 'teilnahme_roh',
            aliases: ['signup_raw'],
            attributes: [
              { name: 'teilnehmerNr', aliases: ['participantNo'] },
              { name: 'name' },
              { name: 'kurs1', aliases: ['course1'] },
              { name: 'kurs2', aliases: ['course2'] }
            ]
          },
          {
            key: 'teilnehmer',
            kind: 'table',
            name: 'teilnehmer',
            aliases: ['participant'],
            attributes: [
              { name: 'teilnehmerNr', aliases: ['participantNo'], isPrimaryKey: true },
              { name: 'name' }
            ]
          },
          {
            key: 'kursbelegung',
            kind: 'table',
            name: 'kursbelegung',
            aliases: ['courseEnrollment'],
            attributes: [
              {
                name: 'teilnehmerNr',
                aliases: ['participantNo'],
                isPrimaryKey: true,
                isForeignKey: true
              },
              { name: 'kurs', aliases: ['course'], isPrimaryKey: true }
            ]
          }
        ],
        edges: [
          {
            kind: 'foreign-key',
            from: 'kursbelegung',
            to: 'teilnehmer',
            fromAttribute: 'teilnehmerNr',
            toAttribute: 'teilnehmerNr'
          }
        ]
      }
    ]
  },
  tags: ['normalization', '1nf']
};
