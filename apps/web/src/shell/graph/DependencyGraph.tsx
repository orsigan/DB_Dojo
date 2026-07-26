import { useCallback, useMemo } from 'react';
import { difficultyClass } from '../../app/difficulty';
import { layoutGraph, type PositionedNode } from '../../app/graph/layout';
import { expandableNodeIds, type GraphNode, nodeStatus } from '../../app/graph/model';
import type { View } from '../../app/modes/types';
import { useLocalStorageState } from '../../app/use-local-storage-state';
import { GraphNodeIcon } from '../chapter-icons';
import { DifficultyBadge } from '../DifficultyBadge';
import { usePanZoom } from './use-pan-zoom';

const MIN_SCALE = 0.35;
const MAX_SCALE = 1.8;
const ZOOM_STEP = 0.15;

interface DependencyGraphProps {
  roots: GraphNode[];
  storageKey: string;
  onOpen: (view: View) => void;
  emptyLabel?: string;
}

export function DependencyGraph({
  roots,
  storageKey,
  onOpen,
  emptyLabel = 'Nothing to show here yet.'
}: DependencyGraphProps) {
  const rootIds = useMemo(() => roots.map((node) => node.id), [roots]);
  const [expandedIds, setExpandedIds] = useLocalStorageState<string[]>(storageKey, rootIds);
  const expanded = useMemo(() => new Set(expandedIds), [expandedIds]);
  const layout = useMemo(() => layoutGraph(roots, expanded), [roots, expanded]);
  const panZoom = usePanZoom({ min: MIN_SCALE, max: MAX_SCALE, step: ZOOM_STEP });

  const toggle = useCallback(
    (id: string) => {
      setExpandedIds((prev) =>
        prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]
      );
    },
    [setExpandedIds]
  );

  const expandAll = useCallback(() => {
    setExpandedIds([...expandableNodeIds(roots)]);
  }, [roots, setExpandedIds]);

  const collapseAll = useCallback(() => setExpandedIds([]), [setExpandedIds]);

  if (roots.length === 0) {
    return <p className="muted graph-empty">{emptyLabel}</p>;
  }

  return (
    <div className="graph">
      <div className="graph-toolbar">
        <div className="graph-toolbar-group">
          <button type="button" onClick={expandAll}>
            Expand all
          </button>
          <button type="button" onClick={collapseAll}>
            Collapse all
          </button>
        </div>
        <div className="graph-toolbar-group">
          <button type="button" aria-label="Zoom out" onClick={panZoom.zoomOut}>
            −
          </button>
          <span className="graph-zoom-value">{Math.round(panZoom.scale * 100)}%</span>
          <button type="button" aria-label="Zoom in" onClick={panZoom.zoomIn}>
            +
          </button>
          <button type="button" onClick={panZoom.reset}>
            Reset
          </button>
        </div>
      </div>

      <div
        ref={panZoom.viewportRef}
        className={panZoom.dragging ? 'graph-viewport dragging' : 'graph-viewport'}
        onPointerDown={panZoom.onPointerDown}
      >
        <div
          className="graph-canvas"
          style={{
            width: layout.width,
            height: layout.height,
            transform: `translate(${panZoom.pan.x}px, ${panZoom.pan.y}px) scale(${panZoom.scale})`,
            transformOrigin: 'top center'
          }}
        >
          <svg
            className="graph-edges"
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            width={layout.width}
            height={layout.height}
            aria-hidden="true"
          >
            <defs>
              <marker
                id="graph-arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" className="graph-arrow-head" />
              </marker>
            </defs>
            {layout.edges.map((edge) => (
              <path
                key={edge.id}
                d={edge.path}
                className={`graph-edge ${edge.kind}`}
                {...(edge.kind === 'requires' ? { markerEnd: 'url(#graph-arrow)' } : {})}
              />
            ))}
          </svg>

          {layout.nodes.map((positioned) => (
            <GraphNodeCard
              key={positioned.node.id}
              positioned={positioned}
              onToggle={toggle}
              onOpen={onOpen}
            />
          ))}
        </div>
      </div>

      <GraphLegend />
    </div>
  );
}

function GraphNodeCard({
  positioned,
  onToggle,
  onOpen
}: {
  positioned: PositionedNode;
  onToggle: (id: string) => void;
  onOpen: (view: View) => void;
}) {
  const { node, expandable, expanded } = positioned;
  const status = nodeStatus(node);
  const target = node.target;

  const classes = [
    'graph-node',
    node.kind,
    status,
    node.difficulty ? difficultyClass(node.difficulty) : '',
    node.blocked ? 'blocked' : '',
    target ? 'openable' : '',
    node.next ? 'next' : '',
    node.onNextPath ? 'on-next-path' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      style={{
        left: positioned.x,
        top: positioned.y,
        width: positioned.width,
        minHeight: positioned.height
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="graph-node-head">
        {expandable ? (
          <button
            type="button"
            className={expanded ? 'graph-node-chevron open' : 'graph-node-chevron'}
            aria-expanded={expanded}
            aria-label={expanded ? `Collapse ${node.label}` : `Expand ${node.label}`}
            onClick={() => onToggle(node.id)}
          >
            ›
          </button>
        ) : (
          <span className="graph-node-chevron placeholder" aria-hidden="true" />
        )}

        <span className="graph-node-step" aria-hidden="true">
          {node.step}
        </span>
        <GraphNodeIcon
          className="graph-node-icon"
          kind={node.kind}
          {...(node.iconKey !== undefined ? { iconKey: node.iconKey } : {})}
        />

        <button
          type="button"
          className="graph-node-title"
          onClick={() => (target ? onOpen(target) : expandable && onToggle(node.id))}
        >
          {node.label}
        </button>
      </div>

      {node.summary && (
        <p className="graph-node-summary" title={node.summary}>
          {node.summary}
        </p>
      )}

      {node.kind !== 'exercise' && node.totalExercises > 0 && (
        <ProgressBar passed={node.passedExercises} total={node.totalExercises} />
      )}

      <div className="graph-node-meta">
        {node.difficulty ? (
          <DifficultyBadge difficulty={node.difficulty} />
        ) : (
          <span className="graph-node-count">
            {node.totalExercises === 0
              ? 'Coming soon'
              : `${node.passedExercises}/${node.totalExercises} solved`}
          </span>
        )}
        {status === 'completed' && node.kind === 'exercise' && (
          <span className="graph-node-check" role="img" aria-label="solved">
            ✓
          </span>
        )}
        {node.next && <span className="graph-node-next">Start here</span>}
      </div>

      {node.topicPath && node.topicPath.length > 0 && (
        <p className="graph-node-topic" title={node.topicPath.join(' / ')}>
          {node.topicPath.join(' / ')}
        </p>
      )}

      {node.externalPrerequisites.length > 0 && (
        <p className="graph-node-prereq" title={node.externalPrerequisites.join(', ')}>
          needs {node.externalPrerequisites.join(', ')}
        </p>
      )}
    </div>
  );
}

/** Shared by the graph nodes and the cards, so progress reads the same in both. */
export function ProgressBar({ passed, total }: { passed: number; total: number }) {
  const percent = total === 0 ? 0 : Math.round((passed / total) * 100);
  return (
    <div
      className="progress-bar"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={passed}
      aria-label={`${passed} of ${total} solved`}
    >
      <span className="progress-bar-fill" style={{ width: `${percent}%` }} />
    </div>
  );
}

function GraphLegend() {
  return (
    <div className="graph-legend">
      <span>
        <span className="graph-legend-line contains" /> contains
      </span>
      <span>
        <span className="graph-legend-line requires" /> requires
      </span>
      <span>
        <span className="graph-legend-swatch completed" /> completed
      </span>
      <span>
        <span className="graph-legend-swatch in-progress" /> in progress
      </span>
      <span>
        <span className="graph-legend-swatch blocked" /> open prerequisites
      </span>
      <span>
        <span className="graph-node-next">Start here</span> next up
      </span>
    </div>
  );
}
