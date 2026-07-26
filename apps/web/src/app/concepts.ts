export interface ConceptFilter {
  tag: string;
  label: string;
}

export const conceptFilters: ConceptFilter[] = [
  { tag: 'alter-table', label: 'ALTER TABLE' },
  { tag: 'foreign-key', label: 'Foreign Key' },
  { tag: 'index', label: 'Index' },
  { tag: 'constraint', label: 'Constraint' },
  { tag: 'insert', label: 'INSERT' },
  { tag: 'update', label: 'UPDATE' },
  { tag: 'delete', label: 'DELETE' },
  { tag: 'select', label: 'SELECT' },
  { tag: 'where', label: 'WHERE' },
  { tag: 'join', label: 'JOIN' },
  { tag: 'group-by', label: 'GROUP BY' },
  { tag: 'aggregation', label: 'Aggregation' },
  { tag: 'subquery', label: 'Subquery' },
  { tag: 'create-view', label: 'View' },
  { tag: 'function', label: 'PL/pgSQL' },
  { tag: 'trigger', label: 'Trigger' },
  { tag: 'grant', label: 'GRANT / Permissions' },
  { tag: 'uml', label: 'UML' },
  { tag: 'relational-model', label: 'Relational Model' },
  { tag: 'normalization', label: 'Normalization' }
];
