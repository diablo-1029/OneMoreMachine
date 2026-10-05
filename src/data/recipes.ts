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
];
