import { CSS_PREFIX } from '../config.ts';
import type { PlatformId } from '../types.ts';

export interface ButtonComponent {
  readonly element: HTMLDivElement;
  readonly buttonEl: HTMLButtonElement;
  setOpen(open: boolean): void;
}

/**
 * Creates an inline command bar button.
 *
 * On Defender: uses native Fluent UI v8 `ms-Button--commandBar` classes so the
 * button inherits the page's own styles and looks identical to Run, Save, Share.
 *
 * On Sentinel: uses our custom `shq-btn` CSS since the reactblade iframe has
 * different styling.
 */
export function createButton(onClick: () => void, platformId: PlatformId): ButtonComponent {
  if (platformId === 'defender') {
    return createDefenderButton(onClick);
  }
  return createSentinelButton(onClick);
}

// ── Defender: native Fluent UI v8 markup ──

/**
 * Copy the class name from a reference element, keeping only the base
 * semantic class and the generated hash class (e.g. "ms-Button-label label-554").
 * Strips disabled-specific overrides like rootDisabled-*, is-disabled, etc.
 */
function copyClasses(el: HTMLElement, semanticPrefix: string): string {
  return el.className
    .split(/\s+/)
    .filter((c) =>
      !c.startsWith('is-') &&
      !c.includes('Disabled') &&
      c !== 'scc-listButton' &&
      c !== 'scc-listDropdown',
    )
    .join(' ') || semanticPrefix;
}

/**
 * Find an existing CommandBar button on the page and steal its generated
 * CSS-in-JS class names so our button inherits the exact same styles.
 */
function getFluentClassMap(): Record<string, string> {
  const map: Record<string, string> = {
    root: 'ms-Button ms-Button--commandBar',
    flexContainer: 'ms-Button-flexContainer',
    textContainer: 'ms-Button-textContainer',
    label: 'ms-Button-label',
    item: 'ms-OverflowSet-item',
  };

  // Find a sibling commandBar button to copy its generated class names.
  // Prefer an enabled button; fall back to disabled if all are disabled.
  const ref =
    document.querySelector<HTMLButtonElement>(
      '.scc-commandBar .ms-Button.ms-Button--commandBar:not(:disabled)',
    ) ??
    document.querySelector<HTMLButtonElement>(
      '.scc-commandBar .ms-Button.ms-Button--commandBar',
    );
  if (!ref) return map;

  map.root = copyClasses(ref, map.root);

  const fc = ref.querySelector<HTMLElement>('.ms-Button-flexContainer');
  if (fc) map.flexContainer = copyClasses(fc, map.flexContainer);

  const tc = ref.querySelector<HTMLElement>('.ms-Button-textContainer');
  if (tc) map.textContainer = copyClasses(tc, map.textContainer);

  const lb = ref.querySelector<HTMLElement>('.ms-Button-label');
  if (lb) map.label = copyClasses(lb, map.label);

  const item = ref.closest<HTMLElement>('.ms-OverflowSet-item');
  if (item) map.item = copyClasses(item, map.item);

  return map;
}

function createDefenderButton(onClick: () => void): ButtonComponent {
  const cls = getFluentClassMap();

  const wrapper = document.createElement('div');
  wrapper.className = cls.item;
  wrapper.setAttribute('role', 'none');

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = cls.root;
  btn.setAttribute('role', 'menuitem');
  btn.setAttribute('data-is-focusable', 'true');
  btn.title = 'Threat Hunting Queries';
  btn.tabIndex = 0;

  const flexContainer = document.createElement('span');
  flexContainer.className = cls.flexContainer;
  flexContainer.setAttribute('data-automationid', 'splitbuttonprimary');

  const textContainer = document.createElement('span');
  textContainer.className = cls.textContainer;

  const label = document.createElement('span');
  label.className = cls.label;
  label.textContent = 'Threat Hunting Queries';

  textContainer.appendChild(label);
  flexContainer.appendChild(textContainer);
  btn.appendChild(flexContainer);
  wrapper.appendChild(btn);

  btn.addEventListener('click', onClick);

  return {
    element: wrapper,
    buttonEl: btn,
    setOpen(open: boolean) {
      btn.classList.toggle('is-checked', open);
      btn.title = open ? 'Close' : 'Threat Hunting Queries';
    },
  };
}

// ── Sentinel: custom-styled button ──

function createSentinelButton(onClick: () => void): ButtonComponent {
  const wrapper = document.createElement('div');
  wrapper.className = `${CSS_PREFIX}-btn-wrap`;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `${CSS_PREFIX}-btn`;
  btn.title = 'Threat Hunting Queries';

  const labelSpan = document.createElement('span');
  labelSpan.className = `${CSS_PREFIX}-btn-label`;
  labelSpan.textContent = 'Threat Hunting Queries';

  btn.appendChild(labelSpan);
  wrapper.appendChild(btn);

  btn.addEventListener('click', onClick);

  return {
    element: wrapper,
    buttonEl: btn,
    setOpen(open: boolean) {
      btn.classList.toggle(`${CSS_PREFIX}-btn--open`, open);
      btn.title = open ? 'Close' : 'Threat Hunting Queries';
    },
  };
}
