import * as THREE from 'three';
import { getMachineDef } from '../core/factory/MachineRegistry';
import type { MachineState } from '../core/factory/MachineState';
import { machineStatus, STATUS_LABELS } from '../core/factory/MachineSystem';
import type { Simulation } from '../core/game/Simulation';
import { getRecipe } from '../core/recipes/RecipeRegistry';
import { getResource } from '../data/resources';
import type { Selection } from '../input/PlacementController';
import { machineCenter } from '../rendering/MachineRenderer';
import { el, setText } from './dom';
import { uiScale } from './preferences';

/** How long the cursor must rest on a machine before its card appears. */
const DWELL_SECONDS = 0.35;
/** Height above the ground that the card points at. */
const ANCHOR_HEIGHT = 1.7;

/**
 * A small card that appears beside a machine when the cursor rests on it: what it is, what it
 * makes, and how it is doing. Reading a factory this way needs no clicking and opens no panel.
 */
export class HoverCard {
  private readonly card: HTMLElement;
  private readonly name: HTMLElement;
  private readonly makes: HTMLElement;
  private readonly status: HTMLElement;
  private readonly busy: HTMLElement;
  private readonly point = new THREE.Vector3();
  private hoveredId: string | null = null;
  private dwell = 0;

  constructor(
    root: HTMLElement,
    private readonly sim: Simulation,
  ) {
    this.name = el('span', { class: 'hover-card-name' });
    this.makes = el('span', { class: 'hover-card-makes' });
    this.status = el('span', { class: 'status' });
    this.busy = el('span', { class: 'hover-card-busy' });
    this.card = el('div', { class: 'hover-card hidden', attrs: { 'aria-hidden': 'true' } }, [
      el('div', { class: 'hover-card-head' }, [this.name, this.status]),
      this.makes,
      this.busy,
    ]);
    root.append(this.card);
  }

  /**
   * Every frame. `hover` is what the cursor is on; the selected machine is skipped because
   * its full panel is already open.
   */
  update(realDt: number, hover: Selection, selection: Selection, camera: THREE.Camera, width: number, height: number): void {
    const machine =
      hover?.kind === 'machine' && hover.id !== selection?.id ? this.sim.state.factory.machines.get(hover.id) : undefined;
    if (!machine) {
      this.hoveredId = null;
      this.card.classList.add('hidden');
      return;
    }
    if (machine.id !== this.hoveredId) {
      this.hoveredId = machine.id;
      this.dwell = 0;
      this.card.classList.add('hidden');
    }
    this.dwell += realDt;
    if (this.dwell < DWELL_SECONDS) return;

    this.describe(machine);
    machineCenter(machine, this.point);
    this.point.y = ANCHOR_HEIGHT;
    this.point.project(camera);
    const scale = uiScale();
    const x = ((this.point.x * 0.5 + 0.5) * width) / scale;
    const y = ((-this.point.y * 0.5 + 0.5) * height) / scale;
    this.card.style.transform = `translate(-50%, -100%) translate(${x.toFixed(1)}px, ${(y - 12).toFixed(1)}px)`;
    this.card.classList.remove('hidden');
  }

  private describe(machine: MachineState): void {
    const def = getMachineDef(machine.type);
    const status = machineStatus(machine);
    setText(this.name, def.name);
    setText(this.status, STATUS_LABELS[status]);
    this.status.dataset.status = status;

    if (def.behavior !== 'crafter') {
      setText(this.makes, def.description);
      this.busy.classList.add('hidden');
      return;
    }
    const recipe = machine.recipeId ? getRecipe(machine.recipeId) : null;
    setText(this.makes, recipe ? `Makes ${getResource(recipe.outputs[0].resourceId).name}` : 'Nothing chosen to make');

    const shares = this.sim.metrics.shares(machine.id);
    this.busy.classList.remove('hidden');
    if (shares.observed < 3) {
      setText(this.busy, 'Measuring…');
      this.busy.dataset.level = '';
      return;
    }
    const lost =
      shares.waiting >= shares.blocked && shares.waiting > 0.02
        ? ` · waiting ${Math.round(shares.waiting * 100)}%`
        : shares.blocked > 0.02
          ? ` · backed up ${Math.round(shares.blocked * 100)}%`
          : '';
    setText(this.busy, `Working ${Math.round(shares.working * 100)}% of the time${lost}`);
    this.busy.dataset.level = shares.working >= 0.9 ? 'good' : shares.working >= 0.6 ? 'fair' : 'poor';
  }
}
