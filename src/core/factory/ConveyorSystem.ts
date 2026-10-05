import { CONVEYOR_SPEED, ITEM_SPACING } from '../game/Constants';
import { DIR_VECTORS, oppositeDir, rotateDir, type Direction } from '../grid/GridPosition';
import type { ConveyorState } from './ConveyorState';
import type { FactoryState } from './FactoryState';
import type { ItemState } from './ItemState';
import { getMachineDef, worldPorts } from './MachineRegistry';
import type { MachineState } from './MachineState';

export type TransferTarget =
  | { kind: 'conveyor'; conveyor: ConveyorState }
  | { kind: 'machine'; machine: MachineState; /** Index of the input port in the definition. */ port: number };

/**
 * What an item leaving cell (x, y) in direction `dir` would enter, if anything:
 * a conveyor that is not pointing straight back, or a machine with an input port facing us.
 */
export function resolveTarget(
  factory: FactoryState,
  x: number,
  y: number,
  dir: Direction,
): TransferTarget | null {
  const tx = x + DIR_VECTORS[dir].x;
  const ty = y + DIR_VECTORS[dir].y;
  const occupant = factory.occupancy.get(tx, ty);
  if (!occupant) return null;

  if (occupant.kind === 'conveyor') {
    const conveyor = factory.conveyors.get(occupant.id)!;
    return conveyor.direction === oppositeDir(dir) ? null : { kind: 'conveyor', conveyor };
  }

  const machine = factory.machines.get(occupant.id)!;
  const facing = oppositeDir(dir);
  const ports = worldPorts(getMachineDef(machine.type), machine.gridX, machine.gridY, machine.rotation);
  const port = ports.findIndex((p) => p.type === 'input' && p.x === tx && p.y === ty && p.side === facing);
  return port >= 0 ? { kind: 'machine', machine, port } : null;
}

/** True if something at the cell behind `conveyor` (relative to `travel`) feeds into it. */
function isFedFrom(factory: FactoryState, conveyor: ConveyorState, travel: Direction): boolean {
  return isFedAt(factory, conveyor.gridX, conveyor.gridY, travel);
}

/**
 * True if the neighbour "behind" cell (x, y) sends items into it travelling in `travel`:
 * a belt heading that way, or a machine with an output port facing the cell.
 */
export function isFedAt(factory: FactoryState, x: number, y: number, travel: Direction): boolean {
  const sx = x - DIR_VECTORS[travel].x;
  const sy = y - DIR_VECTORS[travel].y;
  const occupant = factory.occupancy.get(sx, sy);
  if (!occupant) return false;
  if (occupant.kind === 'conveyor') return factory.conveyors.get(occupant.id)!.direction === travel;
  const machine = factory.machines.get(occupant.id)!;
  const ports = worldPorts(getMachineDef(machine.type), machine.gridX, machine.gridY, machine.rotation);
  return ports.some((p) => p.type === 'output' && p.x === sx && p.y === sy && p.side === travel);
}

export type ConveyorShape = { kind: 'straight' } | { kind: 'corner'; from: Direction };

/**
 * A belt renders as a corner only when its sole feeder comes in from the side.
 * `from` is the feeder's direction of travel.
 */
export function conveyorShape(factory: FactoryState, conveyor: ConveyorState): ConveyorShape {
  if (isFedFrom(factory, conveyor, conveyor.direction)) return { kind: 'straight' };
  const left = rotateDir(conveyor.direction, 1);
  const right = rotateDir(conveyor.direction, 3);
  const fedLeft = isFedFrom(factory, conveyor, left);
  const fedRight = isFedFrom(factory, conveyor, right);
  if (fedLeft !== fedRight) return { kind: 'corner', from: fedLeft ? left : right };
  return { kind: 'straight' };
}

/**
 * Cached belt topology: where each conveyor delivers to, and an update order that
 * processes downstream belts first so items can follow each other without gaps.
 */
export class ConveyorNetwork {
  private dirty = true;
  private order: ConveyorState[] = [];
  private readonly targets = new Map<string, TransferTarget | null>();

  invalidate(): void {
    this.dirty = true;
  }

  targetOf(conveyor: ConveyorState): TransferTarget | null {
    return this.targets.get(conveyor.id) ?? null;
  }

  updateOrder(factory: FactoryState): readonly ConveyorState[] {
    if (this.dirty) this.rebuild(factory);
    return this.order;
  }

  private rebuild(factory: FactoryState): void {
    this.dirty = false;
    this.order = [];
    this.targets.clear();
    for (const conveyor of factory.conveyors.values()) {
      this.targets.set(conveyor.id, resolveTarget(factory, conveyor.gridX, conveyor.gridY, conveyor.direction));
    }

    // Walk each chain to its end, then emit on the way back so sinks come first.
    // Loops are cut wherever the walk re-enters a belt already on the stack.
    const visited = new Set<string>();
    const stack: ConveyorState[] = [];
    for (const start of factory.conveyors.values()) {
      let current: ConveyorState | null = start;
      while (current && !visited.has(current.id)) {
        visited.add(current.id);
        stack.push(current);
        const target: TransferTarget | null = this.targets.get(current.id) ?? null;
        current = target?.kind === 'conveyor' ? target.conveyor : null;
      }
      while (stack.length > 0) this.order.push(stack.pop()!);
    }
  }
}

/** A belt has room at its entry when its rearmost item has moved one spacing along. */
export function conveyorHasRoom(conveyor: ConveyorState): boolean {
  const rear = conveyor.items[conveyor.items.length - 1];
  // The tolerance absorbs rounding from summing ticks; without it a full belt loses a tick per item.
  return !rear || rear.progress >= ITEM_SPACING - 1e-6;
}

export function insertItem(
  factory: FactoryState,
  conveyor: ConveyorState,
  resourceId: string,
  from: Direction,
): void {
  conveyor.items.push({
    id: factory.nextItemId++,
    resourceId,
    tileX: conveyor.gridX,
    tileY: conveyor.gridY,
    progress: 0,
    from,
  });
}

/** Puts an item that already exists (e.g. one leaving a router) onto the start of a belt. */
export function moveItemOnto(conveyor: ConveyorState, item: ItemState, from: Direction, progress: number): void {
  item.tileX = conveyor.gridX;
  item.tileY = conveyor.gridY;
  item.progress = progress;
  item.from = from;
  delete item.to;
  conveyor.items.push(item);
}

export interface TransferHooks {
  /**
   * Hands an item to a machine through one of its input ports and reports whether it was taken.
   * `item` is passed when the item already exists on a belt, so machines that keep items
   * physical (routers) can carry the same object on.
   */
  deliver: (machine: MachineState, resourceId: string, port: number, from: Direction, item?: ItemState) => boolean;
  /**
   * How far an item approaching the machine may advance on its own tile (1 = the edge).
   * Lets routers keep belt spacing across the boundary; Infinity for everything else.
   */
  entryLimit: (machine: MachineState) => number;
}

/** Advances every belt by `dt`. */
export function updateConveyors(
  factory: FactoryState,
  network: ConveyorNetwork,
  dt: number,
  hooks: TransferHooks,
): void {
  const step = CONVEYOR_SPEED * dt;
  for (const conveyor of network.updateOrder(factory)) {
    const items = conveyor.items;
    if (items.length === 0) continue;
    const target = network.targetOf(conveyor);

    let ahead = Infinity;
    let index = 0;
    while (index < items.length) {
      const item = items[index];
      let progress = Math.min(item.progress + step, ahead - ITEM_SPACING);

      if (index === 0 && target?.kind === 'conveyor') {
        // Keep spacing across the tile boundary: progress 1 here is progress 0 on the next belt.
        const next = target.conveyor;
        const rear = next.items[next.items.length - 1];
        if (rear) progress = Math.min(progress, 1 + rear.progress - ITEM_SPACING);
        if (progress >= 1) {
          items.shift();
          item.progress = progress - 1;
          item.tileX = next.gridX;
          item.tileY = next.gridY;
          item.from = conveyor.direction;
          next.items.push(item);
          continue;
        }
      } else {
        const machineTarget = index === 0 && target?.kind === 'machine' ? target : null;
        if (machineTarget) progress = Math.min(progress, hooks.entryLimit(machineTarget.machine));
        if (progress >= 1) {
          if (
            machineTarget &&
            hooks.deliver(machineTarget.machine, item.resourceId, machineTarget.port, conveyor.direction, item)
          ) {
            items.shift();
            continue;
          }
          progress = 1;
        }
      }

      if (progress > item.progress) item.progress = progress;
      ahead = item.progress;
      index++;
    }
  }
}
