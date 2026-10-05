import { cellKey, type GridPosition } from './GridPosition';

export interface Occupant {
  kind: 'machine' | 'conveyor';
  id: string;
}

/** Single source of truth for which entity sits on which cell. */
export class GridOccupancy {
  private readonly cells = new Map<number, Occupant>();

  get(x: number, y: number): Occupant | undefined {
    return this.cells.get(cellKey(x, y));
  }

  occupy(cells: readonly GridPosition[], occupant: Occupant): void {
    for (const cell of cells) this.cells.set(cellKey(cell.x, cell.y), occupant);
  }

  release(cells: readonly GridPosition[]): void {
    for (const cell of cells) this.cells.delete(cellKey(cell.x, cell.y));
  }

  clear(): void {
    this.cells.clear();
  }
}
