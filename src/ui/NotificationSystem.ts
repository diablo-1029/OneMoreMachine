import { el, setText } from './dom';

const TOAST_SECONDS = 2.2;

/** Short-lived toasts above the toolbar plus the persistent tutorial hint under the top bar. */
export class NotificationSystem {
  private readonly toasts: HTMLElement;
  private readonly hint: HTMLElement;
  private readonly hintText: HTMLElement;
  private lastToast = '';
  private lastToastAt = 0;

  constructor(root: HTMLElement) {
    this.toasts = el('div', { class: 'toasts', attrs: { 'aria-live': 'polite' } });
    this.hintText = el('span');
    this.hint = el('div', { class: 'hint hidden' }, [el('span', { class: 'hint-badge', text: 'Next' }), this.hintText]);
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

  /** Shows the current tutorial hint, or hides the banner when there is none. */
  setHint(text: string | null): void {
    this.hint.classList.toggle('hidden', text === null);
    if (text !== null) setText(this.hintText, text);
  }
}
