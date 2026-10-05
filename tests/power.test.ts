import { describe, expect, it } from 'vitest';
import { FactoryState } from '../src/core/factory/FactoryState';
import { TICK_RATE } from '../src/core/game/Constants';
import { createNewGame } from '../src/core/game/GameState';
import { Simulation } from '../src/core/game/Simulation';
import { computePower } from '../src/core/power/Power';
import { allResearchIds } from '../src/core/research/Research';
import { restoreGame, serializeGame } from '../src/core/save/Serializer';
import { DEFAULT_SETTINGS } from '../src/core/save/SaveSchema';
import { analyzeBottlenecks } from '../src/core/stats/Bottlenecks';

function newSim(research: string[] = allResearchIds(), baseSupply = 40): Simulation {
  const state = createNewGame();
  state.factory = new FactoryState(24, 24);
  state.research = research;
  state.economy.money = 100_000;
  state.power.baseSupply = baseSupply;
  const sim = new Simulation(state);
  state.contracts.active = [];
  return sim;
}

function run(sim: Simulation, seconds: number): void {
  for (let i = 0; i < seconds * TICK_RATE; i++) sim.tick();
}

function machine(sim: Simulation, type: string, x: number, y: number) {
  const result = sim.placeMachine(type, x, y, 0);
  if (!result.ok) throw new Error(`Could not place ${type}: ${result.reason}`);
  return result.value;
}

describe('power accounting', () => {
  it('adds up what machines draw and what turbines supply', () => {
    const sim = newSim();
    machine(sim, 'miner', 0, 0);
    machine(sim, 'furnace', 2, 0);
    const assembler = machine(sim, 'assembler', 4, 0);
    machine(sim, 'seller', 6, 0);
    machine(sim, 'splitter', 8, 0);
    expect(computePower(sim.state.factory, sim.state.power)).toEqual({ supply: 40, demand: 9, ratio: 1 });

    const turbine = machine(sim, 'wind_turbine', 10, 0);
    expect(computePower(sim.state.factory, sim.state.power).supply).toBe(55);

    // Upgrades draw more; switching a machine or a turbine off removes its share.
    sim.upgradeMachine(assembler.id);
    expect(computePower(sim.state.factory, sim.state.power).demand).toBe(13);
    sim.upgradeMachine(assembler.id);
    expect(computePower(sim.state.factory, sim.state.power).demand).toBe(17);
    sim.setMachineEnabled(assembler.id, false);
    expect(computePower(sim.state.factory, sim.state.power).demand).toBe(5);
    sim.setMachineEnabled(turbine.id, false);
    expect(computePower(sim.state.factory, sim.state.power).supply).toBe(40);
  });
});

describe('running short of power', () => {
  /** A miner selling straight into a seller, on a supply of only 1 against a draw of 2. */
  function starvedMiner() {
    const sim = newSim(allResearchIds(), 1);
    machine(sim, 'miner', 0, 0);
    machine(sim, 'seller', 2, 0);
    return sim;
  }

  it('slows machines in proportion instead of stopping them', () => {
    const sim = starvedMiner();
    run(sim, 120);
    expect(sim.power).toEqual({ supply: 1, demand: 2, ratio: 0.5 });
    const sold = sim.state.stats.sold['iron_ore'];
    expect(sold).toBeGreaterThanOrEqual(29);
    expect(sold).toBeLessThanOrEqual(30);
  });

  it('is cured by one more turbine', () => {
    const sim = starvedMiner();
    machine(sim, 'wind_turbine', 5, 0);
    run(sim, 120);
    expect(sim.power.ratio).toBe(1);
    expect(sim.state.stats.sold['iron_ore']).toBeGreaterThanOrEqual(59);
  });

  it('is reported first, with the number of turbines that would fix it', () => {
    const sim = newSim(allResearchIds(), 10);
    // Twelve miners draw 24; a supply of 10 leaves 14 to find, which is one turbine.
    for (let i = 0; i < 12; i++) machine(sim, 'miner', i * 2, 0);
    run(sim, 20);
    const [top] = analyzeBottlenecks(sim.state, sim.metrics);
    expect(top).toMatchObject({ machineId: null, kind: 'power' });
    expect(top.problem).toContain('needs 24 power but has 10');
    expect(top.fix).toBe('One more Wind Turbine would cover it.');

    for (let i = 0; i < 8; i++) machine(sim, 'miner', i * 2, 3);
    expect(analyzeBottlenecks(sim.state, sim.metrics)[0].fix).toBe('2 more Wind Turbines would cover it.');
  });

  it('points at research when turbines are not unlocked yet', () => {
    const sim = newSim([], 1);
    machine(sim, 'miner', 0, 0);
    run(sim, 20);
    expect(sim.placeMachine('wind_turbine', 4, 0, 0)).toEqual({ ok: false, reason: 'not_researched' });
    expect(analyzeBottlenecks(sim.state, sim.metrics)[0].fix).toContain('Research Wind Power');
  });

  it('says nothing while there is enough', () => {
    const sim = newSim();
    machine(sim, 'miner', 0, 0);
    machine(sim, 'seller', 2, 0);
    run(sim, 30);
    expect(analyzeBottlenecks(sim.state, sim.metrics).some((f) => f.kind === 'power')).toBe(false);
  });
});

describe('power and saves', () => {
  it('round-trips the free supply and turbines', () => {
    const sim = newSim(allResearchIds(), 55);
    machine(sim, 'wind_turbine', 0, 0);
    const restored = restoreGame(JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS))));
    expect(restored.power.baseSupply).toBe(55);
    expect(computePower(restored.factory, restored.power).supply).toBe(70);
  });

  it('lets a factory built before power keep running at full speed', () => {
    const sim = newSim();
    // 20 assemblers draw 80, twice the standard free supply. Two of them are upgraded.
    const assemblers = [];
    for (let i = 0; i < 20; i++) assemblers.push(machine(sim, 'assembler', (i % 10) * 2, Math.floor(i / 10) * 2));
    sim.upgradeMachine(assemblers[0].id);
    sim.upgradeMachine(assemblers[1].id);
    sim.upgradeMachine(assemblers[1].id);
    const v5 = JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS)));
    v5.version = 5;
    delete v5.power;

    const restored = restoreGame(v5);
    const power = computePower(restored.factory, restored.power);
    expect(power.demand).toBe(18 * 4 + 8 + 12);
    expect(restored.power.baseSupply).toBe(power.demand);
    expect(power.ratio).toBe(1);
  });

  it('gives a small old factory the standard supply', () => {
    const sim = newSim();
    machine(sim, 'miner', 0, 0);
    const v5 = JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS)));
    v5.version = 5;
    delete v5.power;
    expect(restoreGame(v5).power.baseSupply).toBe(40);
  });
});
