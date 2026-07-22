import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'sql-aquarium-water-metrics',
  topic: ['sql', 'select'],
  difficulty: 'Beginner',
  title: {
    de: 'Wasserwerte im Aquarium umrechnen',
    en: 'Converting aquarium water readings'
  },
  prompt: {
    de: [
      'Das öffentliche Aquarium misst regelmäßig die Wasserwerte seiner Becken, aber die Rohdaten',
      'sind für die Anzeige am Infoterminal noch nicht aufbereitet.',
      '',
      'Gib für jedes Becken diese Spalten zurück:',
      '',
      '- `tank_code` — der Code des Beckens',
      '- `tank_label` — Tierart und Code zu einem Label wie `Clownfish (A1)` zusammengefügt',
      '- `temp_fahrenheit` — die gemessene Temperatur, umgerechnet von Celsius in Fahrenheit',
      '- `species_code` — die ersten drei Buchstaben des Artnamens',
      '',
      'Sortiere nach `tank_code`.'
    ].join('\n'),
    en: [
      'The public aquarium regularly measures the water readings of its tanks, but the raw data',
      "isn't prepared for display on the info terminal yet.",
      '',
      'Return these columns for every tank:',
      '',
      "- `tank_code` — the tank's code",
      '- `tank_label` — the species and code combined into a label like `Clownfish (A1)`',
      '- `temp_fahrenheit` — the measured temperature, converted from Celsius to Fahrenheit',
      '- `species_code` — the first three letters of the species name',
      '',
      'Order by `tank_code`.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS tank_reading;

    CREATE TABLE tank_reading (
      reading_id integer PRIMARY KEY,
      tank_code text NOT NULL,
      species text NOT NULL,
      temperature_c numeric NOT NULL
    );

    INSERT INTO tank_reading (reading_id, tank_code, species, temperature_c) VALUES
      (1, 'A1', 'Clownfish', 25),
      (2, 'A2', 'Seahorse', 20),
      (3, 'B1', 'Moray Eel', 25),
      (4, 'B2', 'Octopus', 15),
      (5, 'C1', 'Stingray', 30);
  `,
  starterSql: 'SELECT tank_code, species, temperature_c\nFROM tank_reading;',
  hints: [
    {
      text: {
        de: 'temperature_c ist ein numerischer Wert — die Umrechnung in Fahrenheit braucht die arithmetischen Operatoren * und /, keine Zeichenkettenfunktionen.',
        en: 'temperature_c is a numeric value — converting it to Fahrenheit needs the arithmetic operators * and /, not string functions.'
      }
    },
    {
      text: {
        de: 'species ist eine Zeichenkette — ein Kürzel daraus entsteht mit substring(... from ... for ...), ein Label aus zwei Werten mit ||; beides hat mit Zahlenoperatoren nichts zu tun.',
        en: 'species is a string — pulling a short code out of it needs substring(... from ... for ...), and joining two values into a label needs ||; neither has anything to do with the numeric operators.'
      }
    }
  ],
  grading: {
    kind: 'result-equals',
    ordered: true,
    expectedSql: `
      SELECT
        tank_code,
        species || ' (' || tank_code || ')' AS tank_label,
        temperature_c * 9 / 5 + 32 AS temp_fahrenheit,
        substring(species from 1 for 3) AS species_code
      FROM tank_reading
      ORDER BY tank_code;
    `
  },
  tags: ['scalar-expressions', 'arithmetic', 'concatenation', 'substring', 'alias']
};
