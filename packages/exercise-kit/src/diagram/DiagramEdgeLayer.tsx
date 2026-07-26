import type { Diagram, DiagramEdge, Language } from '@db-dojo/core';
import { CANVAS_HEIGHT, CANVAS_WIDTH, nodeCenter, polylinePath } from './diagram-geometry';
import { d } from './diagram-strings';
import type { DiagramEditor, DiagramSelection } from './use-diagram-editor';
import { geometryOf } from './use-diagram-editor';

interface DiagramEdgeLayerProps {
  diagram: Diagram;
  language: Language;
  selection: DiagramSelection | null;
  highlightedEdgeId: string | null;
  editor: DiagramEditor;
}

const MARKER_START = {
  aggregation: 'url(#diagram-diamond-hollow)',
  composition: 'url(#diagram-diamond-filled)'
} as const;

const MARKER_END = {
  generalization: 'url(#diagram-triangle)',
  'foreign-key': 'url(#diagram-arrow)',
  'functional-dependency': 'url(#diagram-arrow)'
} as const;

export function DiagramEdgeLayer({
  diagram,
  language,
  selection,
  highlightedEdgeId,
  editor
}: DiagramEdgeLayerProps) {
  const drawn = diagram.edges
    .map((edge) => ({ edge, geometry: geometryOf(diagram, edge) }))
    .filter((entry) => entry.geometry !== null);

  return (
    <>
      <svg
        className="diagram-edges"
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        aria-hidden="true"
      >
        <defs>
          <marker
            id="diagram-diamond-hollow"
            viewBox="0 0 14 12"
            refX="0"
            refY="6"
            markerWidth="14"
            markerHeight="12"
            orient="auto"
          >
            <path d="M 0 6 L 7 1.5 L 14 6 L 7 10.5 Z" className="diagram-marker-hollow" />
          </marker>
          <marker
            id="diagram-diamond-filled"
            viewBox="0 0 14 12"
            refX="0"
            refY="6"
            markerWidth="14"
            markerHeight="12"
            orient="auto"
          >
            <path d="M 0 6 L 7 1.5 L 14 6 L 7 10.5 Z" className="diagram-marker-filled" />
          </marker>
          <marker
            id="diagram-triangle"
            viewBox="0 0 12 12"
            refX="12"
            refY="6"
            markerWidth="12"
            markerHeight="12"
            orient="auto"
          >
            <path d="M 0 0.5 L 12 6 L 0 11.5 Z" className="diagram-marker-hollow" />
          </marker>
          <marker
            id="diagram-arrow"
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth="9"
            markerHeight="9"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 Z" className="diagram-marker-filled" />
          </marker>
        </defs>

        {drawn.map(({ edge, geometry }) => {
          if (!geometry) {
            return null;
          }
          const selected = selection?.kind === 'edge' && selection.id === edge.id;
          const className = [
            'diagram-edge',
            `diagram-edge-${edge.kind}`,
            selected && 'selected',
            highlightedEdgeId === edge.id && 'highlighted'
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <g key={edge.id}>
              {geometry.determinantPaths.map((path) => (
                <path key={path} d={path} className={`${className} determinant`} />
              ))}
              <path
                d={geometry.path}
                className={className}
                markerStart={markerStartOf(edge)}
                markerEnd={markerEndOf(edge)}
              />
            </g>
          );
        })}

        {diagram.nodes.map((node) => {
          if (!node.attachedEdgeId) {
            return null;
          }
          const target = drawn.find((entry) => entry.edge.id === node.attachedEdgeId);
          if (!target?.geometry) {
            return null;
          }
          return (
            <path
              key={`tether-${node.id}`}
              d={polylinePath([nodeCenter(node), target.geometry.midpoint])}
              className="diagram-tether"
            />
          );
        })}
      </svg>

      <div className="diagram-edge-labels">
        {drawn.map(({ edge, geometry }) => {
          if (!geometry || edge.kind === 'functional-dependency') {
            return null;
          }
          const selected = selection?.kind === 'edge' && selection.id === edge.id;

          return (
            <div key={edge.id} onPointerDown={(event) => event.stopPropagation()}>
              <input
                className="diagram-multiplicity"
                style={{ left: geometry.fromLabel.x, top: geometry.fromLabel.y }}
                value={edge.fromMultiplicity}
                placeholder="·"
                aria-label={d('editMultiplicity', language)}
                title={d('editMultiplicity', language)}
                onChange={(event) => editor.setMultiplicity(edge.id, 'from', event.target.value)}
                onFocus={() => editor.select({ kind: 'edge', id: edge.id })}
              />
              <input
                className="diagram-multiplicity"
                style={{ left: geometry.toLabel.x, top: geometry.toLabel.y }}
                value={edge.toMultiplicity}
                placeholder="·"
                aria-label={d('editMultiplicity', language)}
                title={d('editMultiplicity', language)}
                onChange={(event) => editor.setMultiplicity(edge.id, 'to', event.target.value)}
                onFocus={() => editor.select({ kind: 'edge', id: edge.id })}
              />
              {(selected || edge.label !== '') && (
                <input
                  className="diagram-edge-label"
                  style={{ left: geometry.midpoint.x, top: geometry.midpoint.y }}
                  value={edge.label}
                  placeholder={d('edgeLabelPlaceholder', language)}
                  aria-label={d('edgeLabelPlaceholder', language)}
                  onChange={(event) => editor.setEdgeLabel(edge.id, event.target.value)}
                  onFocus={() => editor.select({ kind: 'edge', id: edge.id })}
                />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function markerStartOf(edge: DiagramEdge): string | undefined {
  if (edge.kind === 'aggregation') {
    return MARKER_START.aggregation;
  }
  if (edge.kind === 'composition') {
    return MARKER_START.composition;
  }
  return undefined;
}

function markerEndOf(edge: DiagramEdge): string | undefined {
  if (edge.kind === 'generalization') {
    return MARKER_END.generalization;
  }
  if (edge.kind === 'foreign-key') {
    return MARKER_END['foreign-key'];
  }
  if (edge.kind === 'functional-dependency') {
    return MARKER_END['functional-dependency'];
  }
  return undefined;
}
