import type { GameState } from './GameState';

export interface TutorialStep {
  text: string;
  done: (state: GameState) => boolean;
}

function hasMachine(state: GameState, type: string): boolean {
  for (const machine of state.factory.machines.values()) {
    if (machine.type === type) return true;
  }
  return false;
}

/** Contextual hints. Each disappears for good once its condition has been met. */
export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    text: 'Pick the Miner from the toolbar and place it on the factory floor.',
    done: (s) => hasMachine(s, 'miner'),
  },
  {
    text: 'Pick Conveyor and drag a line away from the Miner’s orange output. R rotates.',
    done: (s) => s.factory.conveyors.size > 0,
  },
  {
    text: 'Place a Furnace at the end of the belt. Its green hatch is the input.',
    done: (s) => hasMachine(s, 'furnace'),
  },
  {
    text: 'Connect the Miner’s output to the Furnace’s input so ore can be smelted.',
    done: (s) => (s.stats.produced['iron_plate'] ?? 0) > 0,
  },
  {
    text: 'Place a Seller to turn products into money.',
    done: (s) => hasMachine(s, 'seller'),
  },
  {
    text: 'Run a belt from the Furnace’s output into the Seller and watch the first sale.',
    done: (s) => s.economy.totalEarned > 0,
  },
  {
    text: 'Gears sell for three times a plate. Open Research (T) and unlock Gear Assembly.',
    done: (s) => s.research.includes('gear_assembly'),
  },
  {
    text: 'Add an Assembler between the Furnace and the Seller to start making Gears.',
    done: (s) => hasMachine(s, 'assembler'),
  },
];

/** True once the opening walkthrough is behind the player. */
export function tutorialFinished(state: GameState): boolean {
  return state.tutorialStep >= TUTORIAL_STEPS.length;
}

/** What a tip needs to know about the factory, as plain values. */
export interface TipContext {
  /** Something is holding production back that the bottleneck tools would point at. */
  hasBottleneck: boolean;
  itemsSold: number;
  powerShort: boolean;
  canAffordExpansion: boolean;
  research: readonly string[];
  /** Stars this factory would fetch if sold now. */
  starsAvailable: number;
}

export interface Tip {
  id: string;
  text: string;
  when: (context: TipContext) => boolean;
}

/**
 * One-time pointers to the parts of the game the walkthrough does not reach. Each waits for
 * the moment it becomes useful, is shown once, and can be closed. In order of priority.
 */
export const TIPS: Tip[] = [
  {
    id: 'power',
    text: 'The factory is short of power, so every machine has slowed down. Research Wind Power and build a Turbine, or switch off machines you can spare.',
    when: (c) => c.powerShort,
  },
  {
    id: 'contracts',
    text: 'Contracts pay a bonus for things you are selling anyway. Open Contracts to see what is on offer.',
    when: (c) => c.itemsSold >= 10,
  },
  {
    id: 'bottlenecks',
    text: 'Something is holding the factory back. Open Production for advice on what to add, or turn on Bottlenecks to see it on the floor.',
    when: (c) => c.hasBottleneck,
  },
  {
    id: 'expansion',
    text: 'You can afford a bigger factory floor. Open Floor to expand; everything you have built stays where it is.',
    when: (c) => c.canAffordExpansion,
  },
  {
    id: 'upgrades',
    text: 'Machines can now be upgraded. Select one to make it faster, at the cost of more power.',
    when: (c) => c.research.includes('machine_tuning'),
  },
  {
    id: 'blueprints',
    text: 'Copy duplicates any part of the factory: drag over it, then place the copy. Blueprints keeps layouts for later.',
    when: (c) => c.research.includes('logistics'),
  },
  {
    id: 'prestige',
    text: 'This factory is now worth a star. Selling up, from the star in the top bar, starts a new factory with a permanent bonus, whenever you are ready.',
    when: (c) => c.starsAvailable >= 1,
  },
];

export function isTipId(id: string): boolean {
  return TIPS.some((tip) => tip.id === id);
}

export function allTipIds(): string[] {
  return TIPS.map((tip) => tip.id);
}

/** The tip to show now, if any: the first one not yet seen whose moment has come. */
export function currentTip(state: GameState, context: TipContext): Tip | null {
  if (!tutorialFinished(state)) return null;
  return TIPS.find((tip) => !state.seenTips.includes(tip.id) && tip.when(context)) ?? null;
}

/** Moves past every completed step. Returns true if the step changed. */
export function advanceTutorial(state: GameState): boolean {
  const before = state.tutorialStep;
  while (state.tutorialStep < TUTORIAL_STEPS.length && TUTORIAL_STEPS[state.tutorialStep].done(state)) {
    state.tutorialStep++;
  }
  return state.tutorialStep !== before;
}

export function currentHint(state: GameState): string | null {
  return TUTORIAL_STEPS[state.tutorialStep]?.text ?? null;
}
