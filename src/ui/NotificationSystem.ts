import { el, setText } from './dom';

const TOAST_SECONDS = 2.2;

/** Short-lived toasts above the toolbar plus the persistent tutorial hint under the top bar. */
export class NotificationSystem {
  private readonly toasts: HTMLElement;
  private readonly hint: HTMLElement;
  private readonly hintText: HTMLElement;
  private readonly hintBadge: HTMLElement;
  private readonly hintClose: HTMLButtonElement;
  private onHintClose: (() => void) | null = null;
  private lastToast = '';
  private lastToastAt = 0;

  constructor(root: HTMLElement) {
    this.toasts = el('div', { class: 'toasts', attrs: { 'aria-live': 'polite' } });
    this.hintText = el('span');
    this.hintBadge = el('span', { class: 'hint-badge', text: 'Next' });
    this.hintClose = el('button', {
      class: 'hint-close hidden',
      text: '×',
      attrs: { type: 'button', 'aria-label': 'Close tip' },
      onClick: () => this.onHintClose?.(),
    });
    this.hint = el('div', { class: 'hint hidden', attrs: { role: 'status' } }, [this.hintBadge, this.hintText, this.hintClose]);
    root.append(this.hint, this.toasts);
  }

  /** `seconds` is how long it stays; the default suits a short remark. */
  toast(message: string, seconds = TOAST_SECONDS): void {
    // Dragging a belt across invalid ground would otherwise stack the same message many times.
    const now = performance.now();
    if (message === this.lastToast && now - this.lastToastAt < 1200) return;
    this.lastToast = message;
    this.lastToastAt = now;

    const toast = el('div', { class: 'toast', text: message });
    this.toasts.append(toast);
    window.setTimeout(() => {
      toast.classList.add('leaving');
      window.setTimeout(() => toast.remove(), 250);
    }, seconds * 1000);
  }

  /**
   * Shows the banner under the top bar, or hides it when there is nothing to say. A walkthrough
   * step ("Next") stays until it is done; a tip can be closed, which calls `onClose`.
   */
  setHint(text: string | null, onClose: (() => void) | null = null): void {
    this.hint.classList.toggle('hidden', text === null);
    this.onHintClose = onClose;
    this.hintClose.classList.toggle('hidden', onClose === null);
    setText(this.hintBadge, onClose ? 'Tip' : 'Next');
    if (text !== null) setText(this.hintText, text);
  }
}
