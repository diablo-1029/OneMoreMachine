import { describe, expect, it } from 'vitest';
import { nominalRatePerMinute } from '../src/core/factory/MachineSystem';
import { TICK_RATE } from '../src/core/game/Constants';
import { allAchievementIds } from '../src/core/achievements/Achievements';
import { createNewGame } from '../src/core/game/GameState';
import { Simulation } from '../src/core/game/Simulation';
import { allResearchIds } from '../src/core/research/Research';
import { restoreGame, serializeGame } from '../src/core/save/Serializer';
import { DEFAULT_SETTINGS } from '../src/core/save/SaveSchema';
import { analyzeBottlenecks } from '../src/core/stats/Bottlenecks';

function newSim(research: string[] = allResearchIds(), money = 10_000): Simulation {
  const state = createNewGame();
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

function machine(sim: Simulation, type: string, x: number, y: number) {
  const result = sim.placeMachine(type, x, y, 0);
  if (!result.ok) throw new Error(`Could not place ${type}: ${result.reason}`);
  return result.value;
}

describe('upgrading a machine', () => {
  it('costs a multiple of the build price and raises the speed', () => {
    const sim = newSim();
    const furnace = machine(sim, 'furnace', 0, 0);
    const before = sim.state.economy.money;

    expect(sim.upgradeOffer(furnace)).toMatchObject({ cost: 120, needsResearch: null });
    expect(sim.upgradeMachine(furnace.id).ok).toBe(true);
    expect(furnace.level).toBe(2);
    expect(sim.state.economy.money).toBe(before - 120);
    expect(nominalRatePerMinute(furnace)?.perMinute).toBe(45);

    expect(sim.upgradeOffer(furnace)?.cost).toBe(240);
    expect(sim.upgradeMachine(furnace.id).ok).toBe(true);
    expect(furnace.level).toBe(3);
    expect(nominalRatePerMinute(furnace)?.perMinute).toBe(60);

    expect(sim.upgradeOffer(furnace)).toBeNull();
    expect(sim.upgradeMachine(furnace.id)).toEqual({ ok: false, reason: 'max_level' });
    expect(sim.state.economy.money).toBe(before - 360);
  });

  it('really produces faster', () => {
    const output = (level: number): number => {
      const sim = newSim();
      const miner = machine(sim, 'miner', 0, 0);
      machine(sim, 'seller', 2, 0);
      for (let l = 1; l < level; l++) sim.upgradeMachine(miner.id);
      run(sim, 120);
      return sim.state.stats.sold['iron_ore'];
    };
    // The last item of the two minutes may still be on its way into the seller.
    for (const [level, expected] of [[1, 60], [2, 90], [3, 120]]) {
      const sold = output(level);
      expect(sold).toBeGreaterThanOrEqual(expected - 1);
      expect(sold).toBeLessThanOrEqual(expected);
    }
  });

  it('needs its research first', () => {
    const sim = newSim(['gear_assembly']);
    const miner = machine(sim, 'miner', 0, 0);
    expect(sim.upgradeOffer(miner)?.needsResearch?.id).toBe('machine_tuning');
    expect(sim.upgradeMachine(miner.id)).toEqual({ ok: false, reason: 'not_researched' });

    sim.research('machine_tuning');
    expect(sim.upgradeMachine(miner.id).ok).toBe(true);
    // Mk III is a separate, later node.
    expect(sim.upgradeOffer(miner)?.needsResearch?.id).toBe('precision_engineering');
    expect(sim.upgradeMachine(miner.id)).toEqual({ ok: false, reason: 'not_researched' });
    expect(miner.level).toBe(2);
  });

  it('is refused when unaffordable or not a crafting machine', () => {
    const sim = newSim(allResearchIds(), 400);
    const assembler = machine(sim, 'assembler', 0, 0);
    const seller = machine(sim, 'seller', 3, 0);
    const splitter = machine(sim, 'splitter', 6, 0);
    const money = sim.state.economy.money;
    expect(sim.upgradeMachine(assembler.id).ok).toBe(true);
    expect(sim.upgradeMachine(assembler.id)).toEqual({ ok: false, reason: 'cannot_afford' });
    expect(sim.upgradeMachine(seller.id)).toEqual({ ok: false, reason: 'not_upgradable' });
    expect(sim.upgradeMachine(splitter.id)).toEqual({ ok: false, reason: 'not_upgradable' });
    expect(sim.upgradeOffer(seller)).toBeNull();
    expect(sim.state.economy.money).toBe(money - 160);
  });

  it('refunds the upgrades along with the machine', () => {
    const sim = newSim();
    const before = sim.state.economy.money;
    const furnace = machine(sim, 'furnace', 0, 0);
    sim.upgradeMachine(furnace.id);
    sim.upgradeMachine(furnace.id);
    expect(sim.state.economy.money).toBe(before - 60 - 120 - 240);
    sim.removeAt(0, 0);
    expect(sim.state.economy.money).toBe(before);
  });

  it('keeps a craft in progress', () => {
    const sim = newSim();
    const miner = machine(sim, 'miner', 0, 0);
    run(sim, 1);
    expect(miner.progress).toBeCloseTo(0.5, 5);
    sim.upgradeMachine(miner.id);
    expect(miner.active).toBe(true);
    expect(miner.progress).toBeCloseTo(0.5, 5);
  });
});

describe('upgrades and the rest of the game', () => {
  it('lets one upgraded furnace feed an assembler that a standard one starves', () => {
    const sim = newSim();
    const miner = machine(sim, 'miner', 0, 0);
    sim.placeConveyor(2, 0, 0);
    const furnace = machine(sim, 'furnace', 3, 0);
    sim.placeConveyor(5, 0, 0);
    const assembler = machine(sim, 'assembler', 6, 0);
    sim.placeConveyor(8, 0, 0);
    machine(sim, 'seller', 9, 0);
    run(sim, 90);
    expect(analyzeBottlenecks(sim.state, sim.metrics)[0]).toMatchObject({ machineId: assembler.id, kind: 'starved' });

    // Mk II miner and furnace make 45 plates a minute; the assembler uses 40.
    sim.upgradeMachine(miner.id);
    sim.upgradeMachine(furnace.id);
    run(sim, 120);
    expect(sim.metrics.shares(assembler.id).working).toBeGreaterThan(0.95);
    expect(analyzeBottlenecks(sim.state, sim.metrics).some((f) => f.machineId === assembler.id)).toBe(false);
  });

  it('is kept by a save and reload', () => {
    const sim = newSim();
    const miner = machine(sim, 'miner', 0, 0);
    machine(sim, 'furnace', 2, 0);
    sim.upgradeMachine(miner.id);
    sim.upgradeMachine(miner.id);
    const restored = restoreGame(JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS))));
    expect([...restored.factory.machines.values()].map((m) => m.level)).toEqual([3, 1]);
  });

  it('gives machines from a version 4 save level 1', () => {
    const sim = newSim();
    machine(sim, 'miner', 0, 0);
    machine(sim, 'seller', 2, 0);
    const v4 = JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS)));
    v4.version = 4;
    for (const m of v4.factory.machines) delete m.level;
    expect([...restoreGame(v4).factory.machines.values()].map((m) => m.level)).toEqual([1, 1]);
  });

  it('rejects an impossible level', () => {
    const sim = newSim();
    machine(sim, 'seller', 0, 0);
    const saved = JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS)));
    saved.factory.machines[0].level = 2;
    expect(() => restoreGame(saved)).toThrow();
    saved.factory.machines[0].level = 9;
    expect(() => restoreGame(saved)).toThrow();
  });
});
