import { TILE_SIZE } from '../core/game/Constants';
import type { Direction } from '../core/grid/GridPosition';

/**
 * Grid ↔ world conversion. Grid X maps to world X, grid Y to world Z, height to world Y.
 * The grid is centred on the world origin so the camera can simply look at (0, 0, 0).
 */
let gridWidth = 12;
let gridHeight = 12;

export function setWorldGrid(width: number, height: number): void {
  gridWidth = width;
  gridHeight = height;
}

/** World X of the centre of grid column `gx`. Fractional values are allowed. */
export function cellCenterX(gx: number): number {
  return (gx + 0.5 - gridWidth / 2) * TILE_SIZE;
}

export function cellCenterZ(gy: number): number {
  return (gy + 0.5 - gridHeight / 2) * TILE_SIZE;
}

/** Continuous grid coordinate for a world position; floor it to get the cell. */
export function worldToGridX(wx: number): number {
  return wx / TILE_SIZE + gridWidth / 2;
}

export function worldToGridY(wz: number): number {
  return wz / TILE_SIZE + gridHeight / 2;
}

/** Y rotation that turns an object modelled facing East (+X) to face `dir`. */
export function dirAngle(dir: Direction): number {
  return -dir * (Math.PI / 2);
}
