import { DEFAULT_COSMETICS, type CosmeticChoice } from '../../data/cosmetics';
import type { ContractState } from '../contracts/Contracts';
import type { ItemState } from '../factory/ItemState';
import type { MachineState } from '../factory/MachineState';
import type { Direction } from '../grid/GridPosition';

/** Whether to keep interface animation to a minimum; "system" follows the operating system. */
export type MotionPreference = 'system' | 'on' | 'off';

/** Sizes the interface can be drawn at, as a multiple of the standard size. */
export const UI_SCALES = [0.9, 1, 1.15, 1.3] as const;

export interface GameSettings {
  masterVolume: number;
  sfx: boolean;
  music: boolean;
  shadows: boolean;
  /** The chosen floor, belt and lighting styles. */
  cosmetics: CosmeticChoice;
  reduceMotion: MotionPreference;
  /** One of UI_SCALES. */
  uiScale: number;
}

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.6,
  sfx: true,
  music: true,
  shadows: true,
  cosmetics: { ...DEFAULT_COSMETICS },
  reduceMotion: 'system',
  uiScale: 1,
};

export interface SavedConveyor {
  id: string;
  gridX: number;
  gridY: number;
  direction: Direction;
}

export interface SaveData {
  /** Schema version; bump and add a migration whenever the shape changes. */
  version: number;
  timestamp: number;

  economy: {
    money: number;
    totalEarned: number;
  };

  factory: {
    width: number;
    height: number;
    machines: MachineState[];
    conveyors: SavedConveyor[];
    items: ItemState[];
  };

  stats: {
    produced: Record<string, number>;
    sold: Record<string, number>;
  };

  simTime: number;
  tutorialStep: number;
  seenTips: string[];
  research: string[];
  contracts: ContractState;
  power: { baseSupply: number };
  achievements: string[];
  environment: string;
  prestige: { stars: number; count: number };
  settings: GameSettings;
}

/** Thrown for any save that cannot be turned back into a valid game. */
export class SaveError extends Error {}
