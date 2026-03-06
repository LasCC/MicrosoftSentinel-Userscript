import { CSS_PREFIX } from '../config.ts';
import type { HuntingRule, RuleSourceId } from '../types.ts';
import { isPinned, togglePin } from '../core/storage.ts';
import { injectQuery } from '../core/editor-bridge.ts';
import { showToast } from './notification.ts';

const OVERSCAN_COUNT = 6;
const FALLBACK_VIEWPORT_HEIGHT = 320;
const COLLAPSED_ROW_HEIGHT = 88;
const EXPANDED_ROW_HEIGHT = 248;

interface DisplayRule {
  readonly key: string;
  readonly rule: HuntingRule;
  readonly sourceId: RuleSourceId;
}

export interface QueryListComponent {
  readonly element: HTMLDivElement;
  render(
    rules: readonly HuntingRule[],
    sourceId: RuleSourceId | null,
    showSourceBadge?: boolean,
  ): void;
  showEmpty(message: string): void;
  showLoading(sourceLabel?: string): void;
  resetScroll(): void;
}

/** Custom event dispatched when pin state changes so the pinned bar can refresh */
export function dispatchPinChange(): void {
  document.dispatchEvent(new CustomEvent('shq:pin-change'));
}

export function createQueryList(): QueryListComponent {
  const wrap = document.createElement('div');
  wrap.className = `${CSS_PREFIX}-query-list`;

  const message = document.createElement('div');
  const spacer = document.createElement('div');
  spacer.className = `${CSS_PREFIX}-query-list-spacer`;

  const viewport = document.createElement('div');
  viewport.className = `${CSS_PREFIX}-query-list-viewport`;

  wrap.appendChild(message);
  wrap.appendChild(spacer);
  wrap.appendChild(viewport);

  const expandedKeys = new Set<string>();
  const measuredHeights = new Map<string, number>();
  const resizeObserver = new ResizeObserver((entries) => {
    let shouldRender = false;
    for (const entry of entries) {
      const target = entry.target as HTMLDivElement;
      const { key } = target.dataset;
      if (!key) continue;

      const nextHeight = Math.ceil(entry.contentRect.height);
      if (nextHeight <= 0) continue;

      if (measuredHeights.get(key) !== nextHeight) {
        measuredHeights.set(key, nextHeight);
        shouldRender = true;
      }
    }

    if (shouldRender) {
      scheduleListRender();
    }
  });

  let visibleItems: readonly DisplayRule[] = [];
  let visibleShowSourceBadge = false;
  let frameId: number | null = null;

  wrap.addEventListener('scroll', () => {
    if (visibleItems.length === 0) return;
    scheduleListRender();
  });

  function render(
    rules: readonly HuntingRule[],
    sourceId: RuleSourceId | null,
    showSourceBadge = false,
  ): void {
    if (rules.length === 0) {
      showEmpty('No queries found');
      return;
    }

    visibleItems = rules.map((rule) => {
      const resolvedSourceId =
        sourceId ?? ((rule as HuntingRule & { sourceId?: RuleSourceId }).sourceId || 'user');

      return {
        key: createRuleKey(rule.name, resolvedSourceId),
        rule,
        sourceId: resolvedSourceId,
      };
    });
    visibleShowSourceBadge = showSourceBadge;

    pruneState(visibleItems);
    showListShell();
    scheduleListRender(true);
  }

  function showEmpty(messageText: string): void {
    visibleItems = [];
    visibleShowSourceBadge = false;
    clearPendingRender();
    resizeObserver.disconnect();
    viewport.replaceChildren();
    viewport.style.height = '0px';
    spacer.style.height = '0px';
    spacer.style.display = 'none';
    viewport.style.display = 'none';
    message.style.display = '';
    message.innerHTML = `
      <div class="${CSS_PREFIX}-empty">
        <div class="${CSS_PREFIX}-empty-icon">&#128269;</div>
        <div>${messageText}</div>
      </div>
    `;
  }

  function showLoading(sourceLabel?: string): void {
    visibleItems = [];
    visibleShowSourceBadge = false;
    clearPendingRender();
    resizeObserver.disconnect();
    viewport.replaceChildren();
    viewport.style.height = '0px';
    spacer.style.height = '0px';
    spacer.style.display = 'none';
    viewport.style.display = 'none';
    message.style.display = '';

    const loadingLabel = sourceLabel
      ? `Loading ${escapeHtml(sourceLabel)} queries`
      : 'Loading queries';

    message.innerHTML = `
      <div class="${CSS_PREFIX}-loading" role="status" aria-live="polite">
        <div class="${CSS_PREFIX}-loading-label">${loadingLabel}<span class="${CSS_PREFIX}-loading-dots" aria-hidden="true"></span></div>
        <div class="${CSS_PREFIX}-loading-bar" aria-hidden="true">
          <div class="${CSS_PREFIX}-loading-bar-fill"></div>
        </div>
        <div class="${CSS_PREFIX}-loading-note">Cached locally for 12 hours to speed up future loads.</div>
      </div>
    `;
  }

  function resetScroll(): void {
    wrap.scrollTop = 0;
    if (visibleItems.length > 0) {
      scheduleListRender(true);
    }
  }

  function showListShell(): void {
    message.style.display = 'none';
    message.innerHTML = '';
    spacer.style.display = '';
    viewport.style.display = '';
  }

  function scheduleListRender(force = false): void {
    if (force) {
      clearPendingRender();
    }
    if (frameId !== null) return;

    frameId = window.requestAnimationFrame(() => {
      frameId = null;
      renderVisibleWindow();
    });
  }

  function renderVisibleWindow(): void {
    if (visibleItems.length === 0) {
      viewport.replaceChildren();
      viewport.style.height = '0px';
      spacer.style.height = '0px';
      return;
    }

    const offsets = buildOffsets(visibleItems, expandedKeys, measuredHeights);
    const totalHeight = offsets[offsets.length - 1] ?? 0;
    const viewportHeight = wrap.clientHeight || FALLBACK_VIEWPORT_HEIGHT;
    const scrollTop = wrap.scrollTop;
    const startIndex = Math.max(0, findItemIndex(offsets, scrollTop) - OVERSCAN_COUNT);
    const endIndex = Math.min(
      visibleItems.length,
      findItemIndex(offsets, scrollTop + viewportHeight) + OVERSCAN_COUNT + 1,
    );

    spacer.style.height = `${totalHeight}px`;
    viewport.style.height = `${totalHeight}px`;
    viewport.replaceChildren();
    resizeObserver.disconnect();

    const fragment = document.createDocumentFragment();
    for (let index = startIndex; index < endIndex; index += 1) {
      const item = createQueryItem(
        visibleItems[index],
        visibleShowSourceBadge,
        expandedKeys.has(visibleItems[index].key),
        offsets[index],
        toggleExpanded,
      );
      fragment.appendChild(item);
      resizeObserver.observe(item);
    }

    viewport.appendChild(fragment);
  }

  function toggleExpanded(key: string): void {
    if (expandedKeys.has(key)) {
      expandedKeys.delete(key);
    } else {
      expandedKeys.add(key);
    }

    measuredHeights.delete(key);
    scheduleListRender(true);
  }

  function pruneState(items: readonly DisplayRule[]): void {
    const nextKeys = new Set(items.map((item) => item.key));

    for (const key of Array.from(expandedKeys)) {
      if (!nextKeys.has(key)) {
        expandedKeys.delete(key);
      }
    }

    for (const key of Array.from(measuredHeights.keys())) {
      if (!nextKeys.has(key)) {
        measuredHeights.delete(key);
      }
    }
  }

  function clearPendingRender(): void {
    if (frameId === null) return;
    window.cancelAnimationFrame(frameId);
    frameId = null;
  }

  return { element: wrap, render, showEmpty, showLoading, resetScroll };
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
  itemData: DisplayRule,
  showSourceBadge: boolean,
  expanded: boolean,
  top: number,
  onToggleExpanded: (key: string) => void,
): HTMLDivElement {
  const { key, rule, sourceId } = itemData;
  const item = document.createElement('div');
  item.className = `${CSS_PREFIX}-query-item`;
  if (expanded) item.classList.add(`${CSS_PREFIX}-query-item--expanded`);
  item.dataset.key = key;
  item.style.top = `${top}px`;

  const header = document.createElement('div');
  header.className = `${CSS_PREFIX}-query-item-header`;
  header.title = 'Click to inject query';
  header.addEventListener('click', () => {
    handleUse(rule);
  });

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

  const actions = document.createElement('div');
  actions.className = `${CSS_PREFIX}-query-item-actions`;

  const pinBtn = createIconButton(
    isPinned(rule.name, sourceId) ? '\u{1F4CC}' : '\u{1F4CD}',
    isPinned(rule.name, sourceId) ? 'Unpin' : 'Pin',
  );
  if (isPinned(rule.name, sourceId)) pinBtn.classList.add(`${CSS_PREFIX}-icon-btn--pinned`);
  pinBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const pinned = togglePin(rule.name, sourceId);
    pinBtn.textContent = pinned ? '\u{1F4CC}' : '\u{1F4CD}';
    pinBtn.title = pinned ? 'Unpin' : 'Pin';
    pinBtn.classList.toggle(`${CSS_PREFIX}-icon-btn--pinned`, pinned);
    showToast(
      pinned ? `Pinned: ${rule.name}` : `Unpinned: ${rule.name}`,
      'info',
    );
    dispatchPinChange();
  });

  const chevronBtn = document.createElement('div');
  chevronBtn.role = 'button';
  chevronBtn.tabIndex = 0;
  chevronBtn.className = `${CSS_PREFIX}-icon-btn ${CSS_PREFIX}-icon-btn--chevron`;
  if (expanded) chevronBtn.classList.add(`${CSS_PREFIX}-icon-btn--chevron-open`);
  chevronBtn.appendChild(createChevronSvg());
  chevronBtn.title = expanded ? 'Collapse query preview' : 'Expand query preview';
  chevronBtn.setAttribute('aria-expanded', String(expanded));
  chevronBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    onToggleExpanded(key);
  });
  chevronBtn.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      onToggleExpanded(key);
    }
  });

  actions.appendChild(pinBtn);
  actions.appendChild(chevronBtn);

  header.appendChild(body);
  header.appendChild(actions);

  item.appendChild(header);

  if (expanded) {
    const preview = document.createElement('div');
    preview.className = `${CSS_PREFIX}-query-item-preview`;
    preview.addEventListener('click', (event) => event.stopPropagation());

    const previewLabel = document.createElement('div');
    previewLabel.className = `${CSS_PREFIX}-query-item-preview-label`;
    previewLabel.textContent = 'Query preview';

    const previewCode = document.createElement('pre');
    previewCode.className = `${CSS_PREFIX}-query-item-preview-code`;
    previewCode.textContent = rule.query;

    preview.appendChild(previewLabel);
    preview.appendChild(previewCode);
    item.appendChild(preview);
  }

  return item;
}

function createIconButton(label: string, title: string): HTMLDivElement {
  const el = document.createElement('div');
  el.role = 'button';
  el.tabIndex = 0;
  el.className = `${CSS_PREFIX}-icon-btn`;
  el.textContent = label;
  el.title = title;
  el.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      el.click();
    }
  });
  return el;
}

function createRuleKey(name: string, sourceId: RuleSourceId): string {
  return `${sourceId}:${name}`;
}

function buildOffsets(
  items: readonly DisplayRule[],
  expandedKeys: ReadonlySet<string>,
  measuredHeights: ReadonlyMap<string, number>,
): number[] {
  const offsets = new Array<number>(items.length + 1).fill(0);
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const measured = measuredHeights.get(item.key);
    const estimated = expandedKeys.has(item.key) ? EXPANDED_ROW_HEIGHT : COLLAPSED_ROW_HEIGHT;
    offsets[index + 1] = offsets[index] + (measured ?? estimated);
  }
  return offsets;
}

function findItemIndex(offsets: readonly number[], offset: number): number {
  const itemCount = offsets.length - 1;
  if (itemCount <= 0) {
    return 0;
  }

  let low = 0;
  let high = itemCount - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (offset < offsets[mid]) {
      high = mid - 1;
      continue;
    }
    if (offset >= offsets[mid + 1]) {
      low = mid + 1;
      continue;
    }
    return mid;
  }

  return Math.max(0, Math.min(itemCount - 1, low));
}

function createChevronSvg(): SVGSVGElement {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', '12');
  svg.setAttribute('height', '12');
  svg.setAttribute('viewBox', '0 0 12 12');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');

  const path = document.createElementNS(NS, 'path');
  path.setAttribute('d', 'M2.5 4.5L6 8L9.5 4.5');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.5');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');

  svg.appendChild(path);
  return svg;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
