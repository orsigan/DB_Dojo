import type { Language } from '@db-dojo/core';
import type { ReactNode } from 'react';
import { d, toolHint, toolLabel } from './diagram-strings';
import type { DiagramTool, DiagramToolId } from './diagram-tools';

interface DiagramPaletteProps {
  tools: DiagramTool[];
  language: Language;
  activeToolId: DiagramToolId | null;
  onArm: (toolId: DiagramToolId) => void;
}

export function DiagramPalette({ tools, language, activeToolId, onArm }: DiagramPaletteProps) {
  const elements = tools.filter((tool) => tool.group === 'elements');
  const relationships = tools.filter((tool) => tool.group === 'relationships');

  return (
    <aside className="diagram-palette">
      <div className="diagram-palette-head">
        <h3>{d('paletteTitle', language)}</h3>
        <p className="muted">{d('paletteHelp', language)}</p>
      </div>

      <PaletteGroup
        title={d('groupElements', language)}
        tools={elements}
        language={language}
        activeToolId={activeToolId}
        onArm={onArm}
      />
      <PaletteGroup
        title={d('groupRelationships', language)}
        tools={relationships}
        language={language}
        activeToolId={activeToolId}
        onArm={onArm}
      />

      <div className="diagram-legend">
        <h4>{d('legendTitle', language)}</h4>
        <p className="muted">{d('legendDelete', language)}</p>
        <p className="muted">{d('legendPan', language)}</p>
      </div>
    </aside>
  );
}

function PaletteGroup({
  title,
  tools,
  language,
  activeToolId,
  onArm
}: {
  title: string;
  tools: DiagramTool[];
  language: Language;
  activeToolId: DiagramToolId | null;
  onArm: (toolId: DiagramToolId) => void;
}) {
  if (tools.length === 0) {
    return null;
  }

  return (
    <div className="diagram-palette-group">
      <h4>{title}</h4>
      {tools.map((tool) => (
        <button
          key={tool.id}
          type="button"
          className={activeToolId === tool.id ? 'diagram-tool active' : 'diagram-tool'}
          aria-pressed={activeToolId === tool.id}
          title={toolHint(tool.id, language)}
          onPointerDown={(event) => {
            event.preventDefault();
            onArm(tool.id);
          }}
        >
          <span className="diagram-tool-icon" aria-hidden="true">
            {toolIcon(tool.id)}
          </span>
          <span className="diagram-tool-text">
            <span className="diagram-tool-label">{toolLabel(tool.id, language)}</span>
            <span className="diagram-tool-hint">{toolHint(tool.id, language)}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function toolIcon(toolId: DiagramToolId): ReactNode {
  if (toolId === 'class' || toolId === 'table' || toolId === 'association-class') {
    return (
      <svg viewBox="0 0 32 24" width="32" height="24" aria-hidden="true">
        <rect
          x="4"
          y="3"
          width="24"
          height="18"
          rx="2"
          className={
            toolId === 'association-class' ? 'diagram-icon-box dashed' : 'diagram-icon-box'
          }
        />
        <line x1="4" y1="10" x2="28" y2="10" className="diagram-icon-line" />
        {toolId === 'table' && (
          <line x1="4" y1="15.5" x2="28" y2="15.5" className="diagram-icon-line" />
        )}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 24" width="32" height="24" aria-hidden="true">
      {toolId === 'aggregation' && (
        <path d="M 4 12 L 10 8 L 16 12 L 10 16 Z" className="diagram-icon-box" />
      )}
      {toolId === 'composition' && (
        <path d="M 4 12 L 10 8 L 16 12 L 10 16 Z" className="diagram-icon-solid" />
      )}
      {toolId === 'generalization' && (
        <path d="M 20 6 L 28 12 L 20 18 Z" className="diagram-icon-box" />
      )}
      {(toolId === 'foreign-key' || toolId === 'functional-dependency') && (
        <path d="M 22 8 L 28 12 L 22 16 Z" className="diagram-icon-solid" />
      )}
      <line
        x1={toolId === 'aggregation' || toolId === 'composition' ? 16 : 4}
        y1="12"
        x2={toolId === 'generalization' ? 20 : toolId === 'association' ? 28 : 22}
        y2="12"
        className={
          toolId === 'functional-dependency' ? 'diagram-icon-line accent' : 'diagram-icon-line'
        }
      />
    </svg>
  );
}
