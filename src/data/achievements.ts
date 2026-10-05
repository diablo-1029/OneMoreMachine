import type { Simulation } from '../core/game/Simulation';
import { getMachineDef } from '../core/factory/MachineRegistry';
import { EXPANSION_STEPS, MAX_GRID_SIZE } from './expansion';
import { RESEARCH_NODES } from './research';
import { MAX_MACHINE_LEVEL } from './upgrades';

export interface AchievementDefinition {
  id: string;
  /**
   * milestone:   a rung on the "total earned" ladder, shown in order.
   * achievement: everything else, in no particular order.
   */
  kind: 'milestone' | 'achievement';
  name: string;
  description: string;
  /** Money paid once, when it is unlocked. */
  reward: number;
  /** How far along the player is. Unlocks when current reaches target. */
  progress: (sim: Simulation) => { current: number; target: number };
}

const machines = (sim: Simulation, type?: string): number => {
  let count = 0;
  for (const machine of sim.state.factory.machines.values()) {
    if (!type || machine.type === type) count++;
  }
  return count;
};

const sold = (sim: Simulation, resourceId?: string): number =>
  resourceId
    ? (sim.state.stats.sold[resourceId] ?? 0)
    : Object.values(sim.state.stats.sold).reduce((sum, n) => sum + n, 0);

/** 1 when the condition holds, for goals that are simply done or not done. */
const flag = (done: boolean) => ({ current: done ? 1 : 0, target: 1 });

const earned = (id: string, name: string, target: number, reward: number): AchievementDefinition => ({
  id,
  kind: 'milestone',
  name,
  description: `Earn $${target.toLocaleString('en-US')} in total.`,
  reward,
  progress: (sim) => ({ current: sim.state.economy.totalEarned, target }),
});

export const ACHIEVEMENTS: AchievementDefinition[] = [
  earned('earn_1k', 'Pocket Change', 1_000, 100),
  earned('earn_10k', 'Going Concern', 10_000, 500),
  earned('earn_100k', 'Captain of Industry', 100_000, 2_500),
  earned('earn_1m', 'Tycoon', 1_000_000, 10_000),
  earned('earn_10m', 'One More Million', 10_000_000, 50_000),

  {
    id: 'first_sale',
    kind: 'achievement',
    name: 'Open for Business',
    description: 'Sell your first item.',
    reward: 25,
    progress: (sim) => ({ current: Math.min(sold(sim), 1), target: 1 }),
  },
  {
    id: 'sell_1000',
    kind: 'achievement',
    name: 'Bulk Trader',
    description: 'Sell 1,000 items of any kind.',
    reward: 300,
    progress: (sim) => ({ current: sold(sim), target: 1000 }),
  },
  {
    id: 'gears_100',
    kind: 'achievement',
    name: 'Cog in the Machine',
    description: 'Sell 100 Gears.',
    reward: 250,
    progress: (sim) => ({ current: sold(sim, 'gear'), target: 100 }),
  },
  {
    id: 'motors_50',
    kind: 'achievement',
    name: 'Motor City',
    description: 'Sell 50 Motors.',
    reward: 1500,
    progress: (sim) => ({ current: sold(sim, 'motor'), target: 50 }),
  },
  {
    id: 'computers_25',
    kind: 'achievement',
    name: 'Thinking Machines',
    description: 'Sell 25 Computers.',
    reward: 5000,
    progress: (sim) => ({ current: sold(sim, 'computer'), target: 25 }),
  },
  {
    id: 'robots_10',
    kind: 'achievement',
    name: 'Machines Making Machines',
    description: 'Sell 10 Robots.',
    reward: 20_000,
    progress: (sim) => ({ current: sold(sim, 'robot'), target: 10 }),
  },
  {
    id: 'machines_10',
    kind: 'achievement',
    name: 'Getting Crowded',
    description: 'Have 10 machines on the floor at once.',
    reward: 150,
    progress: (sim) => ({ current: machines(sim), target: 10 }),
  },
  {
    id: 'machines_30',
    kind: 'achievement',
    name: 'Industrial Park',
    description: 'Have 30 machines on the floor at once.',
    reward: 1000,
    progress: (sim) => ({ current: machines(sim), target: 30 }),
  },
  {
    id: 'belts_50',
    kind: 'achievement',
    name: 'Belt and Braces',
    description: 'Have 50 conveyors laid at once.',
    reward: 200,
    progress: (sim) => ({ current: sim.state.factory.conveyors.size, target: 50 }),
  },
  {
    id: 'splitter',
    kind: 'achievement',
    name: 'Fork in the Road',
    description: 'Build a Splitter.',
    reward: 100,
    progress: (sim) => flag(machines(sim, 'splitter') > 0),
  },
  {
    id: 'storage_full',
    kind: 'achievement',
    name: 'Stockpile',
    description: 'Fill a Storage to the roof.',
    reward: 300,
    progress: (sim) => {
      let fullest = 0;
      for (const machine of sim.state.factory.machines.values()) fullest = Math.max(fullest, machine.stored.length);
      return { current: fullest, target: getMachineDef('storage').storageCapacity ?? 200 };
    },
  },
  {
    id: 'wind_farm',
    kind: 'achievement',
    name: 'Wind Farm',
    description: 'Have three Wind Turbines turning.',
    reward: 500,
    progress: (sim) => ({ current: machines(sim, 'wind_turbine'), target: 3 }),
  },
  {
    id: 'mk3',
    kind: 'achievement',
    name: 'Fine Tolerances',
    description: 'Upgrade a machine all the way to Mk III.',
    reward: 750,
    progress: (sim) => {
      let best = 1;
      for (const machine of sim.state.factory.machines.values()) best = Math.max(best, machine.level);
      return { current: best - 1, target: MAX_MACHINE_LEVEL - 1 };
    },
  },
  {
    id: 'first_research',
    kind: 'achievement',
    name: 'Eureka',
    description: 'Complete your first research.',
    reward: 50,
    progress: (sim) => flag(sim.state.research.length > 0),
  },
  {
    id: 'all_research',
    kind: 'achievement',
    name: 'Nothing Left to Learn',
    description: 'Complete every research.',
    reward: 5000,
    progress: (sim) => ({ current: sim.state.research.length, target: RESEARCH_NODES.length }),
  },
  {
    id: 'expand_once',
    kind: 'achievement',
    name: 'Room to Grow',
    description: 'Expand the factory floor.',
    reward: 400,
    progress: (sim) => flag(sim.state.factory.grid.width >= EXPANSION_STEPS[0].size),
  },
  {
    id: 'expand_max',
    kind: 'achievement',
    name: 'As Far as the Eye Can See',
    description: 'Expand the factory floor to its largest size.',
    reward: 10_000,
    progress: (sim) => ({
      current: EXPANSION_STEPS.filter((step) => sim.state.factory.grid.width >= step.size).length,
      target: EXPANSION_STEPS.filter((step) => step.size <= MAX_GRID_SIZE).length,
    }),
  },
  {
    id: 'contracts_1',
    kind: 'achievement',
    name: 'Signed and Delivered',
    description: 'Complete a contract.',
    reward: 100,
    progress: (sim) => ({ current: Math.min(sim.state.contracts.completed, 1), target: 1 }),
  },
  {
    id: 'contracts_10',
    kind: 'achievement',
    name: 'Reliable Supplier',
    description: 'Complete 10 contracts.',
    reward: 2000,
    progress: (sim) => ({ current: sim.state.contracts.completed, target: 10 }),
  },
  {
    id: 'balanced',
    kind: 'achievement',
    name: 'Perfectly Balanced',
    description: 'Have five or more crafting machines all working at least 95% of the time.',
    reward: 1500,
    progress: (sim) => {
      let crafters = 0;
      let busy = 0;
      for (const machine of sim.state.factory.machines.values()) {
        if (getMachineDef(machine.type).behavior !== 'crafter' || !machine.enabled) continue;
        crafters++;
        const shares = sim.metrics.shares(machine.id);
        // A full half-minute of evidence, so a line that only just started does not count.
        if (shares.observed >= 29 && shares.working >= 0.95) busy++;
      }
      // Only complete when every one of at least five qualifies.
      return { current: crafters >= 5 && busy === crafters ? 5 : Math.min(busy, 4), target: 5 };
    },
  },
];
