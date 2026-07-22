import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'sql-museum-guide-language-pairs',
  topic: ['sql', 'joins'],
  difficulty: 'Profi',
  title: {
    de: 'Guides, die sich gegenseitig vertreten können',
    en: 'Guides who can cover for each other'
  },
  prompt: {
    de: [
      'Zwei Museumsguides können sich gegenseitig vertreten, wenn sie ihre Führungen in derselben Sprache geben, aber unterschiedlichen Schichten zugeteilt sind.',
      '',
      'Liste jedes solche Paar genau einmal — nicht zweimal mit vertauschten Namen, und nie einen Guide gepaart mit sich selbst.',
      'Innerhalb eines Paares steht der alphabetisch kleinere Name zuerst.',
      'Ein Guide, dessen Führungssprache unbekannt ist, kann mit niemandem gepaart werden.',
      '',
      'Gib `first_guide` und `second_guide` zurück, sortiert nach `first_guide` und dann nach `second_guide`.'
    ].join('\n'),
    en: [
      'Two museum guides can cover for each other when they give their tours in the same language but are assigned to different shifts.',
      '',
      'List every such pair exactly once — not twice with the names swapped, and never a guide paired with themselves.',
      'Inside a pair the alphabetically smaller name comes first.',
      'A guide whose tour language is unknown cannot be paired with anybody.',
      '',
      'Return `first_guide` and `second_guide`, ordered by `first_guide` and then by `second_guide`.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS guides;

    CREATE TABLE guides (
      id integer PRIMARY KEY,
      name text NOT NULL,
      language text,
      shift text NOT NULL
    );

    INSERT INTO guides (id, name, language, shift) VALUES
      (1, 'Alma Reis', 'Portuguese', 'morning'),
      (2, 'Bo Lindqvist', 'Swedish', 'morning'),
      (3, 'Cato Rossi', 'Italian', 'morning'),
      (4, 'Dita Kern', 'Italian', 'evening'),
      (5, 'Elif Yilmaz', 'Italian', 'morning'),
      (6, 'Frida Holm', 'Swedish', 'morning'),
      (7, 'Gus Meyer', NULL, 'evening'),
      (8, 'Hana Ito', NULL, 'morning'),
      (9, 'Ivo Blum', 'Portuguese', 'evening');
  `,
  starterSql: 'SELECT g.name, g.language, g.shift\nFROM guides AS g;',
  hints: [
    {
      text: {
        de: 'Eine Relation kann zweimal in FROM auftreten, wenn jedes Vorkommen eine eigene Tupelvariable erhält — dadurch lässt sich eine Zeile mit einer anderen Zeile derselben Tabelle vergleichen.',
        en: 'One relation can appear twice in FROM if each occurrence gets its own tuple variable — that is what lets a row be compared with another row of the same table.'
      }
    },
    {
      text: {
        de: 'Verbindet man eine Tabelle allein über Gleichheit mit sich selbst, entsteht jedes Paar doppelt, dazu jeder Guide mit sich selbst; ein Vergleich zwischen den beiden Namen beseitigt beide Probleme auf einen Schlag.',
        en: 'Joining a table with itself on equality alone yields each pair twice plus every guide with themselves; a comparison between the two names removes both problems in one go.'
      }
    },
    {
      text: {
        de: 'Eine unbekannte Sprache lässt sich mit nichts vergleichen, nicht einmal mit einer anderen unbekannten — diese Zeilen fallen also von selbst aus dem Verbund heraus.',
        en: 'An unknown language compares to nothing, not even to another unknown one, so those rows drop out of the join on their own.'
      }
    }
  ],
  grading: {
    kind: 'result-equals',
    ordered: true,
    expectedSql: `
      SELECT a.name AS first_guide, b.name AS second_guide
      FROM guides AS a
      JOIN guides AS b
        ON b.language = a.language
       AND b.shift <> a.shift
       AND b.name > a.name
      ORDER BY first_guide, second_guide;
    `
  },
  tags: ['self-join', 'tuple-variables', 'non-equi-join']
};
