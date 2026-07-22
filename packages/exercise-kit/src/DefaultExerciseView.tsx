import type { Exercise, Language } from '@db-dojo/core';
import { localize } from '@db-dojo/core';
import { type CSSProperties, type ReactNode, useCallback, useState } from 'react';
import { HintList } from './components/HintList';
import { PaneResizer } from './components/PaneResizer';
import { SchemaPanel } from './components/SchemaPanel';
import { ShellPane } from './components/ShellPane';
import { ShellPaneSelector } from './components/ShellPaneSelector';
import { ShellTabBar } from './components/ShellTabBar';
import { WorkspaceWindow } from './components/WorkspaceWindow';
import type { ExerciseHostApi, ExerciseViewProps } from './contract';
import { t } from './strings';
import { useMediaQuery } from './use-media-query';
import type { ShellPaneLayout } from './use-shell-pane-layout';
import {
  MAX_SHELL_PANE_WIDTH,
  MIN_SHELL_PANE_WIDTH,
  useShellPaneLayout
} from './use-shell-pane-layout';
import type { ShellTabs } from './use-shell-tabs';
import { useShellTabs } from './use-shell-tabs';
import { useWindowSwapDrag } from './use-window-swap-drag';
import type { WorkspaceWindowId } from './use-workspace-layout';
import {
  MAX_LEFT_COLUMN_WIDTH,
  MAX_TOP_LEFT_ROW_HEIGHT,
  MIN_LEFT_COLUMN_WIDTH,
  MIN_TOP_LEFT_ROW_HEIGHT,
  useWorkspaceLayout
} from './use-workspace-layout';

const COLLAPSED_WINDOW_SIZE = 40;

type GrowableSlotKey = 'topLeft' | 'bottomLeft';

const SLOT_CLASS_NAMES = {
  topLeft: 'workspace-window-slot-top-left',
  bottomLeft: 'workspace-window-slot-bottom-left',
  right: 'workspace-window-slot-right'
} as const;

function windowTitle(id: WorkspaceWindowId, language: Language): string {
  if (id === 'prompt') {
    return t('workspaceWindowPrompt', language);
  }
  if (id === 'schema') {
    return t('workspaceWindowSchema', language);
  }
  return t('workspaceWindowShell', language);
}

function paneFlexStyle(pane: 'left' | 'right', paneLayout: ShellPaneLayout): CSSProperties {
  if (pane === 'left') {
    if (paneLayout.leftCollapsed) {
      return { flex: `0 0 ${COLLAPSED_WINDOW_SIZE}px` };
    }
    if (paneLayout.rightCollapsed) {
      return { flex: '1 1 auto' };
    }
    return { flex: `0 0 ${paneLayout.leftWidth}px` };
  }
  if (paneLayout.rightCollapsed) {
    return { flex: `0 0 ${COLLAPSED_WINDOW_SIZE}px` };
  }
  return { flex: '1 1 auto' };
}

function ShellWindowContent({
  exercise,
  host,
  language,
  tabs,
  paneLayout,
  paneDrag,
  stacked
}: {
  exercise: Exercise;
  host: ExerciseHostApi;
  language: Language;
  tabs: ShellTabs;
  paneLayout: ShellPaneLayout;
  paneDrag: ReturnType<typeof useWindowSwapDrag<'left' | 'right'>>;
  stacked: boolean;
}) {
  const split = tabs.rightTabId !== null && !stacked;

  return (
    <>
      <ShellTabBar tabs={tabs} language={language} />

      <div className={stacked ? 'shell-panes shell-panes-stacked' : 'shell-panes'}>
        {tabs.tabIds.map((id, index) => {
          const pane: 'left' | 'right' = id === tabs.rightTabId ? 'right' : 'left';
          const visible = id === tabs.leftTabId || id === tabs.rightTabId;
          const collapsed = pane === 'left' ? paneLayout.leftCollapsed : paneLayout.rightCollapsed;

          return (
            <div
              key={id}
              className="shell-pane"
              style={{
                display: visible ? 'flex' : 'none',
                order: pane === 'right' ? 2 : 0,
                ...(split ? paneFlexStyle(pane, paneLayout) : undefined)
              }}
            >
              {split ? (
                <WorkspaceWindow
                  title={`${t('shellTab', language)} ${index + 1}`}
                  collapsed={collapsed}
                  onToggleCollapsed={() => paneLayout.toggleCollapsed(pane)}
                  collapseLabel={t(collapsed ? 'expandWindow' : 'collapseWindow', language)}
                  dragSourceHandlers={paneDrag.dragSourceHandlers(pane)}
                  dragTargetHandlers={paneDrag.dragTargetHandlers(pane)}
                  dragging={paneDrag.draggedId === pane}
                  dragOver={paneDrag.dragOverId === pane}
                  className="shell-pane-window"
                >
                  <ShellPaneSelector pane={pane} tabs={tabs} language={language} />
                  <ShellPane exercise={exercise} host={host} language={language} tabId={id} />
                </WorkspaceWindow>
              ) : (
                <>
                  {tabs.rightTabId !== null && (
                    <ShellPaneSelector pane={pane} tabs={tabs} language={language} />
                  )}
                  <ShellPane exercise={exercise} host={host} language={language} tabId={id} />
                </>
              )}
            </div>
          );
        })}

        {split && !paneLayout.leftCollapsed && !paneLayout.rightCollapsed && (
          <PaneResizer
            axis="horizontal"
            value={paneLayout.leftWidth}
            onChange={paneLayout.setLeftWidth}
            min={MIN_SHELL_PANE_WIDTH}
            max={MAX_SHELL_PANE_WIDTH}
            label={t('resizePanes', language)}
            className="shell-pane-resizer"
          />
        )}
      </div>
    </>
  );
}

export function DefaultExerciseView({ exercise, host, language }: ExerciseViewProps) {
  const stacked = useMediaQuery('(max-width: 900px)');
  const tabs = useShellTabs(exercise);
  const paneLayout = useShellPaneLayout(exercise);
  const layout = useWorkspaceLayout(exercise);
  const windowDrag = useWindowSwapDrag<WorkspaceWindowId>(layout.swapWindows);
  const paneDrag = useWindowSwapDrag<'left' | 'right'>(() => {
    const { leftTabId, rightTabId } = tabs;
    if (rightTabId === null) {
      return;
    }
    tabs.selectPane('left', rightTabId);
    tabs.selectPane('right', leftTabId);
  });

  const [grownHeights, setGrownHeights] = useState<Partial<Record<GrowableSlotKey, number>>>({});

  const handleOverflow = useCallback((slot: GrowableSlotKey, neededHeight: number) => {
    setGrownHeights((prev) => {
      if ((prev[slot] ?? 0) >= neededHeight) {
        return prev;
      }
      return { ...prev, [slot]: neededHeight };
    });
  }, []);

  const growTopLeftHeight = grownHeights.topLeft;
  const growBottomLeftHeight = grownHeights.bottomLeft;
  const anyGrown = growTopLeftHeight !== undefined || growBottomLeftHeight !== undefined;

  const handleTopLeftRowHeightChange = useCallback(
    (height: number) => {
      setGrownHeights((prev) => {
        if (prev.topLeft === undefined) {
          return prev;
        }
        const next = { ...prev };
        delete next.topLeft;
        return next;
      });
      layout.setTopLeftRowHeight(height);
    },
    [layout]
  );

  const windowContent: Record<WorkspaceWindowId, ReactNode> = {
    prompt: (
      <>
        <h2 className="exercise-title">{localize(exercise.title, language)}</h2>
        <p className="exercise-prompt">{localize(exercise.prompt, language)}</p>
        <HintList hints={exercise.hints} language={language} />
      </>
    ),
    schema: <SchemaPanel host={host} />,
    shell: (
      <ShellWindowContent
        exercise={exercise}
        host={host}
        language={language}
        tabs={tabs}
        paneLayout={paneLayout}
        paneDrag={paneDrag}
        stacked={stacked}
      />
    )
  };

  const windows = (['topLeft', 'bottomLeft', 'right'] as const).map((slotKey) => {
    const windowId = layout.slots[slotKey];
    const collapsed = layout.collapsed[windowId];
    return (
      <WorkspaceWindow
        key={slotKey}
        className={SLOT_CLASS_NAMES[slotKey]}
        title={windowTitle(windowId, language)}
        collapsed={collapsed}
        onToggleCollapsed={() => layout.toggleCollapsed(windowId)}
        collapseLabel={t(collapsed ? 'expandWindow' : 'collapseWindow', language)}
        dragSourceHandlers={windowDrag.dragSourceHandlers(windowId)}
        dragTargetHandlers={windowDrag.dragTargetHandlers(windowId)}
        dragging={windowDrag.draggedId === windowId}
        dragOver={windowDrag.dragOverId === windowId}
        onOverflow={
          slotKey === 'topLeft' || slotKey === 'bottomLeft'
            ? (neededHeight) => handleOverflow(slotKey, neededHeight)
            : undefined
        }
      >
        {windowContent[windowId]}
      </WorkspaceWindow>
    );
  });

  const workspaceClassName = [
    'exercise-workspace',
    stacked && 'exercise-workspace-stacked',
    anyGrown && 'window-grown'
  ]
    .filter(Boolean)
    .join(' ');

  if (stacked) {
    return <div className={workspaceClassName}>{windows}</div>;
  }

  const rightCollapsed = layout.collapsed[layout.slots.right];
  const topLeftCollapsed = layout.collapsed[layout.slots.topLeft];
  const bottomLeftCollapsed = layout.collapsed[layout.slots.bottomLeft];

  const gridTemplateColumns = rightCollapsed
    ? `1fr 12px ${COLLAPSED_WINDOW_SIZE}px`
    : `${layout.leftColumnWidth}px 12px 1fr`;

  // The shell column spans both rows, so at least one row must stay flexible —
  // otherwise collapsing both left windows would squeeze the shell down too.
  let gridTemplateRows: string;
  if (bottomLeftCollapsed) {
    gridTemplateRows = `1fr 12px ${COLLAPSED_WINDOW_SIZE}px`;
  } else if (topLeftCollapsed) {
    gridTemplateRows = `${COLLAPSED_WINDOW_SIZE}px 12px 1fr`;
  } else {
    const topTrack = growTopLeftHeight ? `${growTopLeftHeight}px` : `${layout.topLeftRowHeight}px`;
    const bottomTrack = growBottomLeftHeight ? `${growBottomLeftHeight}px` : '1fr';
    gridTemplateRows = `${topTrack} 12px ${bottomTrack}`;
  }

  return (
    <div
      className={workspaceClassName}
      style={{ gridTemplateColumns, gridTemplateRows, minHeight: anyGrown ? 'auto' : undefined }}
    >
      {windows}

      {!rightCollapsed && (
        <PaneResizer
          axis="horizontal"
          value={layout.leftColumnWidth}
          onChange={layout.setLeftColumnWidth}
          min={MIN_LEFT_COLUMN_WIDTH}
          max={MAX_LEFT_COLUMN_WIDTH}
          label={t('resizeColumns', language)}
          className="workspace-col-resizer"
        />
      )}

      {!topLeftCollapsed && !bottomLeftCollapsed && (
        <PaneResizer
          axis="vertical"
          value={growTopLeftHeight ?? layout.topLeftRowHeight}
          onChange={handleTopLeftRowHeightChange}
          min={MIN_TOP_LEFT_ROW_HEIGHT}
          max={Math.max(MAX_TOP_LEFT_ROW_HEIGHT, growTopLeftHeight ?? 0)}
          label={t('resizeRows', language)}
          className="workspace-row-resizer"
        />
      )}
    </div>
  );
}
