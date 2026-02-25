// ── Hunting Rule Schema ──

export interface HuntingRule {
  readonly name: string;
  readonly query: string;
  readonly description: string;
  readonly category: string;
}

// ── Rule Sources ──

export type RuleSourceId = 'user' | 'reprise99' | 'bertjanp' | 'falconfriday';

export interface RuleSource {
  readonly id: RuleSourceId;
  readonly label: string;
  readonly url?: string;
  readonly rules: readonly HuntingRule[];
}

// ── Pinned Queries ──

export interface PinnedQuery {
  readonly name: string;
  readonly sourceId: RuleSourceId;
}

// ── Platform Detection ──

export type PlatformId = 'sentinel' | 'defender';

export interface PlatformAdapter {
  readonly id: PlatformId;
  readonly label: string;
  /** Target element where the inline hunting button should be appended */
  getButtonInjectionTarget(): HTMLElement | null;
  /** Target element where the pinned query bar should be inserted (before) */
  getPinnedBarTarget(): HTMLElement | null;
  /** Attempt to get the Monaco editor instance on the page */
  getMonacoEditor(): MonacoEditorInstance | null;
  /** Check if the current page is the Advanced Hunting page */
  isHuntingPage(): boolean;
}

// ── Monaco Editor ──

/** Minimal subset of the Monaco editor API we actually use */
export interface MonacoEditorInstance {
  getValue(): string;
  setValue(value: string): void;
  getModel(): MonacoEditorModel | null;
  getPosition(): MonacoPosition | null;
  setPosition(position: MonacoPosition): void;
  revealPositionInCenter(position: MonacoPosition): void;
  focus(): void;
}

export interface MonacoEditorModel {
  getLineCount(): number;
  getLineContent(lineNumber: number): string;
  getFullModelRange(): MonacoRange;
  getValue(): string;
  pushEditOperations(
    beforeCursorState: unknown[] | null,
    editOperations: { range: MonacoRange; text: string }[],
    cursorStateComputer: () => unknown[] | null,
  ): unknown[] | null;
}

export interface MonacoPosition {
  readonly lineNumber: number;
  readonly column: number;
}

export interface MonacoRange {
  readonly startLineNumber: number;
  readonly startColumn: number;
  readonly endLineNumber: number;
  readonly endColumn: number;
}

// ── Storage ──

export interface CachedData<T> {
  readonly data: T;
  readonly timestamp: number;
}

// ── Tab System ──

export type TabId = 'user' | 'reprise99' | 'bertjanp' | 'falconfriday' | 'pinned';

export interface TabDefinition {
  readonly id: TabId;
  readonly label: string;
  readonly sourceId?: RuleSourceId;
}

// ── GM API Declarations ──

declare global {
  /** Tampermonkey's unsandboxed reference to the page's real window object */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unsafeWindow: any;

  function GM_setValue(key: string, value: unknown): void;
  function GM_getValue<T = unknown>(key: string, defaultValue?: T): T;
  function GM_deleteValue(key: string): void;
  function GM_xmlhttpRequest(details: GMXmlHttpRequestDetails): void;

  interface GMXmlHttpRequestDetails {
    method: 'GET' | 'POST';
    url: string;
    headers?: Record<string, string>;
    onload?: (response: GMXmlHttpResponse) => void;
    onerror?: (response: GMXmlHttpResponse) => void;
    ontimeout?: () => void;
    timeout?: number;
  }

  interface GMXmlHttpResponse {
    responseText: string;
    status: number;
    statusText: string;
  }
}
