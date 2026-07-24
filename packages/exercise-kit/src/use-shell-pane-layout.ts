import type { Exercise } from '@db-dojo/core';
import { useEffect, useState } from 'react';

export const DEFAULT_SHELL_PANE_LEFT_WIDTH = 480;
export const MIN_SHELL_PANE_WIDTH = 160;
export const MAX_SHELL_PANE_WIDTH = 900;

interface StoredShellPaneLayout {
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  leftWidth: number;
}

function defaultState(): StoredShellPaneLayout {
  return { leftCollapsed: false, rightCollapsed: false, leftWidth: DEFAULT_SHELL_PANE_LEFT_WIDTH };
}

function loadState(storageKey: string): StoredShellPaneLayout {
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return defaultState();
  }
  try {
    const parsed = JSON.parse(raw) as Partial<StoredShellPaneLayout>;
    return {
      leftCollapsed: parsed.leftCollapsed === true,
      rightCollapsed: parsed.rightCollapsed === true,
      leftWidth:
        typeof parsed.leftWidth === 'number' ? parsed.leftWidth : DEFAULT_SHELL_PANE_LEFT_WIDTH
    };
  } catch {
    return defaultState();
  }
}

export interface ShellPaneLayout {
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  leftWidth: number;
  toggleCollapsed: (pane: 'left' | 'right') => void;
  setLeftWidth: (width: number) => void;
}

export function useShellPaneLayout(exercise: Exercise): ShellPaneLayout {
  const storageKey = `db-dojo:shell-pane-layout:${exercise.id}`;
  const [state, setState] = useState<StoredShellPaneLayout>(() => loadState(storageKey));

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [storageKey, state]);

  const toggleCollapsed = (pane: 'left' | 'right') => {
    setState((prev) =>
      pane === 'left'
        ? { ...prev, leftCollapsed: !prev.leftCollapsed }
        : { ...prev, rightCollapsed: !prev.rightCollapsed }
    );
  };

  const setLeftWidth = (width: number) => setState((prev) => ({ ...prev, leftWidth: width }));

  return { ...state, toggleCollapsed, setLeftWidth };
}
