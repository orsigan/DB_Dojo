import type { DatabaseEngine } from '@db-dojo/core';
import { useLanguage } from '../app/i18n/use-language';
import { useTranslation } from '../app/i18n/use-translation';
import type { View } from '../app/modes/types';
import { useTheme } from '../app/theme';
import type { Crumb } from './build-crumbs';
import { createHistoryMenuItem } from './icon-bar/history-menu-item';
import { IconBar } from './icon-bar/IconBar';
import { BackArrowIcon, MoonIcon, SearchIcon, SidebarIcon, SunIcon } from './icon-bar/icons';
import { createProfileMenuItem } from './icon-bar/profile-menu-item';
import { ShortcutsPanel } from './ShortcutsPanel';

interface LocationBarProps {
  crumbs: Crumb[];
  onNavigateCrumb: (view: View) => void;
  engineKind: DatabaseEngine['kind'];
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onShowHome: () => void;
  onShowStats: () => void;
  onShowSettings: () => void;
  onShowHistory: () => void;
  onBack: () => void;
  onOpenCommandPalette: () => void;
  shortcutsOpen: boolean;
  onShortcutsOpenChange: (open: boolean) => void;
}

export function LocationBar({
  crumbs,
  onNavigateCrumb,
  engineKind,
  sidebarCollapsed,
  onToggleSidebar,
  onShowHome,
  onShowStats,
  onShowSettings,
  onShowHistory,
  onBack,
  onOpenCommandPalette,
  shortcutsOpen,
  onShortcutsOpenChange
}: LocationBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <header className="location-bar">
      <div className="location-bar-left">
        <button
          type="button"
          className="icon-bar-trigger"
          aria-label={
            sidebarCollapsed ? t('locationBar.showSidebar') : t('locationBar.hideSidebar')
          }
          aria-pressed={!sidebarCollapsed}
          onClick={onToggleSidebar}
        >
          <SidebarIcon />
        </button>

        <button
          type="button"
          className="icon-bar-trigger"
          aria-label={t('locationBar.goBack')}
          onClick={onBack}
        >
          <BackArrowIcon />
        </button>

        <div className="crumbs">
          {crumbs.map((crumb, index) => {
            const isCurrent = index === crumbs.length - 1;
            if (!isCurrent && crumb.view) {
              return (
                <button
                  key={crumb.label}
                  type="button"
                  className="crumb crumb-link"
                  onClick={() => onNavigateCrumb(crumb.view as View)}
                >
                  {crumb.label}
                </button>
              );
            }
            return (
              <span key={crumb.label} className="crumb">
                {crumb.label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="location-bar-actions">
        <span className="engine-badge">
          {engineKind === 'pglite' ? t('locationBar.offlinePglite') : t('locationBar.remote')}
        </span>
        <button
          type="button"
          className="icon-bar-trigger"
          aria-label={t('commandPalette.triggerLabel')}
          onClick={onOpenCommandPalette}
        >
          <SearchIcon />
        </button>
        <button
          type="button"
          className="icon-bar-trigger language-switch"
          aria-label={
            language === 'de' ? t('locationBar.switchToEnglish') : t('locationBar.switchToGerman')
          }
          onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
        >
          <span className="language-switch-flag" aria-hidden="true">
            {language === 'de' ? '🇩🇪' : '🇬🇧'}
          </span>
        </button>

        <button
          type="button"
          className="icon-bar-trigger"
          aria-label={
            theme === 'dark'
              ? t('locationBar.switchToLightMode')
              : t('locationBar.switchToDarkMode')
          }
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
        </button>
        <ShortcutsPanel open={shortcutsOpen} onOpenChange={onShortcutsOpenChange} />
        <IconBar
          items={[
            createHistoryMenuItem({ onShowHistory, t }),
            createProfileMenuItem({ onShowHome, onShowStats, onShowSettings, t })
          ]}
        />
      </div>
    </header>
  );
}
