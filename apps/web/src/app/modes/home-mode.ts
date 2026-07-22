import { StartScreen } from '../../shell/StartScreen';
import type { ModeDefinition, View } from './types';

export const homeMode: ModeDefinition = {
  id: 'home',
  navLabel: 'Start',
  showInSidebar: true,
  Component: StartScreen,
  parsePath: (pathname) => (pathname === '/' ? { kind: 'home' } : null),
  buildPath: () => '/',
  defaultView: (): View => ({ kind: 'home' })
};
