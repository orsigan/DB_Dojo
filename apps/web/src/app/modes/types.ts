import type { ReactNode } from 'react';

export type View =
  | { kind: 'home' }
  | { kind: 'guided'; chapterId?: string }
  | { kind: 'free' }
  | { kind: 'library' }
  | { kind: 'exercise'; id: string }
  | { kind: 'stats' }
  | { kind: 'settings' }
  | { kind: 'history' };

export interface ModeComponentProps {
  view: View;
  navigate: (view: View) => void;
}

export interface ModeDefinition {
  id: View['kind'];
  navLabel: string;
  showInSidebar: boolean;
  Component: (props: ModeComponentProps) => ReactNode;
  parsePath: (pathname: string) => View | null;
  buildPath: (view: View) => string;
  defaultView: () => View;
}
