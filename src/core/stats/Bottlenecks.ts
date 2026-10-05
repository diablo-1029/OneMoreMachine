import { RECIPES } from '../../data/recipes';
import { getResource } from '../../data/resources';
import { getMachineDef } from '../factory/MachineRegistry';
import type { MachineState } from '../factory/MachineState';
import type { GameState } from '../game/GameState';
import { getRecipe } from '../recipes/RecipeRegistry';
import type { FactoryMetrics } from './FactoryMetrics';

export interface BottleneckFinding {
  machineId: string;
  kind: 'starved' | 'blocked';
  /** Fraction of recent time lost to this cause. */
  share: number;
  /** What is wrong, e.g. "Assembler waits for Iron Plate 58% of the time." */
  problem: string;
  /** What to do about it, e.g. "One more Furnace would keep it fed." */
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

function plural(count: number, name: string): string {
  return count === 1 ? `One more ${name}` : `${count} more ${name}s`;
}

function percent(share: number): string {
  return `${Math.round(share * 100)}%`;
}

/** Machine types whose recipes make / use a resource. */
function typesWith(resourceId: string, side: 'inputs' | 'outputs'): string[] {
  return [...new Set(RECIPES.filter((r) => r[side].some((a) => a.resourceId === resourceId)).map((r) => r.machineType))];
}

/** Average share of time the placed machines of the given types spend in one state. */
function averageShare(
  machines: Iterable<MachineState>,
  metrics: FactoryMetrics,
  types: string[],
  state: 'waiting' | 'blocked',
): { average: number; count: number } {
  let total = 0;
  let count = 0;
  for (const machine of machines) {
    if (!types.includes(machine.type)) continue;
    const shares = metrics.shares(machine.id);
    if (shares.observed < MIN_OBSERVED) continue;
    total += shares[state];
    count++;
  }
  return { average: count > 0 ? total / count : 0, count };
}

/**
 * Looks at how machines have spent the last half minute and says, in plain words, where the
 * factory is losing output and what single change would help most. Pure function of state
 * and metrics, so it is easy to test.
 */
export function analyzeBottlenecks(state: GameState, metrics: FactoryMetrics): BottleneckFinding[] {
  const findings: BottleneckFinding[] = [];
  const machines = [...state.factory.machines.values()];

  for (const machine of machines) {
    if (!machine.enabled || !machine.recipeId) continue;
    const def = getMachineDef(machine.type);
    if (def.behavior !== 'crafter') continue;
    const shares = metrics.shares(machine.id);
    if (shares.observed < MIN_OBSERVED) continue;
    const recipe = getRecipe(machine.recipeId);
    const craftsPerMinute = 60 / recipe.duration;

    if (shares.waiting >= MIN_SHARE && recipe.inputs.length > 0) {
      // The scarcest input is the one the machine currently holds least of, relative to need.
      const input = [...recipe.inputs].sort(
        (a, b) =>
          (machine.inputInventory[a.resourceId] ?? 0) / a.amount - (machine.inputInventory[b.resourceId] ?? 0) / b.amount,
      )[0];
      const resource = getResource(input.resourceId);
      const needPerMinute = craftsPerMinute * input.amount;
      const shortfall = needPerMinute * shares.waiting;
      const producerTypes = typesWith(input.resourceId, 'outputs');
      const producerType = producerTypes[0];
      const upstreamBlocked = averageShare(machines, metrics, producerTypes, 'blocked');
      const upstreamStarved = averageShare(machines, metrics, producerTypes, 'waiting');

      let fix: string;
      let weight = 1;
      if (!producerType) {
        fix = `Nothing makes ${resource.name} yet.`;
      } else if (upstreamBlocked.count > 0 && upstreamBlocked.average >= KNOCK_ON_SHARE) {
        // Supply exists but cannot get here: a routing problem, not a capacity one.
        fix = `Your ${getMachineDef(producerType).name}s are backed up — the belts to this machine are the limit.`;
      } else if (upstreamStarved.count > 0 && upstreamStarved.average >= KNOCK_ON_SHARE) {
        fix = 'The shortage starts further up the line.';
        weight = SYMPTOM_WEIGHT;
      } else {
        const producerRecipe = RECIPES.find((r) => r.machineType === producerType)!;
        const output = producerRecipe.outputs.find((o) => o.resourceId === input.resourceId)!;
        const perProducer = (60 / producerRecipe.duration) * output.amount;
        const extra = Math.max(1, Math.ceil(shortfall / perProducer - 0.05));
        fix = `${plural(extra, getMachineDef(producerType).name)} would keep it fed.`;
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
      const consumerTypes = typesWith(output.resourceId, 'inputs');
      const downstreamBlocked = averageShare(machines, metrics, consumerTypes, 'blocked');
      const surplus = craftsPerMinute * output.amount * shares.blocked;

      let fix: string;
      let weight = 1;
      if (consumerTypes.length === 0) {
        fix = `Send its ${resource.name}s to a Seller, or add another Seller.`;
      } else if (downstreamBlocked.count > 0 && downstreamBlocked.average >= KNOCK_ON_SHARE) {
        fix = 'The jam starts further down the line.';
        weight = SYMPTOM_WEIGHT;
      } else {
        const consumerType = consumerTypes[0];
        const consumerRecipe = RECIPES.find((r) => r.machineType === consumerType)!;
        const input = consumerRecipe.inputs.find((i) => i.resourceId === output.resourceId)!;
        const perConsumer = (60 / consumerRecipe.duration) * input.amount;
        const extra = Math.max(1, Math.ceil(surplus / perConsumer - 0.05));
        fix = `${plural(extra, getMachineDef(consumerType).name)} could use the spare ${resource.name}.`;
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

  return findings.sort((a, b) => b.severity - a.severity);
}
