import { LibraryView } from '../../shell/LibraryView';
import type { ModeDefinition, View } from './types';

export const libraryMode: ModeDefinition = {
  id: 'library',
  navLabel: 'Library',
  showInSidebar: true,
  Component: LibraryView,
  parsePath: (pathname) =>
    pathname === '/library' || pathname === '/knowledge' ? { kind: 'library' } : null,
  buildPath: () => '/library',
  defaultView: (): View => ({ kind: 'library' })
};
