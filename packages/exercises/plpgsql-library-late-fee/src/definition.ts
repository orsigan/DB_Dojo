import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'plpgsql-library-late-fee',
  topic: ['plpgsql', 'functions'],
  difficulty: 'Beginner',
  title: { de: 'Funktion für die Mahngebühr', en: 'Late fee function' },
  prompt: {
    de: [
      'Die Stadtbibliothek gewährt eine Karenzzeit, bevor sie für eine überfällige Ausleihe etwas berechnet.',
      '',
      'Schreibe eine PL/pgSQL-Funktion `late_fee(days_late integer) RETURNS numeric`.',
      '',
      'Die ersten 3 überfälligen Tage sind kostenlos. Jeder weitere Tag kostet 0,50.',
      'Eine Ausleihe, die überhaupt nicht überfällig ist, darf nichts kosten.',
      'Die Tabelle `loan` ist da, um deine Funktion auszuprobieren: `SELECT title, late_fee(days_late) FROM loan;`'
    ].join('\n'),
    en: [
      'The city library grants a grace period before it charges anything for an overdue loan.',
      '',
      'Write a PL/pgSQL function `late_fee(days_late integer) RETURNS numeric`.',
      '',
      'The first 3 overdue days are free. Every further day costs 0.50.',
      'A loan that is not overdue at all must cost nothing.',
      'The `loan` table is there to try your function out: `SELECT title, late_fee(days_late) FROM loan;`'
    ].join('\n')
  },
  seedSql: `
    DROP FUNCTION IF EXISTS late_fee(integer);
    DROP TABLE IF EXISTS loan;

    CREATE TABLE loan (
      id integer PRIMARY KEY,
      title text NOT NULL,
      days_late integer NOT NULL
    );

    INSERT INTO loan (id, title, days_late) VALUES
      (1, 'Dune', 0),
      (2, 'The Dispossessed', 3),
      (3, 'Solaris', 4),
      (4, 'Kindred', 11);
  `,
  starterSql: [
    'CREATE OR REPLACE FUNCTION late_fee(days_late integer) RETURNS numeric AS $late_fee$',
    'BEGIN',
    '  RETURN 0;',
    'END;',
    '$late_fee$ LANGUAGE plpgsql;'
  ].join('\n'),
  hints: [
    {
      text: {
        de: 'Innerhalb des Blocks kann der Parameter über seinen Namen verwendet werden, sodass sich der Rumpf wie gewöhnlicher Code liest.',
        en: 'Inside the block the parameter can be used by its name, so the body reads like ordinary code.'
      }
    },
    {
      text: {
        de: 'Nur die Tage über die Karenzzeit hinaus werden berechnet — entscheide zuerst, ob überhaupt etwas zu berechnen ist.',
        en: 'Only the days beyond the grace period are billed — decide first whether there is anything to bill at all.'
      }
    },
    {
      text: {
        de: 'Prüfe, wo die Grenze liegt: Der dritte Tag ist noch der letzte kostenlose.',
        en: 'Check where the boundary sits: the third day is still the last free one.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'Eine pünktlich zurückgegebene Ausleihe kostet nichts',
          en: 'A loan returned on time costs nothing'
        },
        sql: 'SELECT late_fee(0) = 0 AS ok;'
      },
      {
        label: {
          de: 'Der dritte überfällige Tag ist noch kostenlos',
          en: 'The third overdue day is still free'
        },
        sql: 'SELECT late_fee(3) = 0 AS ok;'
      },
      {
        label: {
          de: 'Der vierte überfällige Tag kostet 0,50',
          en: 'The fourth overdue day costs 0.50'
        },
        sql: 'SELECT late_fee(4) = 0.50 AS ok;'
      },
      {
        label: { de: 'Elf überfällige Tage kosten 4,00', en: 'Eleven overdue days cost 4.00' },
        sql: 'SELECT late_fee(11) = 4.00 AS ok;'
      },
      {
        label: {
          de: 'Auf alle Ausleihen angewendet summieren sich die Gebühren auf 4,50',
          en: 'Applied to every loan the fees add up to 4.50'
        },
        sql: 'SELECT sum(late_fee(days_late)) = 4.50 AS ok FROM loan;'
      }
    ]
  },
  tags: ['function', 'if', 'parameter']
};
