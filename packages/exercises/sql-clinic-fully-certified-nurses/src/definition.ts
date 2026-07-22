import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'sql-clinic-fully-certified-nurses',
  topic: ['sql', 'subqueries'],
  difficulty: 'Profi',
  title: {
    de: 'Pflegekräfte, die für die Nachtschicht freigegeben sind',
    en: 'Nurses cleared for the night shift'
  },
  prompt: {
    de: [
      'Die Nachtschicht darf nur mit Pflegekräften besetzt werden, die für den kompletten Katalog an Verfahren freigegeben sind.',
      '',
      'Eine Pflegekraft qualifiziert sich, wenn es kein Verfahren in `procedures` gibt, für das sie keine Zertifizierung besitzt.',
      'Eine einzige fehlende Zertifizierung reicht aus, um eine Pflegekraft zu disqualifizieren, und der Katalog kann jederzeit wachsen,',
      'die Abfrage darf also nicht davon abhängen, wie viele Verfahren es aktuell gibt.',
      '',
      'Gib `name` zurück, sortiert nach `name`.'
    ].join('\n'),
    en: [
      'The night shift may only be staffed by nurses who are cleared for the complete catalogue of procedures.',
      '',
      'A nurse qualifies when there is no procedure in `procedures` for which they hold no certification.',
      'One missing certification is enough to disqualify a nurse, and the catalogue may grow at any time,',
      'so the query must not depend on how many procedures there currently are.',
      '',
      'Return `name`, ordered by `name`.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS certifications;
    DROP TABLE IF EXISTS procedures;
    DROP TABLE IF EXISTS nurses;

    CREATE TABLE nurses (
      id integer PRIMARY KEY,
      name text NOT NULL
    );

    CREATE TABLE procedures (
      code text PRIMARY KEY,
      name text NOT NULL
    );

    CREATE TABLE certifications (
      nurse_id integer NOT NULL REFERENCES nurses (id),
      procedure_code text NOT NULL REFERENCES procedures (code),
      PRIMARY KEY (nurse_id, procedure_code)
    );

    INSERT INTO nurses (id, name) VALUES
      (1, 'Ada Kern'),
      (2, 'Bruno Sanz'),
      (3, 'Cleo Marsh'),
      (4, 'Dev Rao'),
      (5, 'Eve Lang');

    INSERT INTO procedures (code, name) VALUES
      ('ECG', 'Electrocardiogram'),
      ('IV', 'Infusion therapy'),
      ('VENT', 'Ventilator care'),
      ('WOUND', 'Wound care');

    INSERT INTO certifications (nurse_id, procedure_code) VALUES
      (1, 'ECG'),
      (1, 'IV'),
      (1, 'VENT'),
      (1, 'WOUND'),
      (2, 'ECG'),
      (2, 'IV'),
      (2, 'VENT'),
      (3, 'WOUND'),
      (3, 'VENT'),
      (3, 'IV'),
      (3, 'ECG'),
      (5, 'ECG');
  `,
  starterSql: 'SELECT n.name\nFROM nurses AS n\nJOIN certifications AS c ON c.nurse_id = n.id;',
  hints: [
    {
      text: {
        de: '„Für alle Verfahren zertifiziert" lässt sich leichter umgekehrt ausdrücken: Es darf kein Verfahren geben, das in den Zertifizierungen der Pflegekraft fehlt.',
        en: '"Certified for all procedures" is easier to express the other way round: there must be no procedure that is missing from the nurse\'s certifications.'
      }
    },
    {
      text: {
        de: 'Diese doppelte Verneinung wird zu zwei verschachtelten NOT-EXISTS-Blöcken — der innere fragt, ob diese Pflegekraft genau diese eine Zertifizierung besitzt, der äußere, ob irgendein Verfahren diesen Test nicht besteht.',
        en: 'That double negation becomes two nested NOT EXISTS blocks — the inner one asks whether this nurse holds this one certification, the outer one whether any procedure failed that test.'
      }
    },
    {
      text: {
        de: 'Eine Pflegekraft ohne eine einzige Zertifizierung muss trotzdem berücksichtigt werden — ein Join mit certifications in der äußeren Anfrage würde sie schon verlieren.',
        en: 'A nurse without a single certification must still be considered, so joining certifications in the outer query would already lose them.'
      }
    }
  ],
  grading: {
    kind: 'result-equals',
    ordered: true,
    expectedSql: `
      SELECT n.name
      FROM nurses AS n
      WHERE NOT EXISTS (
        SELECT 1
        FROM procedures AS p
        WHERE NOT EXISTS (
          SELECT 1
          FROM certifications AS c
          WHERE c.nurse_id = n.id AND c.procedure_code = p.code
        )
      )
      ORDER BY n.name;
    `
  },
  tags: ['not-exists', 'division', 'subquery']
};
