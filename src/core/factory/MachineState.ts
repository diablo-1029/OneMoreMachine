import type { Direction } from '../grid/GridPosition';
import type { ItemState } from './ItemState';
import type { MachineType } from './MachineTypes';

/** Resource id → count. */
export type Inventory = Record<string, number>;

export interface MachineState {
  id: string;
  type: MachineType;
  /** Top-left cell of the (rotated) footprint. */
  gridX: number;
  gridY: number;
  rotation: Direction;
  enabled: boolean;
  recipeId: string | null;
  /** True while a craft is in progress (inputs already consumed). */
  active: boolean;
  /** 0..1 through the current craft. */
  progress: number;
  inputInventory: Inventory;
  outputInventory: Inventory;
  /** Routers: items physically crossing the tile, front (highest progress) first. */
  transit: ItemState[];
  /** Routers: which output takes the next item. */
  routeIndex: number;
  /** Routers: index of the input port that delivered last, so a merger can take turns. */
  lastInput: number;
  /** Storage: held resource ids, oldest first. */
  stored: string[];
}

export function createMachineState(
  id: string,
  type: MachineType,
  gridX: number,
  gridY: number,
  rotation: Direction,
  recipeId: string | null,
): MachineState {
  return {
    id,
    type,
    gridX,
    gridY,
    rotation,
    enabled: true,
    recipeId,
    active: false,
    progress: 0,
    inputInventory: {},
    outputInventory: {},
    transit: [],
    routeIndex: 0,
    lastInput: -1,
    stored: [],
  };
}

export function inventoryTotal(inventory: Inventory): number {
  let total = 0;
  for (const key in inventory) total += inventory[key];
  return total;
}
