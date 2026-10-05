import { uiScale } from './preferences';

export interface TooltipContent {
  title: string;
  /** A sentence of explanation under the title. */
  body?: string;
  /** The key that does the same thing. */
  key?: string;
  /** A short extra on the title line, such as a price. */
  meta?: string;
}

/** Plain text in the form "Name (Key) — explanation", ready-made content, or a function giving either. */
export type TooltipSource = string | TooltipContent | (() => string | TooltipContent | null);

/** Pause before a tooltip appears, and how long after one closes the next appears at once. */
const SHOW_DELAY_MS = 380;
const WARM_MS = 400;
const GAP = 10;
const MARGIN = 8;

const sources = new WeakMap<HTMLElement, TooltipSource>();

let bubble: HTMLElement | null = null;
let titleNode: HTMLElement;
let metaNode: HTMLElement;
let keyNode: HTMLElement;
let bodyNode: HTMLElement;
let current: HTMLElement | null = null;
let timer = 0;
let lastHiddenAt = -Infinity;

/** Splits "Research (T) — unlock new machines" into its title, key and explanation. */
export function parseTooltip(text: string): TooltipContent {
  const dash = text.indexOf(' — ');
  const head = dash < 0 ? text : text.slice(0, dash);
  // The explanation stands on its own line, so it starts with a capital.
  const body = dash < 0 ? undefined : text.charAt(dash + 3).toUpperCase() + text.slice(dash + 4);
  const key = /^(.*\S)\s*\(([^()]{1,12})\)$/.exec(head);
  return key ? { title: key[1], key: key[2], body } : { title: head, body };
}

function build(): HTMLElement {
  const make = (tag: string, className: string) => {
    const node = document.createElement(tag);
    node.className = className;
    return node;
  };
  titleNode = make('span', 'tooltip-title');
  metaNode = make('span', 'tooltip-meta');
  keyNode = make('kbd', 'tooltip-key');
  bodyNode = make('p', 'tooltip-body');
  const head = make('div', 'tooltip-head');
  head.append(titleNode, metaNode, keyNode);
  const node = make('div', 'tooltip hidden');
  node.setAttribute('role', 'tooltip');
  node.append(head, bodyNode);
  (document.getElementById('ui') ?? document.body).append(node);

  // Anything that changes what is under the cursor ends the tooltip.
  window.addEventListener('pointerdown', hide, true);
  window.addEventListener('keydown', hide, true);
  window.addEventListener('wheel', hide, { capture: true, passive: true });
  window.addEventListener(
    'pointermove',
    () => {
      // A control that was removed or hidden never reports the pointer leaving it.
      if (current && (!current.isConnected || current.getClientRects().length === 0)) hide();
    },
    { passive: true },
  );
  return node;
}

function show(anchor: HTMLElement): void {
  const source = sources.get(anchor);
  const rect = anchor.getBoundingClientRect();
  if (!source || !anchor.isConnected || rect.width === 0) return;
  const value = typeof source === 'function' ? source() : source;
  if (!value) return;
  const content = typeof value === 'string' ? parseTooltip(value) : value;

  bubble ??= build();
  titleNode.textContent = content.title;
  metaNode.textContent = content.meta ?? '';
  metaNode.classList.toggle('hidden', !content.meta);
  keyNode.textContent = content.key ?? '';
  keyNode.classList.toggle('hidden', !content.key);
  bodyNode.textContent = content.body ?? '';
  bodyNode.classList.toggle('hidden', !content.body);
  bubble.classList.remove('hidden');
  current = anchor;

  // Everything below is in the UI layer's own pixels, which differ from screen pixels when it is scaled.
  const scale = uiScale();
  const viewWidth = window.innerWidth / scale;
  const viewHeight = window.innerHeight / scale;
  const left = rect.left / scale;
  const top = rect.top / scale;
  const width = bubble.offsetWidth;
  const height = bubble.offsetHeight;
  const x = Math.min(Math.max(left + rect.width / scale / 2 - width / 2, MARGIN), viewWidth - width - MARGIN);
  // Below controls in the top half of the window, above those in the bottom half.
  const below = top + rect.height / scale / 2 < viewHeight / 2;
  const y = below ? top + rect.height / scale + GAP : top - height - GAP;
  bubble.dataset.side = below ? 'below' : 'above';
  bubble.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
}

function hide(): void {
  window.clearTimeout(timer);
  if (!current) return;
  current = null;
  lastHiddenAt = performance.now();
  bubble?.classList.add('hidden');
}

function schedule(anchor: HTMLElement): void {
  window.clearTimeout(timer);
  // Moving along a row of buttons should not mean waiting again at each one.
  const delay = performance.now() - lastHiddenAt < WARM_MS ? 0 : SHOW_DELAY_MS;
  timer = window.setTimeout(() => show(anchor), delay);
}

/**
 * Gives a control a tooltip, or replaces the one it has. Shown after a short pause on hover,
 * and at once when the control is reached with the keyboard.
 */
export function attachTooltip(node: HTMLElement, source: TooltipSource): void {
  const known = sources.has(node);
  sources.set(node, source);
  // An icon-only control still needs a name for screen readers.
  if (typeof source === 'string' && !node.hasAttribute('aria-label') && !node.textContent?.trim()) {
    node.setAttribute('aria-label', parseTooltip(source).title);
  }
  if (current === node) show(node);
  if (known) return;
  node.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'touch') schedule(node);
  });
  node.addEventListener('pointerleave', () => {
    if (current === node || timer) hide();
    window.clearTimeout(timer);
  });
  node.addEventListener('focus', () => {
    if (node.matches(':focus-visible')) show(node);
  });
  node.addEventListener('blur', () => {
    if (current === node) hide();
  });
}
