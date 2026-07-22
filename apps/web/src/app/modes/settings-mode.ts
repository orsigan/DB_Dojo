import { SettingsView } from '../../shell/SettingsView';
import type { ModeDefinition, View } from './types';

export const settingsMode: ModeDefinition = {
  id: 'settings',
  navLabel: 'Settings',
  showInSidebar: true,
  Component: SettingsView,
  parsePath: (pathname) => (pathname === '/settings' ? { kind: 'settings' } : null),
  buildPath: () => '/settings',
  defaultView: (): View => ({ kind: 'settings' })
};
