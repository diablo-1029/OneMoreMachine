import { formatMoney } from '../core/economy/Currency';
import { buildCost } from '../core/economy/Pricing';
import { getMachineDef } from '../core/factory/MachineRegistry';
import type { BuildableType } from '../core/factory/MachineTypes';
import type { GameState } from '../core/game/GameState';
import { BUILD_ORDER, CONVEYOR_INFO } from '../data/machines';
import type { PlacementController, Tool } from '../input/PlacementController';
import { el } from './dom';
import { ICONS } from './Icons';

interface Entry {
  type: BuildableType;
  button: HTMLButtonElement;
  cost: number;
}

/** Bottom toolbar: one button per buildable, plus the delete tool. */
export class BuildToolbar {
  private readonly entries: Entry[] = [];
  private readonly deleteButton: HTMLButtonElement;

  constructor(root: HTMLElement, placement: PlacementController, onClick: () => void) {
    const bar = el('div', { class: 'toolbar' });

    BUILD_ORDER.forEach((type, index) => {
      const info = type === 'conveyor' ? CONVEYOR_INFO : getMachineDef(type);
      const cost = buildCost(type);
      const button = el(
        'button',
        {
          class: 'tool',
          title: `${info.name} — ${info.description}`,
          onClick: () => {
            onClick();
            placement.toggleBuild(type);
          },
          attrs: { type: 'button' },
        },
        [
          el('span', { class: 'tool-key', text: String(index + 1) }),
          el('span', { class: 'tool-icon', html: ICONS[type] ?? '' }),
          el('span', { class: 'tool-name', text: info.name }),
          el('span', { class: 'tool-cost', text: formatMoney(cost) }),
        ],
      );
      this.entries.push({ type, button, cost });
      bar.append(button);
    });

    this.deleteButton = el(
      'button',
      {
        class: 'tool tool-delete',
        title: 'Delete — click a machine or drag across belts. Full refund.',
        onClick: () => {
          onClick();
          placement.toggleDelete();
        },
        attrs: { type: 'button' },
      },
      [
        el('span', { class: 'tool-key', text: 'X' }),
        el('span', { class: 'tool-icon', html: ICONS.delete }),
        el('span', { class: 'tool-name', text: 'Delete' }),
        el('span', { class: 'tool-cost', text: 'refund' }),
      ],
    );
    bar.append(el('div', { class: 'toolbar-divider' }), this.deleteButton);
    root.append(bar);

    placement.events.on('toolChanged', (tool) => this.setTool(tool));
  }

  private setTool(tool: Tool): void {
    for (const entry of this.entries) {
      entry.button.classList.toggle('active', tool.mode === 'build' && tool.type === entry.type);
    }
    this.deleteButton.classList.toggle('active', tool.mode === 'delete');
  }

  update(state: GameState): void {
    for (const entry of this.entries) {
      entry.button.classList.toggle('unaffordable', !state.economy.canAfford(entry.cost));
      entry.button.classList.toggle('hidden', !state.unlocked.includes(entry.type));
    }
  }
}
