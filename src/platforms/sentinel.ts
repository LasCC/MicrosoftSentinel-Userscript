import type { MonacoEditorInstance, PlatformAdapter } from '../types.ts';
import { SELECTORS } from '../config.ts';
import { getMonacoEditorInstance } from '../core/editor-bridge.ts';

/**
 * MS Sentinel (Azure Portal) platform adapter.
 *
 * Sentinel's Advanced Hunting runs inside an iframe on reactblade.portal.azure.net.
 * The KQL editor uses Monaco (exposed via window.monaco).
 *
 * Key DOM landmarks:
 * - #DiscoverWrapper                     - main hunting wrapper
 * - .filter-panel                        - command bar area
 * - .left-side.kql-mode-panel            - left panel (Run button, time picker, KQL mode)
 * - .run-split-button .btn-submit        - Run button
 * - la-results-view                      - results area below editor
 */
export const sentinelAdapter: PlatformAdapter = {
  id: 'sentinel',
  label: 'Microsoft Sentinel',

  getButtonInjectionTarget(): HTMLElement | null {
    // Insert into the left-side KQL mode panel only - no fallback to filter-panel
    // so the button sits inline with Run, time picker, etc.
    return document.querySelector<HTMLElement>(SELECTORS.SENTINEL.KQL_PANEL);
  },

  getPinnedBarTarget(): HTMLElement | null {
    // Insert above the results view
    return (
      document.querySelector<HTMLElement>(SELECTORS.SENTINEL.RESULTS_VIEW) ??
      null
    );
  },

  getMonacoEditor(): MonacoEditorInstance | null {
    return getMonacoEditorInstance();
  },

  isHuntingPage(): boolean {
    return document.querySelector(SELECTORS.SENTINEL.DISCOVER_WRAPPER) !== null;
  },
};
