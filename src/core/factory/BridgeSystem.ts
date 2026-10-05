import { CONVEYOR_SPEED, ITEM_SPACING } from '../game/Constants';
import type { Direction } from '../grid/GridPosition';
import { moveItemOnto, resolveTarget, type TransferHooks } from './ConveyorSystem';
import type { FactoryState } from './FactoryState';
import type { ItemState } from './ItemState';
import type { MachineState } from './MachineState';

/**
 * A bridge lets two belts cross. It is one tile with two independent lanes, east–west and
 * north–south; an item leaves by the side opposite the one it came in through, at belt speed,
 * and never changes lane. Each lane keeps belt spacing and runs one way at a time.
 */

/** 0 for the east–west lane, 1 for the north–south lane. */
function laneOf(direction: Direction): number {
  return direction % 2;
}

function laneItems(machine: MachineState, lane: number): ItemState[] {
  return machine.transit.filter((item) => laneOf(item.from) === lane);
}

/** Whether an item travelling in `from` may enter now. */
export function bridgeAccepts(machine: MachineState, from: Direction): boolean {
  if (!machine.enabled) return false;
  const items = laneItems(machine, laneOf(from));
  // The lane is busy carrying traffic the other way.
  if (items.some((item) => item.from !== from)) return false;
  const rear = items[items.length - 1];
  return !rear || rear.progress >= ITEM_SPACING - 1e-6;
}

/** See TransferHooks.entryLimit: keeps belt spacing between an approaching item and the last one in. */
export function bridgeEntryLimit(machine: MachineState, from: Direction): number {
  const items = laneItems(machine, laneOf(from));
  const rear = items[items.length - 1];
  return rear ? 1 + rear.progress - ITEM_SPACING : Infinity;
}

/** Takes an item onto the bridge. Call only after bridgeAccepts. */
export function bridgeInsert(
  factory: FactoryState,
  machine: MachineState,
  from: Direction,
  resourceId: string,
  item?: ItemState,
): void {
  const entering: ItemState = item ?? { id: factory.nextItemId++, resourceId, tileX: 0, tileY: 0, progress: 0, from };
  entering.tileX = machine.gridX;
  entering.tileY = machine.gridY;
  entering.progress = 0;
  entering.from = from;
  // Straight across: it leaves the way it was already going.
  entering.to = from;
  machine.transit.push(entering);
}

/** Advances both lanes of one bridge by `dt`. */
export function updateBridge(factory: FactoryState, machine: MachineState, dt: number, hooks: TransferHooks): void {
  if (machine.transit.length === 0 || !machine.enabled) return;
  const step = CONVEYOR_SPEED * dt;
  const leave = (item: ItemState) => {
    const at = machine.transit.indexOf(item);
    if (at >= 0) machine.transit.splice(at, 1);
  };

  for (const lane of [0, 1]) {
    let ahead = Infinity;
    // A snapshot, front item first: items join the list in the order they enter.
    for (const item of laneItems(machine, lane)) {
      let progress = Math.min(item.progress + step, ahead - ITEM_SPACING);
      const target = resolveTarget(factory, machine.gridX, machine.gridY, item.from);

      if (target?.kind === 'conveyor') {
        const rear = target.conveyor.items[target.conveyor.items.length - 1];
        if (rear) progress = Math.min(progress, 1 + rear.progress - ITEM_SPACING);
        if (progress >= 1) {
          leave(item);
          moveItemOnto(target.conveyor, item, item.from, progress - 1);
          continue;
        }
      } else if (progress >= 1) {
        const direction = item.from;
        if (target?.kind === 'machine' && hooks.deliver(target.machine, item.resourceId, target.port, direction, item)) {
          leave(item);
          continue;
        }
        // Nothing to hand over to: wait at the far edge.
        progress = 1;
      }

      if (progress > item.progress) item.progress = progress;
      ahead = item.progress;
    }
  }
}
