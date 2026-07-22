import { useCallback, useEffect, useState } from 'react';
import type { ModeDefinition, View } from './modes/types';

// Modes deal in root-relative paths ('/library', ...). When deployed under a
// GitHub Pages project base ('/DB_Dojo/'), the browser's real pathname carries
// that prefix, so it's stripped/re-added here — the one place that touches
// window.location — rather than in every mode's parsePath/buildPath.
const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '');

function stripBase(pathname: string): string {
  if (BASE_PATH && pathname.startsWith(BASE_PATH)) {
    const rest = pathname.slice(BASE_PATH.length);
    return rest === '' ? '/' : rest;
  }
  return pathname;
}

function withBase(pathname: string): string {
  return pathname === '/' ? `${BASE_PATH}/` : `${BASE_PATH}${pathname}`;
}

function parseView(modes: ModeDefinition[], pathname: string): View {
  const relativePath = stripBase(pathname);
  for (const mode of modes) {
    const view = mode.parsePath(relativePath);
    if (view) {
      return view;
    }
  }
  return { kind: 'home' };
}

function pathFor(modes: ModeDefinition[], view: View): string {
  const mode = modes.find((candidate) => candidate.id === view.kind);
  return withBase(mode ? mode.buildPath(view) : '/');
}

export const LAST_VIEW_STORAGE_KEY = 'db-dojo:last-view';

export interface UrlView {
  view: View;
  navigate: (view: View) => void;
  goBack: () => void;
}

export function useUrlView(modes: ModeDefinition[]): UrlView {
  const [view, setView] = useState<View>(() => parseView(modes, window.location.pathname));

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only effect
  useEffect(() => {
    const canonicalPath = pathFor(modes, view);
    if (canonicalPath !== window.location.pathname) {
      window.history.replaceState(null, '', canonicalPath);
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: listener reads modes via closure, added once
  useEffect(() => {
    const handlePopState = () => {
      setView(parseView(modes, window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Remembers the last non-home view so the start page can offer a "continue" shortcut.
  useEffect(() => {
    if (view.kind === 'home') {
      return;
    }
    try {
      window.localStorage.setItem(LAST_VIEW_STORAGE_KEY, JSON.stringify(view));
    } catch {
      // storage unavailable (private mode/quota)
    }
  }, [view]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: modes is a stable module-level registry
  const navigate = useCallback((next: View) => {
    setView(next);
    const targetPath = pathFor(modes, next);
    if (targetPath !== window.location.pathname) {
      window.history.pushState(null, '', targetPath);
    }
  }, []);

  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  return { view, navigate, goBack };
}
