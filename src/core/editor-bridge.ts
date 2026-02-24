/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Get the real page window - Tampermonkey sandboxes `window`, so we need
 * `unsafeWindow` to access the page's own globals like `window.monaco`.
 */
function getPageWindow(): any {
  if (typeof unsafeWindow !== 'undefined') return unsafeWindow;
  return window;
}

/**
 * Get the Monaco editor instance.
 * Uses: unsafeWindow.monaco.editor.getEditors()[0]
 */
export function getMonacoEditorInstance(): any | null {
  const w = getPageWindow();

  if (!w.monaco?.editor) return null;

  const getEditors = w.monaco.editor.getEditors;
  if (typeof getEditors !== 'function') return null;

  const editors = getEditors.call(w.monaco.editor);
  if (!editors || editors.length === 0) return null;

  const ed = editors[0];
  if (typeof ed.getValue !== 'function' || typeof ed.setValue !== 'function') return null;

  return ed;
}

/**
 * Inject a KQL query into the Monaco editor.
 * Appends below existing content with \n\n separator.
 * Falls back to clipboard if editor not available.
 */
export function injectQuery(kql: string, queryName?: string): 'injected' | 'clipboard' | 'failed' {
  const payload = queryName ? `// ${queryName}\n${kql}` : kql;

  const editor = getMonacoEditorInstance();
  if (!editor) return copyToClipboard(payload);

  const currentValue: string = editor.getValue();
  const newValue =
    currentValue.trim().length > 0 ? currentValue + '\n\n' + payload : payload;

  editor.setValue(newValue);

  const model = editor.getModel?.();
  if (model) {
    const lineCount = model.getLineCount();
    const lastLine = model.getLineContent(lineCount);
    const pos = { lineNumber: lineCount, column: lastLine.length + 1 };
    editor.setPosition?.(pos);
    editor.revealPositionInCenter?.(pos);
  }

  editor.focus?.();
  return 'injected';
}

function copyToClipboard(text: string): 'clipboard' | 'failed' {
  try {
    void navigator.clipboard.writeText(text);
    return 'clipboard';
  } catch {
    return 'failed';
  }
}
