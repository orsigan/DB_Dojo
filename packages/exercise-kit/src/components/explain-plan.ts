export interface ExplainCost {
  startup: number;
  total: number;
}

export interface ExplainNode {
  id: number;
  label: string;
  depth: number;
  cost?: ExplainCost;
  rows?: number;
  actualTime?: ExplainCost;
  actualRows?: number;
  loops?: number;
  details: string[];
  children: ExplainNode[];
}

const NODE_LINE = /^(\s*)(->\s*)?(.*)$/;
const COST_PATTERN = /\(cost=([\d.]+)\.\.([\d.]+) rows=(\d+) width=(\d+)\)/;
const ACTUAL_TIME_PATTERN = /\(actual time=([\d.]+)\.\.([\d.]+) rows=(\d+) loops=(\d+)\)/;

interface StackEntry {
  indent: number;
  node: ExplainNode;
}

function parseNodeContent(text: string, id: number): ExplainNode {
  const costMatch = COST_PATTERN.exec(text);
  const actualMatch = ACTUAL_TIME_PATTERN.exec(text);
  const label = text.replace(COST_PATTERN, '').replace(ACTUAL_TIME_PATTERN, '').trim();

  return {
    id,
    label,
    depth: 0,
    details: [],
    children: [],
    ...(costMatch && {
      cost: { startup: Number(costMatch[1]), total: Number(costMatch[2]) },
      rows: Number(costMatch[3])
    }),
    ...(actualMatch && {
      actualTime: { startup: Number(actualMatch[1]), total: Number(actualMatch[2]) },
      actualRows: Number(actualMatch[3]),
      loops: Number(actualMatch[4])
    })
  };
}

function findDetailOwner(stack: StackEntry[], root: ExplainNode, indent: number): ExplainNode {
  for (const entry of [...stack].reverse()) {
    if (entry.indent < indent) {
      return entry.node;
    }
  }
  return root;
}

export function parseExplainPlan(lines: string[]): ExplainNode | null {
  const meaningfulLines = lines.filter((line) => line.trim().length > 0);
  if (meaningfulLines.length === 0) {
    return null;
  }

  let root: ExplainNode | null = null;
  const stack: StackEntry[] = [];
  let nextId = 0;

  for (const line of meaningfulLines) {
    const match = NODE_LINE.exec(line);
    if (!match) {
      continue;
    }
    const [, leadingSpaces = '', arrow, rest = ''] = match;
    const indent = leadingSpaces.length;

    if (arrow) {
      const node = parseNodeContent(rest, nextId++);
      while (stack.length > 0) {
        const top = stack[stack.length - 1];
        if (!top || top.indent < indent) {
          break;
        }
        stack.pop();
      }
      const parentEntry = stack[stack.length - 1];
      if (!parentEntry) {
        if (!root) {
          root = node;
        }
      } else {
        node.depth = parentEntry.node.depth + 1;
        parentEntry.node.children.push(node);
      }
      stack.push({ indent, node });
    } else if (!root) {
      const node = parseNodeContent(rest, nextId++);
      root = node;
      stack.push({ indent, node });
    } else {
      findDetailOwner(stack, root, indent).details.push(rest.trim());
    }
  }

  return root;
}
