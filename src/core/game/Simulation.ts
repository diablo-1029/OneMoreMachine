import { buildCost, refundValue, sellValue } from '../economy/Pricing';
import type { ConveyorState } from '../factory/ConveyorState';
import {
  ConveyorNetwork,
  conveyorHasRoom,
  insertItem,
  resolveTarget,
  updateConveyors,
} from '../factory/ConveyorSystem';
import type { ItemState } from '../factory/ItemState';
import { footprintCells, getMachineDef, worldPorts } from '../factory/MachineRegistry';
import { createMachineState, type MachineState } from '../factory/MachineState';
import { machineAccepts, machineStatus, updateCrafter } from '../factory/MachineSystem';
import { routerAccepts, routerEntryLimit, routerInsert, updateRouter, type RouterHooks } from '../factory/RouterSystem';
import { FactoryMetrics } from '../stats/FactoryMetrics';
import { rotateDir, type Direction } from '../grid/GridPosition';
import { validatePlacement, type PlacementFailure } from '../grid/PlacementValidator';
import { defaultRecipeId, getRecipe, hasRecipe } from '../recipes/RecipeRegistry';
import { TICK_DT } from './Constants';
import { EventBus } from './EventBus';
import type { GameState } from './GameState';
import { advanceTutorial } from './Tutorial';

export interface SimulationEvents {
  machinePlaced: MachineState;
  machineRemoved: MachineState;
  /** Rotation or enabled state changed. */
  machineChanged: MachineState;
  machineProduced: { machine: MachineState; recipeId: string };
  conveyorPlaced: ConveyorState;
  conveyorRemoved: ConveyorState;
  /** Any change to what connects to what; belt shapes may need refreshing. */
  topologyChanged: undefined;
  itemSold: { machine: MachineState; resourceId: string; value: number };
  /** A crafting machine took an ingredient in. */
  itemEntered: { machine: MachineState; resourceId: string };
  tutorialAdvanced: number;
}

export type CommandFailure = PlacementFailure | 'cannot_afford' | 'not_found' | 'invalid_recipe';
export type CommandResult<T> = { ok: true; value: T } | { ok: false; reason: CommandFailure };

const fail = (reason: CommandFailure): { ok: false; reason: CommandFailure } => ({ ok: false, reason });

/**
 * Owns the game rules. Everything that changes GameState goes through here,
 * either as a player command or as part of a fixed-timestep tick.
 * Has no knowledge of rendering.
 */
export class Simulation {
  readonly events = new EventBus<SimulationEvents>();
  /** Live throughput and utilisation measurements; derived, never saved. */
  readonly metrics = new FactoryMetrics();
  private readonly network = new ConveyorNetwork();
  private tutorialTimer = 0;

  constructor(readonly state: GameState) {}

  // ---------------------------------------------------------------- tick

  tick(): void {
    const { factory, economy } = this.state;
    const dt = TICK_DT;
    this.state.simTime += dt;
    economy.advance(dt);
    this.metrics.advance(dt);

    updateConveyors(factory, this.network, dt, this.hooks);

    for (const machine of factory.machines.values()) {
      const behavior = getMachineDef(machine.type).behavior;
      if (behavior === 'router') {
        updateRouter(factory, machine, dt, this.hooks);
      } else if (behavior === 'storage') {
        this.pushOutputs(machine);
      } else if (behavior === 'crafter') {
        const finished = updateCrafter(machine, dt);
        if (finished) {
          for (const output of finished.outputs) {
            this.state.stats.produced[output.resourceId] =
              (this.state.stats.produced[output.resourceId] ?? 0) + output.amount;
            this.metrics.count('produced', output.resourceId, output.amount, machine.id);
          }
          for (const input of finished.inputs) this.metrics.count('consumed', input.resourceId, input.amount);
          this.events.emit('machineProduced', { machine, recipeId: finished.id });
        }
        this.pushOutputs(machine);
        this.metrics.sampleMachine(machine.id, machineStatus(machine), dt);
      }
    }

    this.tutorialTimer += dt;
    if (this.tutorialTimer >= 0.5) {
      this.tutorialTimer = 0;
      this.checkTutorial();
    }
  }

  /** Whether a machine would take one unit through the given input port right now. */
  private canDeliver(machine: MachineState, resourceId: string, port: number): boolean {
    const def = getMachineDef(machine.type);
    switch (def.behavior) {
      case 'router':
        return routerAccepts(this.state.factory, machine, port);
      case 'storage':
        return machine.enabled && machine.stored.length < (def.storageCapacity ?? 0);
      default:
        return machineAccepts(machine, resourceId);
    }
  }

  /** Hands one item to a machine through an input port. Reports whether it was taken. */
  private deliver(machine: MachineState, resourceId: string, port: number, from: Direction, item?: ItemState): boolean {
    if (!this.canDeliver(machine, resourceId, port)) return false;
    switch (getMachineDef(machine.type).behavior) {
      case 'router':
        routerInsert(this.state.factory, machine, port, from, resourceId, item);
        break;
      case 'storage':
        machine.stored.push(resourceId);
        break;
      case 'seller': {
        const value = sellValue(resourceId);
        this.state.economy.earn(value);
        this.state.stats.sold[resourceId] = (this.state.stats.sold[resourceId] ?? 0) + 1;
        this.metrics.count('sold', resourceId, 1);
        this.events.emit('itemSold', { machine, resourceId, value });
        break;
      }
      default:
        machine.inputInventory[resourceId] = (machine.inputInventory[resourceId] ?? 0) + 1;
        this.events.emit('itemEntered', { machine, resourceId });
    }
    return true;
  }

  /** The callbacks belts and routers use to hand items to machines. */
  private readonly hooks: RouterHooks = {
    deliver: (machine, resourceId, port, from, item) => this.deliver(machine, resourceId, port, from, item),
    canDeliver: (machine, resourceId, port) => this.canDeliver(machine, resourceId, port),
    entryLimit: (machine) =>
      getMachineDef(machine.type).behavior === 'router' ? routerEntryLimit(machine) : Infinity,
  };

  /** The next item a machine wants to send out, if any: a finished product, or the oldest stored item. */
  private nextOutput(machine: MachineState): string | undefined {
    if (getMachineDef(machine.type).behavior === 'storage') return machine.stored[0];
    return Object.keys(machine.outputInventory).find((id) => machine.outputInventory[id] > 0);
  }

  /** Moves at most one item per output port onto whatever the port connects to. */
  private pushOutputs(machine: MachineState): void {
    if (!machine.enabled) return;
    const { factory } = this.state;
    const def = getMachineDef(machine.type);
    for (const port of worldPorts(def, machine.gridX, machine.gridY, machine.rotation)) {
      if (port.type !== 'output') continue;
      const resourceId = this.nextOutput(machine);
      if (!resourceId) return;
      const target = resolveTarget(factory, port.x, port.y, port.side);
      if (!target) continue;
      if (target.kind === 'conveyor') {
        if (!conveyorHasRoom(target.conveyor)) continue;
        insertItem(factory, target.conveyor, resourceId, port.side);
      } else if (!this.deliver(target.machine, resourceId, target.port, port.side)) {
        continue;
      }
      if (def.behavior === 'storage') machine.stored.shift();
      else machine.outputInventory[resourceId]--;
    }
  }

  private checkTutorial(): void {
    if (advanceTutorial(this.state)) this.events.emit('tutorialAdvanced', this.state.tutorialStep);
  }

  // ------------------------------------------------------------ commands

  canPlaceMachine(type: string, gridX: number, gridY: number, rotation: Direction): CommandResult<null> {
    const { factory, economy } = this.state;
    const cells = footprintCells(getMachineDef(type), gridX, gridY, rotation);
    const check = validatePlacement(factory.grid, factory.occupancy, cells);
    if (!check.valid) return fail(check.reason);
    if (!economy.canAfford(buildCost(type))) return fail('cannot_afford');
    return { ok: true, value: null };
  }

  /** Whether the player may currently use a recipe at all. Everything is available until research gates it. */
  isRecipeAvailable(recipeId: string): boolean {
    return hasRecipe(recipeId);
  }

  /** Whether a machine of this type may run the recipe. */
  canUseRecipe(type: string, recipeId: string): boolean {
    return hasRecipe(recipeId) && getRecipe(recipeId).machineType === type;
  }

  /** `recipeId` picks what the machine makes; omitted, it starts on the type's first recipe. */
  placeMachine(
    type: string,
    gridX: number,
    gridY: number,
    rotation: Direction,
    recipeId?: string,
  ): CommandResult<MachineState> {
    const check = this.canPlaceMachine(type, gridX, gridY, rotation);
    if (!check.ok) return check;
    if (recipeId !== undefined && !this.canUseRecipe(type, recipeId)) return fail('invalid_recipe');
    const { factory, economy } = this.state;
    economy.spend(buildCost(type));
    const machine = createMachineState(
      factory.newEntityId('m'),
      type,
      gridX,
      gridY,
      rotation,
      recipeId ?? defaultRecipeId(type),
    );
    factory.addMachine(machine);
    this.topologyChanged();
    this.events.emit('machinePlaced', machine);
    this.checkTutorial();
    return { ok: true, value: machine };
  }

  canPlaceConveyor(gridX: number, gridY: number): CommandResult<null> {
    const { factory, economy } = this.state;
    const check = validatePlacement(factory.grid, factory.occupancy, [{ x: gridX, y: gridY }]);
    if (!check.valid) return fail(check.reason);
    if (!economy.canAfford(buildCost('conveyor'))) return fail('cannot_afford');
    return { ok: true, value: null };
  }

  placeConveyor(gridX: number, gridY: number, direction: Direction): CommandResult<ConveyorState> {
    const check = this.canPlaceConveyor(gridX, gridY);
    if (!check.ok) return check;
    const { factory, economy } = this.state;
    economy.spend(buildCost('conveyor'));
    const conveyor: ConveyorState = {
      id: factory.newEntityId('c'),
      gridX,
      gridY,
      direction,
      items: [],
    };
    factory.addConveyor(conveyor);
    this.topologyChanged();
    this.events.emit('conveyorPlaced', conveyor);
    this.checkTutorial();
    return { ok: true, value: conveyor };
  }

  setConveyorDirection(id: string, direction: Direction): boolean {
    const conveyor = this.state.factory.conveyors.get(id);
    if (!conveyor || conveyor.direction === direction) return false;
    conveyor.direction = direction;
    this.topologyChanged();
    return true;
  }

  rotateMachine(id: string): CommandResult<MachineState> {
    const { factory } = this.state;
    const machine = factory.machines.get(id);
    if (!machine) return fail('not_found');
    const rotation = rotateDir(machine.rotation, 1);
    const cells = footprintCells(getMachineDef(machine.type), machine.gridX, machine.gridY, rotation);
    const check = validatePlacement(factory.grid, factory.occupancy, cells, machine.id);
    if (!check.valid) return fail(check.reason);
    factory.occupancy.release(factory.machineCells(machine));
    machine.rotation = rotation;
    factory.occupancy.occupy(cells, { kind: 'machine', id: machine.id });
    this.topologyChanged();
    this.events.emit('machineChanged', machine);
    return { ok: true, value: machine };
  }

  /**
   * Switches what a machine makes. The craft in progress is abandoned and ingredients the
   * new recipe cannot use are discarded; finished products still leave as normal.
   */
  setRecipe(id: string, recipeId: string): CommandResult<MachineState> {
    const machine = this.state.factory.machines.get(id);
    if (!machine) return fail('not_found');
    if (!this.canUseRecipe(machine.type, recipeId)) return fail('invalid_recipe');
    if (machine.recipeId === recipeId) return { ok: true, value: machine };

    const recipe = getRecipe(recipeId);
    const kept: Record<string, number> = {};
    for (const input of recipe.inputs) {
      const held = machine.inputInventory[input.resourceId] ?? 0;
      if (held > 0) kept[input.resourceId] = held;
    }
    machine.recipeId = recipeId;
    machine.inputInventory = kept;
    machine.active = false;
    machine.progress = 0;
    // Its past efficiency says nothing about the new job.
    this.metrics.forgetMachine(machine.id);
    this.events.emit('machineChanged', machine);
    return { ok: true, value: machine };
  }

  setMachineEnabled(id: string, enabled: boolean): void {
    const machine = this.state.factory.machines.get(id);
    if (!machine || machine.enabled === enabled) return;
    machine.enabled = enabled;
    this.events.emit('machineChanged', machine);
  }

  /** Removes whatever occupies the cell and refunds it. Items on or in it are lost. */
  removeAt(gridX: number, gridY: number): CommandResult<'machine' | 'conveyor'> {
    const { factory, economy } = this.state;
    const occupant = factory.occupancy.get(gridX, gridY);
    if (!occupant) return fail('not_found');

    if (occupant.kind === 'machine') {
      const machine = factory.machines.get(occupant.id)!;
      factory.removeMachine(machine);
      this.metrics.forgetMachine(machine.id);
      economy.refund(refundValue(machine.type));
      this.topologyChanged();
      this.events.emit('machineRemoved', machine);
    } else {
      const conveyor = factory.conveyors.get(occupant.id)!;
      factory.removeConveyor(conveyor);
      economy.refund(refundValue('conveyor'));
      this.topologyChanged();
      this.events.emit('conveyorRemoved', conveyor);
    }
    return { ok: true, value: occupant.kind };
  }

  private topologyChanged(): void {
    this.network.invalidate();
    this.events.emit('topologyChanged', undefined);
  }
}
