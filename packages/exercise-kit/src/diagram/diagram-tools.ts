import type { DiagramEdgeKind, DiagramNodeKind } from '@db-dojo/core';

export type DiagramToolId =
  | 'class'
  | 'table'
  | 'association-class'
  | 'association'
  | 'aggregation'
  | 'composition'
  | 'generalization'
  | 'foreign-key'
  | 'functional-dependency';

export type DiagramToolGroup = 'elements' | 'relationships';

export type DiagramToolPlacement = 'canvas' | 'edge' | 'nodes' | 'attributes';

export interface DiagramTool {
  id: DiagramToolId;
  group: DiagramToolGroup;
  placement: DiagramToolPlacement;
  nodeKind?: DiagramNodeKind;
  edgeKind?: DiagramEdgeKind;
}

export const diagramTools: DiagramTool[] = [
  { id: 'class', group: 'elements', placement: 'canvas', nodeKind: 'class' },
  { id: 'table', group: 'elements', placement: 'canvas', nodeKind: 'table' },
  {
    id: 'association-class',
    group: 'elements',
    placement: 'edge',
    nodeKind: 'association-class'
  },
  { id: 'association', group: 'relationships', placement: 'nodes', edgeKind: 'association' },
  { id: 'aggregation', group: 'relationships', placement: 'nodes', edgeKind: 'aggregation' },
  { id: 'composition', group: 'relationships', placement: 'nodes', edgeKind: 'composition' },
  {
    id: 'generalization',
    group: 'relationships',
    placement: 'nodes',
    edgeKind: 'generalization'
  },
  { id: 'foreign-key', group: 'relationships', placement: 'attributes', edgeKind: 'foreign-key' },
  {
    id: 'functional-dependency',
    group: 'relationships',
    placement: 'attributes',
    edgeKind: 'functional-dependency'
  }
];

export type DiagramToolsetId = 'uml' | 'relational' | 'normalization' | 'all';

const toolsets: Record<DiagramToolsetId, DiagramToolId[]> = {
  uml: [
    'class',
    'association-class',
    'association',
    'aggregation',
    'composition',
    'generalization'
  ],
  relational: ['table', 'foreign-key'],
  normalization: ['table', 'functional-dependency', 'foreign-key'],
  all: diagramTools.map((tool) => tool.id)
};

export function toolsOf(toolset: DiagramToolsetId): DiagramTool[] {
  const allowed = toolsets[toolset];
  return diagramTools.filter((tool) => allowed.includes(tool.id));
}

export function findTool(toolId: DiagramToolId): DiagramTool {
  const tool = diagramTools.find((candidate) => candidate.id === toolId);
  if (!tool) {
    throw new Error(`Unknown diagram tool "${toolId}".`);
  }
  return tool;
}

export function isEdgeCarryingAssociationClass(edgeKind: DiagramEdgeKind): boolean {
  return edgeKind === 'association' || edgeKind === 'aggregation' || edgeKind === 'composition';
}
