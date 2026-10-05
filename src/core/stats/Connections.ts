import { resolveTarget } from '../factory/ConveyorSystem';
import type { FactoryState } from '../factory/FactoryState';
import { getMachineDef, worldPorts } from '../factory/MachineRegistry';
import type { MachineState } from '../factory/MachineState';
import { DIR_VECTORS, oppositeDir, type Direction } from '../grid/GridPosition';

/** Splitters, mergers and storage pass items on; tracing looks straight through them. */
function passesThrough(machine: MachineState): boolean {
  const behavior = getMachineDef(machine.type).behavior;
  return behavior === 'router' || behavior === 'storage';
}

/**
 * The machines that can actually send items to `machine`: found by walking back along the
 * belts from each of its input hatches, through any splitters, mergers and storage on the way.
 */
export function upstreamMachines(factory: FactoryState, machine: MachineState): MachineState[] {
  const found = new Set<MachineState>();
  const seenCells = new Set<string>();
  const seenMachines = new Set<string>([machine.id]);

  /** Follows whatever delivers into cell (x, y) while travelling in direction `travel`. */
  const walkBack = (x: number, y: number, travel: Direction): void => {
    const sx = x - DIR_VECTORS[travel].x;
    const sy = y - DIR_VECTORS[travel].y;
    const belt = factory.conveyorAt(sx, sy);
    if (belt) {
      if (belt.direction !== travel) return;
      const key = `${sx},${sy}`;
      if (seenCells.has(key)) return;
      seenCells.add(key);
      // A belt can be fed from behind or from either side.
      for (const from of [0, 1, 2, 3] as Direction[]) {
        if (from !== oppositeDir(belt.direction)) walkBack(sx, sy, from);
      }
      return;
    }
    const source = factory.machineAt(sx, sy);
    if (!source) return;
    const ports = worldPorts(getMachineDef(source.type), source.gridX, source.gridY, source.rotation);
    if (!ports.some((p) => p.type === 'output' && p.x === sx && p.y === sy && p.side === travel)) return;
    if (seenMachines.has(source.id)) return;
    seenMachines.add(source.id);
    if (passesThrough(source)) fromInputsOf(source);
    else found.add(source);
  };

  const fromInputsOf = (target: MachineState): void => {
    for (const port of worldPorts(getMachineDef(target.type), target.gridX, target.gridY, target.rotation)) {
      if (port.type === 'input') walkBack(port.x, port.y, oppositeDir(port.side));
    }
  };

  fromInputsOf(machine);
  return [...found];
}

/**
 * The machines that `machine`'s output can actually reach: found by following the belts
 * from each of its output chutes, through any splitters, mergers and storage on the way.
 */
export function downstreamMachines(factory: FactoryState, machine: MachineState): MachineState[] {
  const found = new Set<MachineState>();
  const seenCells = new Set<string>();
  const seenMachines = new Set<string>([machine.id]);

  const follow = (x: number, y: number, direction: Direction): void => {
    const target = resolveTarget(factory, x, y, direction);
    if (!target) return;
    if (target.kind === 'conveyor') {
      const { conveyor } = target;
      const key = `${conveyor.gridX},${conveyor.gridY}`;
      if (seenCells.has(key)) return;
      seenCells.add(key);
      follow(conveyor.gridX, conveyor.gridY, conveyor.direction);
      return;
    }
    if (seenMachines.has(target.machine.id)) return;
    seenMachines.add(target.machine.id);
    if (passesThrough(target.machine)) fromOutputsOf(target.machine);
    else found.add(target.machine);
  };

  const fromOutputsOf = (source: MachineState): void => {
    for (const port of worldPorts(getMachineDef(source.type), source.gridX, source.gridY, source.rotation)) {
      if (port.type === 'output') follow(port.x, port.y, port.side);
    }
  };

  fromOutputsOf(machine);
  return [...found];
}
