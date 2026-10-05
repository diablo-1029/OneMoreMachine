import { BELT_STYLES, FLOOR_STYLES, LIGHT_STYLES } from '../../data/cosmetics';
import { getEnvironment } from '../../data/environments';
import { isResource } from '../../data/resources';
import { MAX_MACHINE_LEVEL } from '../../data/upgrades';
import { isAchievementId } from '../achievements/Achievements';
import type { Contract, ContractState } from '../contracts/Contracts';
import { Economy } from '../economy/Economy';
import { FactoryState } from '../factory/FactoryState';
import type { ItemState } from '../factory/ItemState';
import { footprintCells, getMachineDef, isMachineType } from '../factory/MachineRegistry';
import type { Inventory, MachineState } from '../factory/MachineState';
import { SAVE_VERSION } from '../game/Constants';
import type { GameState } from '../game/GameState';
import { isDirection } from '../grid/GridPosition';
import { validatePlacement } from '../grid/PlacementValidator';
import { hasRecipe } from '../recipes/RecipeRegistry';
import { isResearchId } from '../research/Research';
import { migrateSave } from './Migration';
import { DEFAULT_SETTINGS, SaveError, UI_SCALES, type GameSettings, type SaveData } from './SaveSchema';

export function serializeGame(state: GameState, settings: GameSettings): SaveData {
  const { factory, economy } = state;
  const items: ItemState[] = [];
  for (const conveyor of factory.conveyors.values()) {
    for (const item of conveyor.items) items.push({ ...item });
  }
  return {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    economy: { money: economy.money, totalEarned: economy.totalEarned },
    factory: {
      width: factory.grid.width,
      height: factory.grid.height,
      machines: [...factory.machines.values()].map((m) => ({
        ...m,
        inputInventory: { ...m.inputInventory },
        outputInventory: { ...m.outputInventory },
        transit: m.transit.map((item) => ({ ...item })),
        stored: [...m.stored],
      })),
      conveyors: [...factory.conveyors.values()].map((c) => ({
        id: c.id,
        gridX: c.gridX,
        gridY: c.gridY,
        direction: c.direction,
      })),
      items,
    },
    stats: { produced: { ...state.stats.produced }, sold: { ...state.stats.sold } },
    simTime: state.simTime,
    tutorialStep: state.tutorialStep,
    research: [...state.research],
    power: { baseSupply: state.power.baseSupply },
    achievements: [...state.achievements],
    environment: state.environment,
    prestige: { ...state.prestige },
    contracts: {
      active: state.contracts.active.map((contract) => ({ ...contract })),
      completed: state.contracts.completed,
      nextId: state.contracts.nextId,
      bestRate: { ...state.contracts.bestRate },
    },
    settings: { ...settings, cosmetics: { ...settings.cosmetics } },
  };
}

// ------------------------------------------------------------ validation

function must(condition: boolean, message: string): asserts condition {
  if (!condition) throw new SaveError(message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function finite(value: unknown, message: string): number {
  must(typeof value === 'number' && Number.isFinite(value), message);
  return value;
}

function integer(value: unknown, message: string): number {
  const n = finite(value, message);
  must(Number.isInteger(n), message);
  return n;
}

function text(value: unknown, message: string): string {
  must(typeof value === 'string' && value.length > 0, message);
  return value;
}

function counts(value: unknown, message: string): Inventory {
  must(isRecord(value), message);
  const result: Inventory = {};
  for (const [key, count] of Object.entries(value)) {
    must(isResource(key), `${message}: unknown resource ${key}`);
    const n = finite(count, message);
    must(n >= 0, message);
    result[key] = n;
  }
  return result;
}

/** Reads one belt or router item. `tileX/tileY` are checked by the caller, which knows where it must sit. */
function parseItem(entry: unknown): ItemState {
  must(isRecord(entry), 'Invalid item');
  const resourceId = text(entry.resourceId, 'Invalid item resource');
  must(isResource(resourceId), `Unknown resource ${resourceId}`);
  must(isDirection(entry.from), 'Invalid item direction');
  must(entry.to === undefined || isDirection(entry.to), 'Invalid item exit');
  const item: ItemState = {
    id: integer(entry.id, 'Invalid item id'),
    resourceId,
    tileX: integer(entry.tileX, 'Invalid item position'),
    tileY: integer(entry.tileY, 'Invalid item position'),
    progress: Math.min(Math.max(finite(entry.progress, 'Invalid item progress'), 0), 1),
    from: entry.from,
  };
  if (entry.to !== undefined) item.to = entry.to;
  return item;
}

function parseContracts(raw: unknown): ContractState {
  must(isRecord(raw), 'Missing contracts');
  must(Array.isArray(raw.active), 'Invalid contract list');
  const active: Contract[] = [];
  let maxId = 0;
  for (const entry of raw.active as unknown[]) {
    must(isRecord(entry), 'Invalid contract');
    must(entry.kind === 'deliver' || entry.kind === 'rate', 'Invalid contract kind');
    const resourceId = text(entry.resourceId, 'Invalid contract resource');
    must(isResource(resourceId), `Unknown resource ${resourceId}`);
    const target = integer(entry.target, 'Invalid contract target');
    must(target > 0, 'Invalid contract target');
    const contract: Contract = {
      id: integer(entry.id, 'Invalid contract id'),
      kind: entry.kind,
      resourceId,
      target,
      progress: Math.min(Math.max(integer(entry.progress ?? 0, 'Invalid contract progress'), 0), target),
      reward: Math.max(0, finite(entry.reward, 'Invalid contract reward')),
    };
    must(!active.some((other) => other.id === contract.id), 'Duplicate contract id');
    active.push(contract);
    maxId = Math.max(maxId, contract.id);
  }
  return {
    active,
    completed: Math.max(0, integer(raw.completed ?? 0, 'Invalid contract count')),
    // Never reuse an id: the id decides what a generated contract asks for.
    nextId: Math.max(integer(raw.nextId ?? 1, 'Invalid contract counter'), maxId + 1, 1),
    // Added after contracts first shipped; older saves simply start the record afresh.
    bestRate: counts(raw.bestRate ?? {}, 'Invalid sales record'),
  };
}

/** Highest numeric suffix among entity ids like "m12", so new ids never collide. */
function idNumber(id: string): number {
  const match = /(\d+)$/.exec(id);
  return match ? Number(match[1]) : 0;
}

/**
 * Rebuilds a GameState from stored data. Every field is checked and every entity is
 * re-placed through the same validator the game uses, so a corrupt save fails loudly
 * here instead of producing a broken factory.
 */
export function restoreGame(raw: unknown): GameState {
  const save = migrateSave(raw);

  must(isRecord(save.economy), 'Missing economy');
  const money = finite(save.economy.money, 'Invalid money');
  must(money >= 0, 'Invalid money');
  const totalEarned = finite(save.economy.totalEarned ?? 0, 'Invalid earnings');

  must(isRecord(save.factory), 'Missing factory');
  const width = integer(save.factory.width, 'Invalid grid width');
  const height = integer(save.factory.height, 'Invalid grid height');
  must(width >= 4 && width <= 64 && height >= 4 && height <= 64, 'Invalid grid size');

  const factory = new FactoryState(width, height);
  const seenIds = new Set<string>();
  let maxEntity = 0;
  let maxItem = 0;

  must(Array.isArray(save.factory.machines), 'Invalid machine list');
  for (const entry of save.factory.machines as unknown[]) {
    must(isRecord(entry), 'Invalid machine');
    const id = text(entry.id, 'Invalid machine id');
    const type = text(entry.type, 'Invalid machine type');
    must(isMachineType(type), `Unknown machine type ${type}`);
    must(!seenIds.has(id), 'Duplicate entity id');
    must(isDirection(entry.rotation), 'Invalid machine rotation');
    const recipeId = entry.recipeId === null ? null : text(entry.recipeId, 'Invalid recipe');
    must(recipeId === null || hasRecipe(recipeId), 'Unknown recipe');

    const machine: MachineState = {
      id,
      type,
      gridX: integer(entry.gridX, 'Invalid machine position'),
      gridY: integer(entry.gridY, 'Invalid machine position'),
      rotation: entry.rotation,
      enabled: entry.enabled !== false,
      recipeId,
      active: entry.active === true,
      progress: Math.min(Math.max(finite(entry.progress ?? 0, 'Invalid progress'), 0), 1),
      inputInventory: counts(entry.inputInventory ?? {}, 'Invalid input inventory'),
      outputInventory: counts(entry.outputInventory ?? {}, 'Invalid output inventory'),
      transit: [],
      routeIndex: Math.max(0, integer(entry.routeIndex ?? 0, 'Invalid route index')),
      lastInput: integer(entry.lastInput ?? -1, 'Invalid input index'),
      stored: [],
      level: integer(entry.level ?? 1, 'Invalid machine level'),
    };
    const def = getMachineDef(type);
    must(machine.level >= 1 && machine.level <= MAX_MACHINE_LEVEL, 'Invalid machine level');
    must(machine.level === 1 || def.behavior === 'crafter', 'Only crafting machines can be upgraded');

    must(Array.isArray(entry.transit ?? []), 'Invalid transit list');
    for (const raw of (entry.transit ?? []) as unknown[]) {
      must(def.behavior === 'router' || def.behavior === 'bridge', 'Only routers and bridges carry items');
      const item = parseItem(raw);
      item.tileX = machine.gridX;
      item.tileY = machine.gridY;
      machine.transit.push(item);
      maxItem = Math.max(maxItem, item.id);
    }
    machine.transit.sort((a, b) => b.progress - a.progress);

    must(Array.isArray(entry.stored ?? []), 'Invalid storage contents');
    for (const raw of (entry.stored ?? []) as unknown[]) {
      const resourceId = text(raw, 'Invalid stored resource');
      must(isResource(resourceId), `Unknown resource ${resourceId}`);
      machine.stored.push(resourceId);
    }
    must(machine.stored.length <= (def.storageCapacity ?? 0), 'Storage holds more than it can');

    const cells = footprintCells(def, machine.gridX, machine.gridY, machine.rotation);
    must(validatePlacement(factory.grid, factory.occupancy, cells).valid, 'Machine placement is invalid');
    factory.addMachine(machine);
    seenIds.add(id);
    maxEntity = Math.max(maxEntity, idNumber(id));
  }

  must(Array.isArray(save.factory.conveyors), 'Invalid conveyor list');
  for (const entry of save.factory.conveyors as unknown[]) {
    must(isRecord(entry), 'Invalid conveyor');
    const id = text(entry.id, 'Invalid conveyor id');
    must(!seenIds.has(id), 'Duplicate entity id');
    must(isDirection(entry.direction), 'Invalid conveyor direction');
    const gridX = integer(entry.gridX, 'Invalid conveyor position');
    const gridY = integer(entry.gridY, 'Invalid conveyor position');
    must(
      validatePlacement(factory.grid, factory.occupancy, [{ x: gridX, y: gridY }]).valid,
      'Conveyor placement is invalid',
    );
    factory.addConveyor({ id, gridX, gridY, direction: entry.direction, items: [] });
    seenIds.add(id);
    maxEntity = Math.max(maxEntity, idNumber(id));
  }

  must(Array.isArray(save.factory.items), 'Invalid item list');
  for (const entry of save.factory.items as unknown[]) {
    const item = parseItem(entry);
    const conveyor = factory.conveyorAt(item.tileX, item.tileY);
    must(conveyor !== undefined, 'Item is not on a conveyor');
    delete item.to;
    conveyor.items.push(item);
    maxItem = Math.max(maxItem, item.id);
  }
  for (const conveyor of factory.conveyors.values()) {
    conveyor.items.sort((a, b) => b.progress - a.progress);
  }

  factory.nextEntityId = maxEntity + 1;
  factory.nextItemId = maxItem + 1;

  const stats = isRecord(save.stats) ? save.stats : {};
  const economy = new Economy(money);
  economy.totalEarned = totalEarned;

  return {
    factory,
    economy,
    simTime: finite(save.simTime ?? 0, 'Invalid sim time'),
    stats: {
      produced: counts(stats.produced ?? {}, 'Invalid stats'),
      sold: counts(stats.sold ?? {}, 'Invalid stats'),
    },
    tutorialStep: integer(save.tutorialStep ?? 0, 'Invalid tutorial step'),
    // Ids this version does not know (e.g. from a removed node) are dropped rather than failing the load.
    research: Array.isArray(save.research)
      ? [...new Set(save.research.filter((id): id is string => typeof id === 'string' && isResearchId(id)))]
      : [],
    contracts: parseContracts(save.contracts),
    prestige: {
      stars: Math.max(0, integer(isRecord(save.prestige) ? save.prestige.stars : undefined, 'Invalid star count')),
      count: Math.max(0, integer(isRecord(save.prestige) ? save.prestige.count : undefined, 'Invalid prestige count')),
    },
    // An environment from a newer version falls back to the standard one rather than failing the load.
    environment: getEnvironment(typeof save.environment === 'string' ? save.environment : '').id,
    achievements: Array.isArray(save.achievements)
      ? [...new Set(save.achievements.filter((id): id is string => typeof id === 'string' && isAchievementId(id)))]
      : [],
    power: {
      baseSupply: Math.max(0, finite(isRecord(save.power) ? save.power.baseSupply : undefined, 'Invalid power supply')),
    },
  };
}

/** Reads settings from untrusted data, falling back to defaults field by field. */
export function parseSettings(raw: unknown): GameSettings {
  const settings = { ...DEFAULT_SETTINGS, cosmetics: { ...DEFAULT_SETTINGS.cosmetics } };
  if (!isRecord(raw)) return settings;
  if (isRecord(raw.cosmetics)) {
    // Each choice must name a style that exists; anything else keeps the default.
    const { floor, belt, light } = raw.cosmetics;
    if (FLOOR_STYLES.some((s) => s.id === floor)) settings.cosmetics.floor = floor as string;
    if (BELT_STYLES.some((s) => s.id === belt)) settings.cosmetics.belt = belt as string;
    if (LIGHT_STYLES.some((s) => s.id === light)) settings.cosmetics.light = light as string;
  }
  if (typeof raw.masterVolume === 'number' && Number.isFinite(raw.masterVolume)) {
    settings.masterVolume = Math.min(Math.max(raw.masterVolume, 0), 1);
  }
  if (typeof raw.sfx === 'boolean') settings.sfx = raw.sfx;
  if (typeof raw.music === 'boolean') settings.music = raw.music;
  if (typeof raw.shadows === 'boolean') settings.shadows = raw.shadows;
  if (raw.reduceMotion === 'system' || raw.reduceMotion === 'on' || raw.reduceMotion === 'off') {
    settings.reduceMotion = raw.reduceMotion;
  }
  if (UI_SCALES.some((scale) => scale === raw.uiScale)) settings.uiScale = raw.uiScale as number;
  return settings;
}
