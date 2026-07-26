import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { exerciseModules } from '../app/exercise-registry';
import { useLanguage } from '../app/i18n/use-language';
import { useTranslation } from '../app/i18n/use-translation';
import { modes } from '../app/modes/registry';
import { useServices } from '../app/services-context';
import { buildTopicTree } from '../app/topic-tree';
import { useLocalStorageState } from '../app/use-local-storage-state';
import { useUrlView } from '../app/use-url-view';
import { buildCrumbs } from './build-crumbs';
import { CommandPalette } from './CommandPalette';
import { LocationBar } from './LocationBar';
import { Sidebar } from './Sidebar';
import { getScrollPosition, saveScrollPosition } from './scroll-position-store';
import { MAX_SIDEBAR_WIDTH, MIN_SIDEBAR_WIDTH, useSidebarResize } from './use-sidebar-resize';

export type { Crumb } from './build-crumbs';

export function AppShell() {
  const services = useServices();
  const { view, navigate, goBack } = useUrlView(modes);
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorageState(
    'db-dojo:sidebar-collapsed',
    false
  );
  const [sidebarWidth, setSidebarWidth] = useLocalStorageState('db-dojo:sidebar-width', 260);
  const { resizing, handleResizeStart, handleResizeKeyDown } = useSidebarResize(
    sidebarWidth,
    setSidebarWidth
  );
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const contentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) {
      return;
    }
    const handleScroll = () => {
      saveScrollPosition(window.location.pathname, node.scrollTop);
    };
    node.addEventListener('scroll', handleScroll, { passive: true });
    return () => node.removeEventListener('scroll', handleScroll);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: view triggers restore on navigation, path read via window.location
  useLayoutEffect(() => {
    const node = contentRef.current;
    if (!node) {
      return;
    }
    node.scrollTop = getScrollPosition(window.location.pathname);
  }, [view]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== '?' || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (isTypingTarget(event.target)) {
        return;
      }
      event.preventDefault();
      setShortcutsOpen((prev) => !prev);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const tree = useMemo(() => buildTopicTree(exerciseModules), []);
  const { t } = useTranslation();
  const { language } = useLanguage();

  const activeMode = modes.find((mode) => mode.id === view.kind);
  const crumbs = buildCrumbs(view, t, language);

  return (
    <div
      className={sidebarCollapsed ? 'app-layout collapsed' : 'app-layout'}
      style={
        sidebarCollapsed
          ? undefined
          : ({ '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties)
      }
    >
      {!sidebarCollapsed && (
        <>
          <Sidebar
            modes={modes}
            activeKind={view.kind}
            tree={tree}
            activeExerciseId={view.kind === 'exercise' ? view.id : null}
            onNavigate={navigate}
          />
          {/* biome-ignore lint/a11y/useSemanticElements: interactive draggable splitter, not a static <hr> */}
          <div
            className={resizing ? 'sidebar-resizer resizing' : 'sidebar-resizer'}
            onPointerDown={handleResizeStart}
            onKeyDown={handleResizeKeyDown}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize sidebar"
            aria-valuenow={sidebarWidth}
            aria-valuemin={MIN_SIDEBAR_WIDTH}
            aria-valuemax={MAX_SIDEBAR_WIDTH}
            tabIndex={0}
          />
        </>
      )}

      <div className="app-main">
        <LocationBar
          crumbs={crumbs}
          onNavigateCrumb={navigate}
          engineKind={services.engine.kind}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
          onShowHome={() => navigate({ kind: 'home' })}
          onShowStats={() => navigate({ kind: 'stats' })}
          onShowSettings={() => navigate({ kind: 'settings' })}
          onShowHistory={() => navigate({ kind: 'history' })}
          onBack={goBack}
          onOpenCommandPalette={() => setPaletteOpen(true)}
          shortcutsOpen={shortcutsOpen}
          onShortcutsOpenChange={setShortcutsOpen}
        />

        <main className="app-content" ref={contentRef}>
          {activeMode && <activeMode.Component view={view} navigate={navigate} />}
        </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        navigate={navigate}
      />
    </div>
  );
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
    return true;
  }
  return Boolean(target.closest('.cm-editor'));
}
