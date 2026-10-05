import { cellKey } from './GridPosition';

/** The buildable area. Cells can be marked blocked for scenery or future terrain. */
export class Grid {
  private readonly blocked = new Set<number>();

  constructor(
    readonly width: number,
    readonly height: number,
  ) {}

  inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  setBlocked(x: number, y: number, blocked: boolean): void {
    if (blocked) this.blocked.add(cellKey(x, y));
    else this.blocked.delete(cellKey(x, y));
  }

  isBlocked(x: number, y: number): boolean {
    return this.blocked.has(cellKey(x, y));
  }
}
