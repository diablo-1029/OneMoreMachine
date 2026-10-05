import { BALANCE } from '../../data/balance';
import { DEFAULT_ENVIRONMENT } from '../../data/environments';
import { createContractState, type ContractState } from '../contracts/Contracts';
import type { PowerState } from '../power/Power';
import { Economy } from '../economy/Economy';
import { FactoryState } from '../factory/FactoryState';
import { DEFAULT_GRID_SIZE } from './Constants';

export interface GameStats {
  produced: Record<string, number>;
  sold: Record<string, number>;
}

/** Everything the simulation owns. Renderers and UI read this; only Simulation writes it. */
export interface GameState {
  factory: FactoryState;
  economy: Economy;
  simTime: number;
  stats: GameStats;
  /** Index of the current tutorial hint; past the end means the tutorial is finished. */
  tutorialStep: number;
  /** Ids of completed research nodes; what can be built and made follows from these. */
  research: string[];
  contracts: ContractState;
  power: PowerState;
  /** Ids of unlocked achievements, in the order they were earned. */
  achievements: string[];
  /** Id of the site the factory stands on. Fixed for the life of the factory. */
  environment: string;
}

export function createNewGame(environment: string = DEFAULT_ENVIRONMENT): GameState {
  return {
    factory: new FactoryState(DEFAULT_GRID_SIZE, DEFAULT_GRID_SIZE),
    economy: new Economy(BALANCE.startingMoney),
    simTime: 0,
    stats: { produced: {}, sold: {} },
    tutorialStep: 0,
    research: [],
    contracts: createContractState(),
    power: { baseSupply: BALANCE.power.baseSupply },
    achievements: [],
    environment,
  };
}
