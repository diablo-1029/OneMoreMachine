import type { MachineType } from '../factory/MachineTypes';

export interface ResourceAmount {
  resourceId: string;
  amount: number;
}

export interface Recipe {
  id: string;
  machineType: MachineType;
  inputs: ResourceAmount[];
  outputs: ResourceAmount[];
  /** Seconds per craft. */
  duration: number;
}
