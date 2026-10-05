import { BALANCE } from '../../data/balance';
import { createContractState, type ContractState } from '../contracts/Contracts';
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
}

export function createNewGame(): GameState {
  return {
    factory: new FactoryState(DEFAULT_GRID_SIZE, DEFAULT_GRID_SIZE),
    economy: new Economy(BALANCE.startingMoney),
    simTime: 0,
    stats: { produced: {}, sold: {} },
    tutorialStep: 0,
    research: [],
    contracts: createContractState(),
  };
}
