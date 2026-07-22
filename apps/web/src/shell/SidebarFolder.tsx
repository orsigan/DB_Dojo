import { localize } from '@db-dojo/core';
import { useLanguage } from '../app/i18n/use-language';
import type { TopicNode } from '../app/topic-tree';
import { DifficultyDot } from './DifficultyBadge';

interface SidebarFolderProps {
  node: TopicNode;
  activeId: string | null;
  collapsed: Record<string, boolean>;
  onToggle: (key: string) => void;
  onSelect: (id: string) => void;
}

export function SidebarFolder({
  node,
  activeId,
  collapsed,
  onToggle,
  onSelect
}: SidebarFolderProps) {
  const isOpen = !(collapsed[node.key] ?? false);
  const { language } = useLanguage();

  return (
    <div className="sidebar-folder">
      <button
        type="button"
        className="sidebar-folder-toggle"
        aria-expanded={isOpen}
        onClick={() => onToggle(node.key)}
      >
        <span className={isOpen ? 'sidebar-folder-chevron open' : 'sidebar-folder-chevron'}>›</span>
        <span className="sidebar-folder-label">{node.label}</span>
      </button>

      {isOpen && (
        <div className="sidebar-folder-children">
          {node.exercises.map((module) => (
            <button
              key={module.definition.id}
              type="button"
              className={module.definition.id === activeId ? 'sidebar-link active' : 'sidebar-link'}
              onClick={() => onSelect(module.definition.id)}
            >
              <DifficultyDot difficulty={module.definition.difficulty} />
              {localize(module.definition.title, language)}
            </button>
          ))}
          {node.children.map((child) => (
            <SidebarFolder
              key={child.key}
              node={child}
              activeId={activeId}
              collapsed={collapsed}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
