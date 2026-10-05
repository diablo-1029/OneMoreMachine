import { CONTRACT_BALANCE as B } from '../../data/contracts';
import { RECIPES } from '../../data/recipes';
import { getResource } from '../../data/resources';
import { seededRandom } from '../game/Random';
import { unlockedRecipes } from '../research/Research';

/**
 * deliver: sell `target` of the resource in total.
 * rate:    sell `target` of the resource within one minute.
 * Contracts never expire and cost nothing to hold; the reward is a bonus on top of normal sales.
 */
export type ContractKind = 'deliver' | 'rate';

export interface Contract {
  id: number;
  kind: ContractKind;
  resourceId: string;
  target: number;
  /** Deliver contracts: items sold so far. Unused for rate contracts, which are measured live. */
  progress: number;
  reward: number;
}

export interface ContractState {
  active: Contract[];
  /** How many have been completed; later contracts ask for more and pay more. */
  completed: number;
  nextId: number;
  /**
   * The most of each resource the factory has ever sold in one minute. New orders are sized
   * against this rather than against current sales, so switching machines off for a moment
   * cannot be used to fish for an easy order.
   */
  bestRate: Record<string, number>;
}

export function createContractState(): ContractState {
  return { active: [], completed: 0, nextId: 1, bestRate: {} };
}

function roundTo(value: number, step: number): number {
  return Math.max(step, Math.round(value / step) * step);
}

/** What one machine makes per minute of each resource the player has the recipe for. */
function makeableRates(research: readonly string[]): Map<string, number> {
  const unlocked = unlockedRecipes(research);
  const rates = new Map<string, number>();
  for (const recipe of RECIPES) {
    if (!unlocked.includes(recipe.id)) continue;
    for (const output of recipe.outputs) rates.set(output.resourceId, (60 / recipe.duration) * output.amount);
  }
  return rates;
}

/**
 * Builds the next contract. It only ever asks for things the player can already make, and is
 * fully determined by the contract id, so reloading a save cannot be used to reroll an offer.
 */
/** How many of a resource the factory currently sells per minute. */
export type SalesRate = (resourceId: string) => number;

export function generateContract(
  contracts: ContractState,
  research: readonly string[],
  currentRate: SalesRate = () => 0,
): Contract {
  const rates = makeableRates(research);
  const resources = [...rates.keys()];
  const level = Math.min(contracts.completed, B.maxLevel);
  const id = contracts.nextId;

  // A few attempts to avoid offering the same thing twice at once.
  let pick: { kind: ContractKind; resourceId: string } = { kind: 'deliver', resourceId: resources[0] };
  for (let attempt = 0; attempt < 6; attempt++) {
    const random = seededRandom(id * 7919 + attempt * 104729);
    // Favour more valuable goods without excluding the basics.
    const weights = resources.map((r) => Math.sqrt(getResource(r).baseValue));
    let roll = random() * weights.reduce((a, b) => a + b, 0);
    let resourceId = resources[resources.length - 1];
    for (let i = 0; i < resources.length; i++) {
      roll -= weights[i];
      if (roll <= 0) {
        resourceId = resources[i];
        break;
      }
    }
    pick = { kind: random() < B.rateChance ? 'rate' : 'deliver', resourceId };
    const duplicate = contracts.active.some((c) => c.kind === pick.kind && c.resourceId === pick.resourceId);
    if (!duplicate) break;
  }

  const value = getResource(pick.resourceId).baseValue;
  if (pick.kind === 'rate') {
    const machines = Math.min(B.rateBaseMachines + Math.floor(level / B.rateLevelsPerMachine), B.rateMaxMachines);
    // Always a real step up: never less than half as much again as the factory already sells,
    // or an order for something already mass-produced would be met the moment it appeared.
    const stretch = roundTo(currentRate(pick.resourceId) * B.rateGrowth, 5);
    const target = Math.max(Math.round(rates.get(pick.resourceId)! * machines), stretch);
    return {
      id,
      kind: 'rate',
      resourceId: pick.resourceId,
      target,
      progress: 0,
      reward: roundTo(target * value * B.rateBonusMinutes + B.rateFlatBonus, 10),
    };
  }

  // Valuable goods are slower to make, so ask for fewer of them.
  const scarcity = 1.6 / Math.pow(value, 0.42);
  // For a factory already selling plenty, at least several minutes of its current output.
  const sustained = roundTo(currentRate(pick.resourceId) * B.deliverMinutes, 5);
  const target = Math.max(roundTo((B.deliverBase + B.deliverPerLevel * level) * scarcity, 5), sustained);
  return {
    id,
    kind: 'deliver',
    resourceId: pick.resourceId,
    target,
    progress: 0,
    reward: roundTo(target * value * B.deliverBonusRate + B.deliverFlatBonus, 10),
  };
}

/** Tops the offers back up to the number of slots. Returns true if anything was added. */
export function fillContracts(
  contracts: ContractState,
  research: readonly string[],
  currentRate?: SalesRate,
): boolean {
  let added = false;
  while (contracts.active.length < B.slots) {
    contracts.active.push(generateContract(contracts, research, currentRate));
    contracts.nextId++;
    added = true;
  }
  return added;
}

/** "Deliver 45 Iron Plate" / "Sell 60 Iron Plate per minute". */
export function describeContract(contract: Contract): string {
  const name = getResource(contract.resourceId).name;
  return contract.kind === 'deliver'
    ? `Deliver ${contract.target} ${name}`
    : `Sell ${contract.target} ${name} per minute`;
}
