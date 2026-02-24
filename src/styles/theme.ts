/* eslint-disable @typescript-eslint/no-explicit-any */
import { CSS_PREFIX } from '../config.ts';

/**
 * Azure Portal theme tokens.
 * Copied from .fxs-mode-light and .fxs-mode-dark class definitions.
 * We inject these as CSS vars on our style root so they work inside the
 * reactblade iframe even if the parent frame's vars don't cascade down.
 */

const LIGHT_TOKENS: Record<string, string> = {
  '--colorTextPrimary': '#292827',
  '--colorTextPrimaryHover': '#201f1e',
  '--colorTextSecondary': '#646464',
  '--colorTextInverted': '#fff',
  '--colorTextBrand': '#0078d4',
  '--colorTextDisabled': '#a19f9d',
  '--colorLink': '#0078d4',
  '--colorLinkContrast': '#005a9e',
  '--colorButtonBackgroundPrimary': '#0078d4',
  '--colorButtonBackgroundPrimaryHover': '#106ebe',
  '--colorButtonForegroundPrimary': '#fff',
  '--colorButtonBackgroundSecondary': '#fff',
  '--colorButtonBackgroundSecondaryHover': '#f3f2f1',
  '--colorButtonForegroundSecondary': '#323130',
  '--colorButtonBackgroundTertiary': '#e6f2fb',
  '--colorButtonToolbardForeground': '#323130',
  '--colorButtonToolbardForegroundHover': '#201f1e',
  '--colorControlBackground': '#fff',
  '--colorControlBackgroundHover': '#f3f2f1',
  '--colorControlBackgroundSelected': '#edebe9',
  '--colorControlBackgroundSecondary': '#8a8886',
  '--colorControlBorder': '#8a8886',
  '--colorControlBorderSecondary': '#d6d6d6',
  '--colorControlBorderFocus': '#0078d4',
  '--colorControlBorderInfo': '#015cda',
  '--colorIconPrimary': '#323130',
  '--colorIconSecondary': '#605e5c',
  '--colorIconBrand': '#0078d4',
  '--colorIconSuccess': '#57a300',
  '--colorIconError': '#a4262c',
  '--colorContainerBackgroundPrimary': '#fff',
  '--colorContainerBackgroundSecondary': '#f3f2f1',
  '--colorContainerBackgroudFloating': '#fff',
  '--colorContainerBackgroundInfo': '#dae4ff',
  '--colorContainerBorderPrimary': '#e1dfdd',
  '--colorDividerPrimary': '#f3f2f1',
  '--shadowLevel1': '0 1.6px 3.6px 0 rgba(0,0,0,.132),0 .3px .9px 0 rgba(0,0,0,.108)',
  '--shadowLevel2': '0 3.2px 7.2px 0 rgba(0,0,0,.132),0 .6px 1.8px 0 rgba(0,0,0,.108)',
  '--shadowLevel3': '0 6.4px 14.4px 0 rgba(0,0,0,.132),0 1.2px 3.6px 0 rgba(0,0,0,.108)',
};

const DARK_TOKENS: Record<string, string> = {
  '--colorTextPrimary': '#faf9f8',
  '--colorTextPrimaryHover': '#fff',
  '--colorTextSecondary': '#a19f9d',
  '--colorTextInverted': '#1b1a19',
  '--colorTextBrand': '#2899f5',
  '--colorTextDisabled': '#797775',
  '--colorLink': '#1890f1',
  '--colorLinkContrast': '#3aa0f3',
  '--colorButtonBackgroundPrimary': '#2899f5',
  '--colorButtonBackgroundPrimaryHover': '#3aa0f3',
  '--colorButtonForegroundPrimary': '#1b1a19',
  '--colorButtonBackgroundSecondary': '#1b1a19',
  '--colorButtonBackgroundSecondaryHover': '#252423',
  '--colorButtonForegroundSecondary': '#2899f5',
  '--colorButtonBackgroundTertiary': '#55b3ff66',
  '--colorButtonToolbardForeground': '#fff',
  '--colorButtonToolbardForegroundHover': '#fff',
  '--colorControlBackground': '#1b1a19',
  '--colorControlBackgroundHover': '#323130',
  '--colorControlBackgroundSelected': '#3b3a39',
  '--colorControlBackgroundSecondary': '#484644',
  '--colorControlBorder': '#a19f9d',
  '--colorControlBorderSecondary': '#605e5c',
  '--colorControlBorderFocus': '#2899f5',
  '--colorControlBorderInfo': '#1890f1',
  '--colorIconPrimary': '#f3f2f1',
  '--colorIconSecondary': '#a19f9d',
  '--colorIconBrand': '#2899f5',
  '--colorIconSuccess': '#95c353',
  '--colorIconError': '#f1707b',
  '--colorContainerBackgroundPrimary': '#1b1a19',
  '--colorContainerBackgroundSecondary': '#3b3a39',
  '--colorContainerBackgroudFloating': '#252423',
  '--colorContainerBackgroundInfo': '#00245b',
  '--colorContainerBorderPrimary': '#323130',
  '--colorDividerPrimary': '#323130',
  '--shadowLevel1': '0 1.6px 3.6px 0 rgba(0,0,0,.26),0 .3px .9px 0 rgba(0,0,0,.22)',
  '--shadowLevel2': '0 3.2px 7.2px 0 rgba(0,0,0,.26),0 .6px 1.8px 0 rgba(0,0,0,.22)',
  '--shadowLevel3': '0 6.4px 14.4px 0 rgba(0,0,0,.26),0 1.2px 3.6px 0 rgba(0,0,0,.22)',
};

let themeStyleEl: HTMLStyleElement | null = null;
let themeObserver: MutationObserver | null = null;
let currentMode: 'light' | 'dark' = 'light';

/**
 * Detect current theme mode by checking for .fxs-mode-dark on the page
 * or on the parent frame's body/html.
 */
function detectThemeMode(): 'light' | 'dark' {
  // Check inside current document (iframe)
  if (
    document.documentElement.classList.contains('fxs-mode-dark') ||
    document.body?.classList.contains('fxs-mode-dark')
  ) {
    return 'dark';
  }

  // Check parent frame (cross-origin safe - may throw)
  try {
    const parentDoc = (window as any).parent?.document;
    if (parentDoc) {
      if (
        parentDoc.documentElement?.classList.contains('fxs-mode-dark') ||
        parentDoc.body?.classList.contains('fxs-mode-dark')
      ) {
        return 'dark';
      }
    }
  } catch {
    // Cross-origin - can't access parent
  }

  // Check unsafeWindow parent (Tampermonkey may allow this)
  try {
    if (typeof unsafeWindow !== 'undefined') {
      const parentDoc = (unsafeWindow as any).parent?.document;
      if (parentDoc) {
        if (
          parentDoc.documentElement?.classList.contains('fxs-mode-dark') ||
          parentDoc.body?.classList.contains('fxs-mode-dark')
        ) {
          return 'dark';
        }
      }
    }
  } catch {
    // Not available
  }

  // Fallback: inspect the actual background color of the page body.
  // If it's dark (luminance < 50), assume dark mode.
  // Do NOT use prefers-color-scheme - the OS theme may differ from Portal theme.
  try {
    const bg = window.getComputedStyle(document.body).backgroundColor;
    if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
      const match = bg.match(/\d+/g);
      if (match && match.length >= 3) {
        const [r, g, b] = match.map(Number);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
         if (luminance < 128) {
          return 'dark';
        }
      }
    }
  } catch {
    // Ignore
  }

  return 'light';
}

/** Generate CSS that sets all tokens as vars on :root */
function buildTokenCSS(mode: 'light' | 'dark'): string {
  const tokens = mode === 'dark' ? DARK_TOKENS : LIGHT_TOKENS;
  const vars = Object.entries(tokens)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
  return `:root {\n${vars}\n}`;
}

/** Apply the correct theme tokens */
function applyTheme(mode: 'light' | 'dark'): void {
  if (!themeStyleEl) {
    themeStyleEl = document.createElement('style');
    themeStyleEl.id = `${CSS_PREFIX}-theme`;
    document.head.appendChild(themeStyleEl);
  }
  themeStyleEl.textContent = buildTokenCSS(mode);
  currentMode = mode;
}

/** Start observing for theme changes */
export function initTheme(): void {
  const mode = detectThemeMode();
  applyTheme(mode);

  // Observe class changes on html and body for mode switches
  themeObserver = new MutationObserver(() => {
    const newMode = detectThemeMode();
    if (newMode !== currentMode) {
      applyTheme(newMode);
    }
  });

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

  if (document.body) {
    themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  // Also listen for prefers-color-scheme changes
  window.matchMedia?.('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      const newMode = detectThemeMode();
      if (newMode !== currentMode) {
        applyTheme(newMode);
      }
    });
}
