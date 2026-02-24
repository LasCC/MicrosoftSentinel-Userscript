import type { PlatformAdapter } from './types.ts';
import { CSS_PREFIX } from './config.ts';
import { detectPlatform, getPlatformAdapter } from './platforms/index.ts';
import { injectStyles } from './styles/index.ts';
import { initTheme } from './styles/theme.ts';
import { loadAllRules } from './core/query-manager.ts';
import { createButton, type ButtonComponent } from './ui/button.ts';
import { createPopup, type PopupComponent } from './ui/popup.ts';
import { createPinnedBar, type PinnedBarComponent } from './ui/pinned-bar.ts';
import { showToast } from './ui/notification.ts';

// ── State ──

let platform: PlatformAdapter | null = null;
let button: ButtonComponent | null = null;
let popup: PopupComponent | null = null;
let pinnedBar: PinnedBarComponent | null = null;
let injected = false;

// ── Bootstrap ──

function bootstrap(): void {
  const platformId = detectPlatform();
  if (!platformId) return;

  platform = getPlatformAdapter(platformId);

  initTheme();
  injectStyles();
  observeForHuntingPage();
}

// ── MutationObserver - watches for SPA navigation ──

function observeForHuntingPage(): void {
  checkAndInject();

  const observer = new MutationObserver(() => {
    checkAndInject();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function checkAndInject(): void {
  if (!platform) return;

  if (platform.isHuntingPage()) {
    if (!injected) {
      void injectUI();
    }
  } else {
    if (injected) {
      removeUI();
    }
  }
}

// ── UI Injection ──

function injectUI(): void {
  if (injected || !platform) return;
  injected = true;

  try {
    loadAllRules();
  } catch {
    showToast('Failed to load hunting rules', 'error');
  }

  popup = createPopup(() => {
    popup?.hide();
    button?.setOpen(false);
  });

  button = createButton(() => {
    if (popup?.isVisible()) {
      popup.hide();
      button?.setOpen(false);
    } else {
      popup?.show(button?.buttonEl);
      button?.setOpen(true);
    }
  }, platform.id);

  placeButton(button.element, platform);

  pinnedBar = createPinnedBar();
  placePinnedBar(pinnedBar.element, platform);
}

// ── Place button with retry ──

let buttonObserver: MutationObserver | null = null;

function placeButton(el: HTMLElement, plat: PlatformAdapter): void {
  const target = plat.getButtonInjectionTarget();
  if (target) {
    target.appendChild(el);
    return;
  }

  document.body.appendChild(el);

  buttonObserver = new MutationObserver(() => {
    const t = plat.getButtonInjectionTarget();
    if (t) {
      t.appendChild(el);
      buttonObserver?.disconnect();
      buttonObserver = null;
    }
  });

  buttonObserver.observe(document.body, { childList: true, subtree: true });
}

// ── Place pinned bar with retry ──

let pinnedBarObserver: MutationObserver | null = null;

function placePinnedBar(el: HTMLElement, plat: PlatformAdapter): void {
  const target = plat.getPinnedBarTarget();
  if (target?.parentElement) {
    target.parentElement.insertBefore(el, target);
    return;
  }

  document.body.appendChild(el);

  pinnedBarObserver = new MutationObserver(() => {
    const t = plat.getPinnedBarTarget();
    if (t?.parentElement) {
      t.parentElement.insertBefore(el, t);
      pinnedBarObserver?.disconnect();
      pinnedBarObserver = null;
    }
  });

  pinnedBarObserver.observe(document.body, { childList: true, subtree: true });
}

function removeUI(): void {
  if (!injected) return;
  injected = false;

  buttonObserver?.disconnect();
  buttonObserver = null;
  pinnedBarObserver?.disconnect();
  pinnedBarObserver = null;

  popup?.hide();
  button?.element.remove();
  pinnedBar?.destroy();

  popup = null;
  button = null;
  pinnedBar = null;
}

// ── Ensure we don't double-inject ──

function isAlreadyRunning(): boolean {
  return document.getElementById(`${CSS_PREFIX}-styles`) !== null;
}

// ── Entry Point ──

(function main() {
  if (isAlreadyRunning()) return;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
