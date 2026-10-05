/**
 * Cardinal direction on the logical grid. Increasing the value rotates clockwise
 * when the grid is viewed with +x to the right and +y downwards.
 * 0 = East (+x), 1 = South (+y), 2 = West (-x), 3 = North (-y).
 */
export type Direction = 0 | 1 | 2 | 3;

export interface GridPosition {
  x: number;
  y: number;
}

export const DIR_VECTORS: readonly GridPosition[] = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
];

export const DIR_NAMES = ['East', 'South', 'West', 'North'] as const;

export function rotateDir(dir: Direction, steps: number): Direction {
  return ((((dir + steps) % 4) + 4) % 4) as Direction;
}

export function oppositeDir(dir: Direction): Direction {
  return rotateDir(dir, 2);
}

export function isDirection(value: unknown): value is Direction {
  return value === 0 || value === 1 || value === 2 || value === 3;
}

/** Packs a cell into a single number for use as a Map/Set key. */
export function cellKey(x: number, y: number): number {
  return y * 4096 + x;
}
