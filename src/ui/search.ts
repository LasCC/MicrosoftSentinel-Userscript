import { CSS_PREFIX, SEARCH_DEBOUNCE_MS } from '../config.ts';

export interface SearchComponent {
  readonly element: HTMLDivElement;
  getQuery(): string;
  focus(): void;
  reset(): void;
}

export function createSearch(onSearch: (query: string) => void): SearchComponent {
  const wrap = document.createElement('div');
  wrap.className = `${CSS_PREFIX}-search-wrap`;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = `${CSS_PREFIX}-search-input`;
  input.placeholder = 'Search queries...';
  input.spellcheck = false;
  input.autocomplete = 'off';

  wrap.appendChild(input);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  input.addEventListener('input', () => {
    if (debounceTimer !== null) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      onSearch(input.value);
    }, SEARCH_DEBOUNCE_MS);
  });

  // Immediate search on Enter
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (debounceTimer !== null) clearTimeout(debounceTimer);
      onSearch(input.value);
    }
  });

  return {
    element: wrap,
    getQuery: () => input.value,
    focus: () => input.focus(),
    reset: () => {
      input.value = '';
      onSearch('');
    },
  };
}
