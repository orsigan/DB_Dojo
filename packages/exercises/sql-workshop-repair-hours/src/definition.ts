import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'sql-workshop-repair-hours',
  topic: ['sql', 'aggregation'],
  difficulty: 'Advanced',
  title: { de: 'Abrechenbare Stunden pro Mechaniker', en: 'Billable hours per mechanic' },
  prompt: {
    de: [
      'Die Werkstatt rechnet stundenweise ab, aber nicht in jedem Auftragszettel sind die Stunden eingetragen.',
      '',
      'Zähle für jeden Mechaniker die Reparaturen mit erfasster Stundenzahl und summiere diese Stunden.',
      'Reparaturen ohne erfasste Stunden zählen nirgends mit — weder in der Anzahl noch in der Summe.',
      'Berücksichtige nur Mechaniker mit mindestens drei erfassten Reparaturen.',
      '',
      'Gib `name`, `repair_count` und `total_hours` zurück, sortiert absteigend nach `total_hours` und dann nach `name`.'
    ].join('\n'),
    en: [
      'The workshop bills by the hour, but not every job sheet has the hours filled in.',
      '',
      'For every mechanic, count the repairs that carry a recorded number of hours and add those hours up.',
      'Repairs without recorded hours count for nothing — neither for the count nor for the sum.',
      'Only report mechanics with at least three recorded repairs.',
      '',
      'Return `name`, `repair_count` and `total_hours`, ordered by `total_hours` descending and then by `name`.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS repairs;
    DROP TABLE IF EXISTS mechanics;

    CREATE TABLE mechanics (
      id integer PRIMARY KEY,
      name text NOT NULL
    );

    CREATE TABLE repairs (
      id integer PRIMARY KEY,
      mechanic_id integer NOT NULL REFERENCES mechanics (id),
      vehicle text NOT NULL,
      hours numeric
    );

    INSERT INTO mechanics (id, name) VALUES
      (1, 'Ana Weiss'),
      (2, 'Dana Falk'),
      (3, 'Ivo Brand'),
      (4, 'Lena Vogt'),
      (5, 'Sam Ortiz');

    INSERT INTO repairs (id, mechanic_id, vehicle, hours) VALUES
      (1, 1, 'Fiat Panda', 5.0),
      (2, 1, 'Opel Corsa', 3.0),
      (3, 1, 'Skoda Fabia', 2.0),
      (4, 2, 'VW Golf', 4.0),
      (5, 2, 'Ford Focus', 2.5),
      (6, 2, 'Mazda 2', 3.5),
      (7, 2, 'Renault Clio', NULL),
      (8, 3, 'Volvo V60', 6.0),
      (9, 3, 'Seat Ibiza', 1.5),
      (10, 3, 'Toyota Yaris', NULL),
      (11, 4, 'Audi A3', 2.0),
      (12, 4, 'BMW 116', 3.0),
      (13, 4, 'Kia Ceed', 5.0),
      (14, 4, 'Dacia Logan', 1.0),
      (15, 4, 'Honda Jazz', 4.5);
  `,
  starterSql:
    'SELECT m.name, count(*) AS repair_count\nFROM mechanics AS m\nJOIN repairs AS r ON r.mechanic_id = m.id\nGROUP BY m.name;',
  hints: [
    {
      text: {
        de: 'count(*) zählt Tupel, count(spalte) zählt Werte — Nullwerte werden entfernt, bevor eine Aggregatfunktion angewendet wird, und dieser Unterschied entscheidet, wer auf drei Reparaturen kommt.',
        en: 'count(*) counts tuples, count(column) counts values — null values are removed before an aggregate function is applied, and that difference decides who reaches three repairs.'
      }
    },
    {
      text: {
        de: 'WHERE filtert einzelne Tupel vor der Gruppierung, HAVING filtert danach ganze Gruppen; die Regel „mindestens drei" lässt sich erst prüfen, wenn die Gruppe existiert.',
        en: 'WHERE filters single tuples before the grouping, HAVING filters whole groups afterwards; the "at least three" rule can only be checked once the group exists.'
      }
    },
    {
      text: {
        de: 'Mechaniker ohne jede Reparatur haben überhaupt keine Gruppe und erreichen das Ergebnis daher nie.',
        en: 'Mechanics without any repair have no group at all, so they never reach the result.'
      }
    }
  ],
  grading: {
    kind: 'result-equals',
    ordered: true,
    expectedSql: `
      SELECT m.name, count(r.hours) AS repair_count, sum(r.hours) AS total_hours
      FROM mechanics AS m
      JOIN repairs AS r ON r.mechanic_id = m.id
      GROUP BY m.name
      HAVING count(r.hours) >= 3
      ORDER BY sum(r.hours) DESC, m.name;
    `
  },
  tags: ['group-by', 'having', 'aggregation', 'null']
};
