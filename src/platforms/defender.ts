import type { MonacoEditorInstance, PlatformAdapter } from '../types.ts';
import { SELECTORS } from '../config.ts';
import { getMonacoEditorInstance } from '../core/editor-bridge.ts';

/**
 * MS Defender (security.microsoft.com) platform adapter.
 *
 * Key DOM landmarks:
 * - .scc-sidePanelPage-mainContent                - main content area
 * - .scc-commandBar                               - top command bar wrapper
 * - .scc-commandBar .ms-CommandBar-primaryCommand  - primary commands (Run, time, Save, Share)
 * - #huntingRunQueryButtonId                       - Run query button
 *
 * NOTE: There are multiple .ms-CommandBar-primaryCommand on the page
 * (top bar + results table bar). The selector is scoped to .scc-commandBar
 * to target only the top one.
 */
export const defenderAdapter: PlatformAdapter = {
  id: 'defender',
  label: 'Microsoft Defender',

  getButtonInjectionTarget(): HTMLElement | null {
    // There are multiple .scc-commandBar on the page (top bar + results table bar).
    // Scope to the FIRST one inside mainContent - that's the top command bar.
    const mainContent = document.querySelector<HTMLElement>(SELECTORS.DEFENDER.MAIN_CONTENT);
    if (!mainContent) return null;
    const topCommandBar = mainContent.querySelector<HTMLElement>(SELECTORS.DEFENDER.COMMAND_BAR);
    if (!topCommandBar) return null;
    return topCommandBar.querySelector<HTMLElement>('.ms-CommandBar-primaryCommand');
  },

  getPinnedBarTarget(): HTMLElement | null {
    // Find the command bar, walk up to the direct child of mainContent,
    // then return nextElementSibling - so the pinned bar is inserted
    // between the command bar area and the editor/results below.
    const mainContent = document.querySelector<HTMLElement>(SELECTORS.DEFENDER.MAIN_CONTENT);
    if (!mainContent) return null;
    const commandBar = mainContent.querySelector<HTMLElement>(SELECTORS.DEFENDER.COMMAND_BAR);
    if (!commandBar) return mainContent.firstElementChild as HTMLElement | null;
    // Walk up from commandBar until we reach a direct child of mainContent
    let ancestor: HTMLElement | null = commandBar;
    while (ancestor && ancestor.parentElement !== mainContent) {
      ancestor = ancestor.parentElement;
    }
    // Return the next sibling - the pinned bar will be inserted before it
    return ancestor?.nextElementSibling as HTMLElement | null;
  },

  getMonacoEditor(): MonacoEditorInstance | null {
    return getMonacoEditorInstance();
  },

  isHuntingPage(): boolean {
    return document.querySelector(SELECTORS.DEFENDER.RUN_BUTTON) !== null;
  },
};
