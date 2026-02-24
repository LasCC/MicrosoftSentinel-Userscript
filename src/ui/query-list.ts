import { CSS_PREFIX } from '../config.ts';
import type { HuntingRule, RuleSourceId } from '../types.ts';
import { isPinned, togglePin } from '../core/storage.ts';
import { injectQuery } from '../core/editor-bridge.ts';
import { showToast } from './notification.ts';

export interface QueryListComponent {
  readonly element: HTMLDivElement;
  render(
    rules: readonly HuntingRule[],
    sourceId: RuleSourceId | null,
    showSourceBadge?: boolean,
  ): void;
  showEmpty(message: string): void;
  showLoading(): void;
}

/** Custom event dispatched when pin state changes so the pinned bar can refresh */
export function dispatchPinChange(): void {
  document.dispatchEvent(new CustomEvent('shq:pin-change'));
}

export function createQueryList(): QueryListComponent {
  const wrap = document.createElement('div');
  wrap.className = `${CSS_PREFIX}-query-list`;

  function render(
    rules: readonly HuntingRule[],
    sourceId: RuleSourceId | null,
    showSourceBadge = false,
  ): void {
    wrap.innerHTML = '';

    if (rules.length === 0) {
      showEmpty('No queries found');
      return;
    }

    for (const rule of rules) {
      const effectiveSourceId =
        sourceId ?? ((rule as HuntingRule & { sourceId?: RuleSourceId }).sourceId || 'user');
      wrap.appendChild(createQueryItem(rule, effectiveSourceId, showSourceBadge));
    }
  }

  function showEmpty(message: string): void {
    wrap.innerHTML = `
      <div class="${CSS_PREFIX}-empty">
        <div class="${CSS_PREFIX}-empty-icon">&#128269;</div>
        <div>${message}</div>
      </div>
    `;
  }

  function showLoading(): void {
    wrap.innerHTML = `
      <div class="${CSS_PREFIX}-loading">
        <div class="${CSS_PREFIX}-spinner"></div>
        <div>Loading queries...</div>
      </div>
    `;
  }

  return { element: wrap, render, showEmpty, showLoading };
}

function handleUse(rule: HuntingRule): void {
  const result = injectQuery(rule.query, rule.name);
  switch (result) {
    case 'injected':
      showToast(`Query injected: ${rule.name}`, 'success');
      break;
    case 'clipboard':
      showToast(`Copied to clipboard: ${rule.name}`, 'info');
      break;
    case 'failed':
      showToast(`Failed to inject query: ${rule.name}`, 'error');
      break;
    default: {
      const _exhaustive: never = result;
      throw new Error(`Unhandled inject result: ${_exhaustive}`);
    }
  }
}

function createQueryItem(
  rule: HuntingRule,
  sourceId: RuleSourceId,
  showSourceBadge: boolean,
): HTMLDivElement {
  const item = document.createElement('div');
  item.className = `${CSS_PREFIX}-query-item`;
  item.title = 'Click to inject query';

  // Clicking the row injects the query (same as "Use" button)
  item.addEventListener('click', () => {
    handleUse(rule);
  });

  // Body
  const body = document.createElement('div');
  body.className = `${CSS_PREFIX}-query-item-body`;

  const nameEl = document.createElement('div');
  nameEl.className = `${CSS_PREFIX}-query-item-name`;
  nameEl.textContent = rule.name;
  nameEl.title = rule.name;

  const descEl = document.createElement('div');
  descEl.className = `${CSS_PREFIX}-query-item-desc`;
  descEl.textContent = rule.description;

  const meta = document.createElement('div');
  meta.className = `${CSS_PREFIX}-query-item-meta`;

  const categoryBadge = document.createElement('span');
  categoryBadge.className = `${CSS_PREFIX}-badge`;
  categoryBadge.textContent = rule.category;
  meta.appendChild(categoryBadge);

  if (showSourceBadge) {
    const sourceBadge = document.createElement('span');
    sourceBadge.className = `${CSS_PREFIX}-badge ${CSS_PREFIX}-badge--source`;
    sourceBadge.textContent = sourceId;
    meta.appendChild(sourceBadge);
  }

  body.appendChild(nameEl);
  body.appendChild(descEl);
  body.appendChild(meta);

  // Actions
  const actions = document.createElement('div');
  actions.className = `${CSS_PREFIX}-query-item-actions`;

  // Pin button
  const pinBtn = document.createElement('button');
  pinBtn.type = 'button';
  pinBtn.className = `${CSS_PREFIX}-action-btn`;
  updatePinButton(pinBtn, rule.name, sourceId);

  pinBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const pinned = togglePin(rule.name, sourceId);
    updatePinButton(pinBtn, rule.name, sourceId);
    showToast(
      pinned ? `Pinned: ${rule.name}` : `Unpinned: ${rule.name}`,
      'info',
    );
    dispatchPinChange();
  });

  // Use button
  const useBtn = document.createElement('button');
  useBtn.type = 'button';
  useBtn.className = `${CSS_PREFIX}-action-btn ${CSS_PREFIX}-action-btn--use`;
  useBtn.textContent = 'Use';

  useBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    handleUse(rule);
  });

  actions.appendChild(pinBtn);
  actions.appendChild(useBtn);

  item.appendChild(body);
  item.appendChild(actions);

  return item;
}

function updatePinButton(
  btn: HTMLButtonElement,
  name: string,
  sourceId: string,
): void {
  const pinned = isPinned(name, sourceId);
  btn.textContent = pinned ? '\u{1F4CC}' : '\u{1F4CD}';
  btn.title = pinned ? 'Unpin' : 'Pin';
  btn.classList.toggle(`${CSS_PREFIX}-action-btn--pinned`, pinned);
}
