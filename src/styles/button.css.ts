import { CSS_PREFIX } from '../config.ts';

export const buttonStyles = `
  /* ── Inline command bar button wrapper ── */

  .${CSS_PREFIX}-btn-wrap {
    display: inline-flex !important;
    align-items: center !important;
    margin-left: 4px !important;
    vertical-align: middle !important;
    position: relative !important;
    flex-shrink: 0 !important;
    z-index: 10 !important;
    overflow: visible !important;
    height: auto !important;
    max-height: none !important;
    visibility: visible !important;
    opacity: 1 !important;
  }

  /* ── Neutral CommandBarButton style ── */

  .${CSS_PREFIX}-btn {
    display: inline-flex !important;
    align-items: center !important;
    gap: 6px !important;
    height: 32px !important;
    padding: 0 12px !important;
    border: 1px solid transparent !important;
    border-radius: 2px !important;
    background: transparent !important;
    color: var(--colorButtonToolbardForeground, #323130) !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif !important;
    cursor: pointer !important;
    white-space: nowrap !important;
    transition: background 0.1s, border-color 0.1s !important;
    outline: none !important;
    line-height: 1 !important;
    visibility: visible !important;
    opacity: 1 !important;
    overflow: visible !important;
    min-width: max-content !important;
    box-sizing: border-box !important;
  }

  .${CSS_PREFIX}-btn:hover {
    background: var(--colorControlBackgroundHover, #f3f2f1) !important;
    border-color: var(--colorControlBorderSecondary, #d6d6d6) !important;
    color: var(--colorButtonToolbardForegroundHover, #201f1e) !important;
  }

  .${CSS_PREFIX}-btn:active {
    background: var(--colorControlBackgroundSelected, #edebe9) !important;
    border-color: var(--colorControlBorderSecondary, #d6d6d6) !important;
  }

  .${CSS_PREFIX}-btn--open {
    background: var(--colorControlBackgroundSelected, #edebe9) !important;
    border-color: var(--colorControlBorder, #8a8886) !important;
  }

  .${CSS_PREFIX}-btn-label {
    pointer-events: none;
    color: inherit !important;
    font-size: 13px !important;
  }

  /* Separator line before the button (mimics command bar divider) */
  .${CSS_PREFIX}-btn-wrap::before {
    content: '' !important;
    display: block !important;
    width: 1px !important;
    height: 16px !important;
    background: var(--colorDividerPrimary, #f3f2f1) !important;
    margin-right: 4px !important;
    flex-shrink: 0 !important;
  }
`;
