import { parseAttemptsExport, serializeAttempts } from '@db-dojo/core';
import { type ChangeEvent, useRef } from 'react';
import { useTranslation } from '../app/i18n/use-translation';
import { withSuppressedProgressEvents } from '../app/progress-events';
import { useServices } from '../app/services-context';
import { useToast } from './ToastProvider';

export function BackupSettings() {
  const { progress } = useServices();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const { showToast } = useToast();

  async function handleExport() {
    const attempts = await progress.all();
    const json = serializeAttempts(attempts);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `db-dojo-progress-${new Date().toISOString()}.json`;
    link.click();

    URL.revokeObjectURL(url);

    showToast({ kind: 'backup-success', title: t('notifications.backupExportTitle') });
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    const raw = await file.text();
    const result = parseAttemptsExport(raw);
    if (!result.success) {
      showToast({
        kind: 'backup-error',
        title: t('notifications.backupErrorTitle'),
        message: result.error.message
      });
      return;
    }

    await withSuppressedProgressEvents(async () => {
      for (const attempt of result.value) {
        await progress.record(attempt);
      }
    });

    showToast({
      kind: 'backup-success',
      title: t('notifications.backupImportTitle'),
      message: t('settings.importSuccess', { count: result.value.length })
    });
  }

  return (
    <div className="settings-row">
      <div className="settings-row-text">
        <span className="settings-row-label">{t('settings.backupLabel')}</span>
        <span className="muted settings-row-hint">{t('settings.backupHint')}</span>
      </div>
      <div className="backup-settings-actions">
        <button type="button" className="backup-settings-button" onClick={handleExport}>
          {t('settings.exportButton')}
        </button>
        <button type="button" className="backup-settings-button" onClick={handleImportClick}>
          {t('settings.importButton')}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="backup-settings-file-input"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
