import { CSS_PREFIX } from '../config.ts';
import type { HuntingRule, RuleSourceId } from '../types.ts';
import { getPinnedRules } from '../core/query-manager.ts';
import { unpinQuery } from '../core/storage.ts';
import { injectQuery } from '../core/editor-bridge.ts';
import { showToast } from './notification.ts';

export interface PinnedBarComponent {
  readonly element: HTMLDivElement;
  refresh(): void;
  destroy(): void;
}

/**
 * Horizontal row of pill-shaped chips fixed at the bottom of the page.
 * Each pill represents a pinned query. Clicking it injects the query
 * into the Monaco editor. The X button unpins it.
 */
export function createPinnedBar(): PinnedBarComponent {
  const container = document.createElement('div');
  container.className = `${CSS_PREFIX}-pinned-container`;

  function handlePinChange(): void {
    refresh();
  }

  document.addEventListener('shq:pin-change', handlePinChange);

  function refresh(): void {
    container.innerHTML = '';
    const pinned = getPinnedRules();
    if (pinned.length === 0) return;

    // Leading label
    const label = document.createElement('span');
    label.className = `${CSS_PREFIX}-pinned-label`;
    label.textContent = 'Pinned';
    container.appendChild(label);

    for (const rule of pinned) {
      container.appendChild(
        createPill(
          rule,
          (rule as HuntingRule & { sourceId: RuleSourceId }).sourceId,
        ),
      );
    }
  }

  function createPill(
    rule: HuntingRule,
    sourceId: RuleSourceId,
  ): HTMLDivElement {
    const pill = document.createElement('div');
    pill.className = `${CSS_PREFIX}-pill`;
    pill.title = `${rule.name}\n${rule.description}\n\nClick to inject query`;

    // Click the pill body -> inject query
    pill.addEventListener('click', () => {
      const result = injectQuery(rule.query, rule.name);
      switch (result) {
        case 'injected':
          showToast(`Query injected: ${rule.name}`, 'success');
          break;
        case 'clipboard':
          showToast(`Copied to clipboard: ${rule.name}`, 'info');
          break;
        case 'failed':
          showToast(`Failed to inject query`, 'error');
          break;
        default: {
          const _exhaustive: never = result;
          throw new Error(`Unhandled inject result: ${_exhaustive}`);
        }
      }
    });

    // Pin icon (cross-platform emoji)
    const pin = document.createElement('span');
    pin.className = `${CSS_PREFIX}-pill-pin`;
    pin.textContent = '\u{1F4CC}';

    // Name
    const name = document.createElement('span');
    name.className = `${CSS_PREFIX}-pill-name`;
    name.textContent = rule.name;

    // Dismiss (X) - unpin
    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = `${CSS_PREFIX}-pill-dismiss`;
    dismiss.innerHTML = '&#10005;';
    dismiss.title = 'Unpin';
    dismiss.addEventListener('click', (e) => {
      e.stopPropagation(); // Don't trigger the pill click
      unpinQuery(rule.name, sourceId);
      showToast(`Unpinned: ${rule.name}`, 'info');
      refresh();
    });

    pill.appendChild(pin);
    pill.appendChild(name);
    pill.appendChild(dismiss);

    return pill;
  }

  function destroy(): void {
    document.removeEventListener('shq:pin-change', handlePinChange);
    container.remove();
  }

  // Initial render
  refresh();

  return { element: container, refresh, destroy };
}
