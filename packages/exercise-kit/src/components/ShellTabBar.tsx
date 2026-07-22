import type { Language } from '@db-dojo/core';
import { t } from '../strings';
import { MAX_SHELL_TABS, type ShellTabs } from '../use-shell-tabs';

export function ShellTabBar({ tabs, language }: { tabs: ShellTabs; language: Language }) {
  return (
    <div className="shell-tab-bar">
      <div className="shell-tab-list">
        {tabs.tabIds.map((id, index) => (
          <div
            key={id}
            className={id === tabs.leftTabId ? 'shell-tab-chip active' : 'shell-tab-chip'}
          >
            <button type="button" onClick={() => tabs.selectPane('left', id)}>
              {t('shellTab', language)} {index + 1}
            </button>
            {tabs.tabIds.length > 1 && (
              <button
                type="button"
                className="shell-tab-chip-close"
                aria-label={t('closeTab', language)}
                onClick={() => tabs.closeTab(id)}
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="shell-tab-add"
          onClick={tabs.addTab}
          disabled={tabs.tabIds.length >= MAX_SHELL_TABS}
        >
          + {t('newTab', language)}
        </button>
      </div>

      <button type="button" className="ghost shell-split-toggle" onClick={tabs.toggleSplit}>
        {tabs.rightTabId ? t('unsplit', language) : t('splitView', language)}
      </button>
    </div>
  );
}
