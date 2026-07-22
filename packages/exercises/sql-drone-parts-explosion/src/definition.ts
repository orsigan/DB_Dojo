import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'sql-drone-parts-explosion',
  topic: ['sql', 'subqueries'],
  difficulty: 'Ultra',
  title: {
    de: 'Stücklistenauflösung der Wetterdrohne',
    en: 'Parts explosion of the weather drone'
  },
  prompt: {
    de: [
      'Diese Aufgabe geht über die Vorlesung hinaus: Eine Stückliste ist ein Baum unbekannter Tiefe, den keine feste Anzahl an Joins durchlaufen kann.',
      '',
      'Die `Weather Drone` ist die Komponente mit id 1. Sie besteht aus Baugruppen, die wiederum aus weiteren Teilen bestehen,',
      'und `assemblies` gibt an, wie viele Kindteile in ein Elternteil eingehen.',
      '',
      'Ermittle, wie viele Stück jedes zugekauften Teils für den Bau einer einzigen Drohne benötigt werden.',
      'Ein zugekauftes Teil ist eine Komponente, die aus nichts anderem zusammengesetzt ist.',
      'Mengen multiplizieren sich entlang eines Pfads, und ein Teil, das über mehrere verschiedene Pfade erreicht wird, wird für jeden davon benötigt.',
      'Komponenten, die gar nicht zur Drohne gehören, dürfen nicht erscheinen.',
      '',
      'Gib `component` und `total_quantity` zurück, sortiert nach `component`.'
    ].join('\n'),
    en: [
      'This one reaches past the lecture: a parts list is a tree of unknown depth, and no fixed number of joins can walk it.',
      '',
      'The `Weather Drone` is the component with id 1. It consists of sub-assemblies, which consist of further parts,',
      'and `assemblies` states how many child parts go into one parent part.',
      '',
      'Work out how many of each purchased part are needed to build one single drone.',
      'A purchased part is a component that is not assembled from anything else.',
      'Quantities multiply along a path, and a part reached through several different paths is needed for each of them.',
      'Components that do not belong to the drone at all must not appear.',
      '',
      'Return `component` and `total_quantity`, ordered by `component`.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS assemblies;
    DROP TABLE IF EXISTS components;

    CREATE TABLE components (
      id integer PRIMARY KEY,
      name text NOT NULL
    );

    CREATE TABLE assemblies (
      parent_id integer NOT NULL REFERENCES components (id),
      child_id integer NOT NULL REFERENCES components (id),
      quantity integer NOT NULL,
      PRIMARY KEY (parent_id, child_id)
    );

    INSERT INTO components (id, name) VALUES
      (1, 'Weather Drone'),
      (2, 'Rotor Assembly'),
      (3, 'Battery Pack'),
      (4, 'Sensor Boom'),
      (5, 'Motor'),
      (6, 'Propeller'),
      (7, 'Screw'),
      (8, 'Cell'),
      (9, 'Humidity Sensor'),
      (10, 'Landing Skid'),
      (11, 'Ground Station'),
      (12, 'Antenna');

    INSERT INTO assemblies (parent_id, child_id, quantity) VALUES
      (1, 2, 4),
      (1, 3, 1),
      (1, 4, 2),
      (1, 7, 8),
      (1, 10, 3),
      (2, 5, 1),
      (2, 6, 2),
      (2, 7, 6),
      (3, 8, 6),
      (4, 9, 1),
      (4, 7, 2),
      (11, 12, 1);
  `,
  starterSql: 'SELECT a.child_id, a.quantity\nFROM assemblies AS a\nWHERE a.parent_id = 1;',
  hints: [
    {
      text: {
        de: 'Ein einfacher Join reicht genau eine Ebene tief. WITH RECURSIVE lässt eine Anfrage ihr eigenes Ergebnis wieder in sich selbst einspeisen, bis keine neuen Zeilen mehr entstehen — genau das durchläuft einen Baum unbekannter Tiefe.',
        en: 'A plain join reaches exactly one level down. WITH RECURSIVE lets a query feed its own result back into itself until no new rows appear, which is what walks a tree of unknown depth.'
      }
    },
    {
      text: {
        de: 'Führe die Menge während des Durchlaufs mit: Jeder Schritt multipliziert die bisher angesammelte Menge mit der Menge der Kante, der du folgst.',
        en: 'Carry the quantity along the walk: every step multiplies the quantity accumulated so far by the quantity of the edge you follow.'
      }
    },
    {
      text: {
        de: 'Der Durchlauf erzeugt eine Zeile pro Pfad, dasselbe Teil taucht also mehrfach auf — summiere diese Zeilen pro Komponente auf und behalte nur Komponenten, die nie als Elternteil vorkommen.',
        en: 'The walk produces one row per path, so the same part shows up several times — add those rows up per component, and keep only components that never appear as a parent.'
      }
    }
  ],
  grading: {
    kind: 'result-equals',
    ordered: true,
    expectedSql: `
      WITH RECURSIVE needed AS (
        SELECT a.child_id AS component_id, a.quantity AS quantity
        FROM assemblies AS a
        WHERE a.parent_id = 1
        UNION ALL
        SELECT a.child_id, n.quantity * a.quantity
        FROM needed AS n
        JOIN assemblies AS a ON a.parent_id = n.component_id
      )
      SELECT c.name AS component, sum(n.quantity) AS total_quantity
      FROM needed AS n
      JOIN components AS c ON c.id = n.component_id
      WHERE NOT EXISTS (
        SELECT 1 FROM assemblies AS a WHERE a.parent_id = n.component_id
      )
      GROUP BY c.name
      ORDER BY c.name;
    `
  },
  tags: ['recursive-cte', 'bill-of-materials', 'aggregation']
};
