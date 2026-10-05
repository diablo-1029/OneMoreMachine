import { describe, expect, it } from 'vitest';
import { allAchievementIds } from '../src/core/achievements/Achievements';
import { createContractState, generateContract } from '../src/core/contracts/Contracts';
import { FactoryState } from '../src/core/factory/FactoryState';
import { footprintCells, getMachineDef, worldPorts } from '../src/core/factory/MachineRegistry';
import { TICK_RATE } from '../src/core/game/Constants';
import { createNewGame } from '../src/core/game/GameState';
import { Simulation } from '../src/core/game/Simulation';
import { allResearchIds, researchStatus } from '../src/core/research/Research';
import { analyzeBottlenecks } from '../src/core/stats/Bottlenecks';
import { RECIPES } from '../src/data/recipes';
import { RESEARCH_NODES } from '../src/data/research';
import { getResource, isResource } from '../src/data/resources';

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

function machine(sim: Simulation, type: string, x: number, y: number, recipeId?: string) {
  const result = sim.placeMachine(type, x, y, 0, recipeId);
  if (!result.ok) throw new Error(`Could not place ${type} at ${x},${y}: ${result.reason}`);
  return result.value;
}

function belt(sim: Simulation, x: number, y: number, direction: 0 | 1 | 2 | 3): void {
  const result = sim.placeConveyor(x, y, direction);
  if (!result.ok) throw new Error(`Could not place belt at ${x},${y}: ${result.reason}`);
}

/** A storage holding plenty of one resource, standing in for a whole upstream chain. */
function supply(sim: Simulation, x: number, y: number, resourceId: string) {
  const storage = machine(sim, 'storage', x, y);
  storage.stored = Array.from({ length: 200 }, () => resourceId);
  return storage;
}

describe('recipe data', () => {
  it('only uses real resources and every product is worth more than what goes into it', () => {
    for (const recipe of RECIPES) {
      for (const part of [...recipe.inputs, ...recipe.outputs]) expect(isResource(part.resourceId)).toBe(true);
      if (recipe.inputs.length === 0) continue;
      const cost = recipe.inputs.reduce((sum, i) => sum + getResource(i.resourceId).baseValue * i.amount, 0);
      const value = recipe.outputs.reduce((sum, o) => sum + getResource(o.resourceId).baseValue * o.amount, 0);
      expect(value).toBeGreaterThan(cost);
    }
  });

  it('has a research node for every recipe and machine beyond the basics', () => {
    const unlockedRecipes = new Set(RESEARCH_NODES.flatMap((n) => n.unlocks.recipes));
    for (const id of ['smelt_steel', 'craft_circuit', 'craft_computer', 'build_robot']) {
      expect(unlockedRecipes.has(id)).toBe(true);
    }
    expect(RESEARCH_NODES.find((n) => n.unlocks.machines.includes('fabricator'))?.id).toBe('robotics');
  });
});

describe('fabricator', () => {
  it('is a 3×3 machine with three hatches on one side', () => {
    const def = getMachineDef('fabricator');
    expect(footprintCells(def, 5, 5, 0).length).toBe(9);
    const ports = worldPorts(def, 5, 5, 0);
    expect(ports.filter((p) => p.type === 'input').map((p) => `${p.x},${p.y}`)).toEqual(['5,5', '5,6', '5,7']);
    expect(ports.find((p) => p.type === 'output')).toMatchObject({ x: 7, y: 6, side: 0, outerX: 8, outerY: 6 });
    // Turned a quarter, the hatches run along the top and the output points down.
    const turned = worldPorts(def, 5, 5, 1);
    expect(turned.filter((p) => p.type === 'input').every((p) => p.side === 3 && p.y === 5)).toBe(true);
    expect(turned.find((p) => p.type === 'output')).toMatchObject({ x: 6, y: 7, side: 1 });
  });

  it('builds robots from three ingredients arriving on three belts', () => {
    const sim = newSim();
    // Motors along the top row, computers and steel routed in below it.
    supply(sim, 0, 0, 'motor');
    for (let x = 2; x <= 5; x++) belt(sim, x, 0, 0);
    supply(sim, 0, 3, 'computer');
    belt(sim, 2, 3, 3);
    belt(sim, 2, 2, 3);
    belt(sim, 2, 1, 0);
    for (let x = 3; x <= 5; x++) belt(sim, x, 1, 0);
    supply(sim, 0, 6, 'steel');
    belt(sim, 2, 6, 0);
    for (let y = 6; y >= 3; y--) belt(sim, 3, y, 3);
    belt(sim, 3, 2, 0);
    belt(sim, 4, 2, 0);
    belt(sim, 5, 2, 0);

    const fabricator = machine(sim, 'fabricator', 6, 0);
    belt(sim, 9, 1, 0);
    machine(sim, 'seller', 10, 1);
    run(sim, 180);

    expect(fabricator.recipeId).toBe('build_robot');
    // One robot every 8 seconds once the first ingredients have arrived.
    expect(sim.state.stats.sold['robot']).toBeGreaterThanOrEqual(20);
    expect(sim.state.stats.sold['robot']).toBeLessThanOrEqual(22);
    expect(sim.metrics.shares(fabricator.id).working).toBeGreaterThan(0.95);
    expect(sim.state.economy.totalEarned).toBe(sim.state.stats.sold['robot'] * 700);
  });

  it('stalls, and says why, when one ingredient is missing', () => {
    const sim = newSim();
    supply(sim, 0, 0, 'motor');
    for (let x = 2; x <= 5; x++) belt(sim, x, 0, 0);
    const fabricator = machine(sim, 'fabricator', 6, 0);
    run(sim, 60);
    expect(sim.state.stats.produced['robot'] ?? 0).toBe(0);
    // It took two crafts' worth of motors and then stopped accepting more.
    expect(fabricator.inputInventory['motor']).toBe(2);
    const finding = analyzeBottlenecks(sim.state, sim.metrics).find((f) => f.machineId === fabricator.id)!;
    expect(finding.kind).toBe('starved');
    expect(finding.problem).toMatch(/waits for (Computer|Steel)/);
  });
});

describe('the new assembler and furnace recipes', () => {
  it('smelts steel from two plates', () => {
    const sim = newSim();
    supply(sim, 0, 0, 'iron_plate');
    machine(sim, 'furnace', 2, 0, 'smelt_steel');
    machine(sim, 'seller', 4, 0);
    run(sim, 120);
    // One bar every 4 seconds.
    expect(sim.state.stats.sold['steel']).toBeGreaterThanOrEqual(28);
    expect(sim.state.stats.sold['steel']).toBeLessThanOrEqual(30);
  });

  it('builds computers from circuits and steel through the two hatches', () => {
    const sim = newSim();
    supply(sim, 0, 0, 'circuit');
    belt(sim, 2, 0, 0);
    supply(sim, 0, 3, 'steel');
    belt(sim, 2, 3, 3);
    belt(sim, 2, 2, 3);
    belt(sim, 2, 1, 0);
    const assembler = machine(sim, 'assembler', 3, 0, 'craft_computer');
    machine(sim, 'seller', 5, 0);
    run(sim, 120);
    expect(sim.state.stats.sold['computer']).toBeGreaterThanOrEqual(18);
    expect(sim.metrics.shares(assembler.id).working).toBeGreaterThan(0.9);
  });

  it('builds circuits from wire and plate', () => {
    const sim = newSim();
    supply(sim, 0, 0, 'copper_wire');
    belt(sim, 2, 0, 0);
    supply(sim, 0, 3, 'iron_plate');
    belt(sim, 2, 3, 3);
    belt(sim, 2, 2, 3);
    belt(sim, 2, 1, 0);
    machine(sim, 'assembler', 3, 0, 'craft_circuit');
    machine(sim, 'seller', 5, 0);
    run(sim, 120);
    expect(sim.state.stats.sold['circuit']).toBeGreaterThanOrEqual(36);
  });
});

describe('progression', () => {
  it('gates the top of the tree behind both branches', () => {
    const robotics = RESEARCH_NODES.find((n) => n.id === 'robotics')!;
    expect(researchStatus(['computing'], robotics)).toBe('locked');
    expect(researchStatus(['computing', 'electric_motors'], robotics)).toBe('available');

    const sim = newSim(['gear_assembly']);
    expect(sim.placeMachine('fabricator', 0, 0, 0)).toEqual({ ok: false, reason: 'not_researched' });
    const furnace = machine(sim, 'furnace', 4, 0);
    expect(sim.setRecipe(furnace.id, 'smelt_steel')).toEqual({ ok: false, reason: 'invalid_recipe' });
    sim.research('steelmaking');
    expect(sim.setRecipe(furnace.id, 'smelt_steel').ok).toBe(true);
  });

  it('brings the new goods into contracts once they can be made', () => {
    const contracts = createContractState();
    const early = new Set<string>();
    const late = new Set<string>();
    for (let i = 0; i < 300; i++) {
      early.add(generateContract(contracts, ['gear_assembly']).resourceId);
      late.add(generateContract(contracts, allResearchIds()).resourceId);
      contracts.nextId++;
    }
    expect(early.has('robot')).toBe(false);
    expect(early.has('steel')).toBe(false);
    for (const id of ['steel', 'circuit', 'computer', 'robot']) expect(late.has(id)).toBe(true);
  });
});
