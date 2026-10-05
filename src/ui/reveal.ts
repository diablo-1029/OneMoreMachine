import { reducedMotion, uiScale } from './preferences';

/** Must match the closing animations in panels.css. */
const CLOSE_MS = 130;
const FOCUSABLE = 'button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])';

const closing = new WeakMap<HTMLElement, number>();
const returnFocusTo = new WeakMap<HTMLElement, HTMLElement | null>();
const trapped = new WeakSet<HTMLElement>();

/** True while a panel is open; false as soon as it starts closing. */
export function isRevealed(node: HTMLElement): boolean {
  return !node.classList.contains('hidden') && !node.classList.contains('closing');
}

/** Keeps Tab inside an open dialog. */
function onTrapKey(this: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== 'Tab') return;
  const items = [...this.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((item) => item.getClientRects().length > 0);
  if (items.length === 0) return event.preventDefault();
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || !this.contains(active) || active === this.firstElementChild)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (active === last || !this.contains(active))) {
    event.preventDefault();
    first.focus();
  }
}

/**
 * Opens a drop-down panel or a modal overlay. Given the control that opened it, the panel
 * grows out of that control, so it is clear where it came from and where it goes back to.
 * Modals also take the keyboard focus and hold it until they close.
 */
export function reveal(node: HTMLElement, anchor?: HTMLElement | null): void {
  window.clearTimeout(closing.get(node));
  node.classList.remove('hidden', 'closing', 'revealing');

  const modal = node.classList.contains('overlay');
  const body = modal ? (node.firstElementChild as HTMLElement | null) : node;
  if (body) {
    const from = anchor?.getBoundingClientRect();
    if (from && from.width > 0) {
      const box = body.getBoundingClientRect();
      const scale = uiScale();
      const x = (from.left + from.width / 2 - box.left) / scale;
      const y = (from.top + from.height / 2 - box.top) / scale;
      body.style.transformOrigin = `${x.toFixed(0)}px ${y.toFixed(0)}px`;
    } else {
      body.style.transformOrigin = '';
    }
  }
  // Reading the layout between removing and adding the class restarts the animation.
  void node.offsetWidth;
  node.classList.add('revealing');

  if (modal && body) {
    returnFocusTo.set(node, document.activeElement instanceof HTMLElement ? document.activeElement : null);
    body.tabIndex = -1;
    body.focus({ preventScroll: true });
    if (!trapped.has(node)) {
      trapped.add(node);
      node.addEventListener('keydown', onTrapKey);
    }
  }
}

/** Closes what `reveal` opened, shrinking it back to where it came from. */
export function conceal(node: HTMLElement): void {
  if (!isRevealed(node)) return;
  node.classList.remove('revealing');

  if (node.classList.contains('overlay')) {
    const previous = returnFocusTo.get(node);
    returnFocusTo.delete(node);
    if (previous?.isConnected && previous !== document.body) previous.focus({ preventScroll: true });
    else if (document.activeElement instanceof HTMLElement && node.contains(document.activeElement)) document.activeElement.blur();
  }

  if (reducedMotion()) {
    node.classList.add('hidden');
    return;
  }
  node.classList.add('closing');
  closing.set(
    node,
    window.setTimeout(() => {
      node.classList.add('hidden');
      node.classList.remove('closing');
    }, CLOSE_MS),
  );
}
