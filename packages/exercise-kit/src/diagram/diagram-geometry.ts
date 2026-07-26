import type { Diagram, DiagramEdge, DiagramNode } from '@db-dojo/core';

export const NODE_WIDTH = 220;
export const NODE_HEADER_HEIGHT = 38;
export const ATTRIBUTE_ROW_HEIGHT = 28;
export const NODE_FOOTER_HEIGHT = 34;
export const CANVAS_WIDTH = 2600;
export const CANVAS_HEIGHT = 1800;
export const EDGE_HIT_DISTANCE = 12;

const STUB_LENGTH = 22;
const SELF_LOOP_REACH = 56;
const LABEL_DISTANCE = 30;
const LABEL_OFFSET = 14;

export interface Point {
  x: number;
  y: number;
}

export interface EdgeGeometry {
  points: Point[];
  path: string;
  determinantPaths: string[];
  midpoint: Point;
  fromLabel: Point;
  toLabel: Point;
}

export function nodeHeight(node: DiagramNode): number {
  return NODE_HEADER_HEIGHT + node.attributes.length * ATTRIBUTE_ROW_HEIGHT + NODE_FOOTER_HEIGHT;
}

export function nodeCenter(node: DiagramNode): Point {
  return { x: node.x + NODE_WIDTH / 2, y: node.y + nodeHeight(node) / 2 };
}

export function nodeContains(node: DiagramNode, point: Point): boolean {
  return (
    point.x >= node.x &&
    point.x <= node.x + NODE_WIDTH &&
    point.y >= node.y &&
    point.y <= node.y + nodeHeight(node)
  );
}

export function findNodeAt(diagram: Diagram, point: Point): DiagramNode | undefined {
  return [...diagram.nodes].reverse().find((node) => nodeContains(node, point));
}

export function attributeRowCenter(node: DiagramNode, attributeId: string): number | null {
  const index = node.attributes.findIndex((attribute) => attribute.id === attributeId);
  if (index === -1) {
    return null;
  }
  return node.y + NODE_HEADER_HEIGHT + index * ATTRIBUTE_ROW_HEIGHT + ATTRIBUTE_ROW_HEIGHT / 2;
}

export function edgeGeometry(
  edge: DiagramEdge,
  fromNode: DiagramNode,
  toNode: DiagramNode
): EdgeGeometry {
  const points =
    fromNode.id === toNode.id
      ? selfLoopPoints(fromNode, edge)
      : connectionPoints(fromNode, toNode, edge);

  return {
    points,
    path: polylinePath(points),
    determinantPaths: determinantPaths(edge, fromNode, points),
    midpoint: pointAlong(points, polylineLength(points) / 2),
    fromLabel: labelPoint(points, 'start'),
    toLabel: labelPoint(points, 'end')
  };
}

function connectionPoints(fromNode: DiagramNode, toNode: DiagramNode, edge: DiagramEdge): Point[] {
  const fromRow = rowCenterOf(fromNode, edge.from.attributeId);
  const toRow = rowCenterOf(toNode, edge.to.attributeId);

  if (fromRow === null && toRow === null) {
    return [borderPoint(fromNode, nodeCenter(toNode)), borderPoint(toNode, nodeCenter(fromNode))];
  }

  const fromOnRight = nodeCenter(fromNode).x <= nodeCenter(toNode).x;
  const start = sideAnchor(fromNode, fromRow, fromOnRight);
  const end = sideAnchor(toNode, toRow, !fromOnRight);
  const direction = fromOnRight ? 1 : -1;

  return [
    start,
    { x: start.x + STUB_LENGTH * direction, y: start.y },
    { x: end.x - STUB_LENGTH * direction, y: end.y },
    end
  ];
}

function selfLoopPoints(node: DiagramNode, edge: DiagramEdge): Point[] {
  const startY = rowCenterOf(node, edge.from.attributeId) ?? node.y + NODE_HEADER_HEIGHT / 2;
  const endY = rowCenterOf(node, edge.to.attributeId) ?? node.y + nodeHeight(node);
  const right = node.x + NODE_WIDTH;
  const reach = right + SELF_LOOP_REACH;

  return [
    { x: right, y: startY },
    { x: reach, y: startY },
    { x: reach, y: endY },
    { x: right, y: endY }
  ];
}

function determinantPaths(edge: DiagramEdge, fromNode: DiagramNode, points: Point[]): string[] {
  const bend = points[1];
  if (!bend || edge.additionalDeterminants.length === 0) {
    return [];
  }

  const paths: string[] = [];
  for (const attributeId of edge.additionalDeterminants) {
    const rowY = attributeRowCenter(fromNode, attributeId);
    if (rowY === null) {
      continue;
    }
    const startX = bend.x > nodeCenter(fromNode).x ? fromNode.x + NODE_WIDTH : fromNode.x;
    paths.push(polylinePath([{ x: startX, y: rowY }, { x: bend.x, y: rowY }, bend]));
  }
  return paths;
}

function rowCenterOf(node: DiagramNode, attributeId: string | undefined): number | null {
  return attributeId ? attributeRowCenter(node, attributeId) : null;
}

function sideAnchor(node: DiagramNode, rowY: number | null, onRight: boolean): Point {
  return {
    x: onRight ? node.x + NODE_WIDTH : node.x,
    y: rowY ?? nodeCenter(node).y
  };
}

function borderPoint(node: DiagramNode, towards: Point): Point {
  const center = nodeCenter(node);
  const deltaX = towards.x - center.x;
  const deltaY = towards.y - center.y;
  if (deltaX === 0 && deltaY === 0) {
    return center;
  }

  const halfWidth = NODE_WIDTH / 2;
  const halfHeight = nodeHeight(node) / 2;
  const scaleX = deltaX === 0 ? Number.POSITIVE_INFINITY : halfWidth / Math.abs(deltaX);
  const scaleY = deltaY === 0 ? Number.POSITIVE_INFINITY : halfHeight / Math.abs(deltaY);
  const scale = Math.min(scaleX, scaleY);

  return { x: center.x + deltaX * scale, y: center.y + deltaY * scale };
}

export function polylinePath(points: Point[]): string {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${round(point.x)} ${round(point.y)}`)
    .join(' ');
}

function labelPoint(points: Point[], end: 'start' | 'end'): Point {
  const anchor = end === 'start' ? points[0] : points[points.length - 1];
  const neighbour = end === 'start' ? points[1] : points[points.length - 2];
  if (!anchor) {
    return { x: 0, y: 0 };
  }
  if (!neighbour) {
    return { x: anchor.x, y: anchor.y - LABEL_OFFSET };
  }

  const deltaX = neighbour.x - anchor.x;
  const deltaY = neighbour.y - anchor.y;
  const length = Math.hypot(deltaX, deltaY) || 1;
  const alongX = (deltaX / length) * LABEL_DISTANCE;
  const alongY = (deltaY / length) * LABEL_DISTANCE;

  return {
    x: anchor.x + alongX - (deltaY / length) * LABEL_OFFSET,
    y: anchor.y + alongY + (deltaX / length) * LABEL_OFFSET
  };
}

function polylineLength(points: Point[]): number {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    total += segmentLength(points[index - 1], points[index]);
  }
  return total;
}

function pointAlong(points: Point[], distance: number): Point {
  let remaining = distance;
  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1];
    const end = points[index];
    if (!start || !end) {
      continue;
    }
    const length = segmentLength(start, end);
    if (remaining <= length || index === points.length - 1) {
      const ratio = length === 0 ? 0 : remaining / length;
      return { x: start.x + (end.x - start.x) * ratio, y: start.y + (end.y - start.y) * ratio };
    }
    remaining -= length;
  }
  return points[0] ?? { x: 0, y: 0 };
}

function segmentLength(start: Point | undefined, end: Point | undefined): number {
  if (!start || !end) {
    return 0;
  }
  return Math.hypot(end.x - start.x, end.y - start.y);
}

export function distanceToPolyline(points: Point[], target: Point): number {
  let closest = Number.POSITIVE_INFINITY;
  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1];
    const end = points[index];
    if (start && end) {
      closest = Math.min(closest, distanceToSegment(start, end, target));
    }
  }
  return closest;
}

function distanceToSegment(start: Point, end: Point, target: Point): number {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const lengthSquared = deltaX * deltaX + deltaY * deltaY;
  if (lengthSquared === 0) {
    return Math.hypot(target.x - start.x, target.y - start.y);
  }

  const rawRatio = ((target.x - start.x) * deltaX + (target.y - start.y) * deltaY) / lengthSquared;
  const ratio = Math.min(1, Math.max(0, rawRatio));
  return Math.hypot(target.x - (start.x + deltaX * ratio), target.y - (start.y + deltaY * ratio));
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
