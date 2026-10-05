import { describe, expect, it } from 'vitest';
import { allAchievementIds } from '../src/core/achievements/Achievements';
import {
  blueprintCells,
  blueprintCost,
  captureBlueprint,
  describeBlueprint,
  parseBlueprint,
  rotateBlueprint,
  type Blueprint,
} from '../src/core/blueprints/Blueprint';
import { BlueprintLibrary, MAX_BLUEPRINTS, type BlueprintStorage } from '../src/core/blueprints/BlueprintLibrary';
import { FactoryState } from '../src/core/factory/FactoryState';
import { TICK_RATE } from '../src/core/game/Constants';
import { createNewGame } from '../src/core/game/GameState';
import { Simulation } from '../src/core/game/Simulation';
import { allResearchIds } from '../src/core/research/Research';

function newSim(research: string[] = allResearchIds(), money = 10_000): Simulation {
  const state = createNewGame();
  state.factory = new FactoryState(24, 24);
  state.research = research;
  state.economy.money = money;
  const sim = new Simulation(state);
  state.contracts.active = [];
  state.achievements = allAchievementIds();
  return sim;
}

function run(sim: Simulation, seconds: number): void {
  for (let i = 0; i < seconds * TICK_RATE; i++) sim.tick();
}

/** Miner → belt → furnace (copper) → belt round a corner → seller, with its top-left at (2, 3). */
function buildLine(sim: Simulation): void {
  sim.placeMachine('miner', 2, 3, 0, 'mine_copper_ore');
  sim.placeConveyor(4, 3, 0);
  sim.placeMachine('furnace', 5, 3, 0, 'smelt_copper_plate');
  sim.placeConveyor(7, 3, 1);
  sim.placeConveyor(7, 4, 1);
  sim.placeMachine('seller', 7, 5, 1);
}

function memoryStorage(initial?: string): BlueprintStorage & { value: string | null } {
  return {
    value: initial ?? null,
    getItem() {
      return this.value;
    },
    setItem(_key: string, value: string) {
      this.value = value;
    },
  };
}

describe('capturing', () => {
  it('copies what lies wholly inside the rectangle, trimmed to fit', () => {
    const sim = newSim();
    buildLine(sim);
    const whole = captureBlueprint(sim.state.factory, 0, 0, 20, 20);
    expect(whole).toMatchObject({ width: 7, height: 4 });
    expect(whole.machines.map((m) => `${m.type}@${m.x},${m.y}`)).toEqual(['miner@0,0', 'furnace@3,0', 'seller@5,2']);
    expect(whole.conveyors).toEqual([
      { x: 2, y: 0, direction: 0 },
      { x: 5, y: 0, direction: 1 },
      { x: 5, y: 1, direction: 1 },
    ]);
    expect(whole.machines[0].recipeId).toBe('mine_copper_ore');
    expect(describeBlueprint(whole)).toBe('3 machines, 3 belts');
  });

  it('works whichever corner the drag started from', () => {
    const sim = newSim();
    buildLine(sim);
    expect(captureBlueprint(sim.state.factory, 20, 20, 0, 0)).toEqual(captureBlueprint(sim.state.factory, 0, 0, 20, 20));
  });

  it('leaves out a machine that pokes outside', () => {
    const sim = newSim();
    buildLine(sim);
    // Covers the miner's top row only, plus the first belt.
    const partial = captureBlueprint(sim.state.factory, 2, 3, 4, 3);
    expect(partial.machines).toEqual([]);
    expect(partial).toMatchObject({ width: 1, height: 1, conveyors: [{ x: 0, y: 0, direction: 0 }] });
  });

  it('gives an empty blueprint for empty ground', () => {
    const sim = newSim();
    expect(captureBlueprint(sim.state.factory, 0, 0, 5, 5)).toEqual({ width: 0, height: 0, machines: [], conveyors: [] });
  });

  it('does not copy upgrades or contents', () => {
    const sim = newSim();
    const miner = sim.placeMachine('miner', 0, 0, 0);
    if (!miner.ok) throw new Error('placement failed');
    sim.upgradeMachine(miner.value.id);
    run(sim, 10);
    const copy = captureBlueprint(sim.state.factory, 0, 0, 1, 1);
    expect(copy.machines[0]).toEqual({ type: 'miner', x: 0, y: 0, rotation: 0, recipeId: 'mine_iron_ore' });
    expect(blueprintCost(copy)).toBe(40);
  });
});

describe('rotating', () => {
  it('comes back to itself after four quarter turns', () => {
    const sim = newSim();
    buildLine(sim);
    sim.placeMachine('storage', 12, 3, 0);
    const original = captureBlueprint(sim.state.factory, 0, 0, 23, 23);
    let turned = original;
    for (let i = 0; i < 4; i++) turned = rotateBlueprint(turned);
    const sort = (b: Blueprint) => ({
      ...b,
      machines: [...b.machines].sort((a, c) => a.x - c.x || a.y - c.y),
      conveyors: [...b.conveyors].sort((a, c) => a.x - c.x || a.y - c.y),
    });
    expect(sort(turned)).toEqual(sort(original));
  });

  it('keeps every piece inside the new bounds without overlaps', () => {
    const sim = newSim();
    buildLine(sim);
    sim.placeMachine('storage', 12, 3, 0);
    let blueprint = captureBlueprint(sim.state.factory, 0, 0, 23, 23);
    for (let turn = 0; turn < 4; turn++) {
      blueprint = rotateBlueprint(blueprint);
      const cells = blueprintCells(blueprint, 0, 0);
      expect(new Set(cells.map((c) => `${c.x},${c.y}`)).size).toBe(cells.length);
      for (const cell of cells) {
        expect(cell.x).toBeGreaterThanOrEqual(0);
        expect(cell.y).toBeGreaterThanOrEqual(0);
        expect(cell.x).toBeLessThan(blueprint.width);
        expect(cell.y).toBeLessThan(blueprint.height);
      }
    }
  });

  it('produces a layout that still works', () => {
    const original = newSim();
    buildLine(original);
    const rotated = newSim();
    const blueprint = rotateBlueprint(captureBlueprint(original.state.factory, 0, 0, 23, 23));
    expect(rotated.placeBlueprint(blueprint, 10, 10).ok).toBe(true);
    run(original, 90);
    run(rotated, 90);
    expect(rotated.state.stats.sold).toEqual(original.state.stats.sold);
    expect(rotated.state.stats.sold['copper_plate']).toBeGreaterThan(30);
  });
});

describe('pasting', () => {
  it('builds the whole layout for the sum of its parts', () => {
    const sim = newSim();
    buildLine(sim);
    const blueprint = captureBlueprint(sim.state.factory, 0, 0, 23, 23);
    expect(blueprintCost(blueprint)).toBe(40 + 60 + 50 + 3 * 5);
    const before = sim.state.economy.money;

    expect(sim.placeBlueprint(blueprint, 2, 10)).toEqual({ ok: true, value: 6 });
    expect(sim.state.economy.money).toBe(before - 165);
    expect(sim.state.factory.machines.size).toBe(6);
    expect(sim.state.factory.conveyors.size).toBe(6);
    expect(sim.state.factory.machineAt(2, 10)?.recipeId).toBe('mine_copper_ore');
    expect(sim.state.factory.machineAt(5, 10)?.recipeId).toBe('smelt_copper_plate');
  });

  it('is all or nothing', () => {
    const sim = newSim();
    buildLine(sim);
    const blueprint = captureBlueprint(sim.state.factory, 0, 0, 23, 23);
    const snapshot = () => [sim.state.economy.money, sim.state.factory.machines.size, sim.state.factory.conveyors.size];
    const before = snapshot();

    // One cell of the copy would land on the original seller.
    expect(sim.placeBlueprint(blueprint, 2, 6)).toEqual({ ok: false, reason: 'occupied' });
    expect(sim.placeBlueprint(blueprint, 20, 10)).toEqual({ ok: false, reason: 'out_of_bounds' });
    sim.state.economy.money = 100;
    expect(sim.placeBlueprint(blueprint, 2, 10)).toEqual({ ok: false, reason: 'cannot_afford' });
    sim.state.economy.money = before[0];
    expect(snapshot()).toEqual(before);
    expect(sim.placeBlueprint({ width: 0, height: 0, machines: [], conveyors: [] }, 0, 0)).toEqual({
      ok: false,
      reason: 'empty',
    });
  });

  it('refuses machines that are not researched and falls back on locked recipes', () => {
    const designer = newSim();
    buildLine(designer);
    designer.placeMachine('splitter', 12, 3, 0);
    const blueprint = captureBlueprint(designer.state.factory, 0, 0, 23, 23);

    const beginner = newSim([]);
    expect(beginner.placeBlueprint(blueprint, 0, 0)).toEqual({ ok: false, reason: 'not_researched' });
    expect(beginner.state.factory.machines.size).toBe(0);

    // Without the splitter everything is buildable, but copper is not unlocked yet.
    const basic = { ...blueprint, machines: blueprint.machines.filter((m) => m.type !== 'splitter') };
    expect(beginner.placeBlueprint(basic, 0, 0).ok).toBe(true);
    expect(beginner.state.factory.machineAt(0, 0)?.recipeId).toBe('mine_iron_ore');
    expect(beginner.state.factory.machineAt(3, 0)?.recipeId).toBe('smelt_iron_plate');
  });
});

describe('reading stored blueprints', () => {
  const good = (): Blueprint => ({
    width: 3,
    height: 2,
    machines: [{ type: 'miner', x: 0, y: 0, rotation: 0, recipeId: 'mine_iron_ore' }],
    conveyors: [{ x: 2, y: 0, direction: 0 }],
  });

  it('accepts a well-formed blueprint', () => {
    expect(parseBlueprint(JSON.parse(JSON.stringify(good())))).toEqual(good());
  });

  it('rejects anything malformed', () => {
    expect(parseBlueprint(null)).toBeNull();
    expect(parseBlueprint('blueprint')).toBeNull();
    expect(parseBlueprint({ ...good(), width: 0 })).toBeNull();
    expect(parseBlueprint({ ...good(), machines: [{ ...good().machines[0], type: 'teleporter' }] })).toBeNull();
    expect(parseBlueprint({ ...good(), conveyors: [{ x: 2, y: 0, direction: 7 }] })).toBeNull();
    // A belt on top of the miner, and a belt outside the stated size.
    expect(parseBlueprint({ ...good(), conveyors: [{ x: 1, y: 1, direction: 0 }] })).toBeNull();
    expect(parseBlueprint({ ...good(), conveyors: [{ x: 3, y: 0, direction: 0 }] })).toBeNull();
    expect(parseBlueprint({ width: 2, height: 2, machines: [], conveyors: [] })).toBeNull();
  });
});

describe('blueprint library', () => {
  const blueprint: Blueprint = { width: 1, height: 1, machines: [], conveyors: [{ x: 0, y: 0, direction: 0 }] };

  it('saves, renames, removes and survives a reload', () => {
    const storage = memoryStorage();
    const library = new BlueprintLibrary(storage);
    const first = library.add(blueprint)!;
    const second = library.add(blueprint)!;
    expect([first.name, second.name]).toEqual(['Blueprint 1', 'Blueprint 2']);

    library.rename(first.id, '  Starter line  ');
    library.rename(second.id, '   ');
    library.remove(second.id);
    const reloaded = new BlueprintLibrary(storage);
    expect(reloaded.all.map((b) => b.name)).toEqual(['Starter line']);
    expect(reloaded.all[0].blueprint).toEqual(blueprint);
    // Ids are never reused, even after a removal.
    expect(reloaded.add(blueprint)!.id).toBeGreaterThan(first.id);
  });

  it('stops at its limit', () => {
    const library = new BlueprintLibrary(memoryStorage());
    for (let i = 0; i < MAX_BLUEPRINTS; i++) expect(library.add(blueprint)).not.toBeNull();
    expect(library.isFull).toBe(true);
    expect(library.add(blueprint)).toBeNull();
    expect(library.all.length).toBe(MAX_BLUEPRINTS);
  });

  it('skips stored entries it cannot use and shrugs off rubbish', () => {
    const stored = JSON.stringify([
      { id: 1, name: 'Good', blueprint },
      { id: 2, name: 'From the future', blueprint: { ...blueprint, machines: [{ type: 'fusion_reactor', x: 0, y: 0, rotation: 0, recipeId: null }] } },
      'nonsense',
      { id: 1, name: 'Duplicate id', blueprint },
    ]);
    expect(new BlueprintLibrary(memoryStorage(stored)).all.map((b) => b.name)).toEqual(['Good']);
    expect(new BlueprintLibrary(memoryStorage('{not json')).all).toEqual([]);
    expect(new BlueprintLibrary(null).add(blueprint)?.name).toBe('Blueprint 1');
  });
});
