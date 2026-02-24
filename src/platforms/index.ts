import type { PlatformAdapter, PlatformId } from '../types.ts';
import { sentinelAdapter } from './sentinel.ts';
import { defenderAdapter } from './defender.ts';

/**
 * Detect which platform we're running on based on the current URL.
 *
 * - security.microsoft.com          -> Defender
 * - *.reactblade.portal.azure.net   -> Sentinel (runs inside the iframe, NOT on portal.azure.com)
 *
 * Note: portal.azure.com is excluded because the Advanced Hunting editor
 * (Monaco) lives inside a cross-origin reactblade iframe. The script runs
 * directly inside the iframe where it has access to both the DOM and Monaco.
 */
export function detectPlatform(): PlatformId | null {
  const hostname = window.location.hostname;

  if (hostname === 'security.microsoft.com') {
    return 'defender';
  }

  if (hostname.endsWith('.reactblade.portal.azure.net')) {
    return 'sentinel';
  }

  return null;
}

export function getPlatformAdapter(id: PlatformId): PlatformAdapter {
  switch (id) {
    case 'sentinel':
      return sentinelAdapter;
    case 'defender':
      return defenderAdapter;
    default: {
      const _exhaustive: never = id;
      throw new Error(`Unknown platform: ${_exhaustive}`);
    }
  }
}
