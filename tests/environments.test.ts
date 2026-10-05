import { describe, expect, it } from 'vitest';
import { allAchievementIds } from '../src/core/achievements/Achievements';
import { nominalRatePerMinute } from '../src/core/factory/MachineSystem';
import { TICK_RATE } from '../src/core/game/Constants';
import { createNewGame } from '../src/core/game/GameState';
import { Simulation } from '../src/core/game/Simulation';
import { allResearchIds } from '../src/core/research/Research';
import { restoreGame, serializeGame } from '../src/core/save/Serializer';
import { DEFAULT_SETTINGS } from '../src/core/save/SaveSchema';
import { analyzeBottlenecks } from '../src/core/stats/Bottlenecks';
import { ENVIRONMENTS, getEnvironment } from '../src/data/environments';

function simOn(environment: string, baseSupply = 40): Simulation {
  const state = createNewGame(environment);
  state.research = allResearchIds();
  state.economy.money = 50_000;
  state.power.baseSupply = baseSupply;
  const sim = new Simulation(state);
  state.contracts.active = [];
  state.achievements = allAchievementIds();
  return sim;
}

function run(sim: Simulation, seconds: number): void {
  for (let i = 0; i < seconds * TICK_RATE; i++) sim.tick();
}

/** Ore sold in two minutes by one miner feeding a seller directly. */
function oreInTwoMinutes(environment: string): number {
  const sim = simOn(environment);
  sim.placeMachine('miner', 0, 0, 0);
  sim.placeMachine('seller', 2, 0, 0);
  run(sim, 120);
  return sim.state.stats.sold['iron_ore'];
}

describe('environment definitions', () => {
  it('start with the unmodified meadow and have unique ids', () => {
    expect(ENVIRONMENTS[0]).toMatchObject({ id: 'meadow', effects: [], speed: {}, turbineOutput: 1, powerDraw: 1 });
    expect(new Set(ENVIRONMENTS.map((e) => e.id)).size).toBe(ENVIRONMENTS.length);
  });

  it('describe every rule they change', () => {
    for (const environment of ENVIRONMENTS) {
      const changes =
        Object.keys(environment.speed).length +
        (environment.turbineOutput !== 1 ? 1 : 0) +
        (environment.powerDraw !== 1 ? 1 : 0);
      expect(environment.effects.length).toBe(changes);
    }
  });

  it('fall back to the meadow for an unknown id', () => {
    expect(getEnvironment('moon_base').id).toBe('meadow');
  });
});

describe('environment effects', () => {
  it('change how fast miners work', () => {
    const near = (value: number, expected: number) => {
      expect(value).toBeGreaterThanOrEqual(expected - 1);
      expect(value).toBeLessThanOrEqual(expected);
    };
    near(oreInTwoMinutes('meadow'), 60);
    near(oreInTwoMinutes('dunes'), 48);
    near(oreInTwoMinutes('tundra'), 75);
  });

  it('leave other machines alone and show up in the rated output', () => {
    const sim = simOn('dunes');
    const miner = sim.placeMachine('miner', 0, 0, 0);
    const furnace = sim.placeMachine('furnace', 2, 0, 0);
    if (!miner.ok || !furnace.ok) throw new Error('placement failed');
    expect(nominalRatePerMinute(miner.value, sim.environment)?.perMinute).toBeCloseTo(24);
    expect(nominalRatePerMinute(furnace.value, sim.environment)?.perMinute).toBe(30);
    // Upgrades multiply with the site's effect.
    sim.upgradeMachine(miner.value.id);
    expect(nominalRatePerMinute(miner.value, sim.environment)?.perMinute).toBeCloseTo(36);
  });

  it('make turbines stronger in the dunes', () => {
    const dunes = simOn('dunes');
    const meadow = simOn('meadow');
    for (const sim of [dunes, meadow]) {
      sim.placeMachine('wind_turbine', 0, 0, 0);
      sim.tick();
    }
    expect(meadow.power.supply).toBe(55);
    expect(dunes.power.supply).toBeCloseTo(61);
  });

  it('make machines hungrier in the tundra', () => {
    const tundra = simOn('tundra');
    const meadow = simOn('meadow');
    for (const sim of [tundra, meadow]) {
      sim.placeMachine('miner', 0, 0, 0);
      sim.placeMachine('furnace', 2, 0, 0);
      sim.placeMachine('assembler', 4, 0, 0);
      sim.tick();
    }
    expect(meadow.power.demand).toBe(9);
    expect(tundra.power.demand).toBeCloseTo(11.25);
  });

  it('are taken into account by bottleneck advice', () => {
    // A power shortage of 20: one dune turbine (21) covers it, a meadow turbine (15) does not.
    const advice = (environment: string) => {
      const sim = simOn(environment, 4);
      for (let i = 0; i < 12; i++) sim.placeMachine('miner', (i % 6) * 2, Math.floor(i / 6) * 2, 0);
      run(sim, 5);
      return analyzeBottlenecks(sim.state, sim.metrics)[0].fix;
    };
    expect(advice('dunes')).toBe('One more Wind Turbine would cover it.');
    expect(advice('meadow')).toBe('2 more Wind Turbines would cover it.');
  });
});

describe('environments and saves', () => {
  it('round-trip the chosen site', () => {
    const sim = simOn('tundra');
    const restored = restoreGame(JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS))));
    expect(restored.environment).toBe('tundra');
    expect(new Simulation(restored).environment.id).toBe('tundra');
  });

  it('put a version 7 save on the meadow', () => {
    const sim = simOn('dunes');
    const v7 = JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS)));
    v7.version = 7;
    delete v7.environment;
    expect(restoreGame(v7).environment).toBe('meadow');
  });

  it('fall back rather than fail on an unknown site', () => {
    const sim = simOn('meadow');
    const saved = JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS)));
    saved.environment = 'moon_base';
    expect(restoreGame(saved).environment).toBe('meadow');
  });
});
