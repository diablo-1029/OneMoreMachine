import { RECIPES } from '../../data/recipes';
import type { MachineType } from '../factory/MachineTypes';
import type { Recipe } from './Recipe';

const byId = new Map(RECIPES.map((r) => [r.id, r]));

export function getRecipe(id: string): Recipe {
  const recipe = byId.get(id);
  if (!recipe) throw new Error(`Unknown recipe: ${id}`);
  return recipe;
}

export function hasRecipe(id: string): boolean {
  return byId.has(id);
}

export function recipesFor(machineType: MachineType): Recipe[] {
  return RECIPES.filter((r) => r.machineType === machineType);
}

/** The recipe a freshly placed machine runs, if it runs one at all. */
export function defaultRecipeId(machineType: MachineType): string | null {
  return recipesFor(machineType)[0]?.id ?? null;
}
