import { getEnvironment } from '../../data/environments';
import { RECIPES } from '../../data/recipes';
import { getResource } from '../../data/resources';
import { isFedAt } from '../factory/ConveyorSystem';
import type { FactoryState } from '../factory/FactoryState';
import { getMachineDef, worldPorts } from '../factory/MachineRegistry';
import type { MachineState } from '../factory/MachineState';
import { machineAccepts, machineSpeed } from '../factory/MachineSystem';
import { oppositeDir } from '../grid/GridPosition';
import type { GameState } from '../game/GameState';
import type { Recipe } from '../recipes/Recipe';
import { computePower } from '../power/Power';
import { getRecipe, recipesFor } from '../recipes/RecipeRegistry';
import { unlockedMachines } from '../research/Research';
import { downstreamMachines, upstreamMachines } from './Connections';
import type { FactoryMetrics } from './FactoryMetrics';

export interface BottleneckFinding {
  /** The machine concerned, or null for a factory-wide problem such as a power shortage. */
  machineId: string | null;
  kind: 'starved' | 'blocked' | 'power';
  /** Fraction of recent time lost to this cause. */
  share: number;
  /** What is wrong, e.g. "Assembler waits for Iron Plate 58% of the time." */
  problem: string;
  /** What to do about it, e.g. "One more Furnace making Iron Plate would keep it fed." */
  fix: string;
  /** Higher means more worth fixing first. */
  severity: number;
}

/** A machine must lose at least this share of its time before it is reported. */
const MIN_SHARE = 0.2;
/** Seconds of data needed before a machine is judged. */
const MIN_OBSERVED = 8;
/** Above this, a neighbour is considered to have the same problem, i.e. the cause lies beyond it. */
const KNOCK_ON_SHARE = 0.3;
/** Findings that are only symptoms of another one rank below real causes. */
const SYMPTOM_WEIGHT = 0.3;

function percent(share: number): string {
  return `${Math.round(share * 100)}%`;
}

/** "Furnace making Copper Plate", or just "Miner" when the machine type only has one job. */
function describeRecipe(recipe: Recipe): string {
  const name = getMachineDef(recipe.machineType).name;
  if (recipesFor(recipe.machineType).length <= 1) return name;
  return `${name} making ${getResource(recipe.outputs[0].resourceId).name}`;
}

/** "One more X" / "3 more X", pluralising the machine name that starts the description. */
function oneMore(count: number, recipe: Recipe): string {
  const description = describeRecipe(recipe);
  if (count === 1) return `One more ${description}`;
  const name = getMachineDef(recipe.machineType).name;
  return `${count} more ${description.replace(name, `${name}s`)}`;
}

/** Recipes that make (outputs) or use (inputs) a resource. */
function recipesWith(resourceId: string, side: 'inputs' | 'outputs'): Recipe[] {
  return RECIPES.filter((r) => r[side].some((a) => a.resourceId === resourceId));
}

/** Average share of time that machines running any of the given recipes spend in one state. */
function averageShare(
  machines: MachineState[],
  metrics: FactoryMetrics,
  recipes: Recipe[],
  state: 'waiting' | 'blocked',
): { average: number; count: number } {
  const ids = new Set(recipes.map((r) => r.id));
  let total = 0;
  let count = 0;
  for (const machine of machines) {
    if (!machine.recipeId || !ids.has(machine.recipeId) || !machine.enabled) continue;
    const shares = metrics.shares(machine.id);
    if (shares.observed < MIN_OBSERVED) continue;
    total += shares[state];
    count++;
  }
  return { average: count > 0 ? total / count : 0, count };
}

/**
 * On a belt carrying mixed ingredients, the item at the front can be one the machine already
 * has plenty of, which stops the ingredient it actually needs from ever arriving. Returns the
 * id of the resource jammed against one of the machine's hatches, if any.
 */
function jammedAtHatch(factory: FactoryState, machine: MachineState): string | null {
  const ports = worldPorts(getMachineDef(machine.type), machine.gridX, machine.gridY, machine.rotation);
  let connected = 0;
  let jammed: string | null = null;
  for (const port of ports) {
    if (port.type !== 'input') continue;
    const belt = factory.conveyorAt(port.outerX, port.outerY);
    const router = factory.machineAt(port.outerX, port.outerY);
    // The next thing waiting to come in: the front of a belt aimed at the hatch, or of a router beside it.
    const front =
      belt && belt.direction === oppositeDir(port.side)
        ? belt.items[0]
        : router && router.transit[0]?.to === oppositeDir(port.side)
          ? router.transit[0]
          : undefined;
    if ((belt && belt.direction === oppositeDir(port.side)) || router) connected++;
    else continue;
    // An item the machine has enough of, waiting at a hatch, is normal on a belt of its own.
    // It is only a jam when every way in is plugged like that, leaving the missing
    // ingredient no route.
    if (front && front.progress >= 1 - 1e-6 && !machineAccepts(machine, front.resourceId)) jammed ??= front.resourceId;
    else return null;
  }
  return connected > 0 ? jammed : null;
}

/** True if any belt or machine output leads into one of the machine's input hatches. */
function hasFeeder(factory: FactoryState, machine: MachineState): boolean {
  const ports = worldPorts(getMachineDef(machine.type), machine.gridX, machine.gridY, machine.rotation);
  return ports.some((port) => port.type === 'input' && isFedAt(factory, port.x, port.y, oppositeDir(port.side)));
}

/**
 * Looks at how machines have spent the last half minute and says, in plain words, where the
 * factory is losing output and what single change would help most. Pure function of state
 * and metrics, so it is easy to test.
 */
export function analyzeBottlenecks(state: GameState, metrics: FactoryMetrics): BottleneckFinding[] {
  const findings: BottleneckFinding[] = [];
  const machines = [...state.factory.machines.values()];
  const environment = getEnvironment(state.environment);
  /** What one standard machine running a recipe turns out per minute on this site. */
  const siteRate = (recipe: Recipe) => (60 / recipe.duration) * (environment.speed[recipe.machineType] ?? 1);

  for (const machine of machines) {
    if (!machine.enabled || !machine.recipeId) continue;
    const def = getMachineDef(machine.type);
    if (def.behavior !== 'crafter') continue;
    const shares = metrics.shares(machine.id);
    if (shares.observed < MIN_OBSERVED) continue;
    const recipe = getRecipe(machine.recipeId);
    const craftsPerMinute = (60 / recipe.duration) * machineSpeed(machine, environment);

    if (shares.waiting >= MIN_SHARE && recipe.inputs.length > 0) {
      // The scarcest input is the one the machine currently holds least of, relative to need.
      const input = [...recipe.inputs].sort(
        (a, b) =>
          (machine.inputInventory[a.resourceId] ?? 0) / a.amount - (machine.inputInventory[b.resourceId] ?? 0) / b.amount,
      )[0];
      const resource = getResource(input.resourceId);
      const needPerMinute = craftsPerMinute * input.amount;
      const shortfall = needPerMinute * shares.waiting;
      const producers = recipesWith(input.resourceId, 'outputs');
      const producer = producers[0];
      // Judge the supply by the machines actually connected to this one, not by every machine
      // of that kind in the factory: another module's troubles say nothing about this line.
      const suppliers = upstreamMachines(state.factory, machine);
      const upstreamBlocked = averageShare(suppliers, metrics, producers, 'blocked');
      const upstreamStarved = averageShare(suppliers, metrics, producers, 'waiting');

      // Is anything that makes the missing ingredient connected at all? If it is, and every
      // hatch is plugged by something else, the ingredient is stuck in the queue behind it.
      const producerIds = new Set(producers.map((r) => r.id));
      const connectedMakers = suppliers.filter((m) => m.recipeId !== null && producerIds.has(m.recipeId));
      const jammed = connectedMakers.length > 0 ? jammedAtHatch(state.factory, machine) : null;
      // A storage upstream may hold the ingredient without anything making it, so only call the
      // input unconnected when nothing at all leads into the machine.
      const unconnected = producer !== undefined && suppliers.length === 0 && !hasFeeder(state.factory, machine);

      let fix: string;
      let weight = 1;
      if (jammed) {
        fix = `Its hatch is blocked by ${getResource(jammed).name} it has no room for — give each ingredient its own belt.`;
      } else if (!producer) {
        fix = `Nothing makes ${resource.name} yet.`;
      } else if (unconnected) {
        fix = `Nothing is connected to its input — run a belt carrying ${resource.name} to it.`;
      } else if (upstreamBlocked.count > 0 && upstreamBlocked.average >= KNOCK_ON_SHARE) {
        // Supply exists but cannot get here: a routing problem, not a capacity one.
        fix = `Your ${resource.name} is backed up at its source — the belts to this machine are the limit.`;
      } else if (upstreamStarved.count > 0 && upstreamStarved.average >= KNOCK_ON_SHARE) {
        fix = 'The shortage starts further up the line.';
        weight = SYMPTOM_WEIGHT;
      } else {
        const output = producer.outputs.find((o) => o.resourceId === input.resourceId)!;
        const perProducer = siteRate(producer) * output.amount;
        const extra = Math.max(1, Math.ceil(shortfall / perProducer - 0.05));
        fix = `${oneMore(extra, producer)} would keep it fed.`;
      }

      findings.push({
        machineId: machine.id,
        kind: 'starved',
        share: shares.waiting,
        problem: `${def.name} waits for ${resource.name} ${percent(shares.waiting)} of the time — it can use ${Math.round(needPerMinute)}/min but gets about ${Math.round(needPerMinute - shortfall)}.`,
        fix,
        severity: shares.waiting * weight,
      });
    }

    if (shares.blocked >= MIN_SHARE) {
      const output = recipe.outputs[0];
      const resource = getResource(output.resourceId);
      const consumers = recipesWith(output.resourceId, 'inputs');
      const downstreamBlocked = averageShare(downstreamMachines(state.factory, machine), metrics, consumers, 'blocked');
      const surplus = craftsPerMinute * output.amount * shares.blocked;

      let fix: string;
      let weight = 1;
      if (consumers.length === 0) {
        fix = `Send its ${resource.name}s to a Seller, or add another Seller.`;
      } else if (downstreamBlocked.count > 0 && downstreamBlocked.average >= KNOCK_ON_SHARE) {
        fix = 'The jam starts further down the line.';
        weight = SYMPTOM_WEIGHT;
      } else {
        const consumer = consumers[0];
        const input = consumer.inputs.find((i) => i.resourceId === output.resourceId)!;
        const perConsumer = siteRate(consumer) * input.amount;
        const extra = Math.max(1, Math.ceil(surplus / perConsumer - 0.05));
        fix = `${oneMore(extra, consumer)} could use the spare ${resource.name}.`;
      }

      findings.push({
        machineId: machine.id,
        kind: 'blocked',
        share: shares.blocked,
        problem: `${def.name} is backed up ${percent(shares.blocked)} of the time — about ${Math.round(surplus)} ${resource.name}/min has nowhere to go.`,
        fix,
        severity: shares.blocked * weight,
      });
    }
  }

  const power = computePower(state.factory, state.power, environment);
  if (power.ratio < 0.995) {
    const shortfall = power.demand - power.supply;
    const turbine = getMachineDef('wind_turbine');
    const turbines = Math.ceil(shortfall / ((turbine.powerOutput ?? 1) * environment.turbineOutput));
    findings.push({
      machineId: null,
      kind: 'power',
      share: 1 - power.ratio,
      problem: `The factory needs ${Math.round(power.demand)} power but has ${Math.round(power.supply)} — every machine runs at ${percent(power.ratio)} speed.`,
      fix: unlockedMachines(state.research).includes(turbine.type)
        ? `${turbines === 1 ? 'One more Wind Turbine' : `${turbines} more Wind Turbines`} would cover it.`
        : 'Research Wind Power to build turbines, or switch off machines you can spare.',
      // A shortage slows everything at once, so it outranks any single machine's trouble.
      severity: 1 + (1 - power.ratio),
    });
  }

  return findings.sort((a, b) => b.severity - a.severity);
}
