import { MACHINE_DEFINITIONS } from '../../data/machines';
import { DIR_VECTORS, rotateDir, type Direction, type GridPosition } from '../grid/GridPosition';
import type { MachineDefinition, MachineType } from './MachineTypes';

const byType = new Map(MACHINE_DEFINITIONS.map((d) => [d.type, d]));

export function getMachineDef(type: MachineType): MachineDefinition {
  const def = byType.get(type);
  if (!def) throw new Error(`Unknown machine type: ${type}`);
  return def;
}

export function isMachineType(type: string): boolean {
  return byType.has(type);
}

/** Footprint size after rotating; odd rotations swap width and height. */
export function rotatedSize(def: MachineDefinition, rotation: Direction): { w: number; h: number } {
  return rotation % 2 === 0 ? { w: def.width, h: def.height } : { w: def.height, h: def.width };
}

/** Rotates a footprint-local cell clockwise `rotation` times within a w×h footprint. */
function rotateLocalCell(lx: number, ly: number, w: number, h: number, rotation: Direction): GridPosition {
  let x = lx;
  let y = ly;
  let curW = w;
  let curH = h;
  for (let i = 0; i < rotation; i++) {
    const nx = curH - 1 - y;
    const ny = x;
    x = nx;
    y = ny;
    [curW, curH] = [curH, curW];
  }
  return { x, y };
}

export function footprintCells(
  def: MachineDefinition,
  gridX: number,
  gridY: number,
  rotation: Direction,
): GridPosition[] {
  const { w, h } = rotatedSize(def, rotation);
  const cells: GridPosition[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) cells.push({ x: gridX + x, y: gridY + y });
  }
  return cells;
}

export interface WorldPort {
  type: 'input' | 'output';
  /** Footprint cell the port belongs to. */
  x: number;
  y: number;
  /** Direction the port faces, away from the machine. */
  side: Direction;
  /** The cell just outside the port. */
  outerX: number;
  outerY: number;
}

/** Resolves a definition's ports to grid cells for a placed machine. Rotation is handled generically. */
export function worldPorts(
  def: MachineDefinition,
  gridX: number,
  gridY: number,
  rotation: Direction,
): WorldPort[] {
  return def.ports.map((port) => {
    const local = rotateLocalCell(port.localX, port.localY, def.width, def.height, rotation);
    const side = rotateDir(port.side, rotation);
    const x = gridX + local.x;
    const y = gridY + local.y;
    return {
      type: port.type,
      x,
      y,
      side,
      outerX: x + DIR_VECTORS[side].x,
      outerY: y + DIR_VECTORS[side].y,
    };
  });
}
