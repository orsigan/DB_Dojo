import { modifierKeyLabel } from '@db-dojo/exercise-kit';
import { useEffect, useRef } from 'react';
import { useTranslation } from '../app/i18n/use-translation';
import { KeyboardIcon } from './icon-bar/icons';

interface ShortcutsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShortcutsPanel({ open, onOpenChange }: ShortcutsPanelProps) {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);
  const mod = modifierKeyLabel();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange]);

  const shortcuts: { keys: string[]; label: string }[] = [
    { keys: [mod, 'Enter'], label: t('shortcuts.runQuery') },
    { keys: [mod, 'Shift', 'Enter'], label: t('shortcuts.submitQuery') },
    { keys: [mod, 'K'], label: t('shortcuts.openCommandPalette') },
    { keys: ['Esc'], label: t('shortcuts.closePanel') },
    { keys: ['?'], label: t('shortcuts.openOverview') }
  ];

  return (
    <div className="icon-bar-item" ref={rootRef}>
      <button
        type="button"
        className={open ? 'icon-bar-trigger active' : 'icon-bar-trigger'}
        aria-label={t('shortcuts.buttonLabel')}
        aria-haspopup="true"
        aria-expanded={open}
        title={t('shortcuts.buttonLabel')}
        onClick={() => onOpenChange(!open)}
      >
        <KeyboardIcon />
      </button>
      {open && (
        <div className="icon-bar-panel shortcuts-panel">
          <div className="shortcuts-panel-header">{t('shortcuts.title')}</div>
          <ul className="shortcuts-panel-list">
            {shortcuts.map((shortcut) => (
              <li key={shortcut.label} className="shortcuts-panel-row">
                <span className="shortcuts-panel-label">{shortcut.label}</span>
                <span className="shortcuts-panel-combo">
                  {shortcut.keys.map((key) => (
                    <span key={`${shortcut.label}-${key}`} className="shortcuts-key">
                      {key}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
