import { BALANCE } from '../../data/balance';
import { getUpgradeLevel } from '../../data/upgrades';
import { getRecipe } from '../recipes/RecipeRegistry';
import type { Recipe } from '../recipes/Recipe';
import { getMachineDef } from './MachineRegistry';
import { inventoryTotal, type MachineState } from './MachineState';

export type MachineStatus = 'disabled' | 'working' | 'output_full' | 'waiting' | 'ready';

export const STATUS_LABELS: Record<MachineStatus, string> = {
  disabled: 'Disabled',
  working: 'Working',
  output_full: 'Output blocked',
  waiting: 'Waiting for input',
  ready: 'Ready',
};

/** How many times faster than a newly built machine this one crafts. */
export function machineSpeed(machine: MachineState): number {
  return getUpgradeLevel(machine.level).speed;
}

function recipeOf(machine: MachineState): Recipe | null {
  return machine.recipeId ? getRecipe(machine.recipeId) : null;
}

function hasInputs(machine: MachineState, recipe: Recipe): boolean {
  return recipe.inputs.every((input) => (machine.inputInventory[input.resourceId] ?? 0) >= input.amount);
}

function hasOutputRoom(machine: MachineState, recipe: Recipe): boolean {
  const produced = recipe.outputs.reduce((sum, o) => sum + o.amount, 0);
  return inventoryTotal(machine.outputInventory) + produced <= getMachineDef(machine.type).outputCapacity;
}

/** Whether a machine would take one more unit of `resourceId` right now. */
export function machineAccepts(machine: MachineState, resourceId: string): boolean {
  if (!machine.enabled) return false;
  const def = getMachineDef(machine.type);
  if (def.behavior === 'seller') return true;
  const recipe = recipeOf(machine);
  const input = recipe?.inputs.find((i) => i.resourceId === resourceId);
  if (!input) return false;
  return (machine.inputInventory[resourceId] ?? 0) < input.amount * BALANCE.inputBufferBatches;
}

/**
 * Advances a crafter by `dt`. Returns the recipe when a craft completed this tick.
 * Works for any recipe shape, including input-less producers.
 */
export function updateCrafter(machine: MachineState, dt: number): Recipe | null {
  if (!machine.enabled) return null;
  const recipe = recipeOf(machine);
  if (!recipe) return null;

  if (!machine.active && !tryStart(machine, recipe)) return null;

  machine.progress += (dt * machineSpeed(machine)) / recipe.duration;
  if (machine.progress < 1) return null;

  for (const output of recipe.outputs) {
    machine.outputInventory[output.resourceId] = (machine.outputInventory[output.resourceId] ?? 0) + output.amount;
  }
  // Time left over after finishing counts towards the next craft, so speeds that do not divide
  // evenly into ticks (an upgraded machine) still average out to exactly their rated output.
  const carry = machine.progress - 1;
  machine.active = false;
  machine.progress = 0;
  // Begin the next craft straight away so a fully supplied machine never reads as idle between crafts.
  if (tryStart(machine, recipe)) machine.progress = carry;
  return recipe;
}

/** Consumes the inputs and begins a craft if everything it needs is in place. */
function tryStart(machine: MachineState, recipe: Recipe): boolean {
  if (!hasInputs(machine, recipe) || !hasOutputRoom(machine, recipe)) return false;
  for (const input of recipe.inputs) machine.inputInventory[input.resourceId] -= input.amount;
  machine.active = true;
  machine.progress = 0;
  return true;
}

export function machineStatus(machine: MachineState): MachineStatus {
  if (!machine.enabled) return 'disabled';
  if (getMachineDef(machine.type).behavior !== 'crafter') return 'ready';
  if (machine.active) return 'working';
  const recipe = recipeOf(machine);
  if (!recipe) return 'ready';
  if (!hasOutputRoom(machine, recipe)) return 'output_full';
  return 'waiting';
}

/** Theoretical output per minute when the machine never stalls. */
export function nominalRatePerMinute(machine: MachineState): { resourceId: string; perMinute: number } | null {
  const recipe = recipeOf(machine);
  const output = recipe?.outputs[0];
  if (!recipe || !output) return null;
  return {
    resourceId: output.resourceId,
    perMinute: (60 / recipe.duration) * output.amount * machineSpeed(machine),
  };
}
