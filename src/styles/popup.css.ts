import { CSS_PREFIX } from '../config.ts';

export const popupStyles = `
  .${CSS_PREFIX}-popup-overlay {
    position: fixed;
    inset: 0;
    z-index: 999999;
    background: transparent;
  }

  .${CSS_PREFIX}-popup button {
    min-width: 0 !important;
    min-height: 0 !important;
  }

  .${CSS_PREFIX}-popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 420px;
    max-height: 480px;
    background: var(--colorContainerBackgroudFloating, #fff);
    border: 1px solid var(--colorContainerBorderPrimary, #e1dfdd);
    border-radius: 4px;
    box-shadow: var(--shadowLevel3, 0 6.4px 14.4px 0 rgba(0,0,0,.132), 0 1.2px 3.6px 0 rgba(0,0,0,.108));
    z-index: 1000000;
    display: flex;
    flex-direction: column;
    font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif;
    color: var(--colorTextPrimary, #292827);
    animation: ${CSS_PREFIX}-popup-in 0.15s ease-out;
    overflow: hidden;
  }

  @keyframes ${CSS_PREFIX}-popup-in {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .${CSS_PREFIX}-popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-bottom: 1px solid var(--colorDividerPrimary, #f3f2f1);
    flex-shrink: 0;
    background: var(--colorContainerBackgroundSecondary, #f3f2f1);
  }

  .${CSS_PREFIX}-popup-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--colorTextPrimary, #292827);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .${CSS_PREFIX}-popup-count {
    background: var(--colorButtonBackgroundPrimary, #0078d4);
    color: var(--colorButtonForegroundPrimary, #fff);
    font-size: 10px;
    font-weight: 600;
    padding: 1px 6px;
    border-radius: 10px;
  }

  .${CSS_PREFIX}-popup-close {
    background: none;
    border: none;
    color: var(--colorIconSecondary, #605e5c);
    font-size: 14px;
    cursor: pointer;
    padding: 2px 5px;
    line-height: 1;
    border-radius: 2px;
    transition: color 0.12s, background 0.12s;
  }

  .${CSS_PREFIX}-popup-close:hover {
    color: var(--colorTextPrimary, #292827);
    background: var(--colorControlBackgroundHover, #f3f2f1);
  }

  .${CSS_PREFIX}-search-wrap {
    padding: 8px 14px;
    border-bottom: 1px solid var(--colorDividerPrimary, #f3f2f1);
    flex-shrink: 0;
  }

  .${CSS_PREFIX}-search-input {
    width: 100%;
    padding: 5px 8px;
    background: var(--colorControlBackground, #fff);
    border: 1px solid var(--colorControlBorder, #8a8886);
    border-radius: 2px;
    color: var(--colorTextPrimary, #292827);
    font-size: 12px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.12s;
    box-sizing: border-box;
  }

  .${CSS_PREFIX}-search-input::placeholder {
    color: var(--colorTextDisabled, #a19f9d);
  }

  .${CSS_PREFIX}-search-input:focus {
    border-color: var(--colorControlBorderFocus, #0078d4);
  }

  .${CSS_PREFIX}-tabs {
    display: flex;
    border-bottom: 1px solid var(--colorDividerPrimary, #f3f2f1);
    padding: 0 14px;
    gap: 0;
    flex-shrink: 0;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
  }

  .${CSS_PREFIX}-tabs::-webkit-scrollbar {
    display: none;
  }

  .${CSS_PREFIX}-tab {
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 500;
    color: var(--colorTextSecondary, #646464);
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: color 0.12s, border-color 0.12s;
    font-family: inherit;
    white-space: nowrap;
  }

  .${CSS_PREFIX}-tab:hover {
    color: var(--colorTextPrimary, #292827);
  }

  .${CSS_PREFIX}-tab--active {
    color: var(--colorTextBrand, #0078d4);
    border-bottom-color: var(--colorTextBrand, #0078d4);
  }

  .${CSS_PREFIX}-category-filter {
    display: flex;
    gap: 3px;
    padding: 3px 14px 4px;
    border-bottom: 1px solid var(--colorDividerPrimary, #f3f2f1);
    flex-shrink: 0;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    align-items: center;
  }

  .${CSS_PREFIX}-category-filter::-webkit-scrollbar {
    display: none;
  }

  .${CSS_PREFIX}-category-chip {
    padding: 1px 7px !important;
    font-size: 10px !important;
    font-weight: 500 !important;
    color: var(--colorTextSecondary, #646464) !important;
    background: transparent !important;
    border: 1px solid var(--colorContainerBorderPrimary, #e1dfdd) !important;
    border-radius: 3px !important;
    cursor: pointer !important;
    transition: color 0.12s, background 0.12s, border-color 0.12s !important;
    font-family: inherit !important;
    white-space: nowrap !important;
    flex-shrink: 0 !important;
    line-height: 1.6 !important;
    min-width: 0 !important;
    min-height: 0 !important;
    height: auto !important;
    letter-spacing: 0.01em !important;
    text-transform: none !important;
  }

  .${CSS_PREFIX}-category-chip:hover {
    color: var(--colorTextPrimary, #292827) !important;
    background: var(--colorControlBackgroundHover, #f3f2f1) !important;
    border-color: var(--colorControlBorderSecondary, #c8c6c4) !important;
  }

  .${CSS_PREFIX}-category-chip--active {
    color: var(--colorTextBrand, #0078d4) !important;
    background: var(--colorContainerBackgroundInfo, #e6f2fb) !important;
    border-color: var(--colorControlBorderInfo, #0078d4) !important;
    font-weight: 600 !important;
  }

  .${CSS_PREFIX}-category-chip--active:hover {
    color: var(--colorLinkContrast, #005a9e) !important;
    background: var(--colorButtonBackgroundTertiary, #d0e6f9) !important;
    border-color: var(--colorLinkContrast, #005a9e) !important;
  }

  .${CSS_PREFIX}-query-list {
    flex: 1;
    overflow-y: auto;
    padding: 2px 0;
    min-height: 0;
  }

  .${CSS_PREFIX}-query-list::-webkit-scrollbar {
    width: 6px;
  }

  .${CSS_PREFIX}-query-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .${CSS_PREFIX}-query-list::-webkit-scrollbar-thumb {
    background: var(--colorControlBackgroundSecondary, #8a8886);
    border-radius: 3px;
  }

  .${CSS_PREFIX}-query-item {
    display: flex;
    align-items: flex-start;
    padding: 7px 14px;
    gap: 8px;
    cursor: pointer;
    transition: background 0.1s;
  }

  .${CSS_PREFIX}-query-item:hover {
    background: var(--colorControlBackgroundHover, #f3f2f1);
  }

  .${CSS_PREFIX}-query-item:active {
    background: var(--colorControlBackgroundPressed, #edebe9);
  }

  .${CSS_PREFIX}-query-item-body {
    flex: 1;
    min-width: 0;
  }

  .${CSS_PREFIX}-query-item-name {
    font-size: 12px;
    font-weight: 600;
    color: var(--colorTextPrimary, #292827);
    margin-bottom: 1px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .${CSS_PREFIX}-query-item-desc {
    font-size: 11px;
    color: var(--colorTextSecondary, #646464);
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .${CSS_PREFIX}-query-item-meta {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 3px;
  }

  .${CSS_PREFIX}-badge {
    font-size: 10px;
    font-weight: 500;
    padding: 1px 5px;
    border-radius: 2px;
    background: var(--colorContainerBackgroundSecondary, #f3f2f1);
    color: var(--colorTextSecondary, #646464);
    border: 1px solid var(--colorContainerBorderPrimary, #e1dfdd);
    white-space: nowrap;
  }

  .${CSS_PREFIX}-badge--source {
    background: var(--colorContainerBackgroundInfo, #dae4ff);
    color: var(--colorTextBrand, #0078d4);
    border-color: var(--colorControlBorderInfo, #015cda);
  }

  .${CSS_PREFIX}-query-item-actions {
    display: flex;
    gap: 2px;
    flex-shrink: 0;
    align-items: center;
    padding-top: 1px;
    opacity: 0;
    transition: opacity 0.12s;
  }

  .${CSS_PREFIX}-query-item:hover .${CSS_PREFIX}-query-item-actions {
    opacity: 1;
  }

  .${CSS_PREFIX}-action-btn {
    background: none;
    border: 1px solid transparent;
    color: var(--colorTextDisabled, #a19f9d);
    cursor: pointer;
    padding: 3px 5px;
    border-radius: 2px;
    font-size: 12px;
    transition: color 0.12s, background 0.12s, border-color 0.12s;
    display: flex;
    align-items: center;
    gap: 3px;
    font-family: inherit;
    white-space: nowrap;
  }

  .${CSS_PREFIX}-action-btn:hover {
    color: var(--colorTextPrimary, #292827);
    background: var(--colorControlBackgroundHover, #f3f2f1);
    border-color: var(--colorControlBorderSecondary, #d6d6d6);
  }

  .${CSS_PREFIX}-action-btn--use {
    color: var(--colorTextBrand, #0078d4);
    font-weight: 600;
  }

  .${CSS_PREFIX}-action-btn--use:hover {
    background: var(--colorButtonBackgroundTertiary, #e6f2fb);
    color: var(--colorLinkContrast, #005a9e);
  }

  .${CSS_PREFIX}-action-btn--pinned {
    color: #ffaa44;
  }

  .${CSS_PREFIX}-empty {
    padding: 24px 14px;
    text-align: center;
    color: var(--colorTextDisabled, #a19f9d);
    font-size: 12px;
  }

  .${CSS_PREFIX}-empty-icon {
    font-size: 24px;
    margin-bottom: 6px;
    opacity: 0.5;
  }

  .${CSS_PREFIX}-loading {
    padding: 24px 14px;
    text-align: center;
    color: var(--colorTextDisabled, #a19f9d);
    font-size: 12px;
  }

  .${CSS_PREFIX}-spinner {
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 2px solid var(--colorDividerPrimary, #f3f2f1);
    border-top-color: var(--colorIconBrand, #0078d4);
    border-radius: 50%;
    animation: ${CSS_PREFIX}-spin 0.6s linear infinite;
    margin-bottom: 6px;
  }

  @keyframes ${CSS_PREFIX}-spin {
    to { transform: rotate(360deg); }
  }
`;
