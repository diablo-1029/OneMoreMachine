import { BALANCE } from '../../data/balance';
import { MACHINE_DEFINITIONS } from '../../data/machines';
import { LEGACY_RESEARCH } from '../../data/research';
import { getUpgradeLevel } from '../../data/upgrades';
import { SAVE_VERSION } from '../game/Constants';
import { SaveError } from './SaveSchema';

type RawSave = Record<string, unknown>;

/** One entry per historical version: MIGRATIONS[n] upgrades a version-n save to n + 1. */
const MIGRATIONS: Record<number, (save: RawSave) => RawSave> = {
  // v2 added routers and storage, which keep items inside the machine.
  1: (save) => {
    const factory = save.factory as { machines?: unknown } | undefined;
    if (factory && Array.isArray(factory.machines)) {
      for (const machine of factory.machines) {
        if (typeof machine !== 'object' || machine === null) continue;
        Object.assign(machine, { transit: [], routeIndex: 0, lastInput: -1, stored: [] });
      }
    }
    return save;
  },
  // v3 added research. Everything it gates in older saves was free before, so grant it.
  2: (save) => {
    save.research = [...LEGACY_RESEARCH];
    return save;
  },
  // v6 added power. A factory built before then keeps running at full speed: its free supply
  // is raised to cover everything it already has, so power only matters once it grows.
  5: (save) => {
    const factory = save.factory as { machines?: unknown } | undefined;
    let demand = 0;
    if (factory && Array.isArray(factory.machines)) {
      for (const machine of factory.machines as { type?: unknown; level?: unknown }[]) {
        const def = MACHINE_DEFINITIONS.find((d) => d.type === machine?.type);
        const level = typeof machine?.level === 'number' ? machine.level : 1;
        demand += (def?.powerUse ?? 0) * getUpgradeLevel(level).power;
      }
    }
    save.power = { baseSupply: Math.max(BALANCE.power.baseSupply, Math.ceil(demand)) };
    return save;
  },
  // v5 added machine upgrade levels.
  4: (save) => {
    const factory = save.factory as { machines?: unknown } | undefined;
    if (factory && Array.isArray(factory.machines)) {
      for (const machine of factory.machines) {
        if (typeof machine === 'object' && machine !== null) Object.assign(machine, { level: 1 });
      }
    }
    return save;
  },
  // v4 added contracts; the first offers are generated when the game starts.
  3: (save) => {
    save.contracts = { active: [], completed: 0, nextId: 1 };
    return save;
  },
};

/** Upgrades a parsed save to the current schema version, step by step. */
export function migrateSave(raw: unknown): RawSave {
  if (typeof raw !== 'object' || raw === null) throw new SaveError('Save is not an object');
  let save = raw as RawSave;
  let version = save.version;
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
    throw new SaveError('Save has no valid version');
  }
  if (version > SAVE_VERSION) throw new SaveError('Save is from a newer version of the game');

  while (version < SAVE_VERSION) {
    const migrate = MIGRATIONS[version];
    if (!migrate) throw new SaveError(`No migration from save version ${version}`);
    save = migrate(save);
    version++;
    save.version = version;
  }
  return save;
}
