import { useAutocompleteSetting, useShowSolutionSetting } from '@db-dojo/exercise-kit';
import { useTranslation } from '../app/i18n/use-translation';
import { NOTIFICATIONS_STORAGE_KEY } from '../app/notifications-settings';
import { useLocalStorageState } from '../app/use-local-storage-state';
import { BackupSettings } from './BackupSettings';
import { LanguageSettings } from './LanguageSettings';

export function SettingsView() {
  const [autocompleteEnabled, setAutocompleteEnabled] = useAutocompleteSetting();
  const [showSolutionEnabled, setShowSolutionEnabled] = useShowSolutionSetting();
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorageState(
    NOTIFICATIONS_STORAGE_KEY,
    true
  );
  const { t } = useTranslation();

  return (
    <section className="settings">
      <h1>{t('settings.title')}</h1>
      <p className="muted">{t('settings.subtitle')}</p>

      <LanguageSettings />

      <BackupSettings />

      <div className="settings-row">
        <div className="settings-row-text">
          <span className="settings-row-label">{t('settings.autocompleteLabel')}</span>
          <span className="muted settings-row-hint">{t('settings.autocompleteHint')}</span>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={autocompleteEnabled}
            onChange={(event) => setAutocompleteEnabled(event.target.checked)}
          />
          <span className="switch-track" aria-hidden="true" />
        </label>
      </div>

      <div className="settings-row">
        <div className="settings-row-text">
          <span className="settings-row-label">{t('settings.showSolutionLabel')}</span>
          <span className="muted settings-row-hint">{t('settings.showSolutionHint')}</span>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={showSolutionEnabled}
            onChange={(event) => setShowSolutionEnabled(event.target.checked)}
          />
          <span className="switch-track" aria-hidden="true" />
        </label>
      </div>

      <div className="settings-row">
        <div className="settings-row-text">
          <span className="settings-row-label">{t('settings.notificationsLabel')}</span>
          <span className="muted settings-row-hint">{t('settings.notificationsHint')}</span>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(event) => setNotificationsEnabled(event.target.checked)}
          />
          <span className="switch-track" aria-hidden="true" />
        </label>
      </div>
    </section>
  );
}
