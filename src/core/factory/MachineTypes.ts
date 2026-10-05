import type { Direction } from '../grid/GridPosition';

/** Machine type id. Kept as a string so new machines are added through data, not code. */
export type MachineType = string;

/** Anything that can be picked from the build toolbar. */
export type BuildableType = MachineType | 'conveyor';

/**
 * Where items enter or leave a machine, defined for rotation 0.
 * `localX/localY` is a cell inside the footprint; `side` is the edge of that cell the port faces.
 */
export interface MachinePort {
  localX: number;
  localY: number;
  side: Direction;
  type: 'input' | 'output';
}

/**
 * crafter: runs a recipe (a recipe with no inputs makes it a pure producer, e.g. the Miner).
 * seller:  consumes any resource and converts it to money.
 * router:  a belt-speed junction; items cross it and leave through an output chosen in turn
 *          (one input + several outputs = splitter, several inputs + one output = merger).
 * storage: buffers any resource and releases the oldest first.
 */
export type MachineBehavior = 'crafter' | 'seller' | 'router' | 'storage';

export interface MachineDefinition {
  type: MachineType;
  name: string;
  description: string;
  cost: number;
  width: number;
  height: number;
  behavior: MachineBehavior;
  ports: MachinePort[];
  /** Maximum finished items held before the machine stalls. */
  outputCapacity: number;
  /** Items a storage machine can hold. */
  storageCapacity?: number;
}
