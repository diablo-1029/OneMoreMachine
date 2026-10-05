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
