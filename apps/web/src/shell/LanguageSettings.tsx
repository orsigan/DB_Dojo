import type { Language } from '../app/i18n/translations';
import { useLanguage } from '../app/i18n/use-language';
import { useTranslation } from '../app/i18n/use-translation';

const LANGUAGE_OPTIONS: { id: Language; label: string }[] = [
  { id: 'de', label: 'Deutsch' },
  { id: 'en', label: 'English' }
];

export function LanguageSettings() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <div className="settings-row">
      <div className="settings-row-text">
        <span className="settings-row-label">{t('settings.languageLabel')}</span>
        <span className="settings-row-hint muted">{t('settings.languageHint')}</span>
      </div>
      <div className="filter-chips">
        {LANGUAGE_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={language === option.id}
            className={language === option.id ? 'filter-chip active' : 'filter-chip'}
            onClick={() => setLanguage(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
