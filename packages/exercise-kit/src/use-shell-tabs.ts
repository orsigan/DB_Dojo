import type { Exercise } from '@db-dojo/core';
import { useEffect, useState } from 'react';

export const MAX_SHELL_TABS = 6;

const FIRST_TAB_ID = '1';

export interface ShellTabs {
  tabIds: string[];
  leftTabId: string;
  rightTabId: string | null;
  addTab: () => void;
  closeTab: (id: string) => void;
  selectPane: (pane: 'left' | 'right', id: string) => void;
  toggleSplit: () => void;
}

interface StoredShellTabs {
  tabIds: string[];
  nextTabNumber: number;
  leftTabId: string;
  rightTabId: string | null;
}

function defaultState(): StoredShellTabs {
  return { tabIds: [FIRST_TAB_ID], nextTabNumber: 2, leftTabId: FIRST_TAB_ID, rightTabId: null };
}

function loadState(storageKey: string): StoredShellTabs {
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return defaultState();
  }
  try {
    const parsed = JSON.parse(raw) as Partial<StoredShellTabs>;
    if (
      !Array.isArray(parsed.tabIds) ||
      parsed.tabIds.length === 0 ||
      typeof parsed.leftTabId !== 'string' ||
      typeof parsed.nextTabNumber !== 'number'
    ) {
      return defaultState();
    }
    return {
      tabIds: parsed.tabIds,
      nextTabNumber: parsed.nextTabNumber,
      leftTabId: parsed.leftTabId,
      rightTabId: typeof parsed.rightTabId === 'string' ? parsed.rightTabId : null
    };
  } catch {
    return defaultState();
  }
}

function clearTabStorage(exerciseId: string, tabId: string) {
  if (tabId === FIRST_TAB_ID) {
    return;
  }
  window.localStorage.removeItem(`db-dojo:draft:${exerciseId}:${tabId}`);
  window.localStorage.removeItem(`db-dojo:history:${exerciseId}:${tabId}`);
}

export function useShellTabs(exercise: Exercise): ShellTabs {
  const storageKey = `db-dojo:shell-tabs:${exercise.id}`;
  const [state, setState] = useState<StoredShellTabs>(() => loadState(storageKey));

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [storageKey, state]);

  const addTab = () => {
    setState((prev) => {
      if (prev.tabIds.length >= MAX_SHELL_TABS) {
        return prev;
      }
      const id = String(prev.nextTabNumber);
      return { ...prev, tabIds: [...prev.tabIds, id], nextTabNumber: prev.nextTabNumber + 1 };
    });
  };

  const closeTab = (id: string) => {
    setState((prev) => {
      if (prev.tabIds.length <= 1 || !prev.tabIds.includes(id)) {
        return prev;
      }
      const tabIds = prev.tabIds.filter((tabId) => tabId !== id);
      const fallbackId = tabIds[0] ?? id;
      const leftTabId = prev.leftTabId === id ? fallbackId : prev.leftTabId;
      const rightTabId = prev.rightTabId === id ? null : prev.rightTabId;
      clearTabStorage(exercise.id, id);
      return { ...prev, tabIds, leftTabId, rightTabId };
    });
  };

  const selectPane = (pane: 'left' | 'right', id: string) => {
    setState((prev) =>
      pane === 'left' ? { ...prev, leftTabId: id } : { ...prev, rightTabId: id }
    );
  };

  const toggleSplit = () => {
    setState((prev) => {
      if (prev.rightTabId !== null) {
        return { ...prev, rightTabId: null };
      }
      const otherTab = prev.tabIds.find((tabId) => tabId !== prev.leftTabId);
      if (otherTab) {
        return { ...prev, rightTabId: otherTab };
      }
      const newTabId = String(prev.nextTabNumber);
      return {
        ...prev,
        tabIds: [...prev.tabIds, newTabId],
        nextTabNumber: prev.nextTabNumber + 1,
        rightTabId: newTabId
      };
    });
  };

  return {
    tabIds: state.tabIds,
    leftTabId: state.leftTabId,
    rightTabId: state.rightTabId,
    addTab,
    closeTab,
    selectPane,
    toggleSplit
  };
}
