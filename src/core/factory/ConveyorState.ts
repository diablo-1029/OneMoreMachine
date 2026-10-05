import type { Direction } from '../grid/GridPosition';
import type { ItemState } from './ItemState';

export interface ConveyorState {
  id: string;
  gridX: number;
  gridY: number;
  /** Direction items leave the tile. */
  direction: Direction;
  /** Items on this tile, front (highest progress) first. */
  items: ItemState[];
}
