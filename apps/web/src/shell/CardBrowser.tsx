import { Fragment, useCallback, useMemo } from 'react';
import { type GraphNode, nodeStatus } from '../app/graph/model';
import type { View } from '../app/modes/types';
import { useLocalStorageState } from '../app/use-local-storage-state';
import { GraphNodeIcon } from './chapter-icons';
import { DifficultyBadge } from './DifficultyBadge';
import { ProgressBar } from './graph/DependencyGraph';

interface CardBrowserProps {
  roots: GraphNode[];
  /** Distinguishes the persisted drill-down position of each card surface. */
  storageKey: string;
  onOpen: (view: View) => void;
  emptyLabel?: string;
}

export function CardBrowser({
  roots,
  storageKey,
  onOpen,
  emptyLabel = 'Nothing to show here yet.'
}: CardBrowserProps) {
  const [path, setPath] = useLocalStorageState<string[]>(storageKey, []);
  const { trail, level } = useMemo(() => resolve(roots, path), [roots, path]);

  const goToDepth = useCallback(
    (depth: number) => setPath((prev) => prev.slice(0, depth)),
    [setPath]
  );

  const activate = useCallback(
    (node: GraphNode) => {
      if (node.children.length > 0) {
        setPath([...trail.map((entry) => entry.id), node.id]);
        return;
      }
      if (node.target) {
        onOpen(node.target);
      }
    },
    [trail, setPath, onOpen]
  );

  return (
    <div className="card-browser">
      {trail.length > 0 && (
        <nav className="card-crumbs" aria-label="Card navigation">
          <button type="button" className="crumb-link" onClick={() => goToDepth(0)}>
            Library
          </button>
          {trail.map((node, index) => (
            <Fragment key={node.id}>
              <span className="card-crumb-separator" aria-hidden="true">
                /
              </span>
              {index === trail.length - 1 ? (
                <span aria-current="page">{node.label}</span>
              ) : (
                <button type="button" className="crumb-link" onClick={() => goToDepth(index + 1)}>
                  {node.label}
                </button>
              )}
            </Fragment>
          ))}
        </nav>
      )}

      {level.length === 0 ? (
        <p className="muted">{emptyLabel}</p>
      ) : (
        <div className="topic-card-grid">
          {level.map((node) => (
            <NodeCard key={node.id} node={node} onActivate={activate} />
          ))}
        </div>
      )}
    </div>
  );
}

function NodeCard({
  node,
  onActivate
}: {
  node: GraphNode;
  onActivate: (node: GraphNode) => void;
}) {
  const drillable = node.children.length > 0;
  const classes = [
    'topic-card',
    node.kind,
    nodeStatus(node),
    node.blocked ? 'blocked' : '',
    node.next ? 'next' : '',
    node.onNextPath ? 'on-next-path' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={() => onActivate(node)}
      disabled={!drillable && !node.target}
    >
      <div className="topic-card-head">
        <span className="topic-card-step" aria-hidden="true">
          {node.step}
        </span>
        <GraphNodeIcon
          className="topic-card-icon"
          kind={node.kind}
          {...(node.iconKey !== undefined ? { iconKey: node.iconKey } : {})}
        />
        <h3>{node.label}</h3>
        {node.next && <span className="topic-card-next">Start here</span>}
      </div>

      {node.summary && <p className="topic-card-summary">{node.summary}</p>}

      {node.kind !== 'exercise' && node.totalExercises > 0 && (
        <ProgressBar passed={node.passedExercises} total={node.totalExercises} />
      )}

      <div className="topic-card-meta">
        {node.difficulty ? (
          <DifficultyBadge difficulty={node.difficulty} />
        ) : (
          <span>
            {node.totalExercises === 0
              ? 'Coming soon'
              : `${node.passedExercises}/${node.totalExercises} solved`}
          </span>
        )}
        {drillable && <span>{describeChildren(node)}</span>}
      </div>

      {node.externalPrerequisites.length > 0 && (
        <p className="topic-card-prereq">needs {node.externalPrerequisites.join(', ')}</p>
      )}
    </button>
  );
}

function describeChildren(node: GraphNode): string {
  const challenges = node.children.filter((child) => child.kind === 'exercise').length;
  const sections = node.children.length - challenges;
  return [
    sections > 0 ? `${sections} ${sections === 1 ? 'section' : 'sections'}` : '',
    challenges > 0 ? `${challenges} ${challenges === 1 ? 'challenge' : 'challenges'}` : ''
  ]
    .filter(Boolean)
    .join(' · ');
}

function resolve(roots: GraphNode[], path: string[]): { trail: GraphNode[]; level: GraphNode[] } {
  const trail: GraphNode[] = [];
  let level = roots;

  for (const id of path) {
    const node = level.find((candidate) => candidate.id === id);
    if (!node || node.children.length === 0) {
      break;
    }
    trail.push(node);
    level = node.children;
  }

  return { trail, level };
}
