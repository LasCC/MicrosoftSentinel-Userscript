import type { HuntingRule, RuleSourceId } from '../types.ts';
import type { RepoConfig } from '../config.ts';
import {
  REPOS,
  PUBLIC_FETCH_CONCURRENCY,
  PUBLIC_FETCH_TIMEOUT,
  STORAGE_KEYS,
} from '../config.ts';
import { getCached, setCache } from './storage.ts';

// ── Types ──

interface GitHubTreeEntry {
  readonly path: string;
  readonly type: 'blob' | 'tree';
  readonly sha: string;
}

interface GitHubTreeResponse {
  readonly sha: string;
  readonly tree: readonly GitHubTreeEntry[];
  readonly truncated: boolean;
}

interface TreeCache {
  readonly sha: string;
  readonly rules: readonly HuntingRule[];
}

type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

export interface RepoLoadProgress {
  readonly completed: number;
  readonly total: number | null;
  readonly percent: number | null;
}

// ── Per-repo State ──

const repoRules: Map<RuleSourceId, HuntingRule[]> = new Map();
const repoLoadState: Map<RuleSourceId, LoadState> = new Map();
const repoLoadPromise: Map<RuleSourceId, Promise<void>> = new Map();
const repoLoadProgress: Map<RuleSourceId, RepoLoadProgress> = new Map();

// ── Public API ──

export function getRepoRules(repoId: RuleSourceId): readonly HuntingRule[] {
  return repoRules.get(repoId) ?? [];
}

export function getRepoLoadState(repoId: RuleSourceId): LoadState {
  return repoLoadState.get(repoId) ?? 'idle';
}

export function getRepoLoadProgress(repoId: RuleSourceId): RepoLoadProgress | null {
  return repoLoadProgress.get(repoId) ?? null;
}

/**
 * Fetch rules for a single repo by its source ID.
 * Lazy - called on first tab click for that repo.
 */
export function fetchRepoRules(repoId: RuleSourceId): Promise<void> {
  if (repoLoadState.get(repoId) === 'loaded') return Promise.resolve();

  const existing = repoLoadPromise.get(repoId);
  if (existing) return existing;

  const config = REPOS.find((r) => r.id === repoId);
  if (!config) return Promise.resolve();

  repoLoadState.set(repoId, 'loading');
  setRepoLoadProgress(repoId, 0, null);
  const promise = fetchRepo(config)
    .then((rules) => {
      repoRules.set(repoId, rules);
      repoLoadState.set(repoId, 'loaded');
      const finalTotal = repoLoadProgress.get(repoId)?.total ?? rules.length;
      setRepoLoadProgress(repoId, finalTotal, finalTotal);
      const cacheKey = `${STORAGE_KEYS.REPO_RULES_CACHE}_${repoId}`;
      setCache(cacheKey, rules);
    })
    .catch(() => {
      repoLoadState.set(repoId, 'error');
    })
    .finally(() => {
      repoLoadPromise.delete(repoId);
    });

  repoLoadPromise.set(repoId, promise);
  return promise;
}

/**
 * Try to restore rules for a single repo from cache.
 * Returns true if cache was valid.
 */
export function restoreRepoFromCache(repoId: RuleSourceId): boolean {
  const cacheKey = `${STORAGE_KEYS.REPO_RULES_CACHE}_${repoId}`;
  const cached = getCached<HuntingRule[]>(cacheKey);
  if (cached && cached.length > 0) {
    repoRules.set(repoId, cached);
    repoLoadState.set(repoId, 'loaded');
    return true;
  }
  return false;
}

// ── Internals ──

async function fetchRepo(config: RepoConfig): Promise<HuntingRule[]> {
  const treeCacheKey = `${STORAGE_KEYS.REPO_TREE_CACHE}_${config.id}`;
  const treeCache = getCached<TreeCache>(treeCacheKey);

  const treeResponse = await fetchGitHubTree(config);
  if (treeCache && treeCache.sha === treeResponse.sha) {
    return [...treeCache.rules];
  }

  const matchingEntries = treeResponse.tree.filter(
    (entry) =>
      entry.type === 'blob' &&
      entry.path.endsWith(config.extension) &&
      !entry.path.startsWith('.') &&
      (config.basePath === '' || entry.path.startsWith(config.basePath)),
  );

  setRepoLoadProgress(config.id, 0, matchingEntries.length);

  const rules = await fetchFilesInBatches(matchingEntries, config, (completed, total) => {
    setRepoLoadProgress(config.id, completed, total);
  });

  setCache(treeCacheKey, { sha: treeResponse.sha, rules } satisfies TreeCache);

  return rules;
}

function fetchGitHubTree(config: RepoConfig): Promise<GitHubTreeResponse> {
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/git/trees/${config.branch}?recursive=1`;
  return gmFetch<GitHubTreeResponse>(url);
}

async function fetchFilesInBatches(
  entries: readonly GitHubTreeEntry[],
  config: RepoConfig,
  onProgress: (completed: number, total: number) => void,
): Promise<HuntingRule[]> {
  const rules: HuntingRule[] = [];
  const batches = chunk(entries, PUBLIC_FETCH_CONCURRENCY);
  let completed = 0;

  if (entries.length === 0) {
    onProgress(0, 0);
    return rules;
  }

  for (const batch of batches) {
    const results = await Promise.allSettled(
      batch.map((entry) => fetchAndParseFile(entry, config)),
    );
    completed += batch.length;
    onProgress(completed, entries.length);
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        if (Array.isArray(result.value)) {
          rules.push(...result.value);
        } else {
          rules.push(result.value);
        }
      }
    }
  }

  return rules;
}

async function fetchAndParseFile(
  entry: GitHubTreeEntry,
  config: RepoConfig,
): Promise<HuntingRule | HuntingRule[] | null> {
  const rawUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${entry.path}`;
  const content = await gmFetchText(rawUrl);
  if (!content.trim()) return null;

  switch (config.parser) {
    case 'kql-file':
      return parseKqlFile(content, entry.path);
    case 'markdown-sentinel':
      return parseMarkdownSentinel(content, entry.path);
    case 'markdown-falconfriday':
      return parseMarkdownFalconFriday(content, entry.path);
    default:
      return null;
  }
}

// ── Parsers ──

/**
 * Parse a .kql file from reprise99/Sentinel-Queries.
 * The file IS the query. Name from filename, category from parent folder.
 */
function parseKqlFile(content: string, filePath: string): HuntingRule | null {
  const query = content.trim();
  if (!query) return null;

  const parts = filePath.split('/');
  const fileName = parts[parts.length - 1]?.replace(/\.kql$/i, '') ?? 'Untitled';
  const category = parts.length > 1 ? parts[parts.length - 2] ?? 'General' : 'General';

  const lines = query.split('\n');
  const commentLines: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('//')) {
      commentLines.push(trimmed.replace(/^\/\/\s*/, ''));
    } else if (trimmed.length > 0) {
      break;
    }
  }

  const description = commentLines.join(' ').trim() || `KQL query from ${category}`;
  const name = humanizeName(fileName);

  return { name, query, description, category: humanizeName(category) };
}

/**
 * Parse a .md file from Bert-JanP/Hunting-Queries-Detection-Rules.
 * Structure: # Title, #### Description, ## Sentinel with fenced KQL block.
 */
function parseMarkdownSentinel(content: string, filePath: string): HuntingRule[] | null {
  const rules: HuntingRule[] = [];

  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch?.[1]?.trim() ?? '';
  if (!title) return null;

  const descMatch = content.match(/^####?\s+(.+)$/m);
  const description = descMatch?.[1]?.trim() ?? '';

  const parts = filePath.split('/');
  const category = parts.length > 1 ? parts[parts.length - 2] ?? 'General' : 'General';

  const sentinelSectionMatch = content.match(/##\s+Sentinel\b([\s\S]*?)(?=\n##\s+[^#]|$)/i);
  const defenderSectionMatch = content.match(/##\s+Defender\s+For\s+Endpoint\b([\s\S]*?)(?=\n##\s+[^#]|$)/i);

  const sections: { label: string; content: string }[] = [];

  if (sentinelSectionMatch) {
    sections.push({ label: 'Sentinel', content: sentinelSectionMatch[1] });
  }
  if (defenderSectionMatch) {
    sections.push({ label: 'Defender', content: defenderSectionMatch[1] });
  }

  if (sections.length === 0) {
    sections.push({ label: '', content });
  }

  for (const section of sections) {
    const kqlBlocks = extractFencedCodeBlocks(section.content);
    for (const kql of kqlBlocks) {
      if (!kql.trim()) continue;
      const ruleName = section.label && sections.length > 1
        ? `${title} (${section.label})`
        : title;
      rules.push({
        name: ruleName,
        query: kql.trim(),
        description: description || `From ${humanizeName(category)}`,
        category: humanizeName(category),
      });
    }
  }

  return rules.length > 0 ? rules : null;
}

/**
 * Parse a .md file from FalconForceTeam/FalconFriday.
 * Structure: # Title, ## Detection description, ## Detection section with
 * fenced code blocks using ```C# language tag containing KQL queries.
 * Category is extracted from the filename suffix (e.g. -Win, -Azure, -AWS).
 */
function parseMarkdownFalconFriday(content: string, filePath: string): HuntingRule | null {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch?.[1]?.trim() ?? '';
  if (!title) return null;

  const descMatch = content.match(/##\s+Detection\s+description\s*\n([\s\S]*?)(?=\n##\s)/i);
  const description = descMatch?.[1]?.trim() ?? '';

  // Extract category from filename suffix pattern like -Win, -Azure, -AWS
  const fileName = filePath.split('/').pop() ?? '';
  const categoryMatch = fileName.match(/-([A-Za-z]+)\.md$/);
  const category = categoryMatch?.[1]
    ? humanizeName(categoryMatch[1])
    : 'General';

  // FalconFriday uses ```C# for KQL blocks
  const codeBlocks = extractAllFencedCodeBlocks(content);
  if (codeBlocks.length === 0) return null;

  const query = codeBlocks[0].trim();
  if (!query) return null;

  return {
    name: title,
    query,
    description: description || `FalconFriday detection rule`,
    category,
  };
}

/**
 * Extract all fenced code blocks regardless of language tag.
 * Used by the FalconFriday parser since it uses ```C# for KQL.
 */
function extractAllFencedCodeBlocks(text: string): string[] {
  const blocks: string[] = [];
  const regex = /```[^\n]*\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) blocks.push(match[1]);
  }
  return blocks;
}

function extractFencedCodeBlocks(text: string): string[] {
  const blocks: string[] = [];
  const regex = /```(?:kql|kusto|KQL|Kusto)?\s*\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) blocks.push(match[1]);
  }
  return blocks;
}

// ── Helpers ──

function humanizeName(name: string): string {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function chunk<T>(arr: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size) as T[]);
  }
  return result;
}

function gmFetch<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url,
      headers: { Accept: 'application/json' },
      onload(response) {
        if (response.status >= 200 && response.status < 300) {
          try {
            resolve(JSON.parse(response.responseText) as T);
          } catch {
            reject(new Error(`Failed to parse JSON from ${url}`));
          }
        } else {
          reject(new Error(`HTTP ${response.status} from ${url}`));
        }
      },
      onerror() { reject(new Error(`Network error: ${url}`)); },
      ontimeout() { reject(new Error(`Timeout: ${url}`)); },
      timeout: PUBLIC_FETCH_TIMEOUT,
    });
  });
}

function gmFetchText(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url,
      onload(response) {
        if (response.status >= 200 && response.status < 300) {
          resolve(response.responseText);
        } else {
          reject(new Error(`HTTP ${response.status} from ${url}`));
        }
      },
      onerror() { reject(new Error(`Network error: ${url}`)); },
      ontimeout() { reject(new Error(`Timeout: ${url}`)); },
      timeout: PUBLIC_FETCH_TIMEOUT,
    });
  });
}

function setRepoLoadProgress(repoId: RuleSourceId, completed: number, total: number | null): void {
  const percent = total && total > 0
    ? Math.min(100, Math.round((completed / total) * 100))
    : total === 0
      ? 100
      : null;

  const progress: RepoLoadProgress = { completed, total, percent };
  repoLoadProgress.set(repoId, progress);

  if (typeof document !== 'undefined') {
    document.dispatchEvent(new CustomEvent('shq:repo-progress', {
      detail: { repoId, progress },
    }));
  }
}
