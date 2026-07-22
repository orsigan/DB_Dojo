import { useTranslation } from '../app/i18n/use-translation';

export function ComingSoonPanel({ title }: { title: string }) {
  const { t } = useTranslation();
  return (
    <div className="coming-soon">
      <h3>{title}</h3>
      <p className="muted">{t('comingSoonPanel.message')}</p>
    </div>
  );
}
