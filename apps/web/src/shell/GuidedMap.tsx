import type { ExerciseId, ExerciseProgress } from '@db-dojo/core';
import { useLayoutEffect, useState } from 'react';
import { chapterProgress } from '../app/chapter-tree';
import type { Chapter } from '../app/curriculum';
import { useTranslation } from '../app/i18n/use-translation';
import { ChapterIcon, FlagIcon } from './chapter-icons';
import { usePanZoom } from './graph/use-pan-zoom';

const MILESTONE_GAP_Y = 190;
const SUB_GAP_Y = 130;
const MAP_TOP_PADDING = 90;
const MIN_MAP_WIDTH = 320;
const FALLBACK_MAP_WIDTH = 640;
const MIN_SCALE = 0.5;
const MAX_SCALE = 2;
const ZOOM_STEP = 0.15;
const MILESTONE_AMPLITUDE_RATIO = 0.32;
const SUB_AMPLITUDE_RATIO = 0.16;

export type ChapterStatus = 'completed' | 'current' | 'pending';

export function computeChapterStatuses(
  chapters: Chapter[],
  perExercise: Record<ExerciseId, ExerciseProgress>
): ChapterStatus[] {
  let currentAssigned = false;
  return chapters.map((chapter) => {
    const progress = chapterProgress(chapter, perExercise);
    const completed =
      progress.totalExercises > 0 && progress.passedExercises === progress.totalExercises;
    if (completed) {
      return 'completed';
    }
    if (!currentAssigned) {
      currentAssigned = true;
      return 'current';
    }
    return 'pending';
  });
}

interface MapNode {
  chapter: Chapter;
  status: ChapterStatus;
  kind: 'milestone' | 'sub';
}

function childStatuses(
  chapter: Chapter,
  ownStatus: ChapterStatus,
  perExercise: Record<ExerciseId, ExerciseProgress>
): ChapterStatus[] {
  if (chapter.children.length === 0) {
    return [];
  }
  if (ownStatus === 'completed') {
    return chapter.children.map(() => 'completed');
  }
  if (ownStatus === 'pending') {
    return chapter.children.map(() => 'pending');
  }
  return computeChapterStatuses(chapter.children, perExercise);
}

function flattenMapNodes(
  chapters: Chapter[],
  perExercise: Record<ExerciseId, ExerciseProgress>
): MapNode[] {
  const topStatuses = computeChapterStatuses(chapters, perExercise);
  const nodes: MapNode[] = [];
  chapters.forEach((chapter, index) => {
    const status = topStatuses[index] ?? 'pending';
    nodes.push({ chapter, status, kind: 'milestone' });
    const statuses = childStatuses(chapter, status, perExercise);
    chapter.children.forEach((child, childIndex) => {
      nodes.push({ chapter: child, status: statuses[childIndex] ?? 'pending', kind: 'sub' });
    });
  });
  return nodes;
}

function nodePositions(nodes: MapNode[], mapWidth: number): { x: number; y: number }[] {
  const milestoneAmplitude = mapWidth * MILESTONE_AMPLITUDE_RATIO;
  const subAmplitude = mapWidth * SUB_AMPLITUDE_RATIO;
  let y = MAP_TOP_PADDING;
  return nodes.map((node, index) => {
    if (index > 0) {
      y += node.kind === 'milestone' ? MILESTONE_GAP_Y : SUB_GAP_Y;
    }
    const amplitude = node.kind === 'milestone' ? milestoneAmplitude : subAmplitude;
    const x = mapWidth / 2 + amplitude * Math.sin(index * 1.4);
    return { x, y };
  });
}

function segmentClass(from: ChapterStatus, to: ChapterStatus): 'walked' | 'current' | 'pending' {
  if (to === 'current') {
    return 'current';
  }
  if (from === 'completed' && to === 'completed') {
    return 'walked';
  }
  return 'pending';
}

export function GuidedMap({
  chapters,
  perExercise,
  onOpen
}: {
  chapters: Chapter[];
  perExercise: Record<ExerciseId, ExerciseProgress>;
  onOpen: (chapterId: string) => void;
}) {
  const { t } = useTranslation();
  const panZoom = usePanZoom({ min: MIN_SCALE, max: MAX_SCALE, step: ZOOM_STEP });
  const [mapWidth, setMapWidth] = useState(FALLBACK_MAP_WIDTH);
  const viewportRef = panZoom.viewportRef;

  useLayoutEffect(() => {
    const element = viewportRef.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) {
        setMapWidth(Math.max(MIN_MAP_WIDTH, width));
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [viewportRef]);

  const nodes = flattenMapNodes(chapters, perExercise);
  const positions = nodePositions(nodes, mapWidth);
  const lastPosition = positions[positions.length - 1];
  const mapHeight = (lastPosition?.y ?? MAP_TOP_PADDING) + MAP_TOP_PADDING;

  return (
    <div
      ref={viewportRef}
      className={panZoom.dragging ? 'guided-map-viewport dragging' : 'guided-map-viewport'}
      onPointerDown={panZoom.onPointerDown}
    >
      <div
        className="guided-map"
        style={{
          width: mapWidth,
          height: mapHeight,
          transform: `translate(${panZoom.pan.x}px, ${panZoom.pan.y}px) scale(${panZoom.scale})`,
          transformOrigin: 'top center'
        }}
      >
        <svg
          className="guided-map-paths"
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          width={mapWidth}
          height={mapHeight}
          aria-hidden="true"
        >
          {nodes.slice(1).map((node, i) => {
            const from = positions[i];
            const to = positions[i + 1];
            const previous = nodes[i];
            if (!from || !to || !previous) {
              return null;
            }
            return (
              <path
                key={`edge-${node.chapter.id}`}
                d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
                className={`guided-map-path ${segmentClass(previous.status, node.status)}`}
              />
            );
          })}
        </svg>

        {nodes.map((node, index) => {
          const position = positions[index];
          if (!position) {
            return null;
          }
          const { x, y } = position;
          const isMilestone = node.kind === 'milestone';
          return (
            <button
              key={node.chapter.id}
              type="button"
              className={`guided-map-node ${node.kind} ${node.status}`}
              style={{ left: x, top: y }}
              onClick={() => onOpen(node.chapter.id)}
            >
              <span className="guided-map-node-icon">
                <ChapterIcon chapterId={node.chapter.id} />
                {isMilestone && (
                  <span className="guided-map-node-badge">
                    <FlagIcon />
                  </span>
                )}
              </span>
              <span className="guided-map-node-title">{node.chapter.title}</span>
              {node.chapter.summary && (
                <span className="guided-map-node-summary">{node.chapter.summary}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="guided-map-zoom" onPointerDown={(event) => event.stopPropagation()}>
        <button type="button" aria-label={t('guided.zoomIn')} onClick={panZoom.zoomIn}>
          +
        </button>
        <button type="button" aria-label={t('guided.zoomOut')} onClick={panZoom.zoomOut}>
          −
        </button>
      </div>
    </div>
  );
}
