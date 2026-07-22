import { GuidedPathView } from '../../shell/GuidedPathView';
import type { ModeDefinition, View } from './types';

const PATH_PATTERN = /^\/guided(?:\/([^/]+))?\/?$/;

export const guidedMode: ModeDefinition = {
  id: 'guided',
  navLabel: 'Guided Path',
  showInSidebar: true,
  Component: GuidedPathView,
  parsePath: (pathname) => {
    const match = PATH_PATTERN.exec(pathname);
    if (!match) {
      return null;
    }
    const chapterId = match[1] ? decodeURIComponent(match[1]) : undefined;
    return chapterId ? { kind: 'guided', chapterId } : { kind: 'guided' };
  },
  buildPath: (view) =>
    view.kind === 'guided' && view.chapterId
      ? `/guided/${encodeURIComponent(view.chapterId)}`
      : '/guided',
  defaultView: (): View => ({ kind: 'guided' })
};
