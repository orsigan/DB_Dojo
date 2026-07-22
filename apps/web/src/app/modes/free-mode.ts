import { FreeModeView } from '../../shell/FreeModeView';
import type { ModeDefinition, View } from './types';

export const freeMode: ModeDefinition = {
  id: 'free',
  navLabel: 'Free Mode',
  showInSidebar: true,
  Component: FreeModeView,
  parsePath: (pathname) => (pathname === '/free' ? { kind: 'free' } : null),
  buildPath: () => '/free',
  defaultView: (): View => ({ kind: 'free' })
};
