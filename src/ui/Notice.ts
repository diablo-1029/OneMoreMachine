import { el } from './dom';

export interface NoticeAction {
  label: string;
  primary?: boolean;
  onClick: () => void;
}

export interface NoticeOptions {
  title: string;
  body: string;
  /** Small print under the body, such as an error message. */
  detail?: string;
  actions: NoticeAction[];
}

/**
 * A message that stops play until it is dealt with: something has gone wrong, or the factory
 * cannot safely carry on here. It sits above everything else and cannot be clicked away.
 */
export function showNotice(root: HTMLElement, options: NoticeOptions): { close: () => void } {
  const overlay = el('div', { class: 'overlay notice' }, [
    el('div', { class: 'modal', attrs: { role: 'alertdialog', 'aria-label': options.title } }, [
      el('h2', { class: 'panel-title', text: options.title }),
      el('p', { class: 'panel-description', text: options.body }),
      options.detail ? el('p', { class: 'notice-detail', text: options.detail }) : null,
      el(
        'div',
        { class: 'panel-actions' },
        options.actions.map((action) =>
          el('button', {
            class: action.primary ? 'button primary' : 'button',
            text: action.label,
            attrs: { type: 'button' },
            onClick: action.onClick,
          }),
        ),
      ),
    ]),
  ]);
  // Keys must not reach the game underneath.
  overlay.addEventListener('keydown', (event) => event.stopPropagation());
  root.append(overlay);
  overlay.querySelector('button')?.focus();
  return { close: () => overlay.remove() };
}

/** Hands the player a text file to keep. */
export function downloadText(filename: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = el('a', { attrs: { href: url, download: filename } });
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Asks the player for a text file; resolves with its contents, or null if they chose none. */
export function pickTextFile(accept: string): Promise<string | null> {
  return new Promise((resolve) => {
    const input = el('input', { attrs: { type: 'file', accept } });
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      file.text().then(resolve, () => resolve(null));
    });
    input.addEventListener('cancel', () => resolve(null));
    input.click();
  });
}

/** A file name for a save made now, e.g. one-more-machine-2026-10-05.json. */
export function saveFileName(now = new Date()): string {
  return `one-more-machine-${now.toISOString().slice(0, 10)}.json`;
}
