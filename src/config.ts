import type { TabDefinition } from './types.ts';

// ── Prefix for all CSS classes to avoid collisions with host page ──
export const CSS_PREFIX = 'shq' as const;

// ── Storage Keys ──
export const STORAGE_KEYS = {
  PINNED_QUERIES: 'shq_pinned_queries',
  REPO_RULES_CACHE: 'shq_repo_rules_cache',
  REPO_TREE_CACHE: 'shq_repo_tree_cache',
  USER_RULES: 'shq_user_rules',
} as const;

// ── Cache TTL (1 hour in ms) ──
export const CACHE_TTL_MS = 60 * 60 * 1000;

// ── GitHub Repo Configs ──

export interface RepoConfig {
  readonly id: 'reprise99' | 'bertjanp';
  readonly owner: string;
  readonly repo: string;
  readonly branch: string;
  /** Subfolder path to scope the tree walk (empty = root) */
  readonly basePath: string;
  /** File extension to match */
  readonly extension: '.kql' | '.md';
  /** Parser identifier */
  readonly parser: 'kql-file' | 'markdown-sentinel';
  /** Human-readable label shown in the tab */
  readonly label: string;
}

export const REPOS: readonly RepoConfig[] = [
  {
    id: 'reprise99',
    owner: 'reprise99',
    repo: 'Sentinel-Queries',
    branch: 'main',
    basePath: '',
    extension: '.kql',
    parser: 'kql-file',
    label: 'Reprise99',
  },
  {
    id: 'bertjanp',
    owner: 'Bert-JanP',
    repo: 'Hunting-Queries-Detection-Rules',
    branch: 'main',
    basePath: '',
    extension: '.md',
    parser: 'markdown-sentinel',
    label: 'Bert-JanP',
  },
] as const;

/** Max concurrent file fetches to avoid flooding */
export const PUBLIC_FETCH_CONCURRENCY = 10;

/** Timeout for individual file fetches (ms) */
export const PUBLIC_FETCH_TIMEOUT = 15000;

// ── Tab Definitions ──
export const TABS: readonly TabDefinition[] = [
  { id: 'user', label: 'User Rules', sourceId: 'user' },
  { id: 'reprise99', label: 'Reprise99', sourceId: 'reprise99' },
  { id: 'bertjanp', label: 'Bert-JanP', sourceId: 'bertjanp' },
  { id: 'pinned', label: 'Pinned' },
] as const;

// ── Platform-specific Selectors ──
export const SELECTORS = {
  /** MS Defender (security.microsoft.com) */
  DEFENDER: {
    /** The command bar above the hunting editor */
    COMMAND_BAR: '.scc-commandBar',
    /** The main content area */
    MAIN_CONTENT: '.scc-sidePanelPage-mainContent',
    /** Run query button */
    RUN_BUTTON: '#huntingRunQueryButtonId',
  },
  /** MS Sentinel (portal.azure.com via reactblade iframe) */
  SENTINEL: {
    /** The discover wrapper */
    DISCOVER_WRAPPER: '#DiscoverWrapper',
    /** The filter panel / command bar area */
    FILTER_PANEL: '.filter-panel',
    /** The left-side KQL mode panel (contains Run, time picker, etc.) */
    KQL_PANEL: '.left-side.kql-mode-panel',
    /** Run button */
    RUN_BUTTON: '.run-split-button .btn-submit',
    /** Results view element (pinned pills inserted before this) */
    RESULTS_VIEW: 'la-results-view',
  },
} as const;

// ── Debounce delay for search input ──
export const SEARCH_DEBOUNCE_MS = 250;

// ── Notification duration ──
export const NOTIFICATION_DURATION_MS = 3000;
