import { describe, expect, it } from 'vitest';
import { allAchievementIds } from '../src/core/achievements/Achievements';
import { createContractState, generateContract } from '../src/core/contracts/Contracts';
import { upgradeCost, buildCost } from '../src/core/economy/Pricing';
import { FactoryState } from '../src/core/factory/FactoryState';
import { TICK_RATE } from '../src/core/game/Constants';
import { createNewGame } from '../src/core/game/GameState';
import { Simulation } from '../src/core/game/Simulation';
import { allResearchIds, researchDepth } from '../src/core/research/Research';
import { restoreGame, serializeGame } from '../src/core/save/Serializer';
import { DEFAULT_SETTINGS } from '../src/core/save/SaveSchema';
import { analyzeBottlenecks } from '../src/core/stats/Bottlenecks';
import { downstreamMachines, upstreamMachines } from '../src/core/stats/Connections';
import { EXPANSION_STEPS } from '../src/data/expansion';
import { RECIPES } from '../src/data/recipes';
import { RESEARCH_NODES } from '../src/data/research';
import { getResource } from '../src/data/resources';

/** These lock in problems found by playing the game through, so they cannot quietly return. */

function newSim(): Simulation {
  const state = createNewGame();
  state.factory = new FactoryState(24, 24);
  state.research = allResearchIds();
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

function machine(sim: Simulation, type: string, x: number, y: number, recipeId?: string) {
  const result = sim.placeMachine(type, x, y, 0, recipeId);
  if (!result.ok) throw new Error(`Could not place ${type}: ${result.reason}`);
  return result.value;
}

describe('recipes that make several items at once', () => {
  it('run at their rated speed instead of pausing to unload', () => {
    const sim = newSim();
    const storage = machine(sim, 'storage', 0, 0);
    storage.stored = Array.from({ length: 200 }, () => 'copper_plate');
    const assembler = machine(sim, 'assembler', 2, 0, 'draw_copper_wire');
    sim.placeConveyor(4, 0, 0);
    machine(sim, 'seller', 5, 0);
    run(sim, 120);
    // One plate becomes two coils every two seconds: 60 a minute.
    expect(sim.metrics.rate('sold', 'copper_wire')).toBeGreaterThan(57);
    expect(sim.metrics.shares(assembler.id).working).toBeGreaterThan(0.97);
  });
});

describe('contracts cannot be met without growing', () => {
  it('sizes a new order against the best the factory has ever sold', () => {
    const contracts = createContractState();
    // A factory that has sold 200 gears in its best minute.
    const best = (resourceId: string) => (resourceId === 'gear' ? 200 : 0);
    let rateOrders = 0;
    let deliveries = 0;
    for (let i = 0; i < 400; i++) {
      const contract = generateContract(contracts, ['gear_assembly'], best);
      contracts.nextId++;
      if (contract.resourceId !== 'gear') continue;
      if (contract.kind === 'rate') {
        expect(contract.target).toBeGreaterThanOrEqual(300);
        rateOrders++;
      } else {
        // At least five minutes of that output.
        expect(contract.target).toBeGreaterThanOrEqual(1000);
        deliveries++;
      }
    }
    expect(rateOrders).toBeGreaterThan(0);
    expect(deliveries).toBeGreaterThan(0);
  });

  it('remembers the best rate through a rebuild and a reload', () => {
    const sim = newSim();
    machine(sim, 'miner', 0, 0);
    machine(sim, 'seller', 2, 0);
    run(sim, 120);
    expect(sim.state.contracts.bestRate['iron_ore']).toBe(30);

    // Tearing the line down does not lower the bar, so it cannot be used to fish for easy orders.
    sim.removeAt(0, 0);
    run(sim, 120);
    expect(sim.state.contracts.bestRate['iron_ore']).toBe(30);
    for (let i = 0; i < 20; i++) {
      const offered = sim.state.contracts.active;
      if (offered.length > 0) sim.swapContract(offered[0].id);
    }
    for (const contract of sim.state.contracts.active) {
      if (contract.resourceId === 'iron_ore' && contract.kind === 'rate') expect(contract.target).toBeGreaterThanOrEqual(45);
    }

    const restored = restoreGame(JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS))));
    expect(restored.contracts.bestRate['iron_ore']).toBe(30);
  });
});

describe('bottleneck advice follows the belts', () => {
  it('finds what a machine is really connected to', () => {
    const sim = newSim();
    const miner = machine(sim, 'miner', 0, 0);
    sim.placeConveyor(2, 0, 0);
    machine(sim, 'splitter', 3, 0);
    sim.placeConveyor(4, 0, 0);
    const furnace = machine(sim, 'furnace', 5, 0);
    sim.placeConveyor(7, 0, 0);
    const seller = machine(sim, 'seller', 8, 0);
    // An unrelated line elsewhere on the floor.
    const other = machine(sim, 'miner', 0, 10);
    machine(sim, 'seller', 2, 10);

    const { factory } = sim.state;
    // Through the splitter, the furnace's only supplier is the first miner.
    expect(upstreamMachines(factory, furnace)).toEqual([miner]);
    expect(downstreamMachines(factory, furnace)).toEqual([seller]);
    expect(downstreamMachines(factory, miner)).toEqual([furnace]);
    expect(upstreamMachines(factory, miner)).toEqual([]);
    expect(upstreamMachines(factory, seller)).not.toContain(other);
  });

  it('is not misled by a backed-up machine on another line', () => {
    const sim = newSim();
    // An assembler that could use 40 plates a minute, fed by one furnace making 30.
    machine(sim, 'miner', 0, 0);
    sim.placeConveyor(2, 0, 0);
    machine(sim, 'furnace', 3, 0);
    sim.placeConveyor(5, 0, 0);
    const assembler = machine(sim, 'assembler', 6, 0, 'craft_gear');
    sim.placeConveyor(8, 0, 0);
    machine(sim, 'seller', 9, 0);
    // Elsewhere, two furnaces whose plates have nowhere to go.
    for (const y of [10, 14]) {
      machine(sim, 'miner', 0, y);
      sim.placeConveyor(2, y, 0);
      machine(sim, 'furnace', 3, y);
      sim.placeConveyor(5, y, 0);
    }
    run(sim, 120);
    const finding = analyzeBottlenecks(sim.state, sim.metrics).find((f) => f.machineId === assembler.id)!;
    expect(finding.kind).toBe('starved');
    expect(finding.fix).toBe('One more Furnace making Iron Plate would keep it fed.');
  });

  it('does not call a well-fed two-belt machine jammed', () => {
    const sim = newSim();
    // Plenty of plates on one hatch, wire trickling in on the other.
    const plates = machine(sim, 'storage', 0, 3);
    plates.stored = Array.from({ length: 200 }, () => 'iron_plate');
    sim.placeConveyor(2, 3, 3);
    sim.placeConveyor(2, 2, 3);
    sim.placeConveyor(2, 1, 0);
    machine(sim, 'miner', 0, 8, 'mine_copper_ore');
    const assembler = machine(sim, 'assembler', 3, 0, 'craft_circuit');
    run(sim, 60);
    const finding = analyzeBottlenecks(sim.state, sim.metrics).find((f) => f.machineId === assembler.id)!;
    expect(finding.problem).toContain('waits for Copper Wire');
    // The plate belt is full, as it should be; the wire hatch simply has nothing making wire behind it.
    expect(finding.fix).not.toContain('blocked');
  });
});

describe('the shape of the economy', () => {
  it('prices research so that deeper nodes cost more than what leads to them', () => {
    const byId = new Map(RESEARCH_NODES.map((n) => [n.id, n]));
    for (const node of RESEARCH_NODES) {
      for (const required of node.requires) expect(node.cost).toBeGreaterThan(byId.get(required)!.cost);
    }
    const deepest = Math.max(...RESEARCH_NODES.map(researchDepth));
    expect(deepest).toBeGreaterThanOrEqual(4);
  });

  it('makes each expansion and each upgrade a bigger decision than the last', () => {
    for (let i = 1; i < EXPANSION_STEPS.length; i++) {
      expect(EXPANSION_STEPS[i].cost).toBeGreaterThan(EXPANSION_STEPS[i - 1].cost * 2);
    }
    for (const type of ['miner', 'furnace', 'assembler', 'fabricator']) {
      // An upgrade is never the cheap way to more output: building another machine is.
      expect(upgradeCost(type, 2)).toBeGreaterThan(buildCost(type) * 5);
      expect(upgradeCost(type, 3)).toBeGreaterThan(upgradeCost(type, 2) * 2);
    }
  });

  it('never makes processing something worth less per machine than selling it raw', () => {
    // Income per minute from one machine running flat out, less what its ingredients would have sold for.
    for (const recipe of RECIPES) {
      if (recipe.inputs.length === 0) continue;
      const perMinute = 60 / recipe.duration;
      const out = recipe.outputs.reduce((sum, o) => sum + getResource(o.resourceId).baseValue * o.amount, 0);
      const cost = recipe.inputs.reduce((sum, i) => sum + getResource(i.resourceId).baseValue * i.amount, 0);
      // Every processing step adds value at full speed; the leanest (wire) still adds $60 a minute.
      expect((out - cost) * perMinute, recipe.id).toBeGreaterThanOrEqual(50);
    }
  });
});
