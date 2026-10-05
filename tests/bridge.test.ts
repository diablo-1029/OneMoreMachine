import { describe, expect, it } from 'vitest';
import { allAchievementIds } from '../src/core/achievements/Achievements';
import { captureBlueprint, rotateBlueprint } from '../src/core/blueprints/Blueprint';
import { FactoryState } from '../src/core/factory/FactoryState';
import { ITEM_SPACING, TICK_RATE } from '../src/core/game/Constants';
import { createNewGame } from '../src/core/game/GameState';
import { Simulation } from '../src/core/game/Simulation';
import { allResearchIds } from '../src/core/research/Research';
import { restoreGame, serializeGame } from '../src/core/save/Serializer';
import { DEFAULT_SETTINGS } from '../src/core/save/SaveSchema';
import { downstreamMachines, upstreamMachines } from '../src/core/stats/Connections';

function newSim(research: string[] = allResearchIds()): Simulation {
  const state = createNewGame();
  state.factory = new FactoryState(24, 24);
  state.research = research;
  state.economy.money = 100_000;
  state.power.baseSupply = 500;
  const sim = new Simulation(state);
  state.contracts.active = [];
  state.achievements = allAchievementIds();
  return sim;
}

function run(sim: Simulation, seconds: number): void {
  for (let i = 0; i < seconds * TICK_RATE; i++) sim.tick();
}

function machine(sim: Simulation, type: string, x: number, y: number, rotation: 0 | 1 | 2 | 3 = 0, recipeId?: string) {
  const result = sim.placeMachine(type, x, y, rotation, recipeId);
  if (!result.ok) throw new Error(`Could not place ${type} at ${x},${y}: ${result.reason}`);
  return result.value;
}

function belt(sim: Simulation, x: number, y: number, direction: 0 | 1 | 2 | 3): void {
  const result = sim.placeConveyor(x, y, direction);
  if (!result.ok) throw new Error(`Could not place belt at ${x},${y}: ${result.reason}`);
}

function sales(sim: Simulation): { seller: string; resourceId: string }[] {
  const log: { seller: string; resourceId: string }[] = [];
  sim.events.on('itemSold', ({ machine: m, resourceId }) => log.push({ seller: m.id, resourceId }));
  return log;
}

/**
 * An ore line running east along row 5 and a plate line running south down column 6, crossing
 * at a bridge on (6, 5). Each ends in its own seller.
 */
function buildCrossing() {
  const sim = newSim();
  // East–west: Miner → belts → Seller.
  machine(sim, 'miner', 0, 5);
  for (let x = 2; x <= 5; x++) belt(sim, x, 5, 0);
  const bridge = machine(sim, 'bridge', 6, 5);
  for (let x = 7; x <= 9; x++) belt(sim, x, 5, 0);
  const east = machine(sim, 'seller', 10, 5);
  // North–south: a storage of plates feeding down the column into a seller.
  // Turned a quarter, the storage is 3 wide and its output chute faces south from (6, 1).
  const storage = machine(sim, 'storage', 4, 0, 1);
  storage.stored = Array.from({ length: 200 }, () => 'iron_plate');
  for (let y = 2; y <= 4; y++) belt(sim, 6, y, 1);
  for (let y = 6; y <= 8; y++) belt(sim, 6, y, 1);
  const south = machine(sim, 'seller', 6, 9, 1);
  return { sim, bridge, east, south, storage };
}

describe('bridge', () => {
  it('carries two crossing belts without mixing them', () => {
    const { sim, east, south } = buildCrossing();
    const log = sales(sim);
    run(sim, 120);

    const atEast = log.filter((s) => s.seller === east.id);
    const atSouth = log.filter((s) => s.seller === south.id);
    expect(atEast.length).toBeGreaterThan(50);
    expect(atSouth.length).toBeGreaterThan(150);
    expect(atEast.every((s) => s.resourceId === 'iron_ore')).toBe(true);
    expect(atSouth.every((s) => s.resourceId === 'iron_plate')).toBe(true);
  });

  it('is as fast as a plain belt on each lane', () => {
    const { sim, south } = buildCrossing();
    // Let the column fill, then measure a steady minute.
    run(sim, 20);
    const log = sales(sim);
    run(sim, 60);
    // A belt carries two items a second; the column is saturated from storage.
    const perSecond = log.filter((s) => s.seller === south.id).length / 60;
    expect(perSecond).toBeGreaterThan(1.95);
  });

  it('keeps belt spacing on the bridge itself', () => {
    const { sim, bridge } = buildCrossing();
    for (let i = 0; i < 400; i++) {
      sim.tick();
      for (const lane of [0, 1]) {
        const items = bridge.transit.filter((item) => item.from % 2 === lane);
        expect(items.length).toBeLessThanOrEqual(3);
        for (let k = 1; k < items.length; k++) {
          expect(items[k - 1].progress - items[k].progress).toBeGreaterThanOrEqual(ITEM_SPACING - 1e-6);
        }
      }
    }
  });

  it('backs up only the lane that is blocked', () => {
    const { sim, east, south } = buildCrossing();
    const log = sales(sim);
    // Switch off the seller at the end of the plate column; ore must keep flowing across.
    sim.setMachineEnabled(south.id, false);
    run(sim, 120);
    expect(log.filter((s) => s.seller === south.id).length).toBe(0);
    expect(log.filter((s) => s.seller === east.id).length).toBeGreaterThan(50);
  });

  it('runs one way at a time on a lane', () => {
    const sim = newSim();
    // Two miners facing each other across a bridge.
    machine(sim, 'miner', 0, 0);
    belt(sim, 2, 0, 0);
    const bridge = machine(sim, 'bridge', 3, 0);
    belt(sim, 4, 0, 2);
    machine(sim, 'miner', 5, 0, 2);
    run(sim, 60);
    // Whichever got there first holds the lane; nothing passes through itself.
    const directions = new Set(bridge.transit.map((item) => item.from));
    expect(directions.size).toBeLessThanOrEqual(1);
  });

  it('can be chained and works when rotated', () => {
    const sim = newSim();
    machine(sim, 'miner', 0, 0);
    belt(sim, 2, 0, 0);
    machine(sim, 'bridge', 3, 0, 1);
    machine(sim, 'bridge', 4, 0, 0);
    machine(sim, 'bridge', 5, 0, 3);
    belt(sim, 6, 0, 0);
    machine(sim, 'seller', 7, 0);
    run(sim, 120);
    expect(sim.state.stats.sold['iron_ore']).toBeGreaterThanOrEqual(55);
  });

  it('needs Logistics research', () => {
    const sim = newSim([]);
    expect(sim.placeMachine('bridge', 0, 0, 0)).toEqual({ ok: false, reason: 'not_researched' });
    sim.research('logistics');
    expect(sim.placeMachine('bridge', 0, 0, 0).ok).toBe(true);
  });
});

describe('bridges and the rest of the game', () => {
  it('keeps crossing lines separate when tracing connections', () => {
    const { sim, east, south, storage } = buildCrossing();
    const { factory } = sim.state;
    const miner = [...factory.machines.values()].find((m) => m.type === 'miner')!;
    expect(downstreamMachines(factory, miner)).toEqual([east]);
    expect(upstreamMachines(factory, east)).toEqual([miner]);
    // The plate column passes through storage, which tracing looks through, to nothing upstream.
    expect(downstreamMachines(factory, storage)).toEqual([south]);
    expect(upstreamMachines(factory, south)).toEqual([]);
  });

  it('saves and restores items in mid-crossing', () => {
    const { sim, bridge } = buildCrossing();
    let ticks = 0;
    while (new Set(bridge.transit.map((i) => i.from % 2)).size < 2 && ticks++ < 2000) sim.tick();
    expect(new Set(bridge.transit.map((i) => i.from % 2)).size).toBe(2);

    const saved = JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS)));
    const restored = restoreGame(JSON.parse(JSON.stringify(saved)));
    const again = JSON.parse(JSON.stringify(serializeGame(restored, DEFAULT_SETTINGS)));
    expect({ ...again, timestamp: 0 }).toEqual({ ...saved, timestamp: 0 });

    const resumed = new Simulation(restored);
    run(sim, 60);
    run(resumed, 60);
    expect(resumed.state.stats.sold).toEqual(sim.state.stats.sold);
  });

  it('copies and rotates with a blueprint', () => {
    const { sim } = buildCrossing();
    const blueprint = rotateBlueprint(captureBlueprint(sim.state.factory, 0, 0, 23, 23));
    expect(blueprint.machines.filter((m) => m.type === 'bridge').length).toBe(1);
    const copy = newSim();
    expect(copy.placeBlueprint(blueprint, 12, 12).ok).toBe(true);
    run(copy, 60);
    // The copied miner's ore still crosses the copied bridge to its seller.
    expect(copy.state.stats.sold['iron_ore']).toBeGreaterThan(20);
  });
});
