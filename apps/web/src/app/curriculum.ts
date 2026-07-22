export interface Chapter {
  id: string;
  title: string;
  summary?: string;
  requires?: string[];
  exerciseIds: string[];
  children: Chapter[];
}

export const curriculum: Chapter[] = [
  {
    id: 'fundamentals',
    title: 'Fundamentals',
    summary: 'What is a database? DBMS, history, structured/semi-structured/unstructured data.',
    exerciseIds: [],
    children: []
  },
  {
    id: 'sql-uml',
    title: 'SQL / UML',
    summary: 'SQL commands, permission management, ER modeling and the relational model.',
    requires: ['fundamentals'],
    exerciseIds: [],
    children: [
      {
        id: 'sql-uml-ddl',
        title: 'Schema Definition (DDL)',
        summary: 'CREATE, ALTER and DROP; constraints and foreign keys.',
        exerciseIds: [
          'ddl-create-library-book-table',
          'ddl-workshop-repair-order-constraints',
          'ddl-bike-rental-fleet-alter',
          'ddl-airport-gate-foreign-key',
          'ddl-museum-scan-truncate',
          'ddl-flight-crew-composite-key',
          'ddl-hospital-referential-actions',
          'ddl-vineyard-schema-migration',
          'ddl-observatory-booking-guardrails'
        ],
        children: []
      },
      {
        id: 'sql-uml-dml',
        title: 'Data Manipulation (DML)',
        summary: 'INSERT, UPDATE and DELETE.',
        requires: ['sql-uml-ddl'],
        exerciseIds: [
          'dml-insert-library-loans',
          'dml-update-workshop-labour-rates',
          'dml-delete-expired-locker-rentals',
          'dml-insert-brewery-tasting-queue',
          'dml-update-bike-winter-tariff',
          'dml-delete-cancelled-flight-standby',
          'dml-insert-museum-restoration-queue',
          'dml-update-greenhouse-moisture-summary',
          'dml-delete-duplicate-star-readings',
          'dml-warehouse-delivery-reconciliation'
        ],
        children: []
      },
      {
        id: 'sql-uml-queries',
        title: 'Queries (SELECT & Joins)',
        summary: 'SELECT, WHERE, joins, grouping and subqueries.',
        requires: ['sql-uml-dml'],
        exerciseIds: [
          'sql-brewery-beer-styles',
          'sql-library-shelf-search',
          'sql-bike-rental-price-list',
          'sql-orders-per-customer',
          'sql-airport-gates-without-departures',
          'sql-workshop-repair-hours',
          'sql-festival-single-stage-artists',
          'sql-museum-guide-language-pairs',
          'sql-vineyard-best-lot-per-region',
          'sql-clinic-fully-certified-nurses',
          'sql-drone-parts-explosion',
          'sql-longest-login-streak'
        ],
        children: []
      },
      {
        id: 'sql-uml-permissions',
        title: 'Permissions',
        summary: 'GRANT, REVOKE and role-based access control.',
        requires: ['sql-uml-queries'],
        exerciseIds: [
          'permissions-nurse-vitals-write',
          'permissions-revoke-intern-write',
          'permissions-public-opening-hours',
          'permissions-analyst-read-access',
          'permissions-column-level-personnel',
          'permissions-warehouse-admin-all',
          'permissions-view-shields-drafts',
          'permissions-revoke-cascade-contractor',
          'permissions-grant-option-audit-chain',
          'permissions-role-hierarchy-school',
          'permissions-default-privileges-analytics'
        ],
        children: []
      },
      {
        id: 'sql-uml-er-modeling',
        title: 'ER Modeling & UML',
        summary: 'Entities, relationships and translating diagrams into schemas.',
        exerciseIds: [],
        children: []
      }
    ]
  },
  {
    id: 'database-data-structures',
    title: 'Database Data Structures',
    summary: 'Storage structures and indexes.',
    requires: ['sql-uml'],
    exerciseIds: ['ddl-brewery-batch-indexes'],
    children: []
  },
  {
    id: 'application-automation',
    title: 'Application Automation',
    summary: 'Triggers, stored procedures, views.',
    requires: ['sql-uml'],
    exerciseIds: [],
    children: [
      {
        id: 'application-automation-views',
        title: 'Views',
        summary: 'Virtual tables over existing queries.',
        requires: ['sql-uml-queries'],
        exerciseIds: [
          'views-library-public-catalogue',
          'views-brewery-active-batches',
          'views-airport-departure-board',
          'views-clinic-ward-occupancy',
          'views-festival-crew-privacy',
          'views-garage-staff-generalisation',
          'views-museum-partition-model',
          'views-vineyard-harvest-snapshot',
          'views-depot-updatable-roster',
          'views-observatory-instead-of-insert'
        ],
        children: []
      },
      {
        id: 'application-automation-plpgsql',
        title: 'Stored Procedures & PL/pgSQL',
        summary: 'Blocks, control flow, functions and cursors.',
        requires: ['sql-uml-queries'],
        exerciseIds: [
          'plpgsql-library-late-fee',
          'plpgsql-brewery-bottling-slots',
          'plpgsql-airport-gate-lookup',
          'plpgsql-workshop-repair-tier',
          'plpgsql-clinic-checkin-procedure',
          'plpgsql-ferry-crossing-manifest',
          'plpgsql-greenhouse-hot-streak',
          'plpgsql-vineyard-barrel-grading',
          'plpgsql-observatory-slot-plan',
          'plpgsql-warehouse-fifo-picking'
        ],
        children: []
      },
      {
        id: 'application-automation-triggers',
        title: 'Integrity & Triggers',
        summary: 'Semantic constraints and what only a trigger can enforce.',
        requires: ['application-automation-plpgsql', 'application-automation-views'],
        exerciseIds: [
          'integrity-roastery-batch-limits',
          'integrity-bakery-code-normalizer',
          'integrity-shelter-adoption-audit',
          'integrity-driving-school-lesson-rules',
          'integrity-gallery-no-price-cut',
          'integrity-postal-sorting-stats',
          'integrity-broadcast-slot-clash',
          'integrity-substation-status-log',
          'integrity-hostel-instead-of-update',
          'integrity-ledger-deferred-balance'
        ],
        children: []
      }
    ]
  },
  {
    id: 'concurrency-multi-user',
    title: 'Concurrency & Multi-User Operation',
    summary:
      'Transactions, rollbacks, logs, dirty/nonrepeatable/phantom reads, lost updates, serializability.',
    requires: ['sql-uml'],
    exerciseIds: [],
    children: []
  }
];
