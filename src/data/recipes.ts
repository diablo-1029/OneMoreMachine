import type { Recipe } from '../core/recipes/Recipe';

export const RECIPES: Recipe[] = [
  {
    id: 'mine_iron_ore',
    machineType: 'miner',
    inputs: [],
    outputs: [{ resourceId: 'iron_ore', amount: 1 }],
    duration: 2,
  },
  {
    id: 'smelt_iron_plate',
    machineType: 'furnace',
    inputs: [{ resourceId: 'iron_ore', amount: 1 }],
    outputs: [{ resourceId: 'iron_plate', amount: 1 }],
    duration: 2,
  },
  {
    id: 'craft_gear',
    machineType: 'assembler',
    inputs: [{ resourceId: 'iron_plate', amount: 2 }],
    outputs: [{ resourceId: 'gear', amount: 1 }],
    duration: 3,
  },
  {
    id: 'mine_copper_ore',
    machineType: 'miner',
    inputs: [],
    outputs: [{ resourceId: 'copper_ore', amount: 1 }],
    duration: 2,
  },
  {
    id: 'smelt_copper_plate',
    machineType: 'furnace',
    inputs: [{ resourceId: 'copper_ore', amount: 1 }],
    outputs: [{ resourceId: 'copper_plate', amount: 1 }],
    duration: 2,
  },
  {
    id: 'draw_copper_wire',
    machineType: 'assembler',
    inputs: [{ resourceId: 'copper_plate', amount: 1 }],
    outputs: [{ resourceId: 'copper_wire', amount: 2 }],
    duration: 2,
  },
  {
    // The first recipe with two different ingredients: gears from the iron line, wire from the copper line.
    id: 'craft_motor',
    machineType: 'assembler',
    inputs: [
      { resourceId: 'gear', amount: 1 },
      { resourceId: 'copper_wire', amount: 2 },
    ],
    outputs: [{ resourceId: 'motor', amount: 1 }],
    duration: 4,
  },
];
