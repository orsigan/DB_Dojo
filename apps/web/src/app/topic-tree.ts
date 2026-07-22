import type { ExerciseModule } from '@db-dojo/exercise-kit';
import { topicKey, topicLabel, topicOrder, topicRequires, topicSummary } from './topics';

export interface TopicNode {
  key: string;
  path: string[];
  label: string;
  summary?: string;
  requires: string[];
  children: TopicNode[];
  exercises: ExerciseModule[];
}

export function buildTopicTree(modules: ExerciseModule[]): TopicNode[] {
  const nodesByKey = new Map<string, TopicNode>();
  const roots: TopicNode[] = [];

  function ensureNode(path: string[]): TopicNode {
    const key = topicKey(path);
    const existing = nodesByKey.get(key);
    if (existing) {
      return existing;
    }

    const summary = topicSummary(path);
    const node: TopicNode = {
      key,
      path,
      label: topicLabel(path),
      ...(summary !== undefined ? { summary } : {}),
      requires: topicRequires(path),
      children: [],
      exercises: []
    };
    nodesByKey.set(key, node);

    if (path.length === 1) {
      roots.push(node);
    } else {
      const parent = ensureNode(path.slice(0, -1));
      parent.children.push(node);
    }

    return node;
  }

  for (const module of modules) {
    const path = module.definition.topic.length > 0 ? module.definition.topic : ['uncategorized'];
    const node = ensureNode(path);
    node.exercises.push(module);
  }

  sortChildren(roots);
  return roots;
}

function sortChildren(nodes: TopicNode[]): void {
  nodes.sort((a, b) => topicOrder(a.path) - topicOrder(b.path) || a.label.localeCompare(b.label));
  for (const node of nodes) {
    sortChildren(node.children);
  }
}

export function countExercises(node: TopicNode): number {
  return (
    node.exercises.length + node.children.reduce((sum, child) => sum + countExercises(child), 0)
  );
}

export function firstExerciseId(node: TopicNode): string | undefined {
  if (node.exercises[0]) {
    return node.exercises[0].definition.id;
  }
  for (const child of node.children) {
    const found = firstExerciseId(child);
    if (found) {
      return found;
    }
  }
  return undefined;
}
