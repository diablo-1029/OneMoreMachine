import { starsForEarnings } from '../core/game/Prestige';

/** The parts of the top bar that wait until they are useful. Money, income and speed are always there. */
export type HudControl =
  | 'production'
  | 'bottleneck'
  | 'research'
  | 'contracts'
  | 'floor'
  | 'blueprints'
  | 'achievements'
  | 'power'
  | 'prestige';

export const HUD_CONTROLS: HudControl[] = [
  'production',
  'bottleneck',
  'research',
  'contracts',
  'floor',
  'blueprints',
  'achievements',
  'power',
  'prestige',
];

/** Everything the rule needs to know about the factory, as plain numbers. */
export interface HudFacts {
  machines: number;
  totalEarned: number;
  itemsSold: number;
  contractsCompleted: number;
  research: readonly string[];
  /** Side length of the floor now, and of the floor every factory starts with. */
  gridSize: number;
  startingGridSize: number;
  firstExpansionCost: number;
  hasClipboard: boolean;
  savedBlueprints: number;
  achievements: number;
  powerDemand: number;
  powerSupply: number;
  turbines: number;
  stars: number;
  timesSold: number;
}

/** Power becomes worth watching once this share of the supply is in use. */
const POWER_SHARE = 0.5;

/**
 * Which top-bar controls a factory has grown into. A new factory shows almost nothing; each
 * control appears when it first has something to say. Nearly every condition is one that
 * stays true once met, so a loaded save shows what it had already earned.
 */
export function hudVisibility(facts: HudFacts): Record<HudControl, boolean> {
  const started = facts.machines > 0 || facts.totalEarned > 0;
  return {
    production: started,
    bottleneck: started,
    research: true,
    contracts: facts.itemsSold > 0 || facts.contractsCompleted > 0,
    floor: facts.gridSize > facts.startingGridSize || facts.totalEarned >= facts.firstExpansionCost,
    blueprints: facts.research.includes('logistics') || facts.hasClipboard || facts.savedBlueprints > 0,
    achievements: facts.achievements > 0,
    power:
      facts.turbines > 0 ||
      facts.research.includes('wind_power') ||
      (facts.powerSupply > 0 && facts.powerDemand >= facts.powerSupply * POWER_SHARE),
    prestige: facts.stars > 0 || facts.timesSold > 0 || starsForEarnings(facts.totalEarned) >= 1,
  };
}
