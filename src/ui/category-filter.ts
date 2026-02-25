import { CSS_PREFIX } from '../config.ts';

export interface CategoryFilterComponent {
  readonly element: HTMLDivElement;
  /** Update the list of available categories. Resets selection. */
  setCategories(categories: readonly string[]): void;
  /** Get the currently selected category, or null if "All" is selected. */
  getSelected(): string | null;
  /** Reset selection to "All" without triggering onChange. */
  reset(): void;
}

export function createCategoryFilter(
  onChange: (category: string | null) => void,
): CategoryFilterComponent {
  const wrap = document.createElement('div');
  wrap.className = `${CSS_PREFIX}-category-filter`;

  let selectedCategory: string | null = null;
  let currentCategories: readonly string[] = [];

  function setCategories(categories: readonly string[]): void {
    // Avoid re-rendering if categories haven't changed
    if (
      categories.length === currentCategories.length &&
      categories.every((c, i) => c === currentCategories[i])
    ) {
      return;
    }
    currentCategories = categories;
    // Preserve selection if the selected category still exists in the new list
    if (selectedCategory && !categories.includes(selectedCategory)) {
      selectedCategory = null;
    }
    renderChips();
  }

  function renderChips(): void {
    wrap.innerHTML = '';

    // Hide entirely when there are 0 or 1 categories (no filtering useful)
    if (currentCategories.length <= 1) {
      wrap.style.display = 'none';
      return;
    }
    wrap.style.display = '';

    // "All" chip
    const allChip = createChip('All', selectedCategory === null);
    allChip.addEventListener('click', () => {
      if (selectedCategory === null) return;
      selectedCategory = null;
      updateActiveState();
      onChange(null);
    });
    wrap.appendChild(allChip);

    // Category chips
    for (const cat of currentCategories) {
      const chip = createChip(cat, selectedCategory === cat);
      chip.addEventListener('click', () => {
        if (selectedCategory === cat) {
          // Toggle off -> back to "All"
          selectedCategory = null;
        } else {
          selectedCategory = cat;
        }
        updateActiveState();
        onChange(selectedCategory);
      });
      wrap.appendChild(chip);
    }
  }

  function createChip(label: string, active: boolean): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `${CSS_PREFIX}-category-chip`;
    if (active) btn.classList.add(`${CSS_PREFIX}-category-chip--active`);
    btn.textContent = label;
    return btn;
  }

  function updateActiveState(): void {
    const chips = wrap.querySelectorAll<HTMLButtonElement>(`.${CSS_PREFIX}-category-chip`);
    let idx = 0;
    for (const chip of chips) {
      if (idx === 0) {
        // "All" chip
        chip.classList.toggle(`${CSS_PREFIX}-category-chip--active`, selectedCategory === null);
      } else {
        const cat = currentCategories[idx - 1];
        chip.classList.toggle(`${CSS_PREFIX}-category-chip--active`, selectedCategory === cat);
      }
      idx++;
    }
  }

  function reset(): void {
    selectedCategory = null;
    updateActiveState();
  }

  function getSelected(): string | null {
    return selectedCategory;
  }

  return { element: wrap, setCategories, getSelected, reset };
}
