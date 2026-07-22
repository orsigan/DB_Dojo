import { currentUser } from '../../app/current-user';
import type { useTranslation } from '../../app/i18n/use-translation';
import { ChartIcon, HomeIcon, SettingsIcon, UserIcon } from './icons';
import type { IconBarItemConfig } from './types';

export function createProfileMenuItem(options: {
  onShowHome: () => void;
  onShowStats: () => void;
  onShowSettings: () => void;
  t: ReturnType<typeof useTranslation>['t'];
}): IconBarItemConfig {
  const { t } = options;
  return {
    id: 'profile',
    label: t('profileMenu.accountMenuFor', { name: currentUser.name }),
    icon: (
      <span className="icon-bar-avatar" aria-hidden="true">
        {currentUser.initials}
      </span>
    ),
    panel: (close) => (
      <div className="profile-panel">
        <div className="profile-panel-header">
          <span className="profile-panel-avatar" aria-hidden="true">
            {currentUser.initials}
          </span>
          <div>
            <div className="profile-panel-name">{currentUser.name}</div>
            <div className="profile-panel-email">{currentUser.email}</div>
          </div>
        </div>

        <div className="profile-panel-actions">
          <button
            type="button"
            onClick={() => {
              options.onShowHome();
              close();
            }}
          >
            <HomeIcon className="profile-panel-icon" aria-hidden="true" />
            {t('nav.home')}
          </button>
          <button
            type="button"
            onClick={() => {
              options.onShowStats();
              close();
            }}
          >
            <ChartIcon className="profile-panel-icon" aria-hidden="true" />
            {t('nav.stats')}
          </button>
          <button type="button" disabled title={t('common.comingSoon')}>
            <UserIcon className="profile-panel-icon" aria-hidden="true" />
            {t('profileMenu.profile')}
          </button>
          <button
            type="button"
            onClick={() => {
              options.onShowSettings();
              close();
            }}
          >
            <SettingsIcon className="profile-panel-icon" aria-hidden="true" />
            {t('nav.settings')}
          </button>
        </div>
      </div>
    )
  };
}
