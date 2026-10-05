import { BALANCE } from '../../data/balance';
import { CONVEYOR_INFO } from '../../data/machines';
import { getResource } from '../../data/resources';
import { getMachineDef } from '../factory/MachineRegistry';
import type { BuildableType } from '../factory/MachineTypes';

export function buildCost(type: BuildableType): number {
  return type === 'conveyor' ? CONVEYOR_INFO.cost : getMachineDef(type).cost;
}

export function refundValue(type: BuildableType): number {
  return Math.floor(buildCost(type) * BALANCE.refundRate);
}

export function sellValue(resourceId: string): number {
  return getResource(resourceId).baseValue;
}
