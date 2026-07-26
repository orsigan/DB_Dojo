export interface TopicMeta {
  label?: string;
  order?: number;
  summary?: string;
  requires?: string[];
}

export const topics: Record<string, TopicMeta> = {
  ddl: {
    label: 'DDL',
    order: 0,
    summary: 'Create, change and drop structure.'
  },
  'ddl/create-table': { label: 'CREATE TABLE', order: 0 },
  'ddl/constraints': { label: 'Constraints', order: 1, requires: ['ddl/create-table'] },
  'ddl/foreign-keys': { label: 'Foreign Keys', order: 2, requires: ['ddl/constraints'] },
  'ddl/alter-drop': { label: 'ALTER & DROP', order: 3, requires: ['ddl/create-table'] },
  'ddl/indexes': { label: 'Indexes', order: 4, requires: ['ddl/create-table'] },

  dml: {
    label: 'DML',
    order: 1,
    summary: 'Insert, change and delete data.',
    requires: ['ddl']
  },
  'dml/insert': { label: 'INSERT', order: 0 },
  'dml/update': { label: 'UPDATE', order: 1 },
  'dml/delete': { label: 'DELETE', order: 2 },

  sql: { label: 'SQL', order: 2, summary: 'Queries, Joins, Aggregations.', requires: ['dml'] },
  'sql/select': { label: 'SELECT', order: 0 },
  'sql/where': { label: 'WHERE', order: 1, requires: ['sql/select'] },
  'sql/joins': { label: 'Joins', order: 2, requires: ['sql/where'] },
  'sql/aggregation': { label: 'Aggregation', order: 3, requires: ['sql/joins'] },
  'sql/subqueries': { label: 'Subqueries', order: 4, requires: ['sql/aggregation'] },

  views: {
    label: 'Views',
    order: 3,
    summary: 'Virtual tables over existing queries.',
    requires: ['sql']
  },
  'views/updatable': { label: 'Updatable Views', order: 0 },

  plpgsql: {
    label: 'PL/pgSQL',
    order: 4,
    summary: 'Functions, Stored Procedures, Cursors.',
    requires: ['sql']
  },
  'plpgsql/control-flow': { label: 'Control Flow', order: 0 },
  'plpgsql/functions': { label: 'Functions', order: 1 },
  'plpgsql/cursors': { label: 'Cursors', order: 2, requires: ['plpgsql/functions'] },

  integrity: {
    label: 'Integrity & Triggers',
    order: 5,
    summary: 'Semantic constraints and triggers.',
    requires: ['plpgsql']
  },
  'integrity/constraints': { label: 'Constraints', order: 0 },
  'integrity/triggers': { label: 'Triggers', order: 1, requires: ['integrity/constraints'] },

  indexing: {
    label: 'Indexes',
    order: 6,
    summary: 'Choose fitting indexes and check their impact.',
    requires: ['sql']
  },
  permissions: {
    label: 'Permissions',
    order: 7,
    summary: 'Roles, GRANT & REVOKE.',
    requires: ['sql']
  },
  'permissions/roles': { label: 'Role Hierarchies', order: 0 },

  modelling: {
    label: 'Modelling',
    order: 8,
    summary: 'Draw UML diagrams, map them to tables and normalise them.'
  },
  'modelling/uml': { label: 'UML Class Diagrams', order: 0 },
  'modelling/relational': {
    label: 'Relational Model',
    order: 1,
    requires: ['modelling/uml']
  },
  'modelling/normalization': {
    label: 'Normalization',
    order: 2,
    requires: ['modelling/relational']
  }
};

export function topicKey(path: string[]): string {
  return path.join('/');
}

export function topicLabel(path: string[]): string {
  const meta = topics[topicKey(path)];
  if (meta?.label) {
    return meta.label;
  }
  const last = path[path.length - 1] ?? '';
  return titleCase(last);
}

export function topicSummary(path: string[]): string | undefined {
  return topics[topicKey(path)]?.summary;
}

export function topicOrder(path: string[]): number {
  return topics[topicKey(path)]?.order ?? 0;
}

export function topicRequires(path: string[]): string[] {
  return topics[topicKey(path)]?.requires ?? [];
}

function titleCase(segment: string): string {
  return segment
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
