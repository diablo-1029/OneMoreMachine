import type { MachineDefinition } from '../core/factory/MachineTypes';
import { BALANCE } from './balance';

/**
 * Ports are defined for rotation 0: inputs on the west edge, outputs on the east edge,
 * both on the top row, so a straight belt can run through a line of machines.
 */
export const MACHINE_DEFINITIONS: MachineDefinition[] = [
  {
    type: 'miner',
    name: 'Miner',
    description: 'Drills ore out of the ground.',
    powerUse: BALANCE.power.use.miner,
    cost: BALANCE.costs.miner,
    width: 2,
    height: 2,
    behavior: 'crafter',
    ports: [{ localX: 1, localY: 0, side: 0, type: 'output' }],
    outputCapacity: 2,
  },
  {
    type: 'furnace',
    name: 'Furnace',
    description: 'Smelts ore into plates.',
    powerUse: BALANCE.power.use.furnace,
    cost: BALANCE.costs.furnace,
    width: 2,
    height: 2,
    behavior: 'crafter',
    ports: [
      { localX: 0, localY: 0, side: 2, type: 'input' },
      { localX: 1, localY: 0, side: 0, type: 'output' },
    ],
    outputCapacity: 2,
  },
  {
    type: 'assembler',
    name: 'Assembler',
    description: 'Builds parts from plates, wire and other parts.',
    powerUse: BALANCE.power.use.assembler,
    cost: BALANCE.costs.assembler,
    width: 2,
    height: 2,
    behavior: 'crafter',
    // Two hatches so each ingredient of a mixed recipe can arrive on its own belt.
    ports: [
      { localX: 0, localY: 0, side: 2, type: 'input' },
      { localX: 0, localY: 1, side: 2, type: 'input' },
      { localX: 1, localY: 0, side: 0, type: 'output' },
    ],
    outputCapacity: 2,
  },
  {
    type: 'fabricator',
    name: 'Fabricator',
    description: 'Builds the most complex products from three ingredients at once.',
    powerUse: BALANCE.power.use.fabricator,
    cost: BALANCE.costs.fabricator,
    width: 3,
    height: 3,
    behavior: 'crafter',
    // One hatch per ingredient down the west side; finished goods leave from the middle of the east.
    ports: [
      { localX: 0, localY: 0, side: 2, type: 'input' },
      { localX: 0, localY: 1, side: 2, type: 'input' },
      { localX: 0, localY: 2, side: 2, type: 'input' },
      { localX: 2, localY: 1, side: 0, type: 'output' },
    ],
    outputCapacity: 2,
  },
  {
    type: 'seller',
    name: 'Seller',
    description: 'Sells anything delivered to it.',
    cost: BALANCE.costs.seller,
    width: 2,
    height: 2,
    behavior: 'seller',
    ports: [
      { localX: 0, localY: 0, side: 2, type: 'input' },
      { localX: 0, localY: 1, side: 2, type: 'input' },
    ],
    outputCapacity: 0,
  },
  {
    type: 'splitter',
    name: 'Splitter',
    description: 'Shares one belt between up to three, taking turns.',
    cost: BALANCE.costs.splitter,
    width: 1,
    height: 1,
    behavior: 'router',
    ports: [
      { localX: 0, localY: 0, side: 2, type: 'input' },
      { localX: 0, localY: 0, side: 0, type: 'output' },
      { localX: 0, localY: 0, side: 3, type: 'output' },
      { localX: 0, localY: 0, side: 1, type: 'output' },
    ],
    outputCapacity: 0,
  },
  {
    type: 'merger',
    name: 'Merger',
    description: 'Joins up to three belts into one, taking turns.',
    cost: BALANCE.costs.merger,
    width: 1,
    height: 1,
    behavior: 'router',
    ports: [
      { localX: 0, localY: 0, side: 2, type: 'input' },
      { localX: 0, localY: 0, side: 3, type: 'input' },
      { localX: 0, localY: 0, side: 1, type: 'input' },
      { localX: 0, localY: 0, side: 0, type: 'output' },
    ],
    outputCapacity: 0,
  },
  {
    type: 'storage',
    name: 'Storage',
    description: 'Buffers up to 200 items and releases the oldest first.',
    cost: BALANCE.costs.storage,
    width: 2,
    height: 3,
    behavior: 'storage',
    ports: [
      { localX: 0, localY: 0, side: 2, type: 'input' },
      { localX: 1, localY: 0, side: 0, type: 'output' },
    ],
    outputCapacity: 0,
    storageCapacity: 200,
  },
  {
    type: 'wind_turbine',
    name: 'Wind Turbine',
    toolbarName: 'Turbine',
    description: 'Adds 15 power to the factory. Needs no fuel and no belts.',
    cost: BALANCE.costs.wind_turbine,
    width: 2,
    height: 2,
    behavior: 'generator',
    ports: [],
    outputCapacity: 0,
    powerOutput: BALANCE.power.turbineOutput,
  },
];

export const CONVEYOR_INFO = {
  name: 'Conveyor',
  description: 'Moves items one tile per second.',
  cost: BALANCE.costs.conveyor,
};

/** Toolbar order. */
export const BUILD_ORDER = [
  'miner',
  'conveyor',
  'furnace',
  'assembler',
  'fabricator',
  'seller',
  'splitter',
  'merger',
  'storage',
  'wind_turbine',
] as const;
