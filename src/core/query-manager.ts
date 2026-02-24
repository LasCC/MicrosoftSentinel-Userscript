import type { HuntingRule, RuleSource, RuleSourceId } from '../types.ts';
import { REPOS, STORAGE_KEYS } from '../config.ts';
import { getPinnedQueries, getUserRules } from './storage.ts';
import {
  fetchRepoRules,
  getRepoLoadState,
  getRepoRules,
  restoreRepoFromCache,
} from './public-repos.ts';
import userRulesJson from '../../rules/user-rules.json';

// ── Internal State ──

const sources: Map<RuleSourceId, RuleSource> = new Map();

// ── Initialization ──

export function loadAllRules(): void {
  loadUserRules();
  // Try to restore each repo from cache synchronously.
  // Actual fetching is lazy - triggered on first tab click.
  for (const repo of REPOS) {
    const restored = restoreRepoFromCache(repo.id);
    if (restored) {
      syncRepoSource(repo.id, repo.label);
    } else {
      sources.set(repo.id, { id: repo.id, label: repo.label, rules: [] });
    }
  }
}

// ── User Rules ──

function loadUserRules(): void {
  const storedUserRules = getUserRules();
  const bundledRules = userRulesJson as unknown as readonly HuntingRule[];
  const rules =
    storedUserRules.length > 0 ? storedUserRules : bundledRules;

  sources.set('user', {
    id: 'user',
    label: 'User Rules',
    rules: [...rules],
  });
}

// ── Repo Rules (lazy-loaded from GitHub) ──

/**
 * Lazy-load rules for a specific repo tab.
 * Called when the user first clicks the repo's tab.
 */
export async function ensureRepoLoaded(repoId: RuleSourceId): Promise<void> {
  const state = getRepoLoadState(repoId);
  if (state === 'loaded') {
    const repo = REPOS.find((r) => r.id === repoId);
    if (repo) syncRepoSource(repoId, repo.label);
    return;
  }
  await fetchRepoRules(repoId);
  const repo = REPOS.find((r) => r.id === repoId);
  if (repo) syncRepoSource(repoId, repo.label);
}

/** Sync fetched repo rules into the sources map. */
function syncRepoSource(repoId: RuleSourceId, label: string): void {
  sources.set(repoId, {
    id: repoId,
    label,
    rules: [...getRepoRules(repoId)],
  });
}

// ── Accessors ──

export function getRuleSource(id: RuleSourceId): RuleSource | undefined {
  return sources.get(id);
}

export function getRulesForSource(id: RuleSourceId): readonly HuntingRule[] {
  return sources.get(id)?.rules ?? [];
}

export function getAllRules(): readonly HuntingRule[] {
  const all: HuntingRule[] = [];
  for (const source of sources.values()) {
    all.push(...source.rules);
  }
  return all;
}

export function getPinnedRules(): readonly (HuntingRule & { sourceId: RuleSourceId })[] {
  const pinned = getPinnedQueries();
  const result: (HuntingRule & { sourceId: RuleSourceId })[] = [];

  for (const pin of pinned) {
    const source = sources.get(pin.sourceId);
    if (!source) continue;
    const rule = source.rules.find((r) => r.name === pin.name);
    if (rule) {
      result.push({ ...rule, sourceId: pin.sourceId });
    }
  }

  return result;
}

export function searchRules(
  rules: readonly HuntingRule[],
  query: string,
): readonly HuntingRule[] {
  if (!query.trim()) return rules;
  const lower = query.toLowerCase();
  return rules.filter(
    (r) =>
      r.name.toLowerCase().includes(lower) ||
      r.description.toLowerCase().includes(lower) ||
      r.category.toLowerCase().includes(lower) ||
      r.query.toLowerCase().includes(lower),
  );
}

export function getTotalRuleCount(): number {
  let count = 0;
  for (const source of sources.values()) {
    count += source.rules.length;
  }
  return count;
}
