import type { Grid } from './Grid';
import type { GridOccupancy } from './GridOccupancy';
import type { GridPosition } from './GridPosition';

export type PlacementFailure = 'out_of_bounds' | 'blocked' | 'occupied';

export type PlacementCheck = { valid: true } | { valid: false; reason: PlacementFailure };

/**
 * Checks that every footprint cell is inside the grid, buildable and free.
 * `ignoreId` lets an entity be re-validated against its own cells (used when rotating).
 */
export function validatePlacement(
  grid: Grid,
  occupancy: GridOccupancy,
  cells: readonly GridPosition[],
  ignoreId?: string,
): PlacementCheck {
  for (const cell of cells) {
    if (!grid.inBounds(cell.x, cell.y)) return { valid: false, reason: 'out_of_bounds' };
  }
  for (const cell of cells) {
    if (grid.isBlocked(cell.x, cell.y)) return { valid: false, reason: 'blocked' };
  }
  for (const cell of cells) {
    const occupant = occupancy.get(cell.x, cell.y);
    if (occupant && occupant.id !== ignoreId) return { valid: false, reason: 'occupied' };
  }
  return { valid: true };
}
