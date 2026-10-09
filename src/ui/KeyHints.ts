import type { PlacementController, Selection, Tool } from '../input/PlacementController';
import { el } from './dom';

/** A key (or mouse action) and what it does right now. */
type Hint = [key: string, action: string];

function hintsFor(tool: Tool, selection: Selection): Hint[] {
  switch (tool.mode) {
    case 'build':
      return tool.type === 'conveyor'
        ? [['Drag', 'lay a line'], ['R', 'rotate'], ['Esc', 'done']]
        : [['Click', 'place'], ['R', 'rotate'], ['Esc', 'done']];
    case 'delete':
      return [['Click', 'remove a machine'], ['Drag', 'clear belts'], ['Ctrl Z', 'put back'], ['Esc', 'done']];
    case 'copy':
      return [['Drag', 'over what to copy'], ['Esc', 'cancel']];
    case 'paste':
      return [['Click', 'place the copy'], ['R', 'rotate'], ['Esc', 'done']];
    case 'select':
      if (!selection) return [];
      return selection.kind === 'machine'
        ? [['R', 'rotate'], ['Del', 'remove'], ['Esc', 'deselect']]
        : [['R', 'turn'], ['Del', 'remove'], ['Esc', 'deselect']];
  }
}

/**
 * A slim strip above the toolbar naming the keys that matter for whatever the player is doing
 * at the moment. Empty, and gone, when they are doing nothing in particular.
 */
export class KeyHints {
  private readonly bar: HTMLElement;
  private tool: Tool;
  private selection: Selection;
  private shownKey = '';

  constructor(root: HTMLElement, placement: PlacementController) {
    this.bar = el('div', { class: 'keyhints hidden', attrs: { 'aria-hidden': 'true' } });
    root.append(this.bar);
    this.tool = placement.currentTool;
    this.selection = placement.currentSelection;
    placement.events.on('toolChanged', (tool) => {
      this.tool = tool;
      this.render();
    });
    placement.events.on('selectionChanged', (selection) => {
      this.selection = selection;
      this.render();
    });
  }

  private render(): void {
    const hints = hintsFor(this.tool, this.selection);
    const key = hints.map(([k, a]) => `${k}:${a}`).join('|');
    if (key === this.shownKey) return;
    this.shownKey = key;
    this.bar.classList.toggle('hidden', hints.length === 0);
    this.bar.replaceChildren(
      ...hints.map(([k, action]) => el('span', { class: 'keyhint' }, [el('kbd', { text: k }), action])),
    );
  }
}
