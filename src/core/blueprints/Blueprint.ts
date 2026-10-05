import { buildCost } from '../economy/Pricing';
import type { FactoryState } from '../factory/FactoryState';
import { footprintCells, getMachineDef, isMachineType, rotatedSize } from '../factory/MachineRegistry';
import { isDirection, rotateDir, type Direction, type GridPosition } from '../grid/GridPosition';

export interface BlueprintMachine {
  type: string;
  /** Top-left cell of the footprint, relative to the blueprint's own top-left corner. */
  x: number;
  y: number;
  rotation: Direction;
  recipeId: string | null;
}

export interface BlueprintConveyor {
  x: number;
  y: number;
  direction: Direction;
}

/**
 * A copy of part of a factory: what was there and how it was arranged, but none of its
 * contents. Machines are stored as newly built ones — upgrades are not copied, so pasting
 * costs exactly what building the pieces by hand would.
 */
export interface Blueprint {
  width: number;
  height: number;
  machines: BlueprintMachine[];
  conveyors: BlueprintConveyor[];
}

export function isBlueprintEmpty(blueprint: Blueprint): boolean {
  return blueprint.machines.length + blueprint.conveyors.length === 0;
}

/**
 * Copies everything lying wholly inside the rectangle of cells (corners inclusive, in any
 * order). A machine that pokes out of the rectangle is left out. The result is trimmed to
 * what was actually captured.
 */
export function captureBlueprint(factory: FactoryState, x0: number, y0: number, x1: number, y1: number): Blueprint {
  const left = Math.min(x0, x1);
  const right = Math.max(x0, x1);
  const top = Math.min(y0, y1);
  const bottom = Math.max(y0, y1);
  const inside = (cell: GridPosition) => cell.x >= left && cell.x <= right && cell.y >= top && cell.y <= bottom;

  const machines = [...factory.machines.values()].filter((m) => factory.machineCells(m).every(inside));
  const conveyors = [...factory.conveyors.values()].filter((c) => inside({ x: c.gridX, y: c.gridY }));

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const include = (cell: GridPosition) => {
    minX = Math.min(minX, cell.x);
    minY = Math.min(minY, cell.y);
    maxX = Math.max(maxX, cell.x);
    maxY = Math.max(maxY, cell.y);
  };
  for (const machine of machines) factory.machineCells(machine).forEach(include);
  for (const conveyor of conveyors) include({ x: conveyor.gridX, y: conveyor.gridY });
  if (minX === Infinity) return { width: 0, height: 0, machines: [], conveyors: [] };

  return {
    width: maxX - minX + 1,
    height: maxY - minY + 1,
    machines: machines.map((m) => ({
      type: m.type,
      x: m.gridX - minX,
      y: m.gridY - minY,
      rotation: m.rotation,
      recipeId: m.recipeId,
    })),
    conveyors: conveyors.map((c) => ({ x: c.gridX - minX, y: c.gridY - minY, direction: c.direction })),
  };
}

/** The same layout turned a quarter turn clockwise. */
export function rotateBlueprint(blueprint: Blueprint): Blueprint {
  const { width, height } = blueprint;
  return {
    width: height,
    height: width,
    machines: blueprint.machines.map((machine) => {
      const { h } = rotatedSize(getMachineDef(machine.type), machine.rotation);
      // A cell (x, y) turns to (height - 1 - y, x). The footprint's new top-left comes from
      // what was its bottom-left corner.
      return {
        ...machine,
        x: height - machine.y - h,
        y: machine.x,
        rotation: rotateDir(machine.rotation, 1),
      };
    }),
    conveyors: blueprint.conveyors.map((conveyor) => ({
      x: height - 1 - conveyor.y,
      y: conveyor.x,
      direction: rotateDir(conveyor.direction, 1),
    })),
  };
}

export function blueprintCost(blueprint: Blueprint): number {
  return (
    blueprint.machines.reduce((sum, machine) => sum + buildCost(machine.type), 0) +
    blueprint.conveyors.length * buildCost('conveyor')
  );
}

/** Every grid cell the blueprint would occupy with its top-left corner at (gridX, gridY). */
export function blueprintCells(blueprint: Blueprint, gridX: number, gridY: number): GridPosition[] {
  const cells: GridPosition[] = [];
  for (const machine of blueprint.machines) {
    cells.push(...footprintCells(getMachineDef(machine.type), gridX + machine.x, gridY + machine.y, machine.rotation));
  }
  for (const conveyor of blueprint.conveyors) cells.push({ x: gridX + conveyor.x, y: gridY + conveyor.y });
  return cells;
}

/** "3 machines, 8 belts". */
export function describeBlueprint(blueprint: Blueprint): string {
  const parts: string[] = [];
  const machines = blueprint.machines.length;
  const belts = blueprint.conveyors.length;
  if (machines > 0) parts.push(`${machines} machine${machines === 1 ? '' : 's'}`);
  if (belts > 0) parts.push(`${belts} belt${belts === 1 ? '' : 's'}`);
  return parts.join(', ') || 'empty';
}

/**
 * Reads a blueprint from untrusted data (saved by an older version, or edited by hand).
 * Returns null unless every piece is something this version knows and it all fits together.
 */
export function parseBlueprint(raw: unknown): Blueprint | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const data = raw as Record<string, unknown>;
  const whole = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value);
  if (!whole(data.width) || !whole(data.height) || data.width < 1 || data.height < 1) return null;
  if (data.width > 64 || data.height > 64) return null;
  if (!Array.isArray(data.machines) || !Array.isArray(data.conveyors)) return null;

  const blueprint: Blueprint = { width: data.width, height: data.height, machines: [], conveyors: [] };
  for (const entry of data.machines as Record<string, unknown>[]) {
    if (typeof entry !== 'object' || entry === null) return null;
    if (typeof entry.type !== 'string' || !isMachineType(entry.type)) return null;
    if (!whole(entry.x) || !whole(entry.y) || !isDirection(entry.rotation)) return null;
    if (entry.recipeId !== null && typeof entry.recipeId !== 'string') return null;
    blueprint.machines.push({
      type: entry.type,
      x: entry.x,
      y: entry.y,
      rotation: entry.rotation,
      recipeId: entry.recipeId as string | null,
    });
  }
  for (const entry of data.conveyors as Record<string, unknown>[]) {
    if (typeof entry !== 'object' || entry === null) return null;
    if (!whole(entry.x) || !whole(entry.y) || !isDirection(entry.direction)) return null;
    blueprint.conveyors.push({ x: entry.x, y: entry.y, direction: entry.direction });
  }

  // Everything must lie inside the stated size, and nothing may share a cell.
  const seen = new Set<string>();
  for (const cell of blueprintCells(blueprint, 0, 0)) {
    if (cell.x < 0 || cell.y < 0 || cell.x >= blueprint.width || cell.y >= blueprint.height) return null;
    const key = `${cell.x},${cell.y}`;
    if (seen.has(key)) return null;
    seen.add(key);
  }
  return isBlueprintEmpty(blueprint) ? null : blueprint;
}
