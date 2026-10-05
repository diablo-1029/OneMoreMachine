import type { MachineType } from '../core/factory/MachineTypes';
import { AssemblerVisual } from './AssemblerVisual';
import { FurnaceVisual } from './FurnaceVisual';
import type { MachineVisual } from './MachineVisual';
import { MergerVisual } from './MergerVisual';
import { MinerVisual } from './MinerVisual';
import { SellerVisual } from './SellerVisual';
import { SplitterVisual } from './SplitterVisual';
import { StorageVisual } from './StorageVisual';

/** Machine type → visual. Adding a machine means one entry here plus its data definition. */
const VISUALS: Record<string, () => MachineVisual> = {
  miner: () => new MinerVisual(),
  furnace: () => new FurnaceVisual(),
  assembler: () => new AssemblerVisual(),
  seller: () => new SellerVisual(),
  splitter: () => new SplitterVisual(),
  merger: () => new MergerVisual(),
  storage: () => new StorageVisual(),
};

export function createMachineVisual(type: MachineType): MachineVisual {
  const create = VISUALS[type];
  if (!create) throw new Error(`No visual registered for machine type "${type}"`);
  return create();
}
