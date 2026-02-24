import { CSS_PREFIX } from '../config.ts';

export const notificationStyles = `
  .${CSS_PREFIX}-toast-container {
    position: fixed !important;
    bottom: 16px !important;
    right: 24px !important;
    top: auto !important;
    left: auto !important;
    z-index: 1000002 !important;
    display: flex !important;
    flex-direction: column-reverse !important;
    gap: 8px !important;
    pointer-events: none !important;
  }

  .${CSS_PREFIX}-toast {
    background: var(--colorContainerBackgroudFloating, #fff) !important;
    color: var(--colorTextPrimary, #292827) !important;
    padding: 10px 16px !important;
    border-radius: 4px !important;
    font-size: 13px !important;
    font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif !important;
    box-shadow: var(--shadowLevel3, 0 6.4px 14.4px 0 rgba(0,0,0,.132), 0 1.2px 3.6px 0 rgba(0,0,0,.108)) !important;
    border: 1px solid var(--colorContainerBorderPrimary, #e1dfdd) !important;
    pointer-events: auto !important;
    animation: ${CSS_PREFIX}-toast-in 0.25s ease-out !important;
    max-width: 360px !important;
    line-height: 1.4 !important;
  }

  .${CSS_PREFIX}-toast--success {
    border-left: 3px solid var(--colorIconSuccess, #57a300) !important;
  }

  .${CSS_PREFIX}-toast--error {
    border-left: 3px solid var(--colorIconError, #a4262c) !important;
  }

  .${CSS_PREFIX}-toast--info {
    border-left: 3px solid var(--colorIconBrand, #0078d4) !important;
  }

  .${CSS_PREFIX}-toast--exit {
    animation: ${CSS_PREFIX}-toast-out 0.2s ease-in forwards !important;
  }

  @keyframes ${CSS_PREFIX}-toast-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes ${CSS_PREFIX}-toast-out {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(8px);
    }
  }
`;
