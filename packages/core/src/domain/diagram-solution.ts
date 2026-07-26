import type { DiagramEdgeKind, DiagramNodeKind } from './diagram';
import type { LocalizedText } from './localized-text';

export interface SolutionAttribute {
  name: string;
  aliases?: string[];
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
}

export interface SolutionNode {
  key: string;
  kind: DiagramNodeKind;
  name: string;
  aliases?: string[];
  attributes?: SolutionAttribute[];
}

export interface SolutionEdge {
  kind: DiagramEdgeKind;
  from: string;
  to: string;
  fromAttribute?: string;
  toAttribute?: string;
  additionalDeterminants?: string[];
  fromMultiplicity?: string;
  toMultiplicity?: string;
  associationClass?: string;
}

export interface DiagramSolution {
  label?: LocalizedText;
  nodes: SolutionNode[];
  edges: SolutionEdge[];
}
