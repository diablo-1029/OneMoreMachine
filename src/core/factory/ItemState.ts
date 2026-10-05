import type { Direction } from '../grid/GridPosition';

/** An item riding a conveyor tile. Movement is deterministic progress, not physics. */
export interface ItemState {
  id: number;
  resourceId: string;
  tileX: number;
  tileY: number;
  /** 0 = start of the tile, 1 = end of the tile. */
  progress: number;
  /** Direction of travel when the item entered this tile; lets the renderer curve it round corners. */
  from: Direction;
  /** Only for items crossing a router: the side they will leave by, once it has been chosen. */
  to?: Direction;
}
