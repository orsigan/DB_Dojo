import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'plpgsql-brewery-bottling-slots',
  topic: ['plpgsql', 'control-flow'],
  difficulty: 'Beginner',
  title: { de: 'Abfüllplätze beschriften', en: 'Label the bottling slots' },
  prompt: {
    de: [
      'Die Brauerei betreibt zehn Abfüllplätze pro Tag. Plätze 1 bis 4 gehören zur Frühschicht,',
      'Plätze 5 bis 10 zur Spätschicht. Jeder Platz braucht noch seinen aufgedruckten Code.',
      '',
      'Führe einen anonymen `DO`-Block aus, der mit einer `FOR`-Schleife die Platznummern 1 bis 10 durchläuft und',
      '`bottling_slot.code` für jeden von ihnen füllt.',
      '',
      'Ein Code besteht aus dem Schichtbuchstaben (`M` für Früh, `E` für Spät), gefolgt von der Platznummer,',
      'zweistellig aufgefüllt: Platz 1 wird zu `M01`, Platz 5 zu `E05`, Platz 10 zu `E10`.'
    ].join('\n'),
    en: [
      'The brewery runs ten bottling slots per day. Slots 1 to 4 belong to the morning shift,',
      'slots 5 to 10 to the evening shift. Every slot still needs its printed code.',
      '',
      'Run an anonymous `DO` block that walks the slot numbers 1 to 10 with a `FOR` loop and',
      'fills `bottling_slot.code` for each of them.',
      '',
      'A code is the shift letter (`M` for morning, `E` for evening) followed by the slot number',
      'padded to two digits: slot 1 becomes `M01`, slot 5 becomes `E05`, slot 10 becomes `E10`.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS bottling_slot;

    CREATE TABLE bottling_slot (
      slot integer PRIMARY KEY,
      beer text NOT NULL,
      code text
    );

    INSERT INTO bottling_slot (slot, beer) VALUES
      (1, 'Pale Ale'),
      (2, 'Stout'),
      (3, 'Pilsner'),
      (4, 'Weizen'),
      (5, 'Saison'),
      (6, 'Porter'),
      (7, 'Helles'),
      (8, 'Bock'),
      (9, 'Altbier'),
      (10, 'Lager');
  `,
  starterSql: [
    'DO $labels$',
    'DECLARE',
    '  slot_number integer;',
    'BEGIN',
    "  RAISE NOTICE 'nothing labelled yet';",
    'END $labels$;'
  ].join('\n'),
  hints: [
    {
      text: {
        de: 'Ein `DO`-Block braucht weder Namen noch Rückgabetyp — er wird in einem Zug kompiliert und ausgeführt, deshalb sind die `$$`-Begrenzer um den Rumpf nötig.',
        en: 'A DO block needs no name and no return type — it is compiled and executed in one go, which is why the $$ delimiters are needed around the body.'
      }
    },
    {
      text: {
        de: 'Die FOR-Schleifenvariable wird implizit von der Schleife selbst deklariert; nutze sie sowohl, um den Schichtbuchstaben zu bestimmen, als auch, um die Zeile zu adressieren.',
        en: 'The FOR loop variable is declared implicitly by the loop itself; use it both to decide the shift letter and to address the row.'
      }
    },
    {
      text: {
        de: '`lpad` macht aus einer Zahl eine Zeichenkette fester Breite, braucht dafür aber Text — caste die Schleifenvariable zuerst.',
        en: 'lpad turns a number into a fixed-width string, but it needs text — cast the loop variable first.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: { de: 'Platz 1 ist mit M01 beschriftet', en: 'Slot 1 is labelled M01' },
        sql: "SELECT code = 'M01' AS ok FROM bottling_slot WHERE slot = 1;"
      },
      {
        label: {
          de: 'Platz 4 ist der letzte Frühschichtplatz: M04',
          en: 'Slot 4 is the last morning slot: M04'
        },
        sql: "SELECT code = 'M04' AS ok FROM bottling_slot WHERE slot = 4;"
      },
      {
        label: {
          de: 'Platz 5 ist der erste Spätschichtplatz: E05',
          en: 'Slot 5 is the first evening slot: E05'
        },
        sql: "SELECT code = 'E05' AS ok FROM bottling_slot WHERE slot = 5;"
      },
      {
        label: { de: 'Platz 10 ist mit E10 beschriftet', en: 'Slot 10 is labelled E10' },
        sql: "SELECT code = 'E10' AS ok FROM bottling_slot WHERE slot = 10;"
      },
      {
        label: { de: 'Kein Platz blieb ohne Code', en: 'No slot was left without a code' },
        sql: 'SELECT count(*) = 0 AS ok FROM bottling_slot WHERE code IS NULL;'
      }
    ]
  },
  tags: ['do-block', 'for-loop', 'if']
};
