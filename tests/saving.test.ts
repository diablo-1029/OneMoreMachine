import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isOpening } from '../src/app/TabGuard';
import { createNewGame } from '../src/core/game/GameState';
import { Simulation } from '../src/core/game/Simulation';
import { SaveManager } from '../src/core/save/SaveManager';
import { DEFAULT_SETTINGS, SaveError } from '../src/core/save/SaveSchema';
import { serializeGame } from '../src/core/save/Serializer';

/** A stand-in for the browser's localStorage, optionally one that refuses every write. */
function fakeStorage(full = false) {
  const items = new Map<string, string>();
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (full) throw new Error('QuotaExceededError');
      items.set(key, value);
    },
    removeItem: (key: string) => void items.delete(key),
  };
}

/** A small working factory that has run for a while. */
function playedFactory(): Simulation {
  const sim = new Simulation(createNewGame());
  sim.state.economy.money = 5000;
  sim.placeMachine('miner', 0, 0, 0);
  sim.placeConveyor(2, 0, 0);
  sim.placeMachine('furnace', 3, 0, 0);
  sim.placeConveyor(5, 0, 0);
  sim.placeMachine('seller', 6, 0, 0);
  for (let i = 0; i < 20 * 60; i++) sim.tick();
  return sim;
}

/** Everything in a save except when it was written. */
const comparable = (text: string) => ({ ...JSON.parse(text), timestamp: 0 });

beforeEach(() => vi.stubGlobal('localStorage', fakeStorage()));
afterEach(() => vi.unstubAllGlobals());

describe('save files', () => {
  it('has nothing to export before anything is saved', async () => {
    expect(await new SaveManager().exportText()).toBeNull();
  });

  it('carry a factory from one browser to another unchanged', async () => {
    const sim = playedFactory();
    const here = new SaveManager();
    here.save(sim.state, DEFAULT_SETTINGS);
    const file = await here.exportText();
    expect(file).not.toBeNull();

    // Another browser: nothing stored yet.
    vi.stubGlobal('localStorage', fakeStorage());
    const there = new SaveManager();
    expect(await there.hasSave()).toBe(false);
    there.importText(file!, DEFAULT_SETTINGS);

    const { state } = await there.load();
    expect(state.economy.money).toBe(sim.state.economy.money);
    expect(state.factory.machines.size).toBe(3);
    expect(comparable((await there.exportText())!)).toEqual(comparable(file!));
  });

  it('are stamped with the time they were loaded, so they earn nothing for time away', async () => {
    const old = serializeGame(playedFactory().state, DEFAULT_SETTINGS);
    old.timestamp = Date.now() - 7 * 24 * 3600 * 1000;
    const manager = new SaveManager();
    manager.importText(JSON.stringify(old), DEFAULT_SETTINGS);
    const { savedAt } = await manager.load();
    expect(Date.now() - savedAt).toBeLessThan(5000);
  });

  it('from an older version are brought up to date', async () => {
    const old = JSON.parse(JSON.stringify(serializeGame(playedFactory().state, DEFAULT_SETTINGS)));
    old.version = 8;
    delete old.prestige;
    const manager = new SaveManager();
    manager.importText(JSON.stringify(old), DEFAULT_SETTINGS);
    const { state } = await manager.load();
    expect(state.prestige).toEqual({ stars: 0, count: 0 });
    expect(state.factory.machines.size).toBe(3);
  });

  it('that are damaged or not saves at all are refused, leaving the stored factory alone', async () => {
    const manager = new SaveManager();
    manager.save(playedFactory().state, DEFAULT_SETTINGS);
    const before = await manager.exportText();

    const good = JSON.parse(before!);
    for (const bad of [
      'not json at all',
      '{}',
      '[1, 2, 3]',
      JSON.stringify({ ...good, version: 999 }),
      JSON.stringify({ ...good, economy: { money: 'lots', totalEarned: 0 } }),
      JSON.stringify({ ...good, factory: { ...good.factory, machines: [{ type: 'teleporter' }] } }),
    ]) {
      expect(() => manager.importText(bad, DEFAULT_SETTINGS)).toThrow(SaveError);
    }
    expect(await manager.exportText()).toBe(before);
  });

  it('keep each slot separate', async () => {
    const main = new SaveManager();
    const scratch = new SaveManager('test');
    scratch.save(playedFactory().state, DEFAULT_SETTINGS);
    expect(await scratch.hasSave()).toBe(true);
    expect(await main.hasSave()).toBe(false);
  });
});

describe('a save that cannot be written', () => {
  it('is reported, once storage refuses it everywhere', async () => {
    vi.stubGlobal('localStorage', fakeStorage(true));
    const manager = new SaveManager();
    const failed = vi.fn();
    manager.onFailure = failed;
    manager.save(playedFactory().state, DEFAULT_SETTINGS);
    // There is no IndexedDB here either, which the manager finds out asynchronously.
    await vi.waitFor(() => expect(failed).toHaveBeenCalledTimes(1));
  });

  it('is not reported while one store still works', async () => {
    const manager = new SaveManager();
    const failed = vi.fn();
    manager.onFailure = failed;
    manager.save(playedFactory().state, DEFAULT_SETTINGS);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(failed).not.toHaveBeenCalled();
  });
});

describe('one factory, one tab', () => {
  it('stands down only for another tab opening the factory', () => {
    expect(isOpening({ type: 'opened', id: 'b' }, 'a')).toBe(true);
    // Its own announcement, and anything else on the channel, is ignored.
    expect(isOpening({ type: 'opened', id: 'a' }, 'a')).toBe(false);
    expect(isOpening({ type: 'closed', id: 'b' }, 'a')).toBe(false);
    expect(isOpening('opened', 'a')).toBe(false);
    expect(isOpening(null, 'a')).toBe(false);
  });
});
