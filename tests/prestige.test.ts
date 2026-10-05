import { describe, expect, it } from 'vitest';
import { allAchievementIds, checkAchievements } from '../src/core/achievements/Achievements';
import { TICK_RATE } from '../src/core/game/Constants';
import { createNewGame } from '../src/core/game/GameState';
import {
  createPrestigeGame,
  earningsForStars,
  saleMultiplier,
  starsForEarnings,
  startingMoney,
} from '../src/core/game/Prestige';
import { Simulation } from '../src/core/game/Simulation';
import { allResearchIds } from '../src/core/research/Research';
import { restoreGame, serializeGame } from '../src/core/save/Serializer';
import { DEFAULT_SETTINGS } from '../src/core/save/SaveSchema';

function run(sim: Simulation, seconds: number): void {
  for (let i = 0; i < seconds * TICK_RATE; i++) sim.tick();
}

/** A developed factory: everything researched, things built, money earned. */
function establishedGame(totalEarned: number, stars = 0) {
  const state = createNewGame('meadow');
  state.research = allResearchIds();
  state.economy.money = 80_000;
  state.economy.totalEarned = totalEarned;
  state.prestige = { stars, count: stars > 0 ? 1 : 0 };
  state.achievements = ['first_sale', 'earn_1k'];
  state.tutorialStep = 99;
  state.contracts.completed = 6;
  const sim = new Simulation(state);
  sim.placeMachine('miner', 0, 0, 0);
  sim.placeMachine('seller', 2, 0, 0);
  sim.expandFactory();
  return sim;
}

describe('star values', () => {
  it('follow the cube-root curve', () => {
    expect(starsForEarnings(0)).toBe(0);
    expect(starsForEarnings(49_999)).toBe(0);
    expect(starsForEarnings(50_000)).toBe(1);
    expect(starsForEarnings(399_999)).toBe(1);
    expect(starsForEarnings(400_000)).toBe(2);
    expect(starsForEarnings(1_350_000)).toBe(3);
    expect(starsForEarnings(50_000_000)).toBe(10);
  });

  it('agree with the thresholds shown to the player', () => {
    for (let stars = 1; stars <= 30; stars++) {
      expect(starsForEarnings(earningsForStars(stars))).toBe(stars);
      expect(starsForEarnings(earningsForStars(stars) - 1)).toBe(stars - 1);
    }
  });

  it('raise prices and starting money', () => {
    expect(saleMultiplier(0)).toBe(1);
    expect(saleMultiplier(3)).toBeCloseTo(1.3);
    expect(startingMoney(0)).toBe(200);
    expect(startingMoney(5)).toBe(700);
  });
});

describe('selling up', () => {
  it('is refused until the factory is worth a star', () => {
    const sim = establishedGame(30_000);
    expect(createPrestigeGame(sim.state, 'dunes')).toBeNull();
  });

  it('starts a fresh factory on the chosen site with the stars added', () => {
    const sim = establishedGame(1_400_000, 2);
    const next = createPrestigeGame(sim.state, 'tundra')!;

    expect(next.prestige).toEqual({ stars: 5, count: 2 });
    expect(next.environment).toBe('tundra');
    expect(next.economy.money).toBe(700);
    // Everything to do with the old factory is gone...
    expect(next.economy.totalEarned).toBe(0);
    expect(next.factory.machines.size).toBe(0);
    expect(next.factory.grid.width).toBe(12);
    expect(next.research).toEqual([]);
    expect(next.contracts.completed).toBe(0);
    expect(next.stats).toEqual({ produced: {}, sold: {} });
    // ...while achievements stay, and the tutorial does not start over.
    expect(next.achievements).toEqual(['first_sale', 'earn_1k']);
    expect(next.tutorialStep).toBe(99);
    // The old state is left untouched.
    expect(sim.state.prestige.stars).toBe(2);
    expect(sim.state.factory.machines.size).toBe(2);
  });

  it('falls back to the meadow for an unknown site', () => {
    const sim = establishedGame(100_000);
    expect(createPrestigeGame(sim.state, 'moon_base')!.environment).toBe('meadow');
  });

  it('counts towards its achievements in the new factory', () => {
    const sim = establishedGame(60_000);
    const next = new Simulation(createPrestigeGame(sim.state, 'meadow')!);
    expect(checkAchievements(next).map((a) => a.id)).toContain('prestige_1');
  });
});

describe('stars in play', () => {
  function sellOre(stars: number): Simulation {
    const state = createNewGame();
    state.prestige = { stars, count: 1 };
    state.achievements = allAchievementIds();
    const sim = new Simulation(state);
    state.contracts.active = [];
    sim.placeMachine('miner', 0, 0, 0);
    sim.placeMachine('seller', 2, 0, 0);
    return sim;
  }

  it('raise what every sale pays', () => {
    const plain = sellOre(0);
    const starred = sellOre(5);
    run(plain, 61);
    run(starred, 61);
    expect(plain.state.stats.sold['iron_ore']).toBe(30);
    expect(starred.state.stats.sold['iron_ore']).toBe(30);
    expect(plain.state.economy.totalEarned).toBe(30);
    expect(starred.state.economy.totalEarned).toBeCloseTo(45, 6);
    expect(starred.salePrice('gear')).toBeCloseTo(18);
  });

  it('apply to sales credited while away as well', () => {
    const sim = sellOre(10);
    const before = sim.state.economy.money;
    sim.creditSales('gear', 100);
    expect(sim.state.economy.money - before).toBeCloseTo(2400, 6);
  });
});

describe('prestige and saves', () => {
  it('round-trips stars', () => {
    const sim = establishedGame(0, 4);
    const restored = restoreGame(JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS))));
    expect(restored.prestige).toEqual({ stars: 4, count: 1 });
    expect(new Simulation(restored).salePrice('gear')).toBeCloseTo(16.8);
  });

  it('starts a version 8 save with none', () => {
    const sim = establishedGame(500_000);
    const v8 = JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS)));
    v8.version = 8;
    delete v8.prestige;
    const restored = restoreGame(v8);
    expect(restored.prestige).toEqual({ stars: 0, count: 0 });
    // What the old factory has already earned still counts towards its first sale.
    expect(createPrestigeGame(restored, 'meadow')!.prestige.stars).toBe(2);
  });
});
