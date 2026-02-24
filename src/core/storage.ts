import type { CachedData, HuntingRule, PinnedQuery } from '../types.ts';
import { CACHE_TTL_MS, STORAGE_KEYS } from '../config.ts';

// ── Pinned Queries ──

export function getPinnedQueries(): readonly PinnedQuery[] {
  const raw = GM_getValue<string>(STORAGE_KEYS.PINNED_QUERIES, '[]');
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as PinnedQuery[];
  } catch {
    return [];
  }
}

export function setPinnedQueries(queries: readonly PinnedQuery[]): void {
  GM_setValue(STORAGE_KEYS.PINNED_QUERIES, JSON.stringify(queries));
}

export function isPinned(name: string, sourceId: string): boolean {
  return getPinnedQueries().some(
    (p) => p.name === name && p.sourceId === sourceId,
  );
}

export function pinQuery(name: string, sourceId: string): void {
  const current = getPinnedQueries();
  if (current.some((p) => p.name === name && p.sourceId === sourceId)) return;
  setPinnedQueries([
    ...current,
    { name, sourceId: sourceId as PinnedQuery['sourceId'] },
  ]);
}

export function unpinQuery(name: string, sourceId: string): void {
  const current = getPinnedQueries();
  setPinnedQueries(
    current.filter((p) => !(p.name === name && p.sourceId === sourceId)),
  );
}

export function togglePin(name: string, sourceId: string): boolean {
  if (isPinned(name, sourceId)) {
    unpinQuery(name, sourceId);
    return false;
  }
  pinQuery(name, sourceId);
  return true;
}

// ── Cache Layer with TTL ──

export function getCached<T>(key: string): T | null {
  const raw = GM_getValue<string>(key, '');
  if (!raw) return null;

  try {
    const cached: CachedData<T> = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) return null;
    return cached.data;
  } catch {
    return null;
  }
}

export function setCache<T>(key: string, data: T): void {
  const cached: CachedData<T> = { data, timestamp: Date.now() };
  GM_setValue(key, JSON.stringify(cached));
}

// ── User Rules (stored locally) ──

export function getUserRules(): readonly HuntingRule[] {
  const raw = GM_getValue<string>(STORAGE_KEYS.USER_RULES, '[]');
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as HuntingRule[];
  } catch {
    return [];
  }
}

export function setUserRules(rules: readonly HuntingRule[]): void {
  GM_setValue(STORAGE_KEYS.USER_RULES, JSON.stringify(rules));
}
