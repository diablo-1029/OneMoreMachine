import { formatMoney } from '../core/economy/Currency';
import { buildCost } from '../core/economy/Pricing';
import { getMachineDef } from '../core/factory/MachineRegistry';
import type { BuildableType } from '../core/factory/MachineTypes';
import type { GameState } from '../core/game/GameState';
import { unlockedMachines } from '../core/research/Research';
import { BUILD_ORDER, CONVEYOR_INFO, TOOL_GROUPS, UNGROUPED_TOOL_LIMIT } from '../data/machines';
import type { PlacementController, Tool } from '../input/PlacementController';
import { el, setText } from './dom';
import { ICONS } from './Icons';
import { attachTooltip } from './Tooltip';

interface Entry {
  type: BuildableType;
  button: HTMLButtonElement;
  key: HTMLElement;
  cost: number;
}

/** Below this width the tools shrink and the group tabs move above them. */
const NARROW_BELOW = 780;
/** How long a newly unlocked tool stays highlighted. */
const HIGHLIGHT_MS = 2600;

const groupOf = (type: BuildableType) => TOOL_GROUPS.findIndex((group) => (group.tools as readonly string[]).includes(type));

/**
 * Bottom toolbar. A young factory has a handful of tools in one row. Once research has
 * unlocked more than fit comfortably, they are split into Machines and Logistics, one group
 * showing at a time. Copy and Delete are always there. Number keys pick from what is showing.
 */
export class BuildToolbar {
  private readonly entries = new Map<BuildableType, Entry>();
  private readonly tools: HTMLElement;
  private readonly tabs: HTMLElement;
  private readonly tabButtons: HTMLButtonElement[] = [];
  private readonly deleteButton: HTMLButtonElement;
  private readonly copyButton: HTMLButtonElement;
  private group = 0;
  private grouped = false;
  /** The tools on show, in the order the number keys pick them. */
  private visible: BuildableType[] = [];
  private unlocked: readonly string[] = [];
  private layoutKey = '';

  constructor(
    root: HTMLElement,
    private readonly placement: PlacementController,
    private readonly onClick: () => void,
  ) {
    this.tools = el('div', { class: 'toolbar-tools' });

    for (const type of BUILD_ORDER) {
      const info = type === 'conveyor' ? CONVEYOR_INFO : getMachineDef(type);
      const cost = buildCost(type);
      const key = el('span', { class: 'tool-key' });
      const button = el(
        'button',
        {
          class: 'tool',
          onClick: () => {
            onClick();
            placement.toggleBuild(type);
          },
          attrs: { type: 'button' },
        },
        [
          key,
          el('span', { class: 'tool-icon', html: ICONS[type] ?? '' }),
          el('span', { class: 'tool-name', text: type === 'conveyor' ? info.name : (getMachineDef(type).toolbarName ?? info.name) }),
          el('span', { class: 'tool-cost', text: formatMoney(cost) }),
        ],
      );
      attachTooltip(button, () => ({
        title: info.name,
        body: info.description,
        meta: formatMoney(cost),
        key: key.textContent || undefined,
      }));
      this.entries.set(type, { type, button, key, cost });
    }

    TOOL_GROUPS.forEach((group, index) => {
      const tab = el('button', {
        class: 'toolbar-tab',
        text: group.name,
        title: `${group.name} (\`) — show these tools`,
        onClick: () => {
          onClick();
          this.setGroup(index);
        },
        attrs: { type: 'button', role: 'tab' },
      });
      this.tabButtons.push(tab);
    });
    this.tabs = el('div', { class: 'toolbar-tabs hidden', attrs: { role: 'tablist', 'aria-label': 'Tool groups' } }, this.tabButtons);

    this.copyButton = el(
      'button',
      {
        class: 'tool tool-copy',
        onClick: () => {
          onClick();
          placement.toggleCopy();
        },
        attrs: { type: 'button' },
      },
      [
        el('span', { class: 'tool-icon', html: ICONS.copy }),
        el('span', { class: 'tool-name', text: 'Copy' }),
        el('span', { class: 'tool-cost', text: 'area' }),
      ],
    );
    attachTooltip(this.copyButton, {
      title: 'Copy',
      key: 'Ctrl+C',
      body: 'Drag over part of the factory, then click to place the copy. Ctrl+V places it again.',
    });
    this.deleteButton = el(
      'button',
      {
        class: 'tool tool-delete',
        onClick: () => {
          onClick();
          placement.toggleDelete();
        },
        attrs: { type: 'button' },
      },
      [
        el('span', { class: 'tool-icon', html: ICONS.delete }),
        el('span', { class: 'tool-name', text: 'Delete' }),
        el('span', { class: 'tool-cost', text: 'refund' }),
      ],
    );
    attachTooltip(this.deleteButton, {
      title: 'Delete',
      key: 'X',
      body: 'Click a machine or drag across belts. Everything is refunded in full.',
    });

    const bar = el('div', { class: 'toolbar', attrs: { role: 'toolbar', 'aria-label': 'Build tools' } }, [
      this.tabs,
      this.tools,
      el('div', { class: 'toolbar-divider' }),
      this.copyButton,
      this.deleteButton,
    ]);
    root.append(bar);

    // The key hints and toasts stack above the toolbar, however tall it is.
    const publish = () => {
      // Judged by the UI layer's own width, which is narrower than the window when the interface is enlarged.
      bar.classList.toggle('narrow', root.clientWidth < NARROW_BELOW);
      root.style.setProperty('--toolbar-height', `${bar.offsetHeight}px`);
    };
    const observer = new ResizeObserver(publish);
    observer.observe(bar);
    observer.observe(root);
    publish();

    placement.events.on('toolChanged', (tool) => this.setTool(tool));
  }

  /** Picks the tool in the given position on the bar (0 for the first), as the number keys do. */
  pick(index: number): void {
    const type = this.visible[index];
    if (type) this.placement.toggleBuild(type);
  }

  /** Shows the next group of tools, if the toolbar is split into groups. */
  cycleGroup(): void {
    if (!this.grouped) return;
    this.onClick();
    this.setGroup((this.group + 1) % TOOL_GROUPS.length);
  }

  private setGroup(index: number): void {
    if (index === this.group || index < 0) return;
    this.group = index;
    this.layout();
  }

  private setTool(tool: Tool): void {
    // A tool picked some other way (the pipette, say) brings its group into view.
    if (tool.mode === 'build' && this.grouped) this.setGroup(groupOf(tool.type));
    for (const entry of this.entries.values()) {
      const active = tool.mode === 'build' && tool.type === entry.type;
      entry.button.classList.toggle('active', active);
      entry.button.setAttribute('aria-pressed', String(active));
    }
    this.deleteButton.classList.toggle('active', tool.mode === 'delete');
    this.copyButton.classList.toggle('active', tool.mode === 'copy' || tool.mode === 'paste');
  }

  /** Puts the right tools on the bar, in order, and numbers them. */
  private layout(): void {
    const available: readonly BuildableType[] = BUILD_ORDER.filter((type) => this.unlocked.includes(type));
    this.grouped = available.length > UNGROUPED_TOOL_LIMIT;
    const tools: readonly BuildableType[] = this.grouped ? TOOL_GROUPS[this.group].tools : BUILD_ORDER;
    this.visible = tools.filter((type) => available.includes(type));

    const key = `${this.grouped}|${this.visible.join(',')}`;
    if (key === this.layoutKey) return;
    this.layoutKey = key;

    this.tools.replaceChildren(...this.visible.map((type) => this.entries.get(type)!.button));
    this.visible.forEach((type, index) => {
      // Number keys 1-9, then 0 for the tenth tool.
      setText(this.entries.get(type)!.key, index < 9 ? String(index + 1) : index === 9 ? '0' : '');
    });
    this.tabs.classList.toggle('hidden', !this.grouped);
    this.tabButtons.forEach((tab, index) => {
      // A group with nothing unlocked in it yet is not worth a tab.
      const empty = !TOOL_GROUPS[index].tools.some((type) => this.unlocked.includes(type));
      tab.classList.toggle('hidden', empty);
      tab.classList.toggle('active', index === this.group);
      tab.setAttribute('aria-selected', String(index === this.group));
    });
  }

  update(state: GameState): void {
    const unlocked = unlockedMachines(state.research);
    if (unlocked.length !== this.unlocked.length) {
      const first = this.layoutKey === '';
      const arrived = first ? [] : BUILD_ORDER.filter((type) => unlocked.includes(type) && !this.unlocked.includes(type));
      this.unlocked = [...unlocked];
      // Show the player what the research they just bought has added.
      if (arrived.length > 0) this.group = Math.max(groupOf(arrived[0]), 0);
      this.layout();
      for (const type of arrived) {
        const { button } = this.entries.get(type)!;
        button.classList.add('arrived');
        window.setTimeout(() => button.classList.remove('arrived'), HIGHLIGHT_MS);
      }
    }
    for (const entry of this.entries.values()) {
      entry.button.classList.toggle('unaffordable', !state.economy.canAfford(entry.cost));
    }
  }
}
