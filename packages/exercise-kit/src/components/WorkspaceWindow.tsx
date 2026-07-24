import type { WindowDragSourceHandlers, WindowDragTargetHandlers } from '../use-window-swap-drag';

export function WorkspaceWindow({
  title,
  collapsed,
  onToggleCollapsed,
  collapseLabel,
  dragSourceHandlers,
  dragTargetHandlers,
  dragging,
  dragOver,
  className,
  children
}: {
  title: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  collapseLabel: string;
  dragSourceHandlers: WindowDragSourceHandlers;
  dragTargetHandlers: WindowDragTargetHandlers;
  dragging: boolean;
  dragOver: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const classes = ['workspace-window'];
  if (className) {
    classes.push(className);
  }
  if (collapsed) {
    classes.push('collapsed');
  }
  if (dragging) {
    classes.push('dragging');
  }
  if (dragOver) {
    classes.push('drag-over');
  }

  return (
    <section className={classes.join(' ')} {...dragTargetHandlers}>
      <button
        type="button"
        className="workspace-window-bar"
        aria-expanded={!collapsed}
        aria-label={collapseLabel}
        onClick={onToggleCollapsed}
        {...dragSourceHandlers}
      >
        <span className="workspace-window-title">{title}</span>
        <span className="workspace-window-collapse-icon" aria-hidden="true">
          {collapsed ? '▸' : '▾'}
        </span>
      </button>
      {!collapsed && (
        <div className="workspace-window-body">
          <div className="workspace-window-body-inner">{children}</div>
        </div>
      )}
    </section>
  );
}
