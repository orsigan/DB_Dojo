import { StatsView } from '../../shell/StatsView';
import type { ModeDefinition, View } from './types';

export const statsMode: ModeDefinition = {
  id: 'stats',
  navLabel: 'Statistics',
  showInSidebar: true,
  Component: StatsView,
  parsePath: (pathname) => (pathname === '/stats' ? { kind: 'stats' } : null),
  buildPath: () => '/stats',
  defaultView: (): View => ({ kind: 'stats' })
};
