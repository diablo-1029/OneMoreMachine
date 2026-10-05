import { Grid } from '../grid/Grid';
import { GridOccupancy } from '../grid/GridOccupancy';
import type { ConveyorState } from './ConveyorState';
import { footprintCells, getMachineDef } from './MachineRegistry';
import type { MachineState } from './MachineState';

/** All placed entities plus the grid they sit on. Pure data container; rules live in Simulation. */
export class FactoryState {
  readonly grid: Grid;
  readonly occupancy = new GridOccupancy();
  readonly machines = new Map<string, MachineState>();
  readonly conveyors = new Map<string, ConveyorState>();
  nextEntityId = 1;
  nextItemId = 1;

  constructor(width: number, height: number) {
    this.grid = new Grid(width, height);
  }

  newEntityId(prefix: string): string {
    return `${prefix}${this.nextEntityId++}`;
  }

  machineCells(machine: MachineState) {
    return footprintCells(getMachineDef(machine.type), machine.gridX, machine.gridY, machine.rotation);
  }

  addMachine(machine: MachineState): void {
    this.machines.set(machine.id, machine);
    this.occupancy.occupy(this.machineCells(machine), { kind: 'machine', id: machine.id });
  }

  removeMachine(machine: MachineState): void {
    this.occupancy.release(this.machineCells(machine));
    this.machines.delete(machine.id);
  }

  addConveyor(conveyor: ConveyorState): void {
    this.conveyors.set(conveyor.id, conveyor);
    this.occupancy.occupy([{ x: conveyor.gridX, y: conveyor.gridY }], { kind: 'conveyor', id: conveyor.id });
  }

  removeConveyor(conveyor: ConveyorState): void {
    this.occupancy.release([{ x: conveyor.gridX, y: conveyor.gridY }]);
    this.conveyors.delete(conveyor.id);
  }

  machineAt(x: number, y: number): MachineState | undefined {
    const occupant = this.occupancy.get(x, y);
    return occupant?.kind === 'machine' ? this.machines.get(occupant.id) : undefined;
  }

  conveyorAt(x: number, y: number): ConveyorState | undefined {
    const occupant = this.occupancy.get(x, y);
    return occupant?.kind === 'conveyor' ? this.conveyors.get(occupant.id) : undefined;
  }

  itemCount(): number {
    let count = 0;
    for (const conveyor of this.conveyors.values()) count += conveyor.items.length;
    for (const machine of this.machines.values()) count += machine.transit.length;
    return count;
  }
}
