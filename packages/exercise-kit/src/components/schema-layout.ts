import type { SchemaInfo, SchemaTable } from '@db-dojo/core';

export const TABLE_WIDTH = 232;
const COLUMNS_PER_ROW = 2;
const HEADER_HEIGHT = 34;
const ROW_HEIGHT = 34;
const FLAG_ROW_HEIGHT = 18;
const FOOTER_PADDING = 8;
const GAP_X = 56;
const GAP_Y = 48;
const PADDING = 20;

export interface PositionedSchemaTable {
  table: SchemaTable;
  x: number;
  y: number;
  width: number;
  height: number;
  collapsed: boolean;
}

export interface EdgeLabel {
  x: number;
  y: number;
  text: string;
}

export interface PositionedSchemaEdge {
  id: string;
  path: string;
  fromLabel: EdgeLabel;
  toLabel: EdgeLabel;
}

export interface SchemaLayout {
  tables: PositionedSchemaTable[];
  edges: PositionedSchemaEdge[];
  width: number;
  height: number;
}

function columnRowHeight(column: SchemaTable['columns'][number]): number {
  const hasFlags = !column.nullable || column.isUnique;
  return hasFlags ? ROW_HEIGHT + FLAG_ROW_HEIGHT : ROW_HEIGHT;
}

function cardHeight(table: SchemaTable, collapsed: boolean): number {
  if (collapsed) {
    return HEADER_HEIGHT;
  }
  const columnsHeight = table.columns.reduce((sum, column) => sum + columnRowHeight(column), 0);
  return HEADER_HEIGHT + columnsHeight + FOOTER_PADDING;
}

export function layoutSchema(
  schema: SchemaInfo,
  collapsed: ReadonlySet<string>,
  positionOverrides?: ReadonlyMap<string, { x: number; y: number }>
): SchemaLayout {
  const rows: SchemaTable[][] = [];
  schema.tables.forEach((table, index) => {
    const rowIndex = Math.floor(index / COLUMNS_PER_ROW);
    rows[rowIndex] ??= [];
    rows[rowIndex].push(table);
  });

  const placed = new Map<string, PositionedSchemaTable>();
  let y = PADDING;
  let maxWidth = 0;
  let maxHeight = 0;

  for (const row of rows) {
    let rowHeight = 0;
    row.forEach((table, columnIndex) => {
      const isCollapsed = collapsed.has(table.name);
      const height = cardHeight(table, isCollapsed);
      rowHeight = Math.max(rowHeight, height);
      const override = positionOverrides?.get(table.name);
      const x = override?.x ?? PADDING + columnIndex * (TABLE_WIDTH + GAP_X);
      const cardY = override?.y ?? y;
      maxWidth = Math.max(maxWidth, x + TABLE_WIDTH);
      maxHeight = Math.max(maxHeight, cardY + height);
      placed.set(table.name, {
        table,
        x,
        y: cardY,
        width: TABLE_WIDTH,
        height,
        collapsed: isCollapsed
      });
    });
    y += rowHeight + GAP_Y;
  }

  const width = maxWidth + PADDING;
  const height = rows.length === 0 ? 0 : Math.max(y - GAP_Y, maxHeight) + PADDING;

  const edges: PositionedSchemaEdge[] = [];
  schema.foreignKeys.forEach((fk, index) => {
    const from = placed.get(fk.table);
    const to = placed.get(fk.referencedTable);
    if (!from || !to) {
      return;
    }

    const fromAnchor = columnAnchor(from, fk.column);
    const toAnchor = columnAnchor(to, fk.referencedColumn);
    const goingRight = fromAnchor.x <= toAnchor.x;

    const start = {
      x: goingRight ? from.x + from.width : from.x,
      y: fromAnchor.y
    };
    const end = {
      x: goingRight ? to.x : to.x + to.width,
      y: toAnchor.y
    };

    edges.push({
      id: `${fk.table}.${fk.column}->${fk.referencedTable}.${fk.referencedColumn}:${index}`,
      path: edgePath(start.x, start.y, end.x, end.y),
      fromLabel: { x: start.x + (goingRight ? 10 : -10), y: start.y - 6, text: 'n' },
      toLabel: { x: end.x + (goingRight ? -10 : 10), y: end.y - 6, text: '1' }
    });
  });

  return { tables: [...placed.values()], edges, width, height };
}

function columnAnchor(
  positioned: PositionedSchemaTable,
  columnName: string
): { x: number; y: number } {
  const centerX = positioned.x + positioned.width / 2;
  if (positioned.collapsed) {
    return { x: centerX, y: positioned.y + HEADER_HEIGHT / 2 };
  }
  const columns = positioned.table.columns;
  const rowIndex = columns.findIndex((column) => column.name === columnName);
  const safeIndex = rowIndex === -1 ? 0 : rowIndex;
  const offsetBefore = columns
    .slice(0, safeIndex)
    .reduce((sum, column) => sum + columnRowHeight(column), 0);
  const targetColumn = columns[safeIndex];
  const rowHeight = targetColumn ? columnRowHeight(targetColumn) : ROW_HEIGHT;
  return {
    x: centerX,
    y: positioned.y + HEADER_HEIGHT + offsetBefore + rowHeight / 2
  };
}

function edgePath(x1: number, y1: number, x2: number, y2: number): string {
  const bend = Math.max(50, Math.abs(x2 - x1) / 2);
  const c1x = x1 <= x2 ? x1 + bend : x1 - bend;
  const c2x = x1 <= x2 ? x2 - bend : x2 + bend;
  return `M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}`;
}
