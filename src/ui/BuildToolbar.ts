import { formatMoney } from '../core/economy/Currency';
import { buildCost } from '../core/economy/Pricing';
import { getMachineDef } from '../core/factory/MachineRegistry';
import type { BuildableType } from '../core/factory/MachineTypes';
import type { GameState } from '../core/game/GameState';
import { unlockedMachines } from '../core/research/Research';
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
  private readonly copyButton: HTMLButtonElement;

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
          // Number keys 1-9, then 0 for the tenth tool.
          el('span', { class: 'tool-key', text: index < 9 ? String(index + 1) : index === 9 ? '0' : '' }),
          el('span', { class: 'tool-icon', html: ICONS[type] ?? '' }),
          el('span', { class: 'tool-name', text: type === 'conveyor' ? info.name : (getMachineDef(type).toolbarName ?? info.name) }),
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
    this.copyButton = el(
      'button',
      {
        class: 'tool tool-copy',
        title: 'Copy — drag over part of the factory, then click to place the copy. R rotates it. Ctrl+V pastes again.',
        onClick: () => {
          onClick();
          placement.toggleCopy();
        },
        attrs: { type: 'button' },
      },
      [
        el('span', { class: 'tool-key', text: '^C' }),
        el('span', { class: 'tool-icon', html: ICONS.copy }),
        el('span', { class: 'tool-name', text: 'Copy' }),
        el('span', { class: 'tool-cost', text: 'area' }),
      ],
    );
    bar.append(el('div', { class: 'toolbar-divider' }), this.copyButton, this.deleteButton);
    root.append(bar);

    placement.events.on('toolChanged', (tool) => this.setTool(tool));
  }

  private setTool(tool: Tool): void {
    for (const entry of this.entries) {
      entry.button.classList.toggle('active', tool.mode === 'build' && tool.type === entry.type);
    }
    this.deleteButton.classList.toggle('active', tool.mode === 'delete');
    this.copyButton.classList.toggle('active', tool.mode === 'copy' || tool.mode === 'paste');
  }

  update(state: GameState): void {
    const unlocked = unlockedMachines(state.research);
    for (const entry of this.entries) {
      entry.button.classList.toggle('unaffordable', !state.economy.canAfford(entry.cost));
      entry.button.classList.toggle('hidden', !unlocked.includes(entry.type));
    }
  }
}
