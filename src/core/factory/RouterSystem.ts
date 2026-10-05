import { CONVEYOR_SPEED, ITEM_SPACING } from '../game/Constants';
import { oppositeDir, type Direction } from '../grid/GridPosition';
import { conveyorHasRoom, moveItemOnto, resolveTarget, type TransferHooks, type TransferTarget } from './ConveyorSystem';
import type { FactoryState } from './FactoryState';
import type { ItemState } from './ItemState';
import { getMachineDef, worldPorts, type WorldPort } from './MachineRegistry';
import type { MachineState } from './MachineState';

/**
 * Routers (splitters and mergers) behave like a belt tile with several ways in or out.
 * Items stay physical while crossing: progress 0 is the entry edge, 0.5 the centre, 1 the
 * exit edge. The exit is picked at the centre, so the first half of the path never depends on it.
 */

/** Progress at which an item reaches the middle of the tile and must know where it is going. */
const CENTRE = 0.5;
/** How close to the entry an item must be to count as queued for it (merger turn-taking). */
const QUEUE_TOLERANCE = 0.1;

export type RouterHooks = TransferHooks & {
  /** Whether a machine would take the resource through that port right now, without doing it. */
  canDeliver: (machine: MachineState, resourceId: string, port: number) => boolean;
};

function rearOf(machine: MachineState): ItemState | undefined {
  return machine.transit[machine.transit.length - 1];
}

/** See TransferHooks.entryLimit: keeps one spacing between the approaching item and the last one in. */
export function routerEntryLimit(machine: MachineState): number {
  const rear = rearOf(machine);
  return rear ? 1 + rear.progress - ITEM_SPACING : Infinity;
}

/** True when a belt feeding `port` has an item pressed up against the router. */
function hasQueuedItem(factory: FactoryState, machine: MachineState, port: WorldPort): boolean {
  const feeder = factory.conveyorAt(port.outerX, port.outerY);
  if (!feeder || feeder.direction !== oppositeDir(port.side)) return false;
  const front = feeder.items[0];
  return front !== undefined && front.progress >= Math.min(1, routerEntryLimit(machine)) - QUEUE_TOLERANCE;
}

export function routerAccepts(factory: FactoryState, machine: MachineState, port: number): boolean {
  if (!machine.enabled) return false;
  const rear = rearOf(machine);
  if (rear && rear.progress < ITEM_SPACING - 1e-6) return false;

  // Turn-taking: the input that went last waits if any other input has an item ready.
  if (port === machine.lastInput) {
    const ports = worldPorts(getMachineDef(machine.type), machine.gridX, machine.gridY, machine.rotation);
    for (let i = 0; i < ports.length; i++) {
      if (i !== port && ports[i].type === 'input' && hasQueuedItem(factory, machine, ports[i])) return false;
    }
  }
  return true;
}

/** Takes an item into the router. Call only after routerAccepts. */
export function routerInsert(
  factory: FactoryState,
  machine: MachineState,
  port: number,
  from: Direction,
  resourceId: string,
  item?: ItemState,
): void {
  const entering: ItemState = item ?? { id: factory.nextItemId++, resourceId, tileX: 0, tileY: 0, progress: 0, from };
  entering.tileX = machine.gridX;
  entering.tileY = machine.gridY;
  entering.progress = 0;
  entering.from = from;
  delete entering.to;
  machine.transit.push(entering);
  machine.lastInput = port;
}

function targetHasRoom(target: TransferTarget, resourceId: string, hooks: RouterHooks): boolean {
  return target.kind === 'conveyor'
    ? conveyorHasRoom(target.conveyor)
    : hooks.canDeliver(target.machine, resourceId, target.port);
}

/**
 * Picks the next output in round-robin order. Outputs with room right now are preferred;
 * if `allowBusy`, a connected but momentarily full output is accepted as a fallback so a
 * single fast belt is never starved by the timing of the check.
 */
function chooseOutput(
  factory: FactoryState,
  machine: MachineState,
  outputs: WorldPort[],
  resourceId: string,
  hooks: RouterHooks,
  allowBusy: boolean,
  exclude?: Direction,
): Direction | null {
  let fallback: { side: Direction; next: number } | null = null;
  for (let step = 0; step < outputs.length; step++) {
    const index = (machine.routeIndex + step) % outputs.length;
    const port = outputs[index];
    if (port.side === exclude) continue;
    const target = resolveTarget(factory, port.x, port.y, port.side);
    if (!target) continue;
    if (targetHasRoom(target, resourceId, hooks)) {
      machine.routeIndex = (index + 1) % outputs.length;
      return port.side;
    }
    fallback ??= { side: port.side, next: (index + 1) % outputs.length };
  }
  if (allowBusy && fallback) {
    machine.routeIndex = fallback.next;
    return fallback.side;
  }
  return null;
}

/** Advances the items crossing one router by `dt`. */
export function updateRouter(factory: FactoryState, machine: MachineState, dt: number, hooks: RouterHooks): void {
  const transit = machine.transit;
  if (transit.length === 0 || !machine.enabled) return;
  const outputs = worldPorts(getMachineDef(machine.type), machine.gridX, machine.gridY, machine.rotation).filter(
    (p) => p.type === 'output',
  );
  const step = CONVEYOR_SPEED * dt;

  let ahead = Infinity;
  let index = 0;
  while (index < transit.length) {
    const item = transit[index];
    let progress = Math.min(item.progress + step, ahead - ITEM_SPACING);

    if (item.to === undefined && progress >= CENTRE) {
      const side = chooseOutput(factory, machine, outputs, item.resourceId, hooks, true);
      if (side === null) progress = CENTRE;
      else item.to = side;
    }

    if (item.to !== undefined) {
      const target = resolveTarget(factory, machine.gridX, machine.gridY, item.to);
      let stuck = target === null;

      if (target?.kind === 'conveyor') {
        const rear = target.conveyor.items[target.conveyor.items.length - 1];
        if (rear) progress = Math.min(progress, 1 + rear.progress - ITEM_SPACING);
        if (progress >= 1) {
          transit.splice(index, 1);
          moveItemOnto(target.conveyor, item, item.to, progress - 1);
          continue;
        }
        // Held back near the centre by a belt with no room: that output is jammed.
        stuck = progress <= CENTRE + 0.05 && !conveyorHasRoom(target.conveyor);
      } else if (target?.kind === 'machine' && progress >= 1) {
        if (hooks.deliver(target.machine, item.resourceId, target.port, item.to, item)) {
          const at = transit.indexOf(item);
          if (at >= 0) transit.splice(at, 1);
          continue;
        }
        stuck = true;
      }

      if (stuck) {
        // Send it back through the centre to another output that can take it now.
        const alternative = chooseOutput(factory, machine, outputs, item.resourceId, hooks, false, item.to);
        if (alternative !== null) {
          item.to = alternative;
          item.progress = CENTRE;
          progress = CENTRE;
        }
      }
      progress = Math.min(progress, 1);
    }

    if (progress > item.progress) item.progress = progress;
    ahead = item.progress;
    index++;
  }
}
