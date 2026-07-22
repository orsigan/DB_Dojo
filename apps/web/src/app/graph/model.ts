import type { Difficulty } from '@db-dojo/core';
import type { View } from '../modes/types';

export type GraphNodeKind = 'chapter' | 'folder' | 'exercise';

export interface GraphNode {
  id: string;
  label: string;
  kind: GraphNodeKind;
  requires: string[];
  externalPrerequisites: string[];
  blocked: boolean;
  children: GraphNode[];
  passedExercises: number;
  totalExercises: number;
  summary?: string;
  difficulty?: Difficulty;
  topicPath?: string[];
  iconKey?: string;
  tags?: string[];
  step: number;
  next?: boolean;
  onNextPath?: boolean;
  target?: View;
}

export type GraphNodeStatus = 'completed' | 'in-progress' | 'open' | 'empty';

export function nodeStatus(node: GraphNode): GraphNodeStatus {
  if (node.totalExercises === 0) {
    return 'empty';
  }
  if (node.passedExercises === node.totalExercises) {
    return 'completed';
  }
  return node.passedExercises > 0 ? 'in-progress' : 'open';
}

/** Ids of every node in a graph, collapsed or not. */
export function collectNodeIds(nodes: GraphNode[], into: Set<string> = new Set()): Set<string> {
  for (const node of nodes) {
    into.add(node.id);
    collectNodeIds(node.children, into);
  }
  return into;
}

/** Ids of nodes that can be expanded — the target for "expand all". */
export function expandableNodeIds(nodes: GraphNode[], into: Set<string> = new Set()): Set<string> {
  for (const node of nodes) {
    if (node.children.length > 0) {
      into.add(node.id);
    }
    expandableNodeIds(node.children, into);
  }
  return into;
}
