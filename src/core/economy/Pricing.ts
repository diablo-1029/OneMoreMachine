import { BALANCE } from '../../data/balance';
import { CONVEYOR_INFO } from '../../data/machines';
import { getResource } from '../../data/resources';
import { getUpgradeLevel } from '../../data/upgrades';
import { getMachineDef } from '../factory/MachineRegistry';
import type { BuildableType } from '../factory/MachineTypes';

export function buildCost(type: BuildableType): number {
  return type === 'conveyor' ? CONVEYOR_INFO.cost : getMachineDef(type).cost;
}

export function refundValue(type: BuildableType): number {
  return Math.floor(buildCost(type) * BALANCE.refundRate);
}

/** Price of taking a machine of this type up to `level` from the level below. */
export function upgradeCost(type: string, level: number): number {
  return Math.round(buildCost(type) * getUpgradeLevel(level).costFactor);
}

/** What removing a machine returns: its build cost plus every upgrade bought for it. */
export function machineRefund(type: string, level: number): number {
  let spent = buildCost(type);
  for (let l = 2; l <= level; l++) spent += upgradeCost(type, l);
  return Math.floor(spent * BALANCE.refundRate);
}

export function sellValue(resourceId: string): number {
  return getResource(resourceId).baseValue;
}
