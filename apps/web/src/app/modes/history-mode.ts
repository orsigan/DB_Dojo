import { HistoryView } from '../../shell/HistoryView';
import type { ModeDefinition, View } from './types';

export const historyMode: ModeDefinition = {
  id: 'history',
  navLabel: 'History',
  showInSidebar: true,
  Component: HistoryView,
  parsePath: (pathname) => (pathname === '/history' ? { kind: 'history' } : null),
  buildPath: () => '/history',
  defaultView: (): View => ({ kind: 'history' })
};
