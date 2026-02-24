import { CSS_PREFIX, TABS } from '../config.ts';
import type { TabId } from '../types.ts';

export interface TabsComponent {
  readonly element: HTMLDivElement;
  getActiveTab(): TabId;
  setActiveTab(id: TabId): void;
}

export function createTabs(onChange: (tabId: TabId) => void): TabsComponent {
  const wrap = document.createElement('div');
  wrap.className = `${CSS_PREFIX}-tabs`;

  let activeTab: TabId = TABS[0].id;
  const buttons: Map<TabId, HTMLButtonElement> = new Map();

  for (const tab of TABS) {
    const btn = document.createElement('button');
    btn.className = `${CSS_PREFIX}-tab`;
    btn.textContent = tab.label;
    btn.type = 'button';

    btn.addEventListener('click', () => {
      if (activeTab === tab.id) return;
      activeTab = tab.id;
      updateActive();
      onChange(tab.id);
    });

    buttons.set(tab.id, btn);
    wrap.appendChild(btn);
  }

  function updateActive(): void {
    for (const [id, btn] of buttons) {
      btn.classList.toggle(`${CSS_PREFIX}-tab--active`, id === activeTab);
    }
  }

  // Set initial active
  updateActive();

  return {
    element: wrap,
    getActiveTab: () => activeTab,
    setActiveTab(id: TabId) {
      activeTab = id;
      updateActive();
      onChange(id);
    },
  };
}
