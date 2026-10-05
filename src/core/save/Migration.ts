import { LEGACY_RESEARCH } from '../../data/research';
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
