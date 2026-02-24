import { CSS_PREFIX, TABS } from '../config.ts';
import type { HuntingRule, RuleSourceId, TabId } from '../types.ts';
import {
  getRulesForSource,
  getPinnedRules,
  searchRules,
  getTotalRuleCount,
  ensureRepoLoaded,
} from '../core/query-manager.ts';
import { getRepoLoadState } from '../core/public-repos.ts';
import { createSearch, type SearchComponent } from './search.ts';
import { createTabs, type TabsComponent } from './tabs.ts';
import { createQueryList, type QueryListComponent } from './query-list.ts';

export interface PopupComponent {
  readonly element: HTMLDivElement;
  readonly overlay: HTMLDivElement;
  show(anchorEl?: HTMLElement): void;
  hide(): void;
  isVisible(): boolean;
  refresh(): void;
}

export function createPopup(onClose: () => void): PopupComponent {
  // Overlay
  const overlay = document.createElement('div');
  overlay.className = `${CSS_PREFIX}-popup-overlay`;
  overlay.addEventListener('click', onClose);

  // Popup container
  const popup = document.createElement('div');
  popup.className = `${CSS_PREFIX}-popup`;

  // Prevent overlay click when clicking inside popup
  popup.addEventListener('click', (e) => e.stopPropagation());

  // ── Header ──
  const header = document.createElement('div');
  header.className = `${CSS_PREFIX}-popup-header`;

  const titleWrap = document.createElement('div');
  titleWrap.className = `${CSS_PREFIX}-popup-title`;

  const titleText = document.createElement('span');
  titleText.textContent = 'Threat Hunting Queries';

  const countBadge = document.createElement('span');
  countBadge.className = `${CSS_PREFIX}-popup-count`;

  titleWrap.appendChild(titleText);
  titleWrap.appendChild(countBadge);

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = `${CSS_PREFIX}-popup-close`;
  closeBtn.innerHTML = '&#10005;';
  closeBtn.title = 'Close (Esc)';
  closeBtn.addEventListener('click', onClose);

  header.appendChild(titleWrap);
  header.appendChild(closeBtn);

  // ── Search ──
  const search: SearchComponent = createSearch(handleSearch);

  // ── Tabs ──
  const tabs: TabsComponent = createTabs(handleTabChange);

  // ── Query List ──
  const queryList: QueryListComponent = createQueryList();

  // Assemble
  popup.appendChild(header);
  popup.appendChild(search.element);
  popup.appendChild(tabs.element);
  popup.appendChild(queryList.element);

  // ── Keyboard ──
  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      onClose();
    }
  }

  // ── State Management ──
  let visible = false;

  function handleSearch(query: string): void {
    renderCurrentTab(query);
  }

  function handleTabChange(_tabId: TabId): void {
    search.reset();
  }

  function renderCurrentTab(searchQuery = ''): void {
    const activeTab = tabs.getActiveTab();
    const tabDef = TABS.find((t) => t.id === activeTab);
    if (!tabDef) return;

    if (activeTab === 'pinned') {
      const pinned = getPinnedRules();
      const filtered = searchQuery
        ? searchRules(pinned, searchQuery)
        : pinned;
      queryList.render(
        filtered as readonly (HuntingRule & { sourceId: RuleSourceId })[],
        null,
        true,
      );
      return;
    }

    // Lazy-load repo rules on first tab visit
    if (activeTab === 'reprise99' || activeTab === 'bertjanp') {
      const state = getRepoLoadState(activeTab);
      if (state === 'idle' || state === 'loading') {
        queryList.showLoading();
        void ensureRepoLoaded(activeTab).then(() => {
          if (tabs.getActiveTab() === activeTab) {
            updateCount();
            renderSourceTab(activeTab, searchQuery);
          }
        });
        return;
      }
      if (state === 'error') {
        const rules = getRulesForSource(activeTab);
        if (rules.length === 0) {
          queryList.showEmpty('Failed to load rules. Try again later.');
          return;
        }
      }
    }

    if (tabDef.sourceId) {
      renderSourceTab(tabDef.sourceId, searchQuery);
    }
  }

  function renderSourceTab(sourceId: RuleSourceId, searchQuery: string): void {
    const rules = getRulesForSource(sourceId);
    const filtered = searchQuery ? searchRules(rules, searchQuery) : rules;
    queryList.render(filtered, sourceId);
  }

  function updateCount(): void {
    countBadge.textContent = String(getTotalRuleCount());
  }

  /**
   * Position the popup below the anchor element (the inline button).
   * Left-aligned to the button; clamped so it stays on-screen.
   */
  function positionPopup(anchorEl?: HTMLElement): void {
    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      const popupWidth = 420;
      // Left-align to the button, but don't overflow the viewport
      const maxLeft = window.innerWidth - popupWidth - 8;
      popup.style.top = `${rect.bottom + 4}px`;
      popup.style.left = `${Math.max(4, Math.min(rect.left, maxLeft))}px`;
    } else {
      popup.style.top = '48px';
      popup.style.right = '24px';
      popup.style.left = 'auto';
    }
  }

  function show(anchorEl?: HTMLElement): void {
    if (visible) return;
    visible = true;
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
    positionPopup(anchorEl);
    document.addEventListener('keydown', handleKeydown);
    updateCount();
    renderCurrentTab();
    requestAnimationFrame(() => search.focus());
  }

  function hide(): void {
    if (!visible) return;
    visible = false;
    document.removeEventListener('keydown', handleKeydown);
    overlay.remove();
    popup.remove();
  }

  function refresh(): void {
    if (!visible) return;
    updateCount();
    renderCurrentTab(search.getQuery());
  }

  return {
    element: popup,
    overlay,
    show,
    hide,
    isVisible: () => visible,
    refresh,
  };
}
