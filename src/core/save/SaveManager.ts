import type { GameState } from '../game/GameState';
import { parseSettings, restoreGame, serializeGame } from './Serializer';
import { SaveError, type GameSettings, type SaveData } from './SaveSchema';

const DB_NAME = 'one-more-machine';
const STORE = 'saves';
const LOCAL_SETTINGS_KEY = 'omm.settings';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function timestampOf(raw: unknown): number {
  if (typeof raw !== 'object' || raw === null) return -1;
  const timestamp = (raw as { timestamp?: unknown }).timestamp;
  return typeof timestamp === 'number' ? timestamp : -1;
}

/**
 * Persists one save slot. IndexedDB is the primary store; localStorage mirrors it
 * because it is the only store that can be written synchronously while the page
 * unloads, and it doubles as the fallback where IndexedDB is unavailable.
 * Loading takes whichever copy is newer.
 */
export class SaveManager {
  private db: Promise<IDBDatabase | null> | null = null;
  private readonly saveKey: string;
  private readonly localSaveKey: string;

  /**
   * `slot` names a separate save, kept apart from the main one. The game itself only uses
   * the default; a named slot (`?slot=name` in the URL) gives a scratch factory for testing.
   */
  constructor(slot = '') {
    const suffix = slot ? `.${slot}` : '';
    this.saveKey = `main${suffix}`;
    this.localSaveKey = `omm.save${suffix}`;
  }

  private database(): Promise<IDBDatabase | null> {
    this.db ??= openDatabase().catch(() => null);
    return this.db;
  }

  private async readIndexedDb(): Promise<unknown> {
    const db = await this.database();
    if (!db) return undefined;
    return new Promise((resolve) => {
      try {
        const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(this.saveKey);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(undefined);
      } catch {
        resolve(undefined);
      }
    });
  }

  private async writeIndexedDb(data: SaveData | undefined): Promise<void> {
    const db = await this.database();
    if (!db) return;
    try {
      const store = db.transaction(STORE, 'readwrite').objectStore(STORE);
      if (data) store.put(data, this.saveKey);
      else store.delete(this.saveKey);
    } catch {
      // localStorage still holds the save.
    }
  }

  private readLocal(): unknown {
    try {
      const text = localStorage.getItem(this.localSaveKey);
      return text ? JSON.parse(text) : undefined;
    } catch {
      // Present but unreadable: report it as a corrupt save rather than "no save".
      return localStorage.getItem(this.localSaveKey) ? null : undefined;
    }
  }

  /** The newest stored save, unvalidated. `undefined` means there is none. */
  private async readNewest(): Promise<unknown> {
    const fromDb = await this.readIndexedDb();
    const fromLocal = this.readLocal();
    if (fromDb === undefined) return fromLocal;
    if (fromLocal === undefined) return fromDb;
    return timestampOf(fromLocal) >= timestampOf(fromDb) ? fromLocal : fromDb;
  }

  async hasSave(): Promise<boolean> {
    return (await this.readNewest()) !== undefined;
  }

  /** Throws SaveError when there is no save or it cannot be restored. */
  async load(): Promise<GameState> {
    const raw = await this.readNewest();
    if (raw === undefined) throw new SaveError('No save found');
    try {
      return restoreGame(raw);
    } catch (error) {
      if (error instanceof SaveError) throw error;
      throw new SaveError(error instanceof Error ? error.message : 'Unknown save error');
    }
  }

  /** Synchronous as far as localStorage goes, so it is safe to call during page unload. */
  save(state: GameState, settings: GameSettings): void {
    const data = serializeGame(state, settings);
    try {
      localStorage.setItem(this.localSaveKey, JSON.stringify(data));
    } catch {
      // Storage full or blocked; IndexedDB may still succeed.
    }
    void this.writeIndexedDb(data);
  }

  async clear(): Promise<void> {
    try {
      localStorage.removeItem(this.localSaveKey);
    } catch {
      // Nothing to remove.
    }
    await this.writeIndexedDb(undefined);
  }

  loadSettings(): GameSettings {
    try {
      const text = localStorage.getItem(LOCAL_SETTINGS_KEY);
      return parseSettings(text ? JSON.parse(text) : undefined);
    } catch {
      return parseSettings(undefined);
    }
  }

  saveSettings(settings: GameSettings): void {
    try {
      localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Settings simply won't persist.
    }
  }
}
