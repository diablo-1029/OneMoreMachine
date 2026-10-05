type Child = Node | string | null | undefined | false;

interface Props {
  class?: string;
  text?: string;
  html?: string;
  title?: string;
  onClick?: (event: MouseEvent) => void;
  attrs?: Record<string, string>;
}

/** Tiny element builder so the UI can stay framework-free without string templates everywhere. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props = {},
  children: Child[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (props.class) node.className = props.class;
  if (props.text !== undefined) node.textContent = props.text;
  if (props.html !== undefined) node.innerHTML = props.html;
  if (props.title) node.title = props.title;
  if (props.onClick) (node as HTMLElement).addEventListener('click', props.onClick);
  if (props.attrs) {
    for (const [name, value] of Object.entries(props.attrs)) node.setAttribute(name, value);
  }
  for (const child of children) {
    if (child) node.append(child);
  }
  return node;
}

/** Sets text only when it changed, to avoid needless layout work in per-frame UI updates. */
export function setText(node: HTMLElement, text: string): void {
  if (node.textContent !== text) node.textContent = text;
}
