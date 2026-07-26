import type { Language } from '@db-dojo/core';
import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';
import { usePanZoom } from '../use-pan-zoom';
import { DiagramEdgeLayer } from './DiagramEdgeLayer';
import { DiagramNodeCard, type NodePickMode } from './DiagramNodeCard';
import {
  ATTRIBUTE_ROW_HEIGHT,
  attributeRowCenter,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  NODE_HEADER_HEIGHT,
  NODE_WIDTH,
  nodeCenter,
  type Point
} from './diagram-geometry';
import { d } from './diagram-strings';
import type { DiagramEditor } from './use-diagram-editor';

const MIN_SCALE = 0.4;
const MAX_SCALE = 1.8;
const ZOOM_STEP = 0.1;
const GHOST_HEIGHT = NODE_HEADER_HEIGHT + ATTRIBUTE_ROW_HEIGHT + 34;

interface DiagramCanvasProps {
  editor: DiagramEditor;
  language: Language;
}

export function DiagramCanvas({ editor, language }: DiagramCanvasProps) {
  const panZoom = usePanZoom({ min: MIN_SCALE, max: MAX_SCALE, step: ZOOM_STEP });
  const [pointer, setPointer] = useState<Point | null>(null);
  const placedInGesture = useRef(false);
  const editorRef = useRef(editor);
  editorRef.current = editor;

  const tool = editor.activeTool;
  const dropsOnCanvas = tool?.placement === 'canvas' || tool?.placement === 'edge';

  const toCanvasPoint = (event: { clientX: number; clientY: number }): Point | null => {
    const rect = panZoom.viewportRef.current?.getBoundingClientRect();
    if (!rect) {
      return null;
    }
    return {
      x: (event.clientX - rect.left - panZoom.pan.x) / panZoom.scale,
      y: (event.clientY - rect.top - panZoom.pan.y) / panZoom.scale
    };
  };

  const placeAt = (point: Point): boolean => {
    const current = editorRef.current;
    const activeTool = current.activeTool;
    const target = current.dropTargetAt(point);
    if (!activeTool || !target) {
      return false;
    }
    if (target.kind === 'canvas' && activeTool.nodeKind) {
      current.placeNode(activeTool.nodeKind, point);
      return true;
    }
    if (target.kind === 'edge') {
      current.attachAssociationClass(target.edgeId, point);
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (!dropsOnCanvas) {
      return;
    }
    const handleUp = (event: globalThis.PointerEvent) => {
      if (placedInGesture.current) {
        placedInGesture.current = false;
        return;
      }
      const rect = panZoom.viewportRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!inside) {
        return;
      }
      const point = {
        x: (event.clientX - rect.left - panZoom.pan.x) / panZoom.scale,
        y: (event.clientY - rect.top - panZoom.pan.y) / panZoom.scale
      };
      placeAt(point);
    };

    window.addEventListener('pointerup', handleUp);
    return () => window.removeEventListener('pointerup', handleUp);
  });

  const handleBackgroundPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const point = toCanvasPoint(event);
    if (!point) {
      return;
    }

    if (dropsOnCanvas) {
      placedInGesture.current = placeAt(point);
      return;
    }
    if (tool) {
      editor.cancelPending();
      return;
    }

    const edge = editor.edgeAt(point);
    if (edge) {
      editor.select({ kind: 'edge', id: edge.id });
      return;
    }

    editor.select(null);
    panZoom.onPointerDown(event);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!tool) {
      return;
    }
    setPointer(toCanvasPoint(event));
  };

  const dropTarget = tool && pointer ? editor.dropTargetAt(pointer) : null;
  const highlightedEdgeId = dropTarget?.kind === 'edge' ? dropTarget.edgeId : null;
  const pickMode: NodePickMode =
    tool?.placement === 'nodes' ? 'nodes' : tool?.placement === 'attributes' ? 'attributes' : null;

  const viewportClassName = ['diagram-viewport', panZoom.dragging && 'dragging', tool && 'arming']
    .filter(Boolean)
    .join(' ');

  return (
    <div className="diagram-canvas-area">
      <DiagramToolbar editor={editor} language={language} panZoom={panZoom} />

      <div
        ref={panZoom.viewportRef}
        className={viewportClassName}
        onPointerDown={handleBackgroundPointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setPointer(null)}
      >
        <div
          className="diagram-canvas"
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            transform: `translate(${panZoom.pan.x}px, ${panZoom.pan.y}px) scale(${panZoom.scale})`,
            transformOrigin: 'top left'
          }}
        >
          <DiagramEdgeLayer
            diagram={editor.diagram}
            language={language}
            selection={editor.selection}
            highlightedEdgeId={highlightedEdgeId}
            editor={editor}
          />

          {editor.diagram.nodes.map((node) => (
            <DiagramNodeCard
              key={node.id}
              node={node}
              language={language}
              selected={editor.selection?.kind === 'node' && editor.selection.id === node.id}
              pickMode={pickMode}
              pendingAttributeIds={
                editor.pending?.sourceNodeId === node.id ? editor.pending.sourceAttributeIds : []
              }
              scale={panZoom.scale}
              editor={editor}
            />
          ))}

          <DiagramOverlay editor={editor} pointer={pointer} valid={dropTarget !== null} />
        </div>

        {editor.diagram.nodes.length === 0 && (
          <p className="diagram-empty muted">{d('emptyCanvas', language)}</p>
        )}
      </div>

      <DiagramStepBar editor={editor} language={language} />
    </div>
  );
}

function DiagramOverlay({
  editor,
  pointer,
  valid
}: {
  editor: DiagramEditor;
  pointer: Point | null;
  valid: boolean;
}) {
  const tool = editor.activeTool;
  if (!tool || !pointer) {
    return null;
  }

  if (tool.placement === 'canvas' || tool.placement === 'edge') {
    return (
      <div
        className={valid ? 'diagram-ghost valid' : 'diagram-ghost'}
        style={{
          left: pointer.x - NODE_WIDTH / 2,
          top: pointer.y - 40,
          width: NODE_WIDTH,
          height: GHOST_HEIGHT
        }}
      />
    );
  }

  const source = pendingSourcePoint(editor);
  if (!source) {
    return null;
  }

  return (
    <svg
      className="diagram-rubber-band"
      viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      aria-hidden="true"
    >
      <line x1={source.x} y1={source.y} x2={pointer.x} y2={pointer.y} />
    </svg>
  );
}

function pendingSourcePoint(editor: DiagramEditor): Point | null {
  const pending = editor.pending;
  if (!pending?.sourceNodeId || pending.phase !== 'target') {
    return null;
  }
  const node = editor.diagram.nodes.find((candidate) => candidate.id === pending.sourceNodeId);
  if (!node) {
    return null;
  }
  const attributeId = pending.sourceAttributeIds[0];
  const rowY = attributeId ? attributeRowCenter(node, attributeId) : null;
  if (rowY === null) {
    return nodeCenter(node);
  }
  return { x: node.x + NODE_WIDTH, y: rowY };
}

function DiagramToolbar({
  editor,
  language,
  panZoom
}: {
  editor: DiagramEditor;
  language: Language;
  panZoom: ReturnType<typeof usePanZoom>;
}) {
  return (
    <div className="diagram-toolbar">
      <div className="diagram-toolbar-group">
        <button type="button" onClick={editor.undo} disabled={!editor.canUndo}>
          ↶ {d('undo', language)}
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(d('clearCanvasConfirm', language))) {
              editor.clear();
            }
          }}
        >
          {d('clearCanvas', language)}
        </button>
      </div>
      <div className="diagram-toolbar-group">
        <button type="button" aria-label={d('zoomOut', language)} onClick={panZoom.zoomOut}>
          −
        </button>
        <span className="diagram-zoom-value">{Math.round(panZoom.scale * 100)}%</span>
        <button type="button" aria-label={d('zoomIn', language)} onClick={panZoom.zoomIn}>
          +
        </button>
        <button type="button" onClick={panZoom.reset}>
          {d('resetView', language)}
        </button>
      </div>
    </div>
  );
}

function DiagramStepBar({ editor, language }: { editor: DiagramEditor; language: Language }) {
  const tool = editor.activeTool;
  if (!tool) {
    return null;
  }

  const pending = editor.pending;
  const collectsDeterminants = tool.id === 'functional-dependency';
  const readyToConfirm =
    collectsDeterminants && pending?.phase === 'source' && pending.sourceAttributeIds.length > 0;

  return (
    <div className="diagram-step-bar">
      <span className="diagram-step-text">{stepText(editor, language)}</span>
      {readyToConfirm && (
        <button type="button" className="primary" onClick={editor.confirmDeterminants}>
          {d('confirmDeterminants', language)} →
        </button>
      )}
      <button type="button" className="ghost" onClick={editor.cancelPending}>
        {d('cancelStep', language)}
      </button>
    </div>
  );
}

function stepText(editor: DiagramEditor, language: Language): string {
  const tool = editor.activeTool;
  if (!tool) {
    return '';
  }
  if (tool.placement === 'canvas') {
    return d('stepPlaceElement', language);
  }
  if (tool.placement === 'edge') {
    return d('stepPlaceAssociationClass', language);
  }

  const pending = editor.pending;
  if (tool.placement === 'nodes') {
    return d(pending ? 'stepPickTarget' : 'stepPickSource', language);
  }
  if (tool.id === 'functional-dependency') {
    return d(pending?.phase === 'target' ? 'stepPickDependent' : 'stepPickDeterminants', language);
  }
  return d(pending ? 'stepPickTargetAttribute' : 'stepPickSourceAttribute', language);
}
