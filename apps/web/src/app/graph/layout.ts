import type { GraphNode } from './model';

export const NODE_WIDTH = 244;
export const NODE_HEIGHT = 132;

const GAP_X = 28;
const GAP_Y = 76;
const PADDING = 32;

export type EdgeKind = 'contains' | 'requires';

export interface PositionedNode {
  node: GraphNode;
  x: number;
  y: number;
  width: number;
  height: number;
  layer: number;
  /** Nesting depth in the source tree, used purely for styling. */
  depth: number;
  expandable: boolean;
  expanded: boolean;
}

export interface PositionedEdge {
  id: string;
  kind: EdgeKind;
  /** Ready-to-render SVG path — the renderer never does geometry. */
  path: string;
}

export interface GraphLayout {
  nodes: PositionedNode[];
  edges: PositionedEdge[];
  width: number;
  height: number;
}

interface Indexed {
  node: GraphNode;
  parentId?: string;
  depth: number;
  order: number;
}

/**
 * Lays a dependency graph out in downward layers.
 *
 * Both containment (parent → child) and prerequisite (dependency → dependent)
 * edges push a node down a layer, so every edge points downwards and a node
 * always sits below everything it needs. Collapsed subtrees are excluded, and a
 * prerequisite hidden inside a collapsed parent re-attaches to that parent so
 * the dependency stays visible.
 */
export function layoutGraph(roots: GraphNode[], expanded: ReadonlySet<string>): GraphLayout {
  const index = indexNodes(roots);
  const visible = visibleNodes(roots, index, expanded);
  const visibleIds = new Set(visible.map((entry) => entry.node.id));

  const edges = buildEdges(visible, index, visibleIds, expanded);
  const layers = assignLayers(visible, edges);

  return position(visible, edges, layers, expanded);
}

function indexNodes(roots: GraphNode[]): Map<string, Indexed> {
  const index = new Map<string, Indexed>();
  let order = 0;

  function walk(nodes: GraphNode[], parentId: string | undefined, depth: number): void {
    for (const node of nodes) {
      index.set(node.id, {
        node,
        ...(parentId !== undefined ? { parentId } : {}),
        depth,
        order: order++
      });
      walk(node.children, node.id, depth + 1);
    }
  }

  walk(roots, undefined, 0);
  return index;
}

function visibleNodes(
  roots: GraphNode[],
  index: Map<string, Indexed>,
  expanded: ReadonlySet<string>
): Indexed[] {
  const visible: Indexed[] = [];

  function walk(nodes: GraphNode[]): void {
    for (const node of nodes) {
      const entry = index.get(node.id);
      if (!entry) {
        continue;
      }
      visible.push(entry);
      if (expanded.has(node.id)) {
        walk(node.children);
      }
    }
  }

  walk(roots);
  return visible;
}

interface Edge {
  from: string;
  to: string;
  kind: EdgeKind;
}

function buildEdges(
  visible: Indexed[],
  index: Map<string, Indexed>,
  visibleIds: Set<string>,
  expanded: ReadonlySet<string>
): Edge[] {
  const edges: Edge[] = [];

  for (const entry of visible) {
    if (expanded.has(entry.node.id)) {
      for (const child of entry.node.children) {
        if (visibleIds.has(child.id)) {
          edges.push({ from: entry.node.id, to: child.id, kind: 'contains' });
        }
      }
    }

    for (const requiredId of entry.node.requires) {
      const source = nearestVisible(requiredId, index, visibleIds);
      if (!source || source === entry.node.id) {
        continue;
      }
      // A containment edge already expresses "sits inside" — don't draw it twice.
      if (isAncestor(source, entry.node.id, index)) {
        continue;
      }
      edges.push({ from: source, to: entry.node.id, kind: 'requires' });
    }
  }

  return edges;
}

function nearestVisible(
  id: string,
  index: Map<string, Indexed>,
  visibleIds: Set<string>
): string | undefined {
  let current: string | undefined = id;
  while (current) {
    if (visibleIds.has(current)) {
      return current;
    }
    current = index.get(current)?.parentId;
  }
  return undefined;
}

function isAncestor(candidateId: string, nodeId: string, index: Map<string, Indexed>): boolean {
  let current = index.get(nodeId)?.parentId;
  while (current) {
    if (current === candidateId) {
      return true;
    }
    current = index.get(current)?.parentId;
  }
  return false;
}

/**
 * Longest-path layering: a node sits one layer below its deepest predecessor.
 * Authoring mistakes can produce a `requires` cycle; the `visiting` guard breaks
 * it by ignoring the back edge instead of recursing forever.
 */
function assignLayers(visible: Indexed[], edges: Edge[]): Map<string, number> {
  const incoming = new Map<string, string[]>();
  for (const edge of edges) {
    const list = incoming.get(edge.to);
    if (list) {
      list.push(edge.from);
    } else {
      incoming.set(edge.to, [edge.from]);
    }
  }

  const layers = new Map<string, number>();
  const visiting = new Set<string>();

  function layerOf(id: string): number {
    const known = layers.get(id);
    if (known !== undefined) {
      return known;
    }
    if (visiting.has(id)) {
      return 0;
    }

    visiting.add(id);
    let layer = 0;
    for (const predecessor of incoming.get(id) ?? []) {
      layer = Math.max(layer, layerOf(predecessor) + 1);
    }
    visiting.delete(id);

    layers.set(id, layer);
    return layer;
  }

  for (const entry of visible) {
    layerOf(entry.node.id);
  }
  return layers;
}

function position(
  visible: Indexed[],
  edges: Edge[],
  layers: Map<string, number>,
  expanded: ReadonlySet<string>
): GraphLayout {
  const byLayer = new Map<number, Indexed[]>();
  for (const entry of visible) {
    const layer = layers.get(entry.node.id) ?? 0;
    const row = byLayer.get(layer);
    if (row) {
      row.push(entry);
    } else {
      byLayer.set(layer, [entry]);
    }
  }

  // Pre-order traversal keeps siblings — and whole subtrees — next to each other.
  for (const row of byLayer.values()) {
    row.sort((a, b) => a.order - b.order);
  }

  const layerCount = byLayer.size === 0 ? 0 : Math.max(...byLayer.keys()) + 1;
  const widest = Math.max(0, ...[...byLayer.values()].map((row) => rowWidth(row.length)));
  const width = widest + PADDING * 2;
  const height =
    layerCount === 0 ? 0 : PADDING * 2 + layerCount * NODE_HEIGHT + (layerCount - 1) * GAP_Y;

  const placed = new Map<string, PositionedNode>();
  const nodes: PositionedNode[] = [];

  for (const [layer, row] of byLayer) {
    const startX = (width - rowWidth(row.length)) / 2;
    row.forEach((entry, indexInRow) => {
      const positioned: PositionedNode = {
        node: entry.node,
        x: startX + indexInRow * (NODE_WIDTH + GAP_X),
        y: PADDING + layer * (NODE_HEIGHT + GAP_Y),
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        layer,
        depth: entry.depth,
        expandable: entry.node.children.length > 0,
        expanded: expanded.has(entry.node.id)
      };
      placed.set(entry.node.id, positioned);
      nodes.push(positioned);
    });
  }

  const positionedEdges: PositionedEdge[] = [];
  for (const edge of edges) {
    const from = placed.get(edge.from);
    const to = placed.get(edge.to);
    if (!from || !to) {
      continue;
    }
    positionedEdges.push({
      id: `${edge.kind}:${edge.from}->${edge.to}`,
      kind: edge.kind,
      path: edgePath(from, to)
    });
  }

  return { nodes, edges: positionedEdges, width, height };
}

function rowWidth(count: number): number {
  return count === 0 ? 0 : count * NODE_WIDTH + (count - 1) * GAP_X;
}

function edgePath(from: PositionedNode, to: PositionedNode): string {
  const x1 = from.x + from.width / 2;
  const y1 = from.y + from.height;
  const x2 = to.x + to.width / 2;
  const y2 = to.y;
  const bend = Math.max(24, (y2 - y1) / 2);
  return `M ${x1} ${y1} C ${x1} ${y1 + bend}, ${x2} ${y2 - bend}, ${x2} ${y2}`;
}
