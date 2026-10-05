import { describe, expect, it } from 'vitest';
import { TICK_RATE } from '../src/core/game/Constants';
import { allAchievementIds } from '../src/core/achievements/Achievements';
import { createNewGame } from '../src/core/game/GameState';
import { Simulation } from '../src/core/game/Simulation';
import { allResearchIds } from '../src/core/research/Research';
import { restoreGame, serializeGame } from '../src/core/save/Serializer';
import { DEFAULT_SETTINGS } from '../src/core/save/SaveSchema';
import { EXPANSION_STEPS, nextExpansion } from '../src/data/expansion';

function newSim(money: number): Simulation {
  const state = createNewGame();
  state.research = allResearchIds();
  state.economy.money = money;
  const sim = new Simulation(state);
  // These tests check exact money, so contract bonuses are kept out of the way.
  state.contracts.active = [];
  state.achievements = allAchievementIds();
  return sim;
}

function run(sim: Simulation, seconds: number): void {
  for (let i = 0; i < seconds * TICK_RATE; i++) sim.tick();
}

/** A line that uses belts, a corner, a splitter and a rotated seller, so every kind of coordinate is exercised. */
function buildLine(sim: Simulation): void {
  sim.placeMachine('miner', 0, 0, 0);
  sim.placeConveyor(2, 0, 0);
  sim.placeMachine('splitter', 3, 0, 0);
  sim.placeConveyor(4, 0, 0);
  sim.placeMachine('furnace', 5, 0, 0);
  sim.placeConveyor(7, 0, 0);
  sim.placeMachine('seller', 8, 0, 0);
  sim.placeConveyor(3, 1, 1);
  sim.placeConveyor(3, 2, 1);
  sim.placeMachine('seller', 3, 3, 1);
}

describe('expansion steps', () => {
  it('are offered in order and stop at the largest', () => {
    expect(nextExpansion(12)).toEqual(EXPANSION_STEPS[0]);
    expect(nextExpansion(16)?.size).toBe(20);
    expect(nextExpansion(24)?.size).toBe(32);
    expect(nextExpansion(32)).toBeNull();
  });
});

describe('expanding the factory', () => {
  it('costs money and grows the floor', () => {
    const sim = newSim(EXPANSION_STEPS[0].cost + 500);
    const result = sim.expandFactory();
    expect(result.ok && result.value.size).toBe(16);
    expect(sim.state.economy.money).toBe(500);
    expect(sim.state.factory.grid.width).toBe(16);
    expect(sim.state.factory.grid.height).toBe(16);
    expect(sim.expandFactory()).toEqual({ ok: false, reason: 'cannot_afford' });
    expect(sim.state.factory.grid.width).toBe(16);
  });

  it('stops at the largest size', () => {
    const sim = newSim(1_000_000);
    for (const step of EXPANSION_STEPS) expect(sim.expandFactory()).toMatchObject({ ok: true, value: step });
    expect(sim.expandFactory()).toEqual({ ok: false, reason: 'max_size' });
    expect(sim.state.factory.grid.width).toBe(32);
  });

  it('shifts everything by the added margin and keeps occupancy in step', () => {
    const sim = newSim(10_000);
    buildLine(sim);
    run(sim, 20);
    const { factory } = sim.state;
    const shifts: { dx: number; dy: number }[] = [];
    sim.events.on('factoryExpanded', (e) => shifts.push({ dx: e.dx, dy: e.dy }));
    sim.expandFactory();

    expect(shifts).toEqual([{ dx: 2, dy: 2 }]);
    expect(factory.machineAt(2, 2)?.type).toBe('miner');
    expect(factory.machineAt(3, 3)?.type).toBe('miner');
    expect(factory.machineAt(5, 2)?.type).toBe('splitter');
    expect(factory.conveyorAt(4, 2)?.direction).toBe(0);
    expect(factory.occupancy.get(0, 0)).toBeUndefined();
    expect(factory.occupancy.get(1, 1)).toBeUndefined();
    for (const conveyor of factory.conveyors.values()) {
      for (const item of conveyor.items) {
        expect([item.tileX, item.tileY]).toEqual([conveyor.gridX, conveyor.gridY]);
      }
    }
    // The newly added ring is buildable; outside it is not.
    expect(sim.placeConveyor(0, 0, 0).ok).toBe(true);
    expect(sim.placeConveyor(15, 15, 0).ok).toBe(true);
    expect(sim.placeConveyor(16, 0, 0)).toEqual({ ok: false, reason: 'out_of_bounds' });
  });

  it('does not disturb a running line', () => {
    const expanded = newSim(100_000);
    const untouched = newSim(100_000);
    buildLine(expanded);
    buildLine(untouched);
    run(expanded, 33.3);
    run(untouched, 33.3);
    // Expand mid-flow, with items on belts and inside the splitter, then twice more.
    expanded.expandFactory();
    run(expanded, 20);
    run(untouched, 20);
    expanded.expandFactory();
    expanded.expandFactory();
    run(expanded, 60);
    run(untouched, 60);

    const spent = EXPANSION_STEPS.slice(0, 3).reduce((sum, step) => sum + step.cost, 0);
    expect(expanded.state.stats.sold).toEqual(untouched.state.stats.sold);
    expect(expanded.state.economy.money).toBe(untouched.state.economy.money - spent);
    expect(expanded.state.factory.itemCount()).toBe(untouched.state.factory.itemCount());
  });

  it('is kept by a save and reload', () => {
    const sim = newSim(50_000);
    buildLine(sim);
    sim.expandFactory();
    sim.expandFactory();
    run(sim, 15);
    const saved = JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS)));
    const restored = restoreGame(saved);
    expect(restored.factory.grid.width).toBe(20);
    expect(restored.factory.machineAt(4, 4)?.type).toBe('miner');
    const again = JSON.parse(JSON.stringify(serializeGame(restored, DEFAULT_SETTINGS)));
    expect({ ...again, timestamp: 0 }).toEqual({ ...saved, timestamp: 0 });
  });
});
