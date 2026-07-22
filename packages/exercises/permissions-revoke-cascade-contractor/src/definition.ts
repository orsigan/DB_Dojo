import type { Exercise } from '@db-dojo/core';

export const definition: Exercise = {
  id: 'permissions-revoke-cascade-contractor',
  topic: ['permissions'],
  difficulty: 'Profi',
  title: { de: 'Eine ganze Kette von Rechten entziehen', en: 'Revoking a whole chain of grants' },
  prompt: {
    de: [
      'Der Data Steward der Forschungsgruppe durfte Lesezugriff auf `measurements` weitergeben und hat das auch getan: `field_contractor` hat sein SELECT vom Steward erhalten, nicht von dir.',
      'Der Steward hat das Projekt inzwischen verlassen.',
      '',
      'Entziehe `data_steward` das SELECT auf `measurements` und, in derselben Anweisung, alles, was von dort aus weitergegeben wurde.',
      'Ein einfaches REVOKE verweigert hier die Ausführung, weil noch ein Recht existiert, das von dem entzogenen Recht abhängt.',
      '',
      'Die Rolle `lab_reader` hat ihr SELECT direkt von dir erhalten und muss es behalten. Alle drei Rollen und die Tabelle selbst müssen danach noch existieren.'
    ].join('\n'),
    en: [
      'The data steward of the research group was allowed to pass on read access to `measurements` and used that right: `field_contractor` got its SELECT from the steward, not from you.',
      'The steward has now left the project.',
      '',
      'Remove SELECT on `measurements` from `data_steward` and, in the same statement, everything that was handed on from there.',
      'A plain REVOKE refuses to run here, because a privilege that depends on the one you are revoking still exists.',
      '',
      'The role `lab_reader` received its SELECT directly from you and must keep it. All three roles and the table itself must still exist afterwards.'
    ].join('\n')
  },
  seedSql: `
    DROP TABLE IF EXISTS measurements;
    DROP ROLE IF EXISTS data_steward;
    DROP ROLE IF EXISTS field_contractor;
    DROP ROLE IF EXISTS lab_reader;

    CREATE ROLE data_steward;
    CREATE ROLE field_contractor;
    CREATE ROLE lab_reader;

    CREATE TABLE measurements (
      id integer PRIMARY KEY,
      station text NOT NULL,
      taken_at timestamp NOT NULL,
      ph numeric(4, 2) NOT NULL,
      nitrate_mg_l numeric(6, 2) NOT NULL
    );

    INSERT INTO measurements (id, station, taken_at, ph, nitrate_mg_l) VALUES
      (1, 'Weserufer', '2026-05-03 07:00', 7.31, 12.40),
      (2, 'Weserufer', '2026-05-10 07:00', 7.28, 13.10),
      (3, 'Ochtummuendung', '2026-05-03 08:15', 6.94, 21.70),
      (4, 'Ochtummuendung', '2026-05-10 08:15', 7.02, 19.85),
      (5, 'Hafenbecken III', '2026-05-11 06:40', 7.55, 8.20);

    GRANT SELECT ON measurements TO lab_reader;
    GRANT SELECT ON measurements TO data_steward WITH GRANT OPTION;

    SET ROLE data_steward;
    GRANT SELECT ON measurements TO field_contractor;
    RESET ROLE;
  `,
  starterSql: [
    'SELECT grantor, grantee, privilege_type, is_grantable',
    'FROM information_schema.role_table_grants',
    "WHERE table_name = 'measurements';"
  ].join('\n'),
  hints: [
    {
      text: {
        de: 'REVOKE verhält sich standardmäßig wie RESTRICT: Es bricht ab, solange noch jemand ein Recht besitzt, das von der entzogenen Rolle weitergegeben wurde.',
        en: 'REVOKE behaves like RESTRICT by default: it aborts as long as somebody still holds a privilege that was passed on from the role you are revoking.'
      }
    },
    {
      text: {
        de: 'Die andere Option folgt der Kette der Rechtevergaben und nimmt jedes Recht zurück, das von dem entzogenen abhängt.',
        en: 'The other option follows the chain of grants and takes back every privilege that depends on the one being revoked.'
      }
    },
    {
      text: {
        de: 'Nur Rechte, die von data_steward ausgingen, sind betroffen — ein direkt vom Tabelleneigentümer vergebenes Recht hat mit dieser Kette nichts zu tun und bleibt bestehen.',
        en: 'Only privileges that originated from data_steward are affected — a grant issued directly by the table owner has nothing to do with that chain and survives.'
      }
    }
  ],
  grading: {
    kind: 'assertions',
    checks: [
      {
        label: {
          de: 'data_steward hat seinen Lesezugriff verloren',
          en: 'data_steward lost its read access'
        },
        sql: "SELECT NOT has_table_privilege('data_steward', 'measurements', 'SELECT') AS ok;"
      },
      {
        label: {
          de: 'field_contractor hat den vom Steward erhaltenen Zugriff verloren',
          en: 'field_contractor lost the access it got from the steward'
        },
        sql: "SELECT NOT has_table_privilege('field_contractor', 'measurements', 'SELECT') AS ok;"
      },
      {
        label: {
          de: 'lab_reader behält den direkt vom Eigentümer vergebenen Zugriff',
          en: 'lab_reader keeps the access granted directly by the owner'
        },
        sql: "SELECT has_table_privilege('lab_reader', 'measurements', 'SELECT') AS ok;"
      },
      {
        label: { de: 'Keine Rolle wurde gelöscht', en: 'No role was dropped' },
        sql: `
          SELECT count(*) = 3 AS ok
          FROM pg_roles
          WHERE rolname IN ('data_steward', 'field_contractor', 'lab_reader');
        `
      },
      {
        label: {
          de: 'Die Messwerte selbst sind unangetastet',
          en: 'The measurements themselves are untouched'
        },
        sql: 'SELECT count(*) = 5 AS ok FROM measurements;'
      }
    ]
  },
  tags: ['revoke', 'cascade', 'grant-option']
};
