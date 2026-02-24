import { CSS_PREFIX, NOTIFICATION_DURATION_MS } from '../config.ts';

type ToastType = 'success' | 'error' | 'info';

let container: HTMLDivElement | null = null;

function getContainer(): HTMLDivElement {
  if (container && document.body.contains(container)) return container;

  container = document.createElement('div');
  container.className = `${CSS_PREFIX}-toast-container`;
  document.body.appendChild(container);
  return container;
}

export function showToast(message: string, type: ToastType = 'info'): void {
  const wrap = getContainer();
  const toast = document.createElement('div');
  toast.className = `${CSS_PREFIX}-toast ${CSS_PREFIX}-toast--${type}`;
  toast.textContent = message;
  wrap.appendChild(toast);

  setTimeout(() => {
    toast.classList.add(`${CSS_PREFIX}-toast--exit`);
    toast.addEventListener('animationend', () => toast.remove());
  }, NOTIFICATION_DURATION_MS);
}
