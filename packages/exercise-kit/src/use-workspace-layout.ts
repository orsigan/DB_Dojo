import type { Exercise } from '@db-dojo/core';
import { useEffect, useState } from 'react';

export type WorkspaceWindowId = 'prompt' | 'schema' | 'shell';
export type WorkspaceSlotKey = 'topLeft' | 'bottomLeft' | 'right';
export type WorkspaceSlots = Record<WorkspaceSlotKey, WorkspaceWindowId>;

export const DEFAULT_LEFT_COLUMN_WIDTH = 380;
export const MIN_LEFT_COLUMN_WIDTH = 260;
export const MAX_LEFT_COLUMN_WIDTH = 640;

export const DEFAULT_TOP_LEFT_ROW_HEIGHT = 240;
export const MIN_TOP_LEFT_ROW_HEIGHT = 100;
export const MAX_TOP_LEFT_ROW_HEIGHT = 600;

const DEFAULT_SLOTS: WorkspaceSlots = { topLeft: 'prompt', bottomLeft: 'schema', right: 'shell' };
const DEFAULT_COLLAPSED: Record<WorkspaceWindowId, boolean> = {
  prompt: false,
  schema: false,
  shell: false
};

interface StoredWorkspaceLayout {
  slots: WorkspaceSlots;
  collapsed: Record<WorkspaceWindowId, boolean>;
  leftColumnWidth: number;
  topLeftRowHeight: number;
}

function isWorkspaceWindowId(value: unknown): value is WorkspaceWindowId {
  return value === 'prompt' || value === 'schema' || value === 'shell';
}

function isValidSlots(value: unknown): value is WorkspaceSlots {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const slots = value as Partial<WorkspaceSlots>;
  if (
    !isWorkspaceWindowId(slots.topLeft) ||
    !isWorkspaceWindowId(slots.bottomLeft) ||
    !isWorkspaceWindowId(slots.right)
  ) {
    return false;
  }
  return new Set([slots.topLeft, slots.bottomLeft, slots.right]).size === 3;
}

function defaultState(): StoredWorkspaceLayout {
  return {
    slots: DEFAULT_SLOTS,
    collapsed: DEFAULT_COLLAPSED,
    leftColumnWidth: DEFAULT_LEFT_COLUMN_WIDTH,
    topLeftRowHeight: DEFAULT_TOP_LEFT_ROW_HEIGHT
  };
}

function loadState(storageKey: string): StoredWorkspaceLayout {
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return defaultState();
  }
  try {
    const parsed = JSON.parse(raw) as Partial<StoredWorkspaceLayout>;
    return {
      slots: isValidSlots(parsed.slots) ? parsed.slots : DEFAULT_SLOTS,
      collapsed: { ...DEFAULT_COLLAPSED, ...parsed.collapsed },
      leftColumnWidth:
        typeof parsed.leftColumnWidth === 'number'
          ? parsed.leftColumnWidth
          : DEFAULT_LEFT_COLUMN_WIDTH,
      topLeftRowHeight:
        typeof parsed.topLeftRowHeight === 'number'
          ? parsed.topLeftRowHeight
          : DEFAULT_TOP_LEFT_ROW_HEIGHT
    };
  } catch {
    return defaultState();
  }
}

export interface WorkspaceLayout {
  slots: WorkspaceSlots;
  collapsed: Record<WorkspaceWindowId, boolean>;
  leftColumnWidth: number;
  topLeftRowHeight: number;
  toggleCollapsed: (id: WorkspaceWindowId) => void;
  swapWindows: (a: WorkspaceWindowId, b: WorkspaceWindowId) => void;
  setLeftColumnWidth: (width: number) => void;
  setTopLeftRowHeight: (height: number) => void;
}

export function useWorkspaceLayout(exercise: Exercise): WorkspaceLayout {
  const storageKey = `db-dojo:workspace-layout:${exercise.id}`;
  const [state, setState] = useState<StoredWorkspaceLayout>(() => loadState(storageKey));

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [storageKey, state]);

  const toggleCollapsed = (id: WorkspaceWindowId) => {
    setState((prev) => ({ ...prev, collapsed: { ...prev.collapsed, [id]: !prev.collapsed[id] } }));
  };

  const swapWindows = (a: WorkspaceWindowId, b: WorkspaceWindowId) => {
    setState((prev) => {
      const slotEntries = Object.entries(prev.slots) as [WorkspaceSlotKey, WorkspaceWindowId][];
      const slotOfA = slotEntries.find(([, windowId]) => windowId === a)?.[0];
      const slotOfB = slotEntries.find(([, windowId]) => windowId === b)?.[0];
      if (!slotOfA || !slotOfB) {
        return prev;
      }
      return { ...prev, slots: { ...prev.slots, [slotOfA]: b, [slotOfB]: a } };
    });
  };

  const setLeftColumnWidth = (width: number) =>
    setState((prev) => ({ ...prev, leftColumnWidth: width }));

  const setTopLeftRowHeight = (height: number) =>
    setState((prev) => ({ ...prev, topLeftRowHeight: height }));

  return { ...state, toggleCollapsed, swapWindows, setLeftColumnWidth, setTopLeftRowHeight };
}
