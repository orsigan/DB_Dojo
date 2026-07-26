import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'normalization-festival-lineup-3nf',
  topic: ['modelling', 'normalization'],
  difficulty: 'Profi',
  title: {
    de: 'Festival-Auftritte in die 3. Normalform bringen',
    en: 'Bring a festival lineup into third normal form'
  },
  prompt: {
    de: [
      'Die Tabelle auftritt_roh liegt unnormalisiert vor:',
      '',
      '  buehneNr | zeitslot | bandNr | bandName  | dauer',
      '  ---------+----------+--------+-----------+------',
      '  B1       | 18:00    | R1     | Nordwind  |    45',
      '  B1       | 19:00    | R2     | Feuerrot  |    60',
      '  B2       | 18:00    | R3     | Klangwerk |    50',
      '',
      'Schritt 1 — Zeichne die funktionalen Abhängigkeiten direkt in auftritt_roh ein.',
      'Trage nur die direkten Abhängigkeiten ein, keine transitiv ableitbaren.',
      '',
      'Schritt 2 — Zerlege die Tabelle in die 3. Normalform.',
      'Verwende die Tabellennamen band und auftritt, verteile die Spalten passend,',
      'markiere Primär- und Fremdschlüssel und verbinde jede Fremdschlüsselspalte',
      'mit der Spalte, auf die sie verweist.',
      '',
      'Eine eigene Tabelle für Bühnen ist nicht Teil der Aufgabe.'
    ].join('\n'),
    en: [
      'The table performance_raw is unnormalised:',
      '',
      '  stageNo | timeSlot | bandNo | bandName   | duration',
      '  --------+----------+--------+------------+---------',
      '  B1      | 18:00    | R1     | Northwind  |       45',
      '  B1      | 19:00    | R2     | Fireblaze  |       60',
      '  B2      | 18:00    | R3     | Soundworks |       50',
      '',
      'Step 1 — Draw the functional dependencies straight into performance_raw.',
      'Only add the direct dependencies, not the ones derivable by transitivity.',
      '',
      'Step 2 — Decompose the table into third normal form.',
      'Use the table names band and performance, distribute the columns,',
      'mark primary and foreign keys, and connect every foreign key column to the column',
      'it references.',
      '',
      'A separate table for stages is not part of this exercise.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'bandName benötigt weder die Bühne noch den Zeitslot — es hängt nur von bandNr ab, das selbst schon aus dem vollständigen Schlüssel abgeleitet wird. Genau dieser transitive Schritt muss aus der Tabelle auftritt heraus.',
        en: "bandName doesn't need the stage or the time slot at all — it only needs bandNr, which is itself already derived from the full key. That transitive step is what has to leave the auftritt table."
      }
    },
    {
      text: {
        de: 'Es gibt keinen Grund, warum buehneNr eine eigene Tabelle bekommen sollte — nichts hängt allein von buehneNr ab.',
        en: "There's no reason for buehneNr to get a table of its own — nothing else depends on it alone."
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
            name: 'auftritt_roh',
            aliases: ['performance_raw'],
            attributes: [
              { name: 'buehneNr', aliases: ['stageNo'] },
              { name: 'zeitslot', aliases: ['timeSlot'] },
              { name: 'bandNr', aliases: ['bandNo'] },
              { name: 'bandName', aliases: ['bandName'] },
              { name: 'dauer', aliases: ['duration'] }
            ]
          },
          {
            key: 'band',
            kind: 'table',
            name: 'band',
            attributes: [
              { name: 'bandNr', aliases: ['bandNo'], isPrimaryKey: true },
              { name: 'bandName', aliases: ['bandName'] }
            ]
          },
          {
            key: 'auftritt',
            kind: 'table',
            name: 'auftritt',
            aliases: ['performance'],
            attributes: [
              { name: 'buehneNr', aliases: ['stageNo'], isPrimaryKey: true },
              { name: 'zeitslot', aliases: ['timeSlot'], isPrimaryKey: true },
              { name: 'bandNr', aliases: ['bandNo'], isForeignKey: true },
              { name: 'dauer', aliases: ['duration'] }
            ]
          }
        ],
        edges: [
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'buehneNr',
            additionalDeterminants: ['zeitslot'],
            toAttribute: 'bandNr'
          },
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'bandNr',
            toAttribute: 'bandName'
          },
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'buehneNr',
            additionalDeterminants: ['zeitslot'],
            toAttribute: 'dauer'
          },
          {
            kind: 'foreign-key',
            from: 'auftritt',
            to: 'band',
            fromAttribute: 'bandNr',
            toAttribute: 'bandNr'
          }
        ]
      }
    ]
  },
  tags: ['normalization', 'functional-dependency', '3nf']
};
