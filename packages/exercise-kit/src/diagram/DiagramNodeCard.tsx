import type { DiagramNode, Language } from '@db-dojo/core';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { ATTRIBUTE_ROW_HEIGHT, NODE_WIDTH, nodeHeight } from './diagram-geometry';
import { d } from './diagram-strings';
import type { DiagramEditor } from './use-diagram-editor';

export type NodePickMode = 'nodes' | 'attributes' | null;

interface DiagramNodeCardProps {
  node: DiagramNode;
  language: Language;
  selected: boolean;
  pickMode: NodePickMode;
  pendingAttributeIds: string[];
  scale: number;
  editor: DiagramEditor;
}

export function DiagramNodeCard({
  node,
  language,
  selected,
  pickMode,
  pendingAttributeIds,
  scale,
  editor
}: DiagramNodeCardProps) {
  const className = [
    'diagram-node',
    `diagram-node-${node.kind}`,
    selected && 'selected',
    pickMode && 'picking'
  ]
    .filter(Boolean)
    .join(' ');

  const startDrag = (event: ReactPointerEvent) => {
    if (pickMode) {
      return;
    }
    event.stopPropagation();
    editor.select({ kind: 'node', id: node.id });
    editor.beginNodeDrag();

    const startX = event.clientX;
    const startY = event.clientY;
    const originX = node.x;
    const originY = node.y;

    const handleMove = (moveEvent: globalThis.PointerEvent) => {
      editor.moveNode(node.id, {
        x: originX + (moveEvent.clientX - startX) / scale,
        y: originY + (moveEvent.clientY - startY) / scale
      });
    };
    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  const handleCardPointerDown = (event: ReactPointerEvent) => {
    event.stopPropagation();
    if (pickMode === 'nodes') {
      editor.pickNode(node.id);
      return;
    }
    if (!pickMode) {
      editor.select({ kind: 'node', id: node.id });
    }
  };

  return (
    <div
      className={className}
      style={{ left: node.x, top: node.y, width: NODE_WIDTH, height: nodeHeight(node) }}
      onPointerDown={handleCardPointerDown}
    >
      <div
        className="diagram-node-head"
        onPointerDown={startDrag}
        title={d('moveElement', language)}
      >
        <span className="diagram-node-grip" aria-hidden="true">
          ⠿
        </span>
        <input
          className="diagram-node-name"
          value={node.name}
          placeholder={d('namePlaceholder', language)}
          aria-label={d('namePlaceholder', language)}
          onChange={(event) => editor.renameNode(node.id, event.target.value)}
          onPointerDown={(event) => event.stopPropagation()}
        />
      </div>

      <div className="diagram-node-attributes">
        {node.attributes.map((attribute) => (
          <div
            key={attribute.id}
            className={
              pendingAttributeIds.includes(attribute.id)
                ? 'diagram-attribute pending'
                : 'diagram-attribute'
            }
            style={{ height: ATTRIBUTE_ROW_HEIGHT }}
            onPointerDown={(event) => {
              if (pickMode === 'attributes') {
                event.stopPropagation();
                editor.pickAttribute(node.id, attribute.id);
              }
            }}
          >
            <button
              type="button"
              className={attribute.isPrimaryKey ? 'diagram-key-badge on' : 'diagram-key-badge'}
              title={d('togglePrimaryKey', language)}
              aria-pressed={attribute.isPrimaryKey}
              onClick={() => editor.toggleAttributeKey(node.id, attribute.id, 'primary')}
            >
              PK
            </button>
            {node.kind === 'table' && (
              <button
                type="button"
                className={attribute.isForeignKey ? 'diagram-key-badge on' : 'diagram-key-badge'}
                title={d('toggleForeignKey', language)}
                aria-pressed={attribute.isForeignKey}
                onClick={() => editor.toggleAttributeKey(node.id, attribute.id, 'foreign')}
              >
                FK
              </button>
            )}
            <input
              className="diagram-attribute-name"
              value={attribute.name}
              placeholder={d('attributePlaceholder', language)}
              aria-label={d('attributePlaceholder', language)}
              onChange={(event) =>
                editor.renameAttribute(node.id, attribute.id, event.target.value)
              }
            />
            <button
              type="button"
              className="diagram-attribute-remove"
              title={d('removeAttribute', language)}
              onClick={() => editor.removeAttribute(node.id, attribute.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="diagram-node-foot">
        <button type="button" className="ghost" onClick={() => editor.addAttribute(node.id)}>
          + {d('addAttribute', language)}
        </button>
      </div>
    </div>
  );
}
