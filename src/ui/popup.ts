import { CSS_PREFIX, TABS, REPOS } from '../config.ts';
import type { HuntingRule, RuleSourceId, TabId } from '../types.ts';
import {
  getRulesForSource,
  getPinnedRules,
  searchRules,
  getCategoriesForSource,
  filterByCategory,
  getTotalRuleCount,
  ensureRepoLoaded,
} from '../core/query-manager.ts';
import { getRepoLoadState } from '../core/public-repos.ts';
import { createSearch, type SearchComponent } from './search.ts';
import { createTabs, type TabsComponent } from './tabs.ts';
import { createQueryList, type QueryListComponent } from './query-list.ts';
import { createCategoryFilter, type CategoryFilterComponent } from './category-filter.ts';

export interface PopupComponent {
  readonly element: HTMLDivElement;
  readonly overlay: HTMLDivElement;
  show(anchorEl?: HTMLElement): void;
  hide(): void;
  isVisible(): boolean;
  refresh(): void;
}

export function createPopup(onClose: () => void): PopupComponent {
  const overlay = document.createElement('div');
  overlay.className = `${CSS_PREFIX}-popup-overlay`;
  overlay.addEventListener('click', onClose);

  const popup = document.createElement('div');
  popup.className = `${CSS_PREFIX}-popup`;

  popup.addEventListener('click', (e) => e.stopPropagation());

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

  const search: SearchComponent = createSearch(handleSearch);
  const tabs: TabsComponent = createTabs(handleTabChange);
  const categoryFilter: CategoryFilterComponent = createCategoryFilter(handleCategoryChange);
  const queryList: QueryListComponent = createQueryList();
  popup.appendChild(header);
  popup.appendChild(search.element);
  popup.appendChild(tabs.element);
  popup.appendChild(categoryFilter.element);
  popup.appendChild(queryList.element);

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      onClose();
    }
  }

  let visible = false;

  function handleSearch(query: string): void {
    renderCurrentTab(query);
  }

  function handleCategoryChange(_category: string | null): void {
    renderCurrentTab(search.getQuery());
  }

  function handleTabChange(_tabId: TabId): void {
    search.reset();
    categoryFilter.reset();
  }

  function renderCurrentTab(searchQuery = ''): void {
    const activeTab = tabs.getActiveTab();
    const tabDef = TABS.find((t) => t.id === activeTab);
    if (!tabDef) return;

    if (activeTab === 'pinned') {
      categoryFilter.setCategories([]);
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

    const isRepoTab = REPOS.some((r) => r.id === activeTab);
    if (isRepoTab) {
      const state = getRepoLoadState(activeTab as RuleSourceId);
      if (state === 'idle' || state === 'loading') {
        categoryFilter.setCategories([]);
        queryList.showLoading(tabDef.label);
        void ensureRepoLoaded(activeTab as RuleSourceId).then(() => {
          if (tabs.getActiveTab() === activeTab) {
            updateCount();
            renderSourceTab(activeTab as RuleSourceId, searchQuery);
          }
        });
        return;
      }
      if (state === 'error') {
        const rules = getRulesForSource(activeTab as RuleSourceId);
        if (rules.length === 0) {
          categoryFilter.setCategories([]);
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
    const categories = getCategoriesForSource(sourceId);
    categoryFilter.setCategories(categories);

    let rules = getRulesForSource(sourceId);
    const selectedCategory = categoryFilter.getSelected();
    if (selectedCategory) {
      rules = filterByCategory(rules, selectedCategory);
    }
    const filtered = searchQuery ? searchRules(rules, searchQuery) : rules;
    queryList.render(filtered, sourceId);
  }

  function updateCount(): void {
    countBadge.textContent = String(getTotalRuleCount());
  }

  function positionPopup(anchorEl?: HTMLElement): void {
    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      const popupWidth = 420;
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
