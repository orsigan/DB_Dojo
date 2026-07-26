export type DiagramNodeKind = 'class' | 'association-class' | 'table';

export type DiagramEdgeKind =
  | 'association'
  | 'aggregation'
  | 'composition'
  | 'generalization'
  | 'foreign-key'
  | 'functional-dependency';

export interface DiagramAttribute {
  id: string;
  name: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}

export interface DiagramNode {
  id: string;
  kind: DiagramNodeKind;
  name: string;
  attributes: DiagramAttribute[];
  x: number;
  y: number;
  attachedEdgeId?: string;
}

export interface DiagramEndpoint {
  nodeId: string;
  attributeId?: string;
}

export interface DiagramEdge {
  id: string;
  kind: DiagramEdgeKind;
  from: DiagramEndpoint;
  to: DiagramEndpoint;
  fromMultiplicity: string;
  toMultiplicity: string;
  label: string;
  additionalDeterminants: string[];
}

export interface Diagram {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export const emptyDiagram: Diagram = { nodes: [], edges: [] };

export function findNode(diagram: Diagram, nodeId: string): DiagramNode | undefined {
  return diagram.nodes.find((node) => node.id === nodeId);
}

export function findEdge(diagram: Diagram, edgeId: string): DiagramEdge | undefined {
  return diagram.edges.find((edge) => edge.id === edgeId);
}

export function findAttribute(
  node: DiagramNode,
  attributeId: string
): DiagramAttribute | undefined {
  return node.attributes.find((attribute) => attribute.id === attributeId);
}

export function isRelationshipEdge(kind: DiagramEdgeKind): boolean {
  return kind === 'association' || kind === 'aggregation' || kind === 'composition';
}

export function connectsAttributes(kind: DiagramEdgeKind): boolean {
  return kind === 'foreign-key' || kind === 'functional-dependency';
}
