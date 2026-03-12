import { CSS_PREFIX } from '../config.ts';

export const pinnedBarStyles = `
  /* ── Pinned Query Tags - single horizontal scrollable row ── */

  .${CSS_PREFIX}-pinned-container {
    display: flex !important;
    flex-wrap: nowrap !important;
    gap: 6px !important;
    padding: 6px 12px !important;
    align-items: center !important;
    font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
    border-bottom: 1px solid var(--colorDividerPrimary, #f3f2f1) !important;
    background: transparent !important;
  }

  /* Hide scrollbar (Webkit) - scroll via mousewheel / trackpad */
  .${CSS_PREFIX}-pinned-container::-webkit-scrollbar {
    display: none !important;
  }

  /* Hide when empty */
  .${CSS_PREFIX}-pinned-container:empty {
    display: none !important;
  }

  /* ── Pinned label ── */

  .${CSS_PREFIX}-pinned-label {
    font-size: 11px !important;
    font-weight: 600 !important;
    color: var(--colorTextSecondary, #646464) !important;
    white-space: nowrap !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    flex-shrink: 0 !important;
    padding-right: 4px !important;
  }

  /* ── Individual Tag ── */

  .${CSS_PREFIX}-pill {
    display: inline-flex !important;
    align-items: center !important;
    gap: 4px !important;
    padding: 0 8px !important;
    height: 26px !important;
    background: var(--colorContainerBackgroundSecondary, #f3f2f1) !important;
    border: 1px solid var(--colorContainerBorderPrimary, #e1dfdd) !important;
    border-radius: 2px !important;
    font-size: 12px !important;
    color: var(--colorTextPrimary, #292827) !important;
    cursor: pointer !important;
    white-space: nowrap !important;
    transition: background 0.1s, border-color 0.1s !important;
    flex-shrink: 0 !important;
    user-select: none !important;
    box-sizing: border-box !important;
  }

  .${CSS_PREFIX}-pill:hover {
    background: var(--colorControlBackgroundHover, #f3f2f1) !important;
    border-color: var(--colorControlBorderSecondary, #d6d6d6) !important;
  }

  .${CSS_PREFIX}-pill:active {
    background: var(--colorControlBackgroundSelected, #edebe9) !important;
  }

  .${CSS_PREFIX}-pill-pin {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 13px !important;
    height: 13px !important;
    line-height: 1 !important;
    flex-shrink: 0 !important;
    color: var(--colorTextBrand, #0078d4) !important;
  }

  .${CSS_PREFIX}-pill-pin svg {
    width: 13px !important;
    height: 13px !important;
    display: block !important;
    fill: none !important;
  }

  .${CSS_PREFIX}-pill-name {
    font-weight: 400 !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
    max-width: 200px !important;
  }

  .${CSS_PREFIX}-pill-dismiss {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 16px !important;
    height: 16px !important;
    background: none !important;
    border: none !important;
    border-radius: 2px !important;
    color: var(--colorTextDisabled, #a19f9d) !important;
    font-size: 10px !important;
    cursor: pointer !important;
    padding: 0 !important;
    line-height: 1 !important;
    flex-shrink: 0 !important;
    transition: color 0.1s, background 0.1s !important;
  }

  .${CSS_PREFIX}-pill-dismiss:hover {
    color: var(--colorTextPrimary, #292827) !important;
    background: var(--colorControlBackgroundSelected, #edebe9) !important;
  }
`;
