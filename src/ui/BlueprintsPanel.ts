import { blueprintCost, describeBlueprint } from '../core/blueprints/Blueprint';
import { MAX_BLUEPRINTS, type BlueprintLibrary, type SavedBlueprint } from '../core/blueprints/BlueprintLibrary';
import { formatMoney } from '../core/economy/Currency';
import type { GameState } from '../core/game/GameState';
import type { PlacementController } from '../input/PlacementController';
import { el, setText } from './dom';
import { conceal, isRevealed, reveal } from './reveal';

/**
 * Drop-down for the blueprint library: save whatever was last copied, then place, rename
 * or delete saved layouts. Blueprints belong to the player rather than to one factory.
 */
export class BlueprintsPanel {
  private readonly panel: HTMLElement;
  private readonly list: HTMLElement;
  private readonly saveButton: HTMLButtonElement;
  private readonly hint: HTMLElement;
  private costs: { element: HTMLElement; cost: number }[] = [];
  private shownKey = '';

  constructor(
    root: HTMLElement,
    private readonly library: BlueprintLibrary,
    private readonly placement: PlacementController,
    private readonly onClick: () => void,
  ) {
    this.list = el('div', { class: 'blueprint-list' });
    this.hint = el('p', { class: 'panel-description' });
    this.saveButton = el('button', {
      class: 'button primary',
      text: 'Save what I copied',
      attrs: { type: 'button' },
      onClick: () => {
        const clipboard = this.placement.clipboard;
        if (!clipboard) return;
        this.onClick();
        this.library.add(clipboard);
        this.rebuild();
      },
    });
    this.panel = el('div', { class: 'blueprints-panel hidden' }, [
      el('h2', { class: 'panel-title', text: 'Blueprints' }),
      this.hint,
      this.saveButton,
      this.list,
    ]);
    root.append(this.panel);
  }

  toggle(anchor?: HTMLElement | null): void {
    if (this.visible) return this.hide();
    reveal(this.panel, anchor);
    this.shownKey = '';
  }

  hide(): void {
    conceal(this.panel);
  }

  get visible(): boolean {
    return isRevealed(this.panel);
  }

  private row(saved: SavedBlueprint): HTMLElement {
    const name = el('input', {
      class: 'blueprint-name',
      attrs: { type: 'text', value: saved.name, maxlength: '30', 'aria-label': 'Blueprint name' },
    });
    // Renaming is saved when the field is left or Enter is pressed.
    name.addEventListener('change', () => {
      this.library.rename(saved.id, name.value);
      name.value = this.library.all.find((b) => b.id === saved.id)?.name ?? name.value;
    });
    name.addEventListener('keydown', (event) => {
      if (event.code === 'Enter' || event.code === 'Escape') name.blur();
    });

    const cost = blueprintCost(saved.blueprint);
    const costLabel = el('span', { class: 'blueprint-cost', text: formatMoney(cost) });
    this.costs.push({ element: costLabel, cost });

    return el('div', { class: 'blueprint' }, [
      name,
      el('div', { class: 'blueprint-footer' }, [
        el('span', { class: 'blueprint-summary', text: `${describeBlueprint(saved.blueprint)} · ${saved.blueprint.width}×${saved.blueprint.height}` }),
        costLabel,
        el('button', {
          class: 'button',
          text: 'Place',
          attrs: { type: 'button' },
          onClick: () => {
            this.onClick();
            this.placement.startPaste(saved.blueprint);
            this.hide();
          },
        }),
        el('button', {
          class: 'button danger',
          text: '×',
          title: 'Delete this blueprint',
          attrs: { type: 'button', 'aria-label': `Delete ${saved.name}` },
          onClick: () => {
            this.onClick();
            this.library.remove(saved.id);
            this.rebuild();
          },
        }),
      ]),
    ]);
  }

  private rebuild(): void {
    this.costs = [];
    this.list.replaceChildren(...this.library.all.map((saved) => this.row(saved)));
    this.shownKey = '';
  }

  update(state: GameState): void {
    if (!this.visible) return;
    const clipboard = this.placement.clipboard;
    // Rebuild the list only when it changed, so a name being typed is not wiped out.
    const key = this.library.all.map((b) => b.id).join(',');
    if (key !== this.shownKey) {
      this.rebuild();
      this.shownKey = key;
    }

    this.saveButton.disabled = !clipboard || this.library.isFull;
    setText(
      this.hint,
      this.library.isFull
        ? `The library is full (${MAX_BLUEPRINTS}). Delete one to save another.`
        : clipboard
          ? `Copied: ${describeBlueprint(clipboard)}. Save it to keep it for any factory.`
          : 'Use Copy (Ctrl+C) and drag over part of your factory, then save it here.',
    );
    for (const { element, cost } of this.costs) {
      element.classList.toggle('unaffordable', !state.economy.canAfford(cost));
    }
  }
}
