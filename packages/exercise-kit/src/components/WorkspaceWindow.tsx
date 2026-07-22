import { useEffect, useRef } from 'react';
import type { WindowDragSourceHandlers, WindowDragTargetHandlers } from '../use-window-swap-drag';

// Keep in sync with the padding-top + padding-bottom of .workspace-window-body in global.css.
const BODY_PADDING_Y = 32;

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
  onOverflow,
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
  onOverflow?: ((neededHeight: number) => void) | undefined;
  children: React.ReactNode;
}) {
  const barRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onOverflow || collapsed) {
      return;
    }
    const body = bodyRef.current;
    const inner = innerRef.current;
    if (!body || !inner) {
      return;
    }

    const measure = () => {
      const available = body.clientHeight - BODY_PADDING_Y;
      const needed = inner.getBoundingClientRect().height;
      if (needed > available + 1) {
        const barHeight = barRef.current?.getBoundingClientRect().height ?? 0;
        onOverflow(Math.ceil(barHeight + needed + BODY_PADDING_Y));
      }
    };

    const observer = new ResizeObserver(measure);
    observer.observe(body);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [onOverflow, collapsed]);

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
        ref={barRef}
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
        <div className="workspace-window-body" ref={bodyRef}>
          <div className="workspace-window-body-inner" ref={innerRef}>
            {children}
          </div>
        </div>
      )}
    </section>
  );
}
