import type { SchemaInfo } from '@db-dojo/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ExerciseHostApi } from '../contract';
import { usePanZoom } from '../use-pan-zoom';
import { layoutSchema, type PositionedSchemaTable, TABLE_WIDTH } from './schema-layout';

const EMPTY_SET: ReadonlySet<string> = new Set();
const MIN_SCALE = 0.4;
const MAX_SCALE = 2;
const ZOOM_STEP = 0.15;

export const SCHEMA_GROW_TABLE_THRESHOLD = 6;
const SCHEMA_VIEWPORT_MIN_HEIGHT = 420;
const SCHEMA_VIEWPORT_MAX_HEIGHT = 1000;
const SCHEMA_VIEWPORT_HEIGHT_PER_TABLE = 70;

export function schemaViewportMinHeight(tableCount: number): number {
  if (tableCount <= SCHEMA_GROW_TABLE_THRESHOLD) {
    return SCHEMA_VIEWPORT_MIN_HEIGHT;
  }
  return Math.min(
    SCHEMA_VIEWPORT_MAX_HEIGHT,
    SCHEMA_VIEWPORT_MIN_HEIGHT +
      (tableCount - SCHEMA_GROW_TABLE_THRESHOLD) * SCHEMA_VIEWPORT_HEIGHT_PER_TABLE
  );
}

export function SchemaPanel({ host }: { host: ExerciseHostApi }) {
  const [schema, setSchema] = useState<SchemaInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => {
    let active = true;
    host.introspectSchema().then((outcome) => {
      if (!active) {
        return;
      }
      if (outcome.success) {
        setSchema(outcome.value);
        setError(null);
      } else {
        setError(outcome.error.message);
      }
    });
    return () => {
      active = false;
    };
  }, [host]);

  const layout = useMemo(
    () => (schema ? layoutSchema(schema, collapsed, positions) : null),
    [schema, collapsed, positions]
  );

  const foreignKeysByTable = useMemo(() => {
    const byTable = new Map<string, Set<string>>();
    for (const fk of schema?.foreignKeys ?? []) {
      const columns = byTable.get(fk.table) ?? new Set<string>();
      columns.add(fk.column);
      byTable.set(fk.table, columns);
    }
    return byTable;
  }, [schema]);

  const panZoom = usePanZoom({ min: MIN_SCALE, max: MAX_SCALE, step: ZOOM_STEP });

  const startTableDrag = useCallback(
    (tableName: string, origin: { x: number; y: number }, event: React.PointerEvent) => {
      event.stopPropagation();
      const startX = event.clientX;
      const startY = event.clientY;

      const handleMove = (moveEvent: PointerEvent) => {
        setPositions((prev) => {
          const next = new Map(prev);
          next.set(tableName, {
            x: origin.x + (moveEvent.clientX - startX) / panZoom.scale,
            y: origin.y + (moveEvent.clientY - startY) / panZoom.scale
          });
          return next;
        });
      };
      const handleUp = () => {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
      };

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    },
    [panZoom.scale]
  );

  const toggle = (tableName: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(tableName)) {
        next.delete(tableName);
      } else {
        next.add(tableName);
      }
      return next;
    });
  };

  const expandAll = useCallback(() => setCollapsed(new Set()), []);
  const collapseAll = useCallback(() => {
    setCollapsed(new Set(schema?.tables.map((table) => table.name) ?? []));
  }, [schema]);

  if (error) {
    return (
      <aside className="schema-panel">
        <p className="error">{error}</p>
      </aside>
    );
  }

  if (!layout || layout.tables.length === 0) {
    return (
      <aside className="schema-panel">
        <p className="muted schema-panel-empty">
          {schema ? 'This exercise has no tables yet.' : 'Loading schema…'}
        </p>
      </aside>
    );
  }

  return (
    <aside className="schema-panel">
      <div className="schema-panel-head">
        <h3>Schema</h3>
        <span className="muted">
          {layout.tables.length} {layout.tables.length === 1 ? 'table' : 'tables'}
        </span>
      </div>

      <div className="schema-toolbar">
        <div className="schema-toolbar-group">
          <button type="button" onClick={expandAll}>
            Expand all
          </button>
          <button type="button" onClick={collapseAll}>
            Collapse all
          </button>
        </div>
        <div className="schema-toolbar-group">
          <button type="button" aria-label="Zoom out" onClick={panZoom.zoomOut}>
            −
          </button>
          <span className="schema-zoom-value">{Math.round(panZoom.scale * 100)}%</span>
          <button type="button" aria-label="Zoom in" onClick={panZoom.zoomIn}>
            +
          </button>
          <button type="button" onClick={panZoom.reset}>
            Reset
          </button>
        </div>
      </div>

      <div
        ref={panZoom.viewportRef}
        className={panZoom.dragging ? 'schema-viewport dragging' : 'schema-viewport'}
        style={{ minHeight: schemaViewportMinHeight(layout.tables.length) }}
        onPointerDown={panZoom.onPointerDown}
      >
        <div
          className="schema-canvas"
          style={{
            width: layout.width,
            height: layout.height,
            transform: `translate(${panZoom.pan.x}px, ${panZoom.pan.y}px) scale(${panZoom.scale})`,
            transformOrigin: 'top left'
          }}
        >
          <svg
            className="schema-edges"
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            width={layout.width}
            height={layout.height}
            aria-hidden="true"
          >
            {layout.edges.map((edge) => (
              <g key={edge.id}>
                <path d={edge.path} className="schema-edge" />
                <text x={edge.fromLabel.x} y={edge.fromLabel.y} className="schema-edge-label">
                  {edge.fromLabel.text}
                </text>
                <text x={edge.toLabel.x} y={edge.toLabel.y} className="schema-edge-label">
                  {edge.toLabel.text}
                </text>
              </g>
            ))}
          </svg>

          {layout.tables.map((positioned) => (
            <SchemaTableCard
              key={positioned.table.name}
              positioned={positioned}
              foreignKeyColumns={foreignKeysByTable.get(positioned.table.name) ?? EMPTY_SET}
              onToggle={() => toggle(positioned.table.name)}
              onDragStart={(event) =>
                startTableDrag(positioned.table.name, { x: positioned.x, y: positioned.y }, event)
              }
            />
          ))}
        </div>
      </div>

      <div className="schema-legend">
        <span>
          <span className="schema-badge pk">PK</span> primary key
        </span>
        <span>
          <span className="schema-badge fk">FK</span> foreign key
        </span>
        <span>1 — n: one row references many</span>
      </div>
    </aside>
  );
}

function SchemaTableCard({
  positioned,
  foreignKeyColumns,
  onToggle,
  onDragStart
}: {
  positioned: PositionedSchemaTable;
  foreignKeyColumns: ReadonlySet<string>;
  onToggle: () => void;
  onDragStart: (event: React.PointerEvent) => void;
}) {
  const { table, collapsed } = positioned;

  return (
    <div
      className={collapsed ? 'schema-table collapsed' : 'schema-table'}
      style={{
        left: positioned.x,
        top: positioned.y,
        width: TABLE_WIDTH,
        height: positioned.height
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="schema-table-head">
        <span className="schema-table-grip" aria-hidden="true" onPointerDown={onDragStart}>
          ⠿
        </span>
        <button
          type="button"
          className="schema-table-toggle"
          onClick={onToggle}
          aria-expanded={!collapsed}
        >
          <span className={collapsed ? 'schema-table-chevron' : 'schema-table-chevron open'}>
            ›
          </span>
          <span className="schema-table-name" title={table.name}>
            {table.name}
          </span>
          <span className="muted">{table.columns.length}</span>
        </button>
      </div>

      {!collapsed && (
        <div className="schema-table-columns">
          {table.columns.map((column) => (
            <div key={column.name} className="schema-column">
              <div className="schema-column-main">
                <span className="schema-column-badges">
                  {column.isPrimaryKey && <span className="schema-badge pk">PK</span>}
                  {foreignKeyColumns.has(column.name) && (
                    <span className="schema-badge fk">FK</span>
                  )}
                </span>
                <span
                  className={column.isPrimaryKey ? 'schema-column-name pk' : 'schema-column-name'}
                  title={column.name}
                >
                  {column.name}
                </span>
                <span className="schema-column-type">{column.dataType}</span>
              </div>
              {(!column.nullable || column.isUnique) && (
                <div className="schema-column-flags">
                  {!column.nullable && <span>NOT NULL</span>}
                  {column.isUnique && <span>UNIQUE</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
