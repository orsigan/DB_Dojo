import type { Language } from '@db-dojo/core';
import { t } from '../strings';
import type { ShellTabs } from '../use-shell-tabs';

export function ShellPaneSelector({
  pane,
  tabs,
  language
}: {
  pane: 'left' | 'right';
  tabs: ShellTabs;
  language: Language;
}) {
  const activeId = pane === 'left' ? tabs.leftTabId : tabs.rightTabId;

  return (
    <div className="shell-pane-selector" role="tablist">
      {tabs.tabIds.map((id, index) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={id === activeId}
          className={id === activeId ? 'segmented-option active' : 'segmented-option'}
          onClick={() => tabs.selectPane(pane, id)}
        >
          {t('shellTab', language)} {index + 1}
        </button>
      ))}
    </div>
  );
}
