import { useTranslation } from '../app/i18n/use-translation';
import type { ModeDefinition, View } from '../app/modes/types';
import type { TopicNode } from '../app/topic-tree';
import { useLocalStorageState } from '../app/use-local-storage-state';
import { SidebarFolder } from './SidebarFolder';

interface SidebarProps {
  modes: ModeDefinition[];
  activeKind: View['kind'];
  tree: TopicNode[];
  activeExerciseId: string | null;
  onNavigate: (view: View) => void;
}

export function Sidebar({ modes, activeKind, tree, activeExerciseId, onNavigate }: SidebarProps) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useLocalStorageState<Record<string, boolean>>(
    'db-dojo:folder-collapsed',
    {}
  );

  function toggle(key: string) {
    setCollapsed((prev) => ({ ...prev, [key]: !(prev[key] ?? false) }));
  }

  return (
    <nav className="sidebar">
      <button type="button" className="sidebar-brand" onClick={() => onNavigate({ kind: 'home' })}>
        DB Dojo
      </button>

      {modes
        .filter((mode) => mode.showInSidebar)
        .map((mode) => (
          <button
            key={mode.id}
            type="button"
            className={mode.id === activeKind ? 'sidebar-link active' : 'sidebar-link'}
            aria-label={mode.navLabel}
            onClick={() => onNavigate(mode.defaultView())}
          >
            {t(`nav.${mode.id}`)}
          </button>
        ))}

      {activeKind === 'library' && (
        <div className="sidebar-tree">
          {tree.map((node) => (
            <SidebarFolder
              key={node.key}
              node={node}
              activeId={activeExerciseId}
              collapsed={collapsed}
              onToggle={toggle}
              onSelect={(id) => onNavigate({ kind: 'exercise', id })}
            />
          ))}
        </div>
      )}
    </nav>
  );
}
