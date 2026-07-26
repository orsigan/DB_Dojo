import type {
  Diagram,
  DiagramAttribute,
  DiagramEdge,
  DiagramEndpoint,
  DiagramNode,
  DiagramNodeKind,
  Language
} from '@db-dojo/core';
import { useCallback, useEffect, useState } from 'react';
import {
  distanceToPolyline,
  EDGE_HIT_DISTANCE,
  edgeGeometry,
  findNodeAt,
  NODE_WIDTH,
  type Point
} from './diagram-geometry';
import { d } from './diagram-strings';
import {
  type DiagramTool,
  type DiagramToolId,
  findTool,
  isEdgeCarryingAssociationClass
} from './diagram-tools';

const MAX_UNDO_STEPS = 50;

export type DiagramSelection = { kind: 'node'; id: string } | { kind: 'edge'; id: string };

export type PendingPhase = 'source' | 'target';

export interface PendingEdge {
  tool: DiagramTool;
  phase: PendingPhase;
  sourceNodeId: string | null;
  sourceAttributeIds: string[];
}

export type DropTarget = { kind: 'canvas' } | { kind: 'edge'; edgeId: string };

export interface DiagramEditor {
  diagram: Diagram;
  selection: DiagramSelection | null;
  activeTool: DiagramTool | null;
  pending: PendingEdge | null;
  canUndo: boolean;
  select: (selection: DiagramSelection | null) => void;
  armTool: (toolId: DiagramToolId | null) => void;
  dropTargetAt: (point: Point) => DropTarget | null;
  edgeAt: (point: Point) => DiagramEdge | null;
  placeNode: (kind: DiagramNodeKind, point: Point) => void;
  attachAssociationClass: (edgeId: string, point: Point) => void;
  pickNode: (nodeId: string) => void;
  pickAttribute: (nodeId: string, attributeId: string) => void;
  confirmDeterminants: () => void;
  cancelPending: () => void;
  beginNodeDrag: () => void;
  moveNode: (nodeId: string, point: Point) => void;
  renameNode: (nodeId: string, name: string) => void;
  addAttribute: (nodeId: string) => void;
  renameAttribute: (nodeId: string, attributeId: string, name: string) => void;
  removeAttribute: (nodeId: string, attributeId: string) => void;
  toggleAttributeKey: (nodeId: string, attributeId: string, key: 'primary' | 'foreign') => void;
  setMultiplicity: (edgeId: string, end: 'from' | 'to', value: string) => void;
  setEdgeLabel: (edgeId: string, value: string) => void;
  deleteSelection: () => void;
  clear: () => void;
  undo: () => void;
  reset: () => void;
}

export function useDiagramEditor(
  exerciseId: string,
  starterDiagram: Diagram,
  language: Language
): DiagramEditor {
  const storageKey = `db-dojo:diagram:${exerciseId}`;
  const [diagram, setDiagram] = useState<Diagram>(() => loadDiagram(storageKey, starterDiagram));
  const [past, setPast] = useState<Diagram[]>([]);
  const [selection, setSelection] = useState<DiagramSelection | null>(null);
  const [activeTool, setActiveTool] = useState<DiagramTool | null>(null);
  const [pending, setPending] = useState<PendingEdge | null>(null);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(diagram));
  }, [storageKey, diagram]);

  const change = useCallback((next: (current: Diagram) => Diagram) => {
    setDiagram((current) => {
      setPast((steps) => [...steps, current].slice(-MAX_UNDO_STEPS));
      return next(current);
    });
  }, []);

  const changeWithoutUndoStep = useCallback((next: (current: Diagram) => Diagram) => {
    setDiagram(next);
  }, []);

  const edgeAt = useCallback(
    (point: Point) => {
      let closest: DiagramEdge | null = null;
      let closestDistance = EDGE_HIT_DISTANCE;

      for (const edge of diagram.edges) {
        const geometry = geometryOf(diagram, edge);
        if (!geometry) {
          continue;
        }
        const distance = distanceToPolyline(geometry.points, point);
        if (distance < closestDistance) {
          closest = edge;
          closestDistance = distance;
        }
      }
      return closest;
    },
    [diagram]
  );

  const dropTargetAt = useCallback(
    (point: Point): DropTarget | null => {
      if (!activeTool) {
        return null;
      }
      if (activeTool.placement === 'canvas') {
        return findNodeAt(diagram, point) ? null : { kind: 'canvas' };
      }
      if (activeTool.placement === 'edge') {
        const edge = edgeAt(point);
        if (
          !edge ||
          !isEdgeCarryingAssociationClass(edge.kind) ||
          hasAssociationClass(diagram, edge.id)
        ) {
          return null;
        }
        return { kind: 'edge', edgeId: edge.id };
      }
      return null;
    },
    [activeTool, diagram, edgeAt]
  );

  const armTool = useCallback((toolId: DiagramToolId | null) => {
    setPending(null);
    setSelection(null);
    setActiveTool((current) => {
      if (toolId === null || current?.id === toolId) {
        return null;
      }
      return findTool(toolId);
    });
  }, []);

  const placeNode = useCallback(
    (kind: DiagramNodeKind, point: Point) => {
      change((current) => ({
        ...current,
        nodes: [...current.nodes, createNode(current, kind, point, language)]
      }));
      setActiveTool(null);
    },
    [change, language]
  );

  const attachAssociationClass = useCallback(
    (edgeId: string, point: Point) => {
      change((current) => {
        const node = createNode(current, 'association-class', point, language);
        return { ...current, nodes: [...current.nodes, { ...node, attachedEdgeId: edgeId }] };
      });
      setActiveTool(null);
    },
    [change, language]
  );

  const createEdge = useCallback(
    (tool: DiagramTool, from: DiagramEndpoint, to: DiagramEndpoint, determinants: string[]) => {
      const edgeKind = tool.edgeKind;
      if (!edgeKind) {
        return;
      }
      change((current) => ({
        ...current,
        edges: [
          ...current.edges,
          {
            id: createId('edge'),
            kind: edgeKind,
            from,
            to,
            fromMultiplicity: '',
            toMultiplicity: '',
            label: '',
            additionalDeterminants: determinants
          }
        ]
      }));
      setPending(null);
      setActiveTool(null);
    },
    [change]
  );

  const pickNode = useCallback(
    (nodeId: string) => {
      if (activeTool?.placement !== 'nodes') {
        setSelection({ kind: 'node', id: nodeId });
        return;
      }
      if (!pending) {
        setPending({
          tool: activeTool,
          phase: 'target',
          sourceNodeId: nodeId,
          sourceAttributeIds: []
        });
        return;
      }
      if (pending.sourceNodeId === null) {
        return;
      }
      if (pending.sourceNodeId === nodeId && activeTool.edgeKind === 'generalization') {
        return;
      }
      createEdge(activeTool, { nodeId: pending.sourceNodeId }, { nodeId }, []);
    },
    [activeTool, pending, createEdge]
  );

  const pickAttribute = useCallback(
    (nodeId: string, attributeId: string) => {
      if (activeTool?.placement !== 'attributes') {
        setSelection({ kind: 'node', id: nodeId });
        return;
      }

      const collectsDeterminants = activeTool.id === 'functional-dependency';

      if (!pending || pending.phase === 'source') {
        const sameNode = pending?.sourceNodeId === nodeId;
        const alreadyPicked = sameNode && pending ? pending.sourceAttributeIds : [];

        if (!collectsDeterminants) {
          setPending({
            tool: activeTool,
            phase: 'target',
            sourceNodeId: nodeId,
            sourceAttributeIds: [attributeId]
          });
          return;
        }

        setPending({
          tool: activeTool,
          phase: 'source',
          sourceNodeId: nodeId,
          sourceAttributeIds: alreadyPicked.includes(attributeId)
            ? alreadyPicked.filter((id) => id !== attributeId)
            : [...alreadyPicked, attributeId]
        });
        return;
      }

      const sourceNodeId = pending.sourceNodeId;
      const [firstDeterminant, ...additional] = pending.sourceAttributeIds;
      if (!sourceNodeId || !firstDeterminant) {
        return;
      }
      if (sourceNodeId === nodeId && pending.sourceAttributeIds.includes(attributeId)) {
        return;
      }

      createEdge(
        activeTool,
        { nodeId: sourceNodeId, attributeId: firstDeterminant },
        { nodeId, attributeId },
        additional
      );
    },
    [activeTool, pending, createEdge]
  );

  const confirmDeterminants = useCallback(() => {
    setPending((current) =>
      current && current.sourceAttributeIds.length > 0 ? { ...current, phase: 'target' } : current
    );
  }, []);

  const cancelPending = useCallback(() => {
    setPending(null);
    setActiveTool(null);
  }, []);

  const beginNodeDrag = useCallback(() => {
    setDiagram((current) => {
      setPast((steps) => [...steps, current].slice(-MAX_UNDO_STEPS));
      return current;
    });
  }, []);

  const moveNode = useCallback(
    (nodeId: string, point: Point) => {
      changeWithoutUndoStep((current) => ({
        ...current,
        nodes: current.nodes.map((node) =>
          node.id === nodeId ? { ...node, x: point.x, y: point.y } : node
        )
      }));
    },
    [changeWithoutUndoStep]
  );

  const renameNode = useCallback(
    (nodeId: string, name: string) => {
      changeWithoutUndoStep((current) => ({
        ...current,
        nodes: current.nodes.map((node) => (node.id === nodeId ? { ...node, name } : node))
      }));
    },
    [changeWithoutUndoStep]
  );

  const addAttribute = useCallback(
    (nodeId: string) => {
      change((current) => ({
        ...current,
        nodes: current.nodes.map((node) =>
          node.id === nodeId
            ? { ...node, attributes: [...node.attributes, createAttribute()] }
            : node
        )
      }));
    },
    [change]
  );

  const renameAttribute = useCallback(
    (nodeId: string, attributeId: string, name: string) => {
      changeWithoutUndoStep((current) => ({
        ...current,
        nodes: current.nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                attributes: node.attributes.map((attribute) =>
                  attribute.id === attributeId ? { ...attribute, name } : attribute
                )
              }
            : node
        )
      }));
    },
    [changeWithoutUndoStep]
  );

  const removeAttribute = useCallback(
    (nodeId: string, attributeId: string) => {
      change((current) => ({
        nodes: current.nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                attributes: node.attributes.filter((attribute) => attribute.id !== attributeId)
              }
            : node
        ),
        edges: current.edges.filter(
          (edge) =>
            edge.from.attributeId !== attributeId &&
            edge.to.attributeId !== attributeId &&
            !edge.additionalDeterminants.includes(attributeId)
        )
      }));
    },
    [change]
  );

  const toggleAttributeKey = useCallback(
    (nodeId: string, attributeId: string, key: 'primary' | 'foreign') => {
      change((current) => ({
        ...current,
        nodes: current.nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                attributes: node.attributes.map((attribute) => {
                  if (attribute.id !== attributeId) {
                    return attribute;
                  }
                  return key === 'primary'
                    ? { ...attribute, isPrimaryKey: !attribute.isPrimaryKey }
                    : { ...attribute, isForeignKey: !attribute.isForeignKey };
                })
              }
            : node
        )
      }));
    },
    [change]
  );

  const setMultiplicity = useCallback(
    (edgeId: string, end: 'from' | 'to', value: string) => {
      changeWithoutUndoStep((current) => ({
        ...current,
        edges: current.edges.map((edge) => {
          if (edge.id !== edgeId) {
            return edge;
          }
          return end === 'from'
            ? { ...edge, fromMultiplicity: value }
            : { ...edge, toMultiplicity: value };
        })
      }));
    },
    [changeWithoutUndoStep]
  );

  const setEdgeLabel = useCallback(
    (edgeId: string, value: string) => {
      changeWithoutUndoStep((current) => ({
        ...current,
        edges: current.edges.map((edge) => (edge.id === edgeId ? { ...edge, label: value } : edge))
      }));
    },
    [changeWithoutUndoStep]
  );

  const deleteSelection = useCallback(() => {
    if (!selection) {
      return;
    }
    change((current) =>
      selection.kind === 'node'
        ? removeNode(current, selection.id)
        : removeEdge(current, selection.id)
    );
    setSelection(null);
  }, [change, selection]);

  const clear = useCallback(() => {
    change(() => ({ nodes: [], edges: [] }));
    setSelection(null);
    setPending(null);
    setActiveTool(null);
  }, [change]);

  const undo = useCallback(() => {
    setPast((steps) => {
      const previous = steps[steps.length - 1];
      if (previous) {
        setDiagram(previous);
      }
      return steps.slice(0, -1);
    });
    setSelection(null);
  }, []);

  const reset = useCallback(() => {
    change(() => starterDiagram);
    setSelection(null);
    setPending(null);
    setActiveTool(null);
  }, [change, starterDiagram]);

  return {
    diagram,
    selection,
    activeTool,
    pending,
    canUndo: past.length > 0,
    select: setSelection,
    armTool,
    dropTargetAt,
    edgeAt,
    placeNode,
    attachAssociationClass,
    pickNode,
    pickAttribute,
    confirmDeterminants,
    cancelPending,
    beginNodeDrag,
    moveNode,
    renameNode,
    addAttribute,
    renameAttribute,
    removeAttribute,
    toggleAttributeKey,
    setMultiplicity,
    setEdgeLabel,
    deleteSelection,
    clear,
    undo,
    reset
  };
}

export function geometryOf(diagram: Diagram, edge: DiagramEdge) {
  const fromNode = diagram.nodes.find((node) => node.id === edge.from.nodeId);
  const toNode = diagram.nodes.find((node) => node.id === edge.to.nodeId);
  if (!fromNode || !toNode) {
    return null;
  }
  return edgeGeometry(edge, fromNode, toNode);
}

export function hasAssociationClass(diagram: Diagram, edgeId: string): boolean {
  return diagram.nodes.some((node) => node.attachedEdgeId === edgeId);
}

function removeNode(diagram: Diagram, nodeId: string): Diagram {
  const removedEdges = diagram.edges.filter(
    (edge) => edge.from.nodeId === nodeId || edge.to.nodeId === nodeId
  );
  const removedEdgeIds = new Set(removedEdges.map((edge) => edge.id));

  return {
    nodes: diagram.nodes.filter(
      (node) =>
        node.id !== nodeId && !(node.attachedEdgeId && removedEdgeIds.has(node.attachedEdgeId))
    ),
    edges: diagram.edges.filter((edge) => !removedEdgeIds.has(edge.id))
  };
}

function removeEdge(diagram: Diagram, edgeId: string): Diagram {
  return {
    nodes: diagram.nodes.filter((node) => node.attachedEdgeId !== edgeId),
    edges: diagram.edges.filter((edge) => edge.id !== edgeId)
  };
}

function createNode(
  diagram: Diagram,
  kind: DiagramNodeKind,
  point: Point,
  language: Language
): DiagramNode {
  return {
    id: createId('node'),
    kind,
    name: nextNodeName(diagram, kind, language),
    attributes: [createAttribute()],
    x: Math.round(point.x - NODE_WIDTH / 2),
    y: Math.round(point.y - 40)
  };
}

function nextNodeName(diagram: Diagram, kind: DiagramNodeKind, language: Language): string {
  const base = d(
    kind === 'class' ? 'newClass' : kind === 'table' ? 'newTable' : 'newAssociationClass',
    language
  );
  const used = new Set(diagram.nodes.map((node) => node.name));
  if (!used.has(base)) {
    return base;
  }
  let counter = 2;
  while (used.has(`${base} ${counter}`)) {
    counter += 1;
  }
  return `${base} ${counter}`;
}

function createAttribute(): DiagramAttribute {
  return { id: createId('attribute'), name: '', isPrimaryKey: false, isForeignKey: false };
}

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function loadDiagram(storageKey: string, fallback: Diagram): Diagram {
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return fallback;
  }
  try {
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
      return parsed as Diagram;
    }
  } catch {
    return fallback;
  }
  return fallback;
}
