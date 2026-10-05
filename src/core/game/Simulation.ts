import type { AchievementDefinition } from '../../data/achievements';
import { getEnvironment, type EnvironmentDefinition } from '../../data/environments';
import { checkAchievements } from '../achievements/Achievements';
import { blueprintCells, blueprintCost, type Blueprint } from '../blueprints/Blueprint';
import { fillContracts, type Contract } from '../contracts/Contracts';
import { buildCost, machineRefund, refundValue, sellValue, upgradeCost } from '../economy/Pricing';
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
import { bridgeAccepts, bridgeEntryLimit, bridgeInsert, updateBridge } from '../factory/BridgeSystem';
import { computePower, type PowerStatus } from '../power/Power';
import { FactoryMetrics } from '../stats/FactoryMetrics';
import { oppositeDir, rotateDir, type Direction } from '../grid/GridPosition';
import { validatePlacement, type PlacementFailure } from '../grid/PlacementValidator';
import { getRecipe, hasRecipe, recipesFor } from '../recipes/RecipeRegistry';
import {
  getResearchNode,
  researchForUpgrade,
  researchStatus,
  unlockedMachines,
  unlockedRecipes,
} from '../research/Research';
import { MAX_MACHINE_LEVEL, getUpgradeLevel, type UpgradeLevel } from '../../data/upgrades';
import { nextExpansion, type ExpansionStep } from '../../data/expansion';
import type { ResearchNode } from '../../data/research';
import { TICK_DT } from './Constants';
import { EventBus } from './EventBus';
import type { GameState } from './GameState';
import { saleMultiplier } from './Prestige';
import { advanceTutorial } from './Tutorial';

export interface SimulationEvents {
  machinePlaced: MachineState;
  machineRemoved: MachineState;
  /** Rotation or enabled state changed. */
  machineChanged: MachineState;
  machineUpgraded: MachineState;
  machineProduced: { machine: MachineState; recipeId: string };
  conveyorPlaced: ConveyorState;
  conveyorRemoved: ConveyorState;
  /** Any change to what connects to what; belt shapes may need refreshing. */
  topologyChanged: undefined;
  itemSold: { machine: MachineState; resourceId: string; value: number };
  /** A crafting machine took an ingredient in. */
  itemEntered: { machine: MachineState; resourceId: string };
  tutorialAdvanced: number;
  researchCompleted: ResearchNode;
  contractCompleted: Contract;
  /** One or more achievements were earned in the same check. */
  achievementsUnlocked: AchievementDefinition[];
  /** The floor grew; every grid coordinate has shifted by (dx, dy). */
  factoryExpanded: { width: number; height: number; dx: number; dy: number };
}

export type CommandFailure =
  | PlacementFailure
  | 'cannot_afford'
  | 'not_found'
  | 'invalid_recipe'
  | 'not_researched'
  | 'already_researched'
  | 'max_size'
  | 'max_level'
  | 'not_upgradable'
  | 'empty';
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
  /** Supply, demand and the resulting machine speed, as of the last tick. Derived, never saved. */
  power: PowerStatus = { supply: 0, demand: 0, ratio: 1 };
  /** The site this factory stands on, with its modifiers. */
  readonly environment: EnvironmentDefinition;
  private tutorialTimer = 0;
  private achievementTimer = 0;

  constructor(readonly state: GameState) {
    this.environment = getEnvironment(state.environment);
    fillContracts(state.contracts, state.research);
    this.power = computePower(state.factory, state.power, this.environment);
  }

  // ---------------------------------------------------------------- tick

  tick(): void {
    const { factory, economy } = this.state;
    const dt = TICK_DT;
    this.state.simTime += dt;
    economy.advance(dt);
    this.metrics.advance(dt);

    updateConveyors(factory, this.network, dt, this.hooks);

    // Short of power, every crafting machine runs slower by the same proportion.
    this.power = computePower(factory, this.state.power, this.environment);
    const craftDt = dt * this.power.ratio;

    for (const machine of factory.machines.values()) {
      const behavior = getMachineDef(machine.type).behavior;
      if (behavior === 'router') {
        updateRouter(factory, machine, dt, this.hooks);
      } else if (behavior === 'bridge') {
        updateBridge(factory, machine, dt, this.hooks);
      } else if (behavior === 'storage') {
        this.pushOutputs(machine);
      } else if (behavior === 'crafter') {
        const finished = updateCrafter(machine, craftDt, this.environment);
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
      this.checkRateContracts();
    }

    this.achievementTimer += dt;
    if (this.achievementTimer >= 1) {
      this.achievementTimer = 0;
      const unlocked = checkAchievements(this);
      if (unlocked.length > 0) this.events.emit('achievementsUnlocked', unlocked);
    }
  }

  // ----------------------------------------------------------- contracts

  /** What the factory currently sells per minute, so new orders are sized to it. */
  private readonly salesRate = (resourceId: string): number => this.state.contracts.bestRate[resourceId] ?? 0;

  /** Credits a sale to every "deliver" contract for that resource. */
  private advanceContracts(resourceId: string): void {
    for (const contract of [...this.state.contracts.active]) {
      if (contract.kind !== 'deliver' || contract.resourceId !== resourceId) continue;
      contract.progress++;
      if (contract.progress >= contract.target) this.completeContract(contract);
    }
  }

  /** "Rate" contracts are met once a full minute's sales reach the target. */
  private checkRateContracts(): void {
    // Keep the record of the best minute so far for each resource being sold.
    const { bestRate } = this.state.contracts;
    for (const resourceId of Object.keys(this.state.stats.sold)) {
      const lastMinute = this.metrics.windowTotal('sold', resourceId);
      if (lastMinute > (bestRate[resourceId] ?? 0)) bestRate[resourceId] = lastMinute;
    }
    for (const contract of [...this.state.contracts.active]) {
      if (contract.kind !== 'rate') continue;
      if (this.metrics.windowTotal('sold', contract.resourceId) >= contract.target) this.completeContract(contract);
    }
  }

  private completeContract(contract: Contract): void {
    const { contracts, economy, research } = this.state;
    contracts.active = contracts.active.filter((c) => c.id !== contract.id);
    contracts.completed++;
    economy.award(contract.reward);
    this.events.emit('contractCompleted', contract);
    fillContracts(contracts, research, this.salesRate);
  }

  /**
   * Credits sales that were not played out item by item (offline progress): the money, the
   * totals, and progress on delivery contracts, just as if a Seller had taken each one.
   */
  creditSales(resourceId: string, count: number): void {
    if (count <= 0) return;
    this.state.economy.award(this.salePrice(resourceId) * count);
    this.state.stats.sold[resourceId] = (this.state.stats.sold[resourceId] ?? 0) + count;
    for (const contract of [...this.state.contracts.active]) {
      if (contract.kind !== 'deliver' || contract.resourceId !== resourceId) continue;
      contract.progress = Math.min(contract.progress + count, contract.target);
      if (contract.progress >= contract.target) this.completeContract(contract);
    }
  }

  /** Trades a contract for a fresh one. Free, so an awkward order never blocks a slot. */
  swapContract(id: number): boolean {
    const { contracts, research } = this.state;
    if (!contracts.active.some((c) => c.id === id)) return false;
    contracts.active = contracts.active.filter((c) => c.id !== id);
    fillContracts(contracts, research, this.salesRate);
    return true;
  }

  /** What one unit sells for: its base value raised by the stars earned from earlier factories. */
  salePrice(resourceId: string): number {
    return sellValue(resourceId) * saleMultiplier(this.state.prestige.stars);
  }

  /** Whether a machine would take one unit through the given input port right now. */
  private canDeliver(machine: MachineState, resourceId: string, port: number): boolean {
    const def = getMachineDef(machine.type);
    switch (def.behavior) {
      case 'router':
        return routerAccepts(this.state.factory, machine, port);
      case 'bridge': {
        // The hatch it would come in through says which way it is travelling.
        const side = worldPorts(def, machine.gridX, machine.gridY, machine.rotation)[port].side;
        return bridgeAccepts(machine, oppositeDir(side));
      }
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
      case 'bridge':
        bridgeInsert(this.state.factory, machine, from, resourceId, item);
        break;
      case 'storage':
        machine.stored.push(resourceId);
        break;
      case 'seller': {
        const value = this.salePrice(resourceId);
        this.state.economy.earn(value);
        this.state.stats.sold[resourceId] = (this.state.stats.sold[resourceId] ?? 0) + 1;
        this.metrics.count('sold', resourceId, 1);
        this.events.emit('itemSold', { machine, resourceId, value });
        this.advanceContracts(resourceId);
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
    entryLimit: (machine, from) => {
      const behavior = getMachineDef(machine.type).behavior;
      if (behavior === 'router') return routerEntryLimit(machine);
      if (behavior === 'bridge') return bridgeEntryLimit(machine, from);
      return Infinity;
    },
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
    if (!this.isMachineUnlocked(type)) return fail('not_researched');
    const cells = footprintCells(getMachineDef(type), gridX, gridY, rotation);
    const check = validatePlacement(factory.grid, factory.occupancy, cells);
    if (!check.valid) return fail(check.reason);
    if (!economy.canAfford(buildCost(type))) return fail('cannot_afford');
    return { ok: true, value: null };
  }

  // ---------------------------------------------------------- blueprints

  /**
   * Whether a whole blueprint fits with its top-left corner at (gridX, gridY). It is all or
   * nothing: every cell must be free, every machine researched, and the total affordable.
   */
  canPlaceBlueprint(blueprint: Blueprint, gridX: number, gridY: number): CommandResult<null> {
    const { factory, economy } = this.state;
    if (blueprint.machines.length + blueprint.conveyors.length === 0) return fail('empty');
    if (blueprint.machines.some((machine) => !this.isMachineUnlocked(machine.type))) return fail('not_researched');
    const check = validatePlacement(factory.grid, factory.occupancy, blueprintCells(blueprint, gridX, gridY));
    if (!check.valid) return fail(check.reason);
    if (!economy.canAfford(blueprintCost(blueprint))) return fail('cannot_afford');
    return { ok: true, value: null };
  }

  /** Builds everything in a blueprint, or nothing at all. Returns how many pieces were placed. */
  placeBlueprint(blueprint: Blueprint, gridX: number, gridY: number): CommandResult<number> {
    const check = this.canPlaceBlueprint(blueprint, gridX, gridY);
    if (!check.ok) return check;
    for (const machine of blueprint.machines) {
      // A recipe that has since become unavailable falls back to the machine's default.
      const recipeId =
        machine.recipeId && this.canUseRecipe(machine.type, machine.recipeId) ? machine.recipeId : undefined;
      this.placeMachine(machine.type, gridX + machine.x, gridY + machine.y, machine.rotation, recipeId);
    }
    for (const conveyor of blueprint.conveyors) {
      this.placeConveyor(gridX + conveyor.x, gridY + conveyor.y, conveyor.direction);
    }
    return { ok: true, value: blueprint.machines.length + blueprint.conveyors.length };
  }

  // ------------------------------------------------------------ upgrades

  /**
   * The next upgrade for a machine: what it would become, what it costs, and the research
   * still needed before it can be bought (null when none). Null if it cannot be upgraded further.
   */
  upgradeOffer(machine: MachineState): { next: UpgradeLevel; cost: number; needsResearch: ResearchNode | null } | null {
    if (getMachineDef(machine.type).behavior !== 'crafter' || machine.level >= MAX_MACHINE_LEVEL) return null;
    const next = getUpgradeLevel(machine.level + 1);
    const node = researchForUpgrade(next.level);
    return {
      next,
      cost: upgradeCost(machine.type, next.level),
      needsResearch: node && !this.state.research.includes(node.id) ? node : null,
    };
  }

  /** Raises a machine one level. Work in progress carries on, just faster. */
  upgradeMachine(id: string): CommandResult<MachineState> {
    const machine = this.state.factory.machines.get(id);
    if (!machine) return fail('not_found');
    if (getMachineDef(machine.type).behavior !== 'crafter') return fail('not_upgradable');
    const offer = this.upgradeOffer(machine);
    if (!offer) return fail('max_level');
    if (offer.needsResearch) return fail('not_researched');
    if (!this.state.economy.spend(offer.cost)) return fail('cannot_afford');
    machine.level = offer.next.level;
    // Its efficiency so far was measured at the old speed.
    this.metrics.forgetMachine(machine.id);
    this.events.emit('machineUpgraded', machine);
    return { ok: true, value: machine };
  }

  // ----------------------------------------------------------- expansion

  /** The next floor size on offer, or null once the factory is as large as it can get. */
  nextExpansion(): ExpansionStep | null {
    const { width, height } = this.state.factory.grid;
    return nextExpansion(Math.max(width, height));
  }

  /** Buys the next floor size. Nothing that is already built moves on the ground. */
  expandFactory(): CommandResult<ExpansionStep> {
    const step = this.nextExpansion();
    if (!step) return fail('max_size');
    if (!this.state.economy.spend(step.cost)) return fail('cannot_afford');
    const { dx, dy } = this.state.factory.expand(step.size, step.size);
    this.events.emit('factoryExpanded', { width: step.size, height: step.size, dx, dy });
    this.topologyChanged();
    return { ok: true, value: step };
  }

  // ------------------------------------------------------------ research

  isMachineUnlocked(type: string): boolean {
    return type === 'conveyor' || unlockedMachines(this.state.research).includes(type);
  }

  /** Whether research has made a recipe available to the player. */
  isRecipeAvailable(recipeId: string): boolean {
    return unlockedRecipes(this.state.research).includes(recipeId);
  }

  /** Whether a machine of this type may run the recipe: it must be its own, and researched. */
  canUseRecipe(type: string, recipeId: string): boolean {
    return hasRecipe(recipeId) && getRecipe(recipeId).machineType === type && this.isRecipeAvailable(recipeId);
  }

  /** The recipe a newly built machine starts on: the first one of its type that is researched. */
  private startingRecipe(type: string): string | null {
    return recipesFor(type).find((recipe) => this.isRecipeAvailable(recipe.id))?.id ?? null;
  }

  /** Buys a research node. It completes immediately. */
  research(id: string): CommandResult<ResearchNode> {
    const node = getResearchNode(id);
    if (!node) return fail('not_found');
    const status = researchStatus(this.state.research, node);
    if (status === 'done') return fail('already_researched');
    if (status === 'locked') return fail('not_researched');
    if (!this.state.economy.spend(node.cost)) return fail('cannot_afford');
    this.state.research.push(node.id);
    this.events.emit('researchCompleted', node);
    this.checkTutorial();
    return { ok: true, value: node };
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
      recipeId ?? this.startingRecipe(type),
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
      economy.refund(machineRefund(machine.type, machine.level));
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
