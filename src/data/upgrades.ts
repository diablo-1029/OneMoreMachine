export interface UpgradeLevel {
  level: number;
  /** Shown in the UI, e.g. "Mk II". */
  name: string;
  /** Crafting speed multiplier at this level. */
  speed: number;
  /** Power draw multiplier at this level. Faster machines are hungrier than they are fast. */
  power: number;
  /** Price of reaching this level from the one below, as a multiple of the machine's build cost. */
  costFactor: number;
  /** Research node that must be completed first, if any. */
  requires: string | null;
}

/**
 * Upgrades trade money for space: a Mk III machine does the work of two, but costs far more
 * than simply building a second one. "One more machine" stays the cheap answer; upgrading is
 * for when there is no room left for it.
 */
export const UPGRADE_LEVELS: UpgradeLevel[] = [
  { level: 1, name: 'Mk I', speed: 1, power: 1, costFactor: 0, requires: null },
  { level: 2, name: 'Mk II', speed: 1.5, power: 2, costFactor: 10, requires: 'machine_tuning' },
  { level: 3, name: 'Mk III', speed: 2, power: 3, costFactor: 40, requires: 'precision_engineering' },
];

export const MAX_MACHINE_LEVEL = UPGRADE_LEVELS.length;

export function getUpgradeLevel(level: number): UpgradeLevel {
  return UPGRADE_LEVELS[Math.min(Math.max(level, 1), MAX_MACHINE_LEVEL) - 1];
}
