import type { ConveyorState } from '../core/factory/ConveyorState';
import { getMachineDef } from '../core/factory/MachineRegistry';
import type { Inventory, MachineState } from '../core/factory/MachineState';
import { machineSpeed, machineStatus, nominalRatePerMinute, STATUS_LABELS } from '../core/factory/MachineSystem';
import { formatMoney } from '../core/economy/Currency';
import { machinePowerOutput, machinePowerUse } from '../core/power/Power';
import { getUpgradeLevel } from '../data/upgrades';
import type { Simulation } from '../core/game/Simulation';
import { DIR_NAMES } from '../core/grid/GridPosition';
import { getRecipe, recipesFor } from '../core/recipes/RecipeRegistry';
import { CONVEYOR_INFO } from '../data/machines';
import { getResource, RESOURCE_DEFINITIONS } from '../data/resources';
import type { PlacementController, Selection } from '../input/PlacementController';
import { el, setText } from './dom';

function resourceChip(resourceId: string, amount: string): HTMLElement {
  const resource = getResource(resourceId);
  const dot = el('span', { class: `resource-dot resource-${resource.icon}` });
  dot.style.background = resource.color;
  return el('span', { class: 'chip' }, [dot, `${amount} ${resource.name}`]);
}

/** Trims the rounding noise that site modifiers leave on otherwise tidy numbers (21.000000000000004). */
const tidy = (value: number) => String(Number(value.toFixed(2)));

type RowKey = 'status' | 'level' | 'power' | 'makes' | 'recipe' | 'input' | 'output' | 'progress' | 'rate' | 'efficiency';

/** Right-hand panel describing the selected machine or belt. */
export class MachinePanel {
  private readonly panel: HTMLElement;
  private readonly name: HTMLElement;
  private readonly description: HTMLElement;
  private readonly status: HTMLElement;
  private readonly recipe: HTMLElement;
  private readonly makes: HTMLElement;
  private readonly input: HTMLElement;
  private readonly output: HTMLElement;
  private readonly inputLabel: HTMLElement;
  private readonly progressFill: HTMLElement;
  private readonly rate: HTMLElement;
  private readonly efficiency: HTMLElement;
  private readonly efficiencyFill: HTMLElement;
  private readonly toggle: HTMLButtonElement;
  private readonly level: HTMLElement;
  private readonly power: HTMLElement;
  private readonly upgradeButton: HTMLButtonElement;
  private readonly rows = new Map<RowKey, HTMLElement>();
  private selection: Selection = null;
  private signature = '';

  constructor(
    root: HTMLElement,
    private readonly sim: Simulation,
    private readonly placement: PlacementController,
    onClick: () => void,
  ) {
    this.name = el('h2', { class: 'panel-title' });
    this.description = el('p', { class: 'panel-description' });
    this.status = el('span', { class: 'status' });
    this.recipe = el('div', { class: 'row-value' });
    this.makes = el('div', { class: 'row-value recipe-choices' });
    this.input = el('div', { class: 'row-value' });
    this.output = el('div', { class: 'row-value' });
    this.rate = el('div', { class: 'row-value' });
    this.efficiency = el('div', { class: 'row-value' });
    this.progressFill = el('div', { class: 'progress-fill' });
    this.efficiencyFill = el('div', { class: 'progress-fill' });
    this.inputLabel = el('span', { class: 'row-label', text: 'Input' });

    const row = (key: RowKey, label: string | HTMLElement, value: HTMLElement) => {
      const node = el('div', { class: 'row' }, [
        typeof label === 'string' ? el('span', { class: 'row-label', text: label }) : label,
        value,
      ]);
      this.rows.set(key, node);
      return node;
    };

    this.level = el('div', { class: 'row-value' });
    this.power = el('div', { class: 'row-value' });
    this.upgradeButton = el('button', {
      class: 'button primary upgrade-button hidden',
      attrs: { type: 'button' },
      onClick: () => {
        const machine = this.machine();
        if (machine) this.placement.upgrade(machine.id);
        this.update();
      },
    });

    this.toggle = el('button', {
      class: 'button',
      attrs: { type: 'button' },
      onClick: () => {
        onClick();
        const machine = this.machine();
        if (machine) this.sim.setMachineEnabled(machine.id, !machine.enabled);
      },
    });

    this.panel = el('aside', { class: 'machine-panel hidden' }, [
      el('div', { class: 'panel-header' }, [
        this.name,
        el('button', {
          class: 'panel-close',
          text: '×',
          title: 'Close (Esc)',
          attrs: { type: 'button', 'aria-label': 'Close' },
          onClick: () => placement.select(null),
        }),
      ]),
      this.description,
      el('div', { class: 'rows' }, [
        row('status', 'Status', this.status),
        row('level', 'Level', this.level),
        row('power', 'Power', this.power),
        row('makes', 'Makes', this.makes),
        row('recipe', 'Recipe', this.recipe),
        row('input', this.inputLabel, this.input),
        row('output', 'Output', this.output),
        row('progress', 'Progress', el('div', { class: 'progress' }, [this.progressFill])),
        row('rate', 'Rate', this.rate),
        row('efficiency', 'Efficiency', el('div', { class: 'efficiency' }, [
          el('div', { class: 'progress' }, [this.efficiencyFill]),
          this.efficiency,
        ])),
      ]),
      this.upgradeButton,
      el('div', { class: 'panel-actions' }, [
        this.toggle,
        el('button', {
          class: 'button',
          text: 'Rotate',
          title: 'Rotate (R)',
          attrs: { type: 'button' },
          onClick: () => placement.rotate(),
        }),
        el('button', {
          class: 'button danger',
          text: 'Delete',
          title: 'Delete (Del)',
          attrs: { type: 'button' },
          onClick: () => placement.deleteSelected(),
        }),
      ]),
    ]);
    root.append(this.panel);

    placement.events.on('selectionChanged', (selection) => {
      this.selection = selection;
      this.signature = '';
      this.update();
    });
  }

  private machine(): MachineState | undefined {
    return this.selection?.kind === 'machine' ? this.sim.state.factory.machines.get(this.selection.id) : undefined;
  }

  private conveyor(): ConveyorState | undefined {
    return this.selection?.kind === 'conveyor' ? this.sim.state.factory.conveyors.get(this.selection.id) : undefined;
  }

  /** Refreshes the panel. Cheap enough to call several times a second. */
  update(): void {
    const machine = this.machine();
    const conveyor = this.conveyor();
    this.panel.classList.toggle('hidden', !machine && !conveyor);
    if (machine) this.showMachine(machine);
    else if (conveyor) this.showConveyor(conveyor);
  }

  private showRows(visible: RowKey[]): void {
    for (const [key, node] of this.rows) node.classList.toggle('hidden', !visible.includes(key));
  }

  private fillChips(container: HTMLElement, key: string, chips: HTMLElement[], empty: string): void {
    // Rebuild only when the contents changed; the key is a cheap fingerprint.
    if (container.dataset.key === key) return;
    container.dataset.key = key;
    container.replaceChildren(...(chips.length > 0 ? chips : [el('span', { class: 'muted', text: empty })]));
  }

  private inventoryChips(inventory: Inventory): { key: string; chips: HTMLElement[] } {
    const chips: HTMLElement[] = [];
    let key = '';
    for (const resource of RESOURCE_DEFINITIONS) {
      const count = inventory[resource.id] ?? 0;
      if (count <= 0) continue;
      key += `${resource.id}:${count};`;
      chips.push(resourceChip(resource.id, String(count)));
    }
    return { key, chips };
  }

  private showHeader(id: string, name: string, description: string, canDisable: boolean): void {
    if (this.signature === id) return;
    this.signature = id;
    setText(this.name, name);
    setText(this.description, description);
    this.toggle.classList.toggle('hidden', !canDisable);
  }

  private showMachine(machine: MachineState): void {
    const def = getMachineDef(machine.type);
    const status = machineStatus(machine);
    this.showHeader(machine.id, def.name, def.description, true);
    setText(this.status, STATUS_LABELS[status]);
    this.status.dataset.status = status;
    setText(this.toggle, machine.enabled ? 'Disable' : 'Enable');

    if (def.behavior !== 'crafter') this.upgradeButton.classList.add('hidden');
    switch (def.behavior) {
      case 'crafter':
        this.showCrafter(machine);
        break;
      case 'seller':
        this.showRows(['status', 'input', 'output', 'rate']);
        setText(this.inputLabel, 'Input');
        this.fillChips(this.input, 'seller-in', [], 'Any item');
        this.fillChips(this.output, 'seller-out', [], 'Money');
        setText(this.rate, 'As fast as items arrive');
        break;
      case 'bridge':
      case 'router':
        this.showRows(['status', 'input', 'rate']);
        setText(this.inputLabel, 'Crossing');
        this.fillChips(this.input, `transit:${machine.transit.length}`, [], `${machine.transit.length} item${machine.transit.length === 1 ? '' : 's'}`);
        setText(this.rate, 'Up to 120 items/min');
        break;
      case 'generator':
        this.showRows(['status', 'power']);
        setText(this.power, machine.enabled ? `Supplies ${tidy(machinePowerOutput(machine, this.sim.environment))}` : 'Switched off');
        break;
      case 'storage': {
        this.showRows(['status', 'input', 'progress']);
        setText(this.inputLabel, 'Holding');
        const held: Inventory = {};
        for (const id of machine.stored) held[id] = (held[id] ?? 0) + 1;
        const chips = this.inventoryChips(held);
        const capacity = def.storageCapacity ?? 0;
        this.fillChips(this.input, `stored:${chips.key}`, chips.chips, 'Empty');
        this.progressFill.style.width = `${Math.round((machine.stored.length / Math.max(capacity, 1)) * 100)}%`;
        break;
      }
    }
  }

  private showCrafter(machine: MachineState): void {
    const def = getMachineDef(machine.type);
    // Machines with a choice of products get a picker; the rest just show their recipe.
    const choices = recipesFor(machine.type).filter((r) => this.sim.isRecipeAvailable(r.id));
    const rows: RowKey[] = ['status', 'level', 'power', 'recipe', 'input', 'output', 'progress', 'rate', 'efficiency'];
    if (choices.length > 1) rows.splice(3, 0, 'makes');

    const { ratio } = this.sim.power;
    const draw = machinePowerUse(machine, this.sim.environment);
    setText(
      this.power,
      !machine.enabled
        ? 'Switched off, uses none'
        : ratio < 0.995
          ? `Uses ${tidy(draw)} · short, running at ${Math.round(ratio * 100)}%`
          : `Uses ${tidy(draw)}`,
    );
    this.power.dataset.short = String(machine.enabled && ratio < 0.995);

    const speed = machineSpeed(machine, this.sim.environment);
    setText(this.level, `${getUpgradeLevel(machine.level).name} · ${speed === 1 ? 'standard speed' : `${tidy(speed)}× speed`}`);
    const offer = this.sim.upgradeOffer(machine);
    this.upgradeButton.classList.toggle('hidden', offer === null);
    if (offer) {
      if (offer.needsResearch) {
        setText(this.upgradeButton, `${offer.next.name} needs ${offer.needsResearch.name}`);
        this.upgradeButton.disabled = true;
      } else {
        setText(this.upgradeButton, `Upgrade to ${offer.next.name} (${offer.next.speed}× speed) · ${formatMoney(offer.cost)}`);
        this.upgradeButton.disabled = !this.sim.state.economy.canAfford(offer.cost);
      }
    }
    this.showRows(rows);
    setText(this.inputLabel, 'Input');

    const choiceKey = machine.id + '|' + machine.recipeId + '|' + choices.map((r) => r.id).join(',');
    if (this.makes.dataset.key !== choiceKey) {
      this.makes.dataset.key = choiceKey;
      this.makes.replaceChildren(
        ...choices.map((choice) => {
          const resource = getResource(choice.outputs[0].resourceId);
          const dot = el('span', { class: 'resource-dot resource-' + resource.icon });
          dot.style.background = resource.color;
          return el(
            'button',
            {
              class: choice.id === machine.recipeId ? 'recipe-choice active' : 'recipe-choice',
              title: 'Make ' + resource.name,
              attrs: { type: 'button', 'aria-pressed': String(choice.id === machine.recipeId) },
              onClick: () => this.placement.setRecipe(machine.id, choice.id),
            },
            [dot, resource.name],
          );
        }),
      );
    }

    if (machine.recipeId) {
      const recipe = getRecipe(machine.recipeId);
      const parts = [
        ...recipe.inputs.map((i) => resourceChip(i.resourceId, String(i.amount))),
        el('span', { class: 'arrow', text: '→' }),
        ...recipe.outputs.map((o) => resourceChip(o.resourceId, String(o.amount))),
        el('span', { class: 'muted', text: `${recipe.duration}s` }),
      ];
      this.fillChips(this.recipe, recipe.id, recipe.inputs.length > 0 ? parts : parts.slice(1), '');
    }

    const input = this.inventoryChips(machine.inputInventory);
    const takesInput = def.ports.some((p) => p.type === 'input');
    this.fillChips(this.input, `in:${input.key}`, input.chips, takesInput ? 'Empty' : 'None needed');
    const output = this.inventoryChips(machine.outputInventory);
    this.fillChips(this.output, `out:${output.key}`, output.chips, 'Empty');
    this.progressFill.style.width = `${Math.round((machine.active ? machine.progress : 0) * 100)}%`;

    const { metrics } = this.sim;
    const nominal = nominalRatePerMinute(machine, this.sim.environment);
    if (nominal) {
      const actual = Math.round(metrics.machineOutputRate(machine.id));
      setText(this.rate, `${actual} of ${Math.round(nominal.perMinute)} ${getResource(nominal.resourceId).name}/min`);
    }

    // Where the machine's time has gone over the last half minute.
    const shares = metrics.shares(machine.id);
    if (shares.observed < 3) {
      setText(this.efficiency, 'Measuring…');
      this.efficiencyFill.style.width = '0%';
      this.efficiencyFill.dataset.level = '';
    } else {
      const lost =
        shares.waiting >= shares.blocked && shares.waiting > 0.02
          ? ` · waiting ${Math.round(shares.waiting * 100)}%`
          : shares.blocked > 0.02
            ? ` · backed up ${Math.round(shares.blocked * 100)}%`
            : '';
      setText(this.efficiency, `${Math.round(shares.working * 100)}%${lost}`);
      this.efficiencyFill.style.width = `${Math.round(shares.working * 100)}%`;
      this.efficiencyFill.dataset.level = shares.working >= 0.9 ? 'good' : shares.working >= 0.6 ? 'fair' : 'poor';
    }
  }

  private showConveyor(conveyor: ConveyorState): void {
    this.upgradeButton.classList.add('hidden');
    this.showHeader(conveyor.id, CONVEYOR_INFO.name, CONVEYOR_INFO.description, false);
    this.showRows(['status', 'input', 'rate']);
    setText(this.status, `Heading ${DIR_NAMES[conveyor.direction]}`);
    this.status.dataset.status = 'working';
    setText(this.inputLabel, 'Carrying');
    const count = conveyor.items.length;
    this.fillChips(this.input, `belt:${count}`, [], `${count} item${count === 1 ? '' : 's'}`);
    setText(this.rate, 'Up to 120 items/min');
  }
}
