import { getUpgradeLevel } from '../../data/upgrades';
import type { FactoryState } from '../factory/FactoryState';
import { getMachineDef } from '../factory/MachineRegistry';
import type { MachineState } from '../factory/MachineState';

/** Saved power state. Supply from generators and demand from machines are derived each tick. */
export interface PowerState {
  /** Power the factory gets for free, before any generator is built. */
  baseSupply: number;
}

export interface PowerStatus {
  supply: number;
  demand: number;
  /** 0..1: how fast powered machines run. 1 whenever supply covers demand. */
  ratio: number;
}

/** Power a machine draws while switched on. Upgraded machines draw more. */
export function machinePowerUse(machine: MachineState): number {
  if (!machine.enabled) return 0;
  return (getMachineDef(machine.type).powerUse ?? 0) * getUpgradeLevel(machine.level).power;
}

/** Power a machine feeds into the factory while switched on. */
export function machinePowerOutput(machine: MachineState): number {
  return machine.enabled ? (getMachineDef(machine.type).powerOutput ?? 0) : 0;
}

/**
 * The whole factory shares one pool: no wiring. When machines want more than there is,
 * nothing shuts off — every powered machine simply slows down by the same proportion.
 */
export function computePower(factory: FactoryState, power: PowerState): PowerStatus {
  let supply = power.baseSupply;
  let demand = 0;
  for (const machine of factory.machines.values()) {
    supply += machinePowerOutput(machine);
    demand += machinePowerUse(machine);
  }
  return { supply, demand, ratio: demand > supply ? supply / demand : 1 };
}
