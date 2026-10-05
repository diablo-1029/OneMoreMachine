import { describe, expect, it } from 'vitest';
import { conveyorShape } from '../src/core/factory/ConveyorSystem';
import { getMachineDef, worldPorts } from '../src/core/factory/MachineRegistry';
import { ITEM_SPACING, TICK_RATE } from '../src/core/game/Constants';
import { createNewGame } from '../src/core/game/GameState';
import { Simulation } from '../src/core/game/Simulation';
import { allResearchIds } from '../src/core/research/Research';
import { restoreGame, serializeGame } from '../src/core/save/Serializer';
import { DEFAULT_SETTINGS, SaveError } from '../src/core/save/SaveSchema';

function newSim(money = 1000): Simulation {
  const state = createNewGame();
  state.research = allResearchIds();
  state.economy.money = money;
  return new Simulation(state);
}

function run(sim: Simulation, seconds: number): void {
  for (let i = 0; i < seconds * TICK_RATE; i++) sim.tick();
}

/** Miner → Furnace → Assembler → Seller along the top row, with a corner into the seller. */
function buildFullLine(sim: Simulation): void {
  expect(sim.placeMachine('miner', 0, 0, 0).ok).toBe(true);
  expect(sim.placeConveyor(2, 0, 0).ok).toBe(true);
  expect(sim.placeConveyor(3, 0, 0).ok).toBe(true);
  expect(sim.placeMachine('furnace', 4, 0, 0).ok).toBe(true);
  expect(sim.placeConveyor(6, 0, 0).ok).toBe(true);
  expect(sim.placeConveyor(7, 0, 0).ok).toBe(true);
  expect(sim.placeMachine('assembler', 8, 0, 0).ok).toBe(true);
  expect(sim.placeConveyor(10, 0, 1).ok).toBe(true);
  expect(sim.placeConveyor(10, 1, 1).ok).toBe(true);
  expect(sim.placeMachine('seller', 10, 2, 1).ok).toBe(true);
}

describe('ports', () => {
  it('rotate with the machine', () => {
    const def = getMachineDef('furnace');
    const r0 = worldPorts(def, 4, 4, 0);
    expect(r0.find((p) => p.type === 'input')).toMatchObject({ x: 4, y: 4, side: 2, outerX: 3, outerY: 4 });
    expect(r0.find((p) => p.type === 'output')).toMatchObject({ x: 5, y: 4, side: 0, outerX: 6, outerY: 4 });
    const r1 = worldPorts(def, 4, 4, 1);
    expect(r1.find((p) => p.type === 'input')).toMatchObject({ x: 5, y: 4, side: 3 });
    expect(r1.find((p) => p.type === 'output')).toMatchObject({ x: 5, y: 5, side: 1 });
  });
});

describe('placement', () => {
  it('rejects overlap, out of bounds and unaffordable builds', () => {
    const sim = newSim(45);
    expect(sim.placeMachine('miner', 0, 0, 0).ok).toBe(true);
    expect(sim.placeConveyor(1, 1, 0)).toEqual({ ok: false, reason: 'occupied' });
    expect(sim.placeConveyor(12, 0, 0)).toEqual({ ok: false, reason: 'out_of_bounds' });
    expect(sim.placeMachine('miner', 11, 11, 0)).toEqual({ ok: false, reason: 'out_of_bounds' });
    expect(sim.placeConveyor(5, 5, 0).ok).toBe(true);
    expect(sim.placeConveyor(6, 5, 0)).toEqual({ ok: false, reason: 'cannot_afford' });
  });

  it('frees every footprint cell and refunds on removal', () => {
    const sim = newSim(100);
    sim.placeMachine('miner', 3, 3, 0);
    expect(sim.state.economy.money).toBe(60);
    expect(sim.removeAt(4, 4).ok).toBe(true);
    expect(sim.state.economy.money).toBe(100);
    for (const [x, y] of [[3, 3], [4, 3], [3, 4], [4, 4]]) {
      expect(sim.state.factory.occupancy.get(x, y)).toBeUndefined();
    }
  });
});

describe('production chain', () => {
  it('turns ore into plates, gears and money', () => {
    const sim = newSim();
    buildFullLine(sim);
    const before = sim.state.economy.money;
    run(sim, 120);
    expect(sim.state.stats.produced['iron_plate']).toBeGreaterThan(40);
    expect(sim.state.stats.sold['gear']).toBeGreaterThan(20);
    expect(sim.state.economy.money).toBe(before + sim.state.stats.sold['gear'] * 12);
  });

  it('backs up without overlapping items when the belt is a dead end', () => {
    const sim = newSim();
    sim.placeMachine('miner', 0, 0, 0);
    for (let x = 2; x < 6; x++) sim.placeConveyor(x, 0, 0);
    run(sim, 60);
    const positions: number[] = [];
    for (const conveyor of sim.state.factory.conveyors.values()) {
      for (const item of conveyor.items) positions.push(conveyor.gridX + item.progress);
    }
    positions.sort((a, b) => a - b);
    // 4 tiles hold 8 items at half-tile spacing, plus one sitting at the very end.
    expect(positions.length).toBe(9);
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i] - positions[i - 1]).toBeGreaterThanOrEqual(ITEM_SPACING - 1e-9);
    }
    // The miner stalls once its output buffer fills.
    const miner = [...sim.state.factory.machines.values()][0];
    expect(miner.active).toBe(false);
    expect(miner.outputInventory['iron_ore']).toBe(2);
  });

  it('stops a disabled machine and resumes it', () => {
    const sim = newSim();
    buildFullLine(sim);
    const furnace = [...sim.state.factory.machines.values()].find((m) => m.type === 'furnace')!;
    sim.setMachineEnabled(furnace.id, false);
    run(sim, 30);
    expect(sim.state.stats.produced['iron_plate'] ?? 0).toBe(0);
    sim.setMachineEnabled(furnace.id, true);
    run(sim, 30);
    expect(sim.state.stats.produced['iron_plate']).toBeGreaterThan(5);
  });

  it('feeds an adjacent machine directly', () => {
    const sim = newSim();
    sim.placeMachine('miner', 0, 0, 0);
    sim.placeMachine('seller', 2, 0, 0);
    run(sim, 21);
    expect(sim.state.stats.sold['iron_ore']).toBe(10);
  });
});

describe('belt shape', () => {
  it('is a corner only when fed from the side alone', () => {
    const sim = newSim();
    sim.placeConveyor(2, 2, 0);
    const corner = sim.placeConveyor(3, 2, 1);
    sim.placeConveyor(3, 3, 1);
    if (!corner.ok) throw new Error('placement failed');
    const { factory } = sim.state;
    expect(conveyorShape(factory, corner.value)).toEqual({ kind: 'corner', from: 0 });
    expect(conveyorShape(factory, factory.conveyorAt(3, 3)!)).toEqual({ kind: 'straight' });
    sim.placeConveyor(3, 1, 1);
    expect(conveyorShape(factory, corner.value)).toEqual({ kind: 'straight' });
  });
});

describe('save', () => {
  it('round-trips a running factory', () => {
    const sim = newSim();
    buildFullLine(sim);
    run(sim, 47);
    const json = JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS));
    const restored = restoreGame(JSON.parse(json));
    const again = JSON.parse(JSON.stringify(serializeGame(restored, DEFAULT_SETTINGS)));
    expect({ ...again, timestamp: 0 }).toEqual({ ...JSON.parse(json), timestamp: 0 });
    expect(restored.economy.money).toBe(sim.state.economy.money);
    expect(restored.factory.machines.size).toBe(4);
    expect(restored.factory.conveyors.size).toBe(6);
    expect(restored.factory.itemCount()).toBe(sim.state.factory.itemCount());

    // Both copies keep producing identically.
    const resumed = new Simulation(restored);
    run(sim, 30);
    run(resumed, 30);
    expect(resumed.state.economy.money).toBe(sim.state.economy.money);
  });

  it('rejects corrupt data', () => {
    const sim = newSim();
    buildFullLine(sim);
    const good = JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS)));

    expect(() => restoreGame(null)).toThrow(SaveError);
    expect(() => restoreGame('nonsense')).toThrow(SaveError);
    expect(() => restoreGame({ ...good, version: 999 })).toThrow(SaveError);
    expect(() => restoreGame({ ...good, economy: { money: 'lots' } })).toThrow(SaveError);

    const overlapping = JSON.parse(JSON.stringify(good));
    overlapping.factory.machines[1].gridX = 1;
    expect(() => restoreGame(overlapping)).toThrow(SaveError);

    const unknownType = JSON.parse(JSON.stringify(good));
    unknownType.factory.machines[0].type = 'teleporter';
    expect(() => restoreGame(unknownType)).toThrow(SaveError);
  });
});
