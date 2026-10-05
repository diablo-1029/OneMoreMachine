import { describe, expect, it } from 'vitest';
import {
  createContractState,
  describeContract,
  fillContracts,
  generateContract,
  type Contract,
} from '../src/core/contracts/Contracts';
import { SAVE_VERSION, TICK_RATE } from '../src/core/game/Constants';
import { allAchievementIds } from '../src/core/achievements/Achievements';
import { createNewGame } from '../src/core/game/GameState';
import { Simulation } from '../src/core/game/Simulation';
import { allResearchIds } from '../src/core/research/Research';
import { restoreGame, serializeGame } from '../src/core/save/Serializer';
import { DEFAULT_SETTINGS } from '../src/core/save/SaveSchema';
import { CONTRACT_BALANCE } from '../src/data/contracts';

function run(sim: Simulation, seconds: number): void {
  for (let i = 0; i < seconds * TICK_RATE; i++) sim.tick();
}

/** A simulation whose only contract is the one given, so its outcome is not left to chance. */
function simWith(contract: Omit<Contract, 'id' | 'progress'>, money = 5000): Simulation {
  const state = createNewGame();
  state.research = allResearchIds();
  state.economy.money = money;
  const sim = new Simulation(state);
  state.contracts.active = [{ id: 9000, progress: 0, ...contract }];
  state.achievements = allAchievementIds();
  return sim;
}

/** Miner → belt → furnace → belt → seller: 30 Iron Plate per minute. */
function buildPlateLine(sim: Simulation, y: number): void {
  sim.placeMachine('miner', 0, y, 0);
  sim.placeConveyor(2, y, 0);
  sim.placeMachine('furnace', 3, y, 0);
  sim.placeConveyor(5, y, 0);
  sim.placeMachine('seller', 6, y, 0);
}

describe('contract generation', () => {
  it('only asks for what the player can already make', () => {
    const contracts = createContractState();
    for (let i = 0; i < 60; i++) {
      const contract = generateContract(contracts, []);
      expect(['iron_ore', 'iron_plate']).toContain(contract.resourceId);
      expect(contract.target).toBeGreaterThan(0);
      expect(contract.reward).toBeGreaterThan(0);
      contracts.nextId++;
    }
  });

  it('offers new goods once they are researched', () => {
    const contracts = createContractState();
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) {
      seen.add(generateContract(contracts, allResearchIds()).resourceId);
      contracts.nextId++;
    }
    expect(seen).toContain('motor');
    expect(seen).toContain('copper_wire');
  });

  it('is decided by the contract id, so reloading cannot reroll it', () => {
    const a = createContractState();
    const b = createContractState();
    a.nextId = b.nextId = 17;
    expect(generateContract(a, ['gear_assembly'])).toEqual(generateContract(b, ['gear_assembly']));
  });

  it('fills every slot with different orders', () => {
    const contracts = createContractState();
    expect(fillContracts(contracts, allResearchIds())).toBe(true);
    expect(contracts.active.length).toBe(CONTRACT_BALANCE.slots);
    expect(new Set(contracts.active.map((c) => c.id)).size).toBe(CONTRACT_BALANCE.slots);
    expect(new Set(contracts.active.map((c) => `${c.kind}:${c.resourceId}`)).size).toBe(CONTRACT_BALANCE.slots);
    expect(fillContracts(contracts, allResearchIds())).toBe(false);
  });

  it('asks for more and pays more as contracts are completed', () => {
    const early = createContractState();
    const late = createContractState();
    late.completed = 15;
    let earlyTotal = 0;
    let lateTotal = 0;
    for (let i = 0; i < 40; i++) {
      earlyTotal += generateContract(early, []).reward;
      lateTotal += generateContract(late, []).reward;
      early.nextId++;
      late.nextId++;
    }
    expect(lateTotal).toBeGreaterThan(earlyTotal * 1.5);
  });

  it('describes itself in plain words', () => {
    expect(describeContract({ id: 1, kind: 'deliver', resourceId: 'gear', target: 20, progress: 0, reward: 0 })).toBe(
      'Deliver 20 Gear',
    );
    expect(describeContract({ id: 1, kind: 'rate', resourceId: 'iron_plate', target: 60, progress: 0, reward: 0 })).toBe(
      'Sell 60 Iron Plate per minute',
    );
  });
});

describe('contracts in the simulation', () => {
  it('starts with a full set of offers', () => {
    const sim = new Simulation(createNewGame());
    expect(sim.state.contracts.active.length).toBe(CONTRACT_BALANCE.slots);
  });

  it('pays a delivery contract on top of normal sales, then replaces it', () => {
    const sim = simWith({ kind: 'deliver', resourceId: 'iron_plate', target: 10, reward: 500 });
    buildPlateLine(sim, 0);
    const before = sim.state.economy.money;
    const completed: Contract[] = [];
    sim.events.on('contractCompleted', (c) => completed.push(c));
    run(sim, 40);

    const sold = sim.state.stats.sold['iron_plate'];
    expect(sold).toBeGreaterThanOrEqual(10);
    expect(completed.map((c) => c.id)).toContain(9000);
    expect(sim.state.contracts.completed).toBeGreaterThanOrEqual(1);
    expect(sim.state.contracts.active.length).toBe(CONTRACT_BALANCE.slots);
    expect(sim.state.contracts.active.some((c) => c.id === 9000)).toBe(false);
    // Sale money plus every bonus that was paid, and nothing else.
    const bonuses = completed.reduce((sum, c) => sum + c.reward, 0);
    expect(sim.state.economy.money).toBe(before + sold * 4 + bonuses);
  });

  it('does not count other goods towards a delivery', () => {
    const sim = simWith({ kind: 'deliver', resourceId: 'gear', target: 5, reward: 500 });
    buildPlateLine(sim, 0);
    run(sim, 60);
    expect(sim.state.contracts.active.find((c) => c.id === 9000)?.progress).toBe(0);
  });

  it('needs the rate to actually be reached', () => {
    // One line sells 30 plates a minute; the contract wants 60.
    const sim = simWith({ kind: 'rate', resourceId: 'iron_plate', target: 60, reward: 800 });
    buildPlateLine(sim, 0);
    run(sim, 150);
    expect(sim.state.contracts.active.some((c) => c.id === 9000)).toBe(true);
    expect(Math.round(sim.metrics.windowTotal('sold', 'iron_plate'))).toBe(30);

    // One more line doubles it.
    buildPlateLine(sim, 3);
    const before = sim.state.contracts.completed;
    run(sim, 90);
    expect(sim.state.contracts.active.some((c) => c.id === 9000)).toBe(false);
    expect(sim.state.contracts.completed).toBeGreaterThan(before);
  });

  it('swaps an order for a new one at no cost', () => {
    const sim = simWith({ kind: 'deliver', resourceId: 'motor', target: 50, reward: 2000 });
    const money = sim.state.economy.money;
    expect(sim.swapContract(9000)).toBe(true);
    expect(sim.swapContract(9000)).toBe(false);
    expect(sim.state.contracts.active.length).toBe(CONTRACT_BALANCE.slots);
    expect(sim.state.contracts.active.some((c) => c.id === 9000)).toBe(false);
    expect(sim.state.contracts.completed).toBe(0);
    expect(sim.state.economy.money).toBe(money);
  });
});

describe('contracts and saves', () => {
  it('round-trips offers and progress', () => {
    const sim = simWith({ kind: 'deliver', resourceId: 'iron_plate', target: 400, reward: 900 });
    buildPlateLine(sim, 0);
    run(sim, 30);
    const saved = JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS)));
    expect(saved.version).toBe(SAVE_VERSION);
    const restored = restoreGame(saved);
    expect(restored.contracts.active).toEqual(sim.state.contracts.active);
    expect(restored.contracts.completed).toBe(sim.state.contracts.completed);
    // The counter always moves past every id in use, so an id is never handed out twice.
    expect(restored.contracts.nextId).toBeGreaterThan(9000);
    expect(restored.contracts.active[0].progress).toBeGreaterThan(5);
  });

  it('gives a version 3 save its first offers', () => {
    const sim = new Simulation(createNewGame());
    const v3 = JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS)));
    v3.version = 3;
    delete v3.contracts;
    const restored = restoreGame(v3);
    expect(restored.contracts).toEqual({ active: [], completed: 0, nextId: 1 });
    expect(new Simulation(restored).state.contracts.active.length).toBe(CONTRACT_BALANCE.slots);
  });

  it('rejects a malformed contract', () => {
    const sim = new Simulation(createNewGame());
    const saved = JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS)));
    saved.contracts.active[0].resourceId = 'unobtainium';
    expect(() => restoreGame(saved)).toThrow();
  });
});
