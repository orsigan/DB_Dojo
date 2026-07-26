import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'normalization-school-results-3nf',
  topic: ['modelling', 'normalization'],
  difficulty: 'Ultra',
  title: {
    de: 'Prüfungsergebnisse in die 3. Normalform bringen',
    en: 'Bring exam results into third normal form'
  },
  prompt: {
    de: [
      'Die Tabelle ergebnis_roh liegt unnormalisiert vor. Ein Schüler kann in mehreren Fächern',
      'Ergebnisse haben, daher besteht der Schlüssel aus schuelerNr und fachNr zusammen:',
      '',
      '  schuelerNr | schuelerName | fachNr | fachName    | punkte',
      '  -----------+--------------+--------+-------------+-------',
      '  S1         | Klein        | F1     | Mathematik  |     14',
      '  S1         | Klein        | F2     | Englisch    |     12',
      '  S2         | Weber        | F1     | Mathematik  |      9',
      '',
      'Schritt 1 — Zeichne die funktionalen Abhängigkeiten direkt in ergebnis_roh ein.',
      'Trage nur die direkten Abhängigkeiten ein, keine transitiv ableitbaren.',
      '',
      'Schritt 2 — Zerlege die Tabelle in die 3. Normalform.',
      'Verwende die Tabellennamen schueler, fach und ergebnis, verteile die Spalten passend,',
      'markiere Primär- und Fremdschlüssel und verbinde jede Fremdschlüsselspalte mit der Spalte,',
      'auf die sie verweist.'
    ].join('\n'),
    en: [
      'The table result_raw is unnormalised. A student can have results in several subjects, so its',
      'key is the combination of studentNo and subjectNo:',
      '',
      '  studentNo | studentName | subjectNo | subjectName | points',
      '  ----------+-------------+-----------+-------------+-------',
      '  S1        | Klein       | F1        | Mathematics |     14',
      '  S1        | Klein       | F2        | English     |     12',
      '  S2        | Weber       | F1        | Mathematics |      9',
      '',
      'Step 1 — Draw the functional dependencies straight into result_raw.',
      'Only add the direct dependencies, not the ones derivable by transitivity.',
      '',
      'Step 2 — Decompose the table into third normal form.',
      'Use the table names schueler, fach and ergebnis, distribute the columns, mark primary and',
      'foreign keys, and connect every foreign key column to the column it references.'
    ].join('\n')
  },
  seedSql: '',
  hints: [
    {
      text: {
        de: 'Beide Nicht-Schlüsselspalten sind transitiv, jeweils über eine Hälfte des Schlüssels — keine bleibt in der mittleren Tabelle stehen.',
        en: 'Both non-key columns are transitive, one through each half of the key — neither survives in the middle table.'
      }
    },
    {
      text: {
        de: 'punkte ist das einzige Attribut, das wirklich den vollständigen zusammengesetzten Schlüssel braucht — es bleibt daher als einzige Spalte neben den beiden Fremdschlüsseln in ergebnis stehen.',
        en: 'punkte is the one attribute that genuinely needs the full composite key, so it is the only column left in ergebnis besides the two foreign keys.'
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
            name: 'ergebnis_roh',
            aliases: ['result_raw'],
            attributes: [
              { name: 'schuelerNr', aliases: ['studentNo'] },
              { name: 'schuelerName', aliases: ['studentName'] },
              { name: 'fachNr', aliases: ['subjectNo'] },
              { name: 'fachName', aliases: ['subjectName'] },
              { name: 'punkte', aliases: ['points'] }
            ]
          },
          {
            key: 'schueler',
            kind: 'table',
            name: 'schueler',
            aliases: ['student'],
            attributes: [
              { name: 'schuelerNr', aliases: ['studentNo'], isPrimaryKey: true },
              { name: 'schuelerName', aliases: ['studentName'] }
            ]
          },
          {
            key: 'fach',
            kind: 'table',
            name: 'fach',
            aliases: ['subject'],
            attributes: [
              { name: 'fachNr', aliases: ['subjectNo'], isPrimaryKey: true },
              { name: 'fachName', aliases: ['subjectName'] }
            ]
          },
          {
            key: 'ergebnis',
            kind: 'table',
            name: 'ergebnis',
            aliases: ['result'],
            attributes: [
              {
                name: 'schuelerNr',
                aliases: ['studentNo'],
                isPrimaryKey: true,
                isForeignKey: true
              },
              { name: 'fachNr', aliases: ['subjectNo'], isPrimaryKey: true, isForeignKey: true },
              { name: 'punkte', aliases: ['points'] }
            ]
          }
        ],
        edges: [
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'schuelerNr',
            toAttribute: 'schuelerName'
          },
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'fachNr',
            toAttribute: 'fachName'
          },
          {
            kind: 'functional-dependency',
            from: 'raw',
            to: 'raw',
            fromAttribute: 'schuelerNr',
            additionalDeterminants: ['fachNr'],
            toAttribute: 'punkte'
          },
          {
            kind: 'foreign-key',
            from: 'ergebnis',
            to: 'schueler',
            fromAttribute: 'schuelerNr',
            toAttribute: 'schuelerNr'
          },
          {
            kind: 'foreign-key',
            from: 'ergebnis',
            to: 'fach',
            fromAttribute: 'fachNr',
            toAttribute: 'fachNr'
          }
        ]
      }
    ]
  },
  tags: ['normalization', 'functional-dependency', '3nf']
};
