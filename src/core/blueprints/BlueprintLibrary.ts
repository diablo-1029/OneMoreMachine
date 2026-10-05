import { parseBlueprint, type Blueprint } from './Blueprint';

export interface SavedBlueprint {
  id: number;
  name: string;
  blueprint: Blueprint;
}

const STORAGE_KEY = 'omm.blueprints';
export const MAX_BLUEPRINTS = 20;
const MAX_NAME_LENGTH = 30;

/** The slice of the Web Storage API this needs; lets tests pass in a stand-in. */
export interface BlueprintStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * The player's saved blueprints. Kept apart from any one factory's save, so a layout
 * designed in one factory can be placed in the next.
 */
export class BlueprintLibrary {
  private items: SavedBlueprint[] = [];
  private nextId = 1;

  constructor(private readonly storage: BlueprintStorage | null) {
    this.load();
  }

  get all(): readonly SavedBlueprint[] {
    return this.items;
  }

  get isFull(): boolean {
    return this.items.length >= MAX_BLUEPRINTS;
  }

  /** Stores a blueprint under a default name. Returns null when the library is full. */
  add(blueprint: Blueprint): SavedBlueprint | null {
    if (this.isFull) return null;
    const saved: SavedBlueprint = { id: this.nextId++, name: `Blueprint ${this.nextId - 1}`, blueprint };
    this.items.push(saved);
    this.persist();
    return saved;
  }

  rename(id: number, name: string): void {
    const item = this.items.find((i) => i.id === id);
    const trimmed = name.trim().slice(0, MAX_NAME_LENGTH);
    if (!item || trimmed.length === 0 || item.name === trimmed) return;
    item.name = trimmed;
    this.persist();
  }

  remove(id: number): void {
    this.items = this.items.filter((i) => i.id !== id);
    this.persist();
  }

  private load(): void {
    let raw: unknown;
    try {
      const text = this.storage?.getItem(STORAGE_KEY);
      raw = text ? JSON.parse(text) : undefined;
    } catch {
      return; // Unreadable: start with an empty library rather than fail.
    }
    if (!Array.isArray(raw)) return;
    for (const entry of raw as Record<string, unknown>[]) {
      if (typeof entry !== 'object' || entry === null || this.items.length >= MAX_BLUEPRINTS) continue;
      // A blueprint using something this version does not know is skipped, not fatal.
      const blueprint = parseBlueprint(entry.blueprint);
      if (!blueprint) continue;
      const id = typeof entry.id === 'number' && Number.isInteger(entry.id) && entry.id > 0 ? entry.id : this.nextId;
      if (this.items.some((i) => i.id === id)) continue;
      const name = typeof entry.name === 'string' && entry.name.trim() ? entry.name.trim().slice(0, MAX_NAME_LENGTH) : `Blueprint ${id}`;
      this.items.push({ id, name, blueprint });
      this.nextId = Math.max(this.nextId, id + 1);
    }
  }

  private persist(): void {
    try {
      this.storage?.setItem(STORAGE_KEY, JSON.stringify(this.items));
    } catch {
      // Storage full or blocked: the library still works for this session.
    }
  }
}
