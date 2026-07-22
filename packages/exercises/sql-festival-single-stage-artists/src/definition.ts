import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'sql-festival-single-stage-artists',
  topic: ['sql', 'subqueries'],
  difficulty: 'Advanced',
  title: { de: 'Künstler mit genau einer Hauptbühne', en: 'Artists of exactly one main stage' },
  prompt: {
    de: [
      'Das Festival druckt ein Plakat zu seinen beiden Hauptbühnen, `Riverside` und `Forest`.',
      '',
      'Liste die Künstler auf, die auf genau einer dieser beiden Bühnen aufgetreten sind.',
      'Künstler, die auf beiden gespielt haben, bleiben außen vor, Künstler, die nur auf einer anderen Bühne gespielt haben, gehören nie auf das Plakat,',
      'und wer dieselbe Bühne mehrmals bespielt hat, wird trotzdem nur einmal genannt.',
      '',
      'Gib `artist` zurück, sortiert nach `artist`.'
    ].join('\n'),
    en: [
      'The festival prints a poster about its two main stages, `Riverside` and `Forest`.',
      '',
      'List the artists that appeared on exactly one of these two stages.',
      'Artists that played on both are left out, artists that only played on some other stage never belong on the poster,',
      'and an artist who played the same stage several times is still named once.',
      '',
      'Return `artist`, ordered by `artist`.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS performances;

    CREATE TABLE performances (
      id integer PRIMARY KEY,
      artist text NOT NULL,
      stage text NOT NULL,
      festival_day text NOT NULL
    );

    INSERT INTO performances (id, artist, stage, festival_day) VALUES
      (1, 'Nova Kite', 'Riverside', 'Friday'),
      (2, 'Nova Kite', 'Riverside', 'Saturday'),
      (3, 'Nova Kite', 'Forest', 'Sunday'),
      (4, 'Pale Harbor', 'Riverside', 'Friday'),
      (5, 'Pale Harbor', 'Riverside', 'Sunday'),
      (6, 'Quiet Anvil', 'Forest', 'Saturday'),
      (7, 'Rusty Lantern', 'Meadow', 'Friday'),
      (8, 'Solar Fen', 'Forest', 'Friday'),
      (9, 'Solar Fen', 'Meadow', 'Saturday'),
      (10, 'Tin Gospel', 'Riverside', 'Saturday');
  `,
  starterSql: "SELECT DISTINCT artist\nFROM performances\nWHERE stage = 'Riverside';",
  hints: [
    {
      text: {
        de: 'Beide Richtungen zählen: Künstler einer Bühne, die nie auf der anderen gespielt haben, und dieselbe Aussage mit vertauschten Bühnen.',
        en: 'Both directions matter: an artist of one stage who never played the other one, and the same statement with the two stages swapped.'
      }
    },
    {
      text: {
        de: 'UNION und EXCEPT werden von links nach rechts ausgewertet, ohne Klammern ändert die zweite Differenz also stillschweigend ihre Bedeutung.',
        en: 'UNION and EXCEPT are evaluated from left to right, so without parentheses the second difference silently changes meaning.'
      }
    },
    {
      text: {
        de: 'UNION und EXCEPT entfernen Duplikate von selbst — das erledigt schon den Fall eines Künstlers, der eine Bühne zweimal bespielt hat.',
        en: 'UNION and EXCEPT remove duplicates by themselves, which already handles the artist who played one stage twice.'
      }
    }
  ],
  grading: {
    kind: 'result-equals',
    ordered: true,
    expectedSql: `
      (
        SELECT p.artist FROM performances AS p WHERE p.stage = 'Riverside'
        EXCEPT
        SELECT p.artist FROM performances AS p WHERE p.stage = 'Forest'
      )
      UNION
      (
        SELECT p.artist FROM performances AS p WHERE p.stage = 'Forest'
        EXCEPT
        SELECT p.artist FROM performances AS p WHERE p.stage = 'Riverside'
      )
      ORDER BY artist;
    `
  },
  tags: ['union', 'except', 'set-operations']
};
