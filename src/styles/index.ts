import { CSS_PREFIX } from '../config.ts';
import { buttonStyles } from './button.css.ts';
import { popupStyles } from './popup.css.ts';
import { notificationStyles } from './notification.css.ts';
import { pinnedBarStyles } from './pinned-bar.css.ts';

let injected = false;

/** Inject all userscript styles into the document head */
export function injectStyles(): void {
  if (injected) return;
  injected = true;

  const style = document.createElement('style');
  style.id = `${CSS_PREFIX}-styles`;
  style.textContent = [
    buttonStyles,
    popupStyles,
    notificationStyles,
    pinnedBarStyles,
  ].join('\n');
  document.head.appendChild(style);
}
