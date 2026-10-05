import { describe, expect, it } from 'vitest';
import { checkAchievements, nextMilestone } from '../src/core/achievements/Achievements';
import { TICK_RATE } from '../src/core/game/Constants';
import { createNewGame } from '../src/core/game/GameState';
import { Simulation } from '../src/core/game/Simulation';
import { allResearchIds } from '../src/core/research/Research';
import { restoreGame, serializeGame } from '../src/core/save/Serializer';
import { DEFAULT_SETTINGS } from '../src/core/save/SaveSchema';
import { ACHIEVEMENTS, type AchievementDefinition } from '../src/data/achievements';

function newSim(): Simulation {
  const state = createNewGame();
  state.research = allResearchIds();
  state.economy.money = 50_000;
  const sim = new Simulation(state);
  state.contracts.active = [];
  return sim;
}

function run(sim: Simulation, seconds: number): void {
  for (let i = 0; i < seconds * TICK_RATE; i++) sim.tick();
}

const ids = (list: AchievementDefinition[]) => list.map((a) => a.id);

describe('achievement definitions', () => {
  it('have unique ids and sensible targets', () => {
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length);
    const sim = newSim();
    for (const achievement of ACHIEVEMENTS) {
      const { current, target } = achievement.progress(sim);
      expect(target).toBeGreaterThan(0);
      expect(current).toBeGreaterThanOrEqual(0);
      expect(achievement.reward).toBeGreaterThanOrEqual(0);
    }
  });

  it('list the earning milestones in rising order', () => {
    const sim = newSim();
    const targets = ACHIEVEMENTS.filter((a) => a.kind === 'milestone').map((a) => a.progress(sim).target);
    expect(targets.length).toBeGreaterThan(2);
    for (let i = 1; i < targets.length; i++) expect(targets[i]).toBeGreaterThan(targets[i - 1]);
  });
});

describe('unlocking', () => {
  it('starts with nothing unlocked on an empty factory', () => {
    const sim = new Simulation(createNewGame());
    expect(checkAchievements(sim)).toEqual([]);
    expect(nextMilestone(sim)?.id).toBe('earn_1k');
  });

  it('pays each reward exactly once', () => {
    const sim = newSim();
    sim.research('gear_assembly');
    const before = sim.state.economy.money;
    const first = checkAchievements(sim);
    expect(ids(first)).toEqual(['first_research', 'all_research']);
    const reward = first.reduce((sum, a) => sum + a.reward, 0);
    expect(sim.state.economy.money).toBe(before + reward);

    expect(checkAchievements(sim)).toEqual([]);
    expect(sim.state.economy.money).toBe(before + reward);
    expect(sim.state.achievements).toEqual(['first_research', 'all_research']);
  });

  it('follows what is built', () => {
    const sim = newSim();
    sim.state.achievements = ['first_research', 'all_research'];
    sim.placeMachine('splitter', 0, 0, 0);
    for (let i = 0; i < 3; i++) sim.placeMachine('wind_turbine', i * 2, 2, 0);
    const miner = sim.placeMachine('miner', 0, 5, 0);
    if (!miner.ok) throw new Error('placement failed');
    sim.upgradeMachine(miner.value.id);
    sim.upgradeMachine(miner.value.id);
    sim.expandFactory();
    expect(ids(checkAchievements(sim)).sort()).toEqual(['expand_once', 'mk3', 'splitter', 'wind_farm']);
  });

  it('is announced by the simulation as play goes on', () => {
    const sim = newSim();
    sim.state.achievements = ['first_research', 'all_research'];
    const announced: string[] = [];
    sim.events.on('achievementsUnlocked', (list) => announced.push(...ids(list)));
    sim.placeMachine('miner', 0, 0, 0);
    sim.placeMachine('seller', 2, 0, 0);
    run(sim, 10);
    expect(announced).toEqual(['first_sale']);
    expect(sim.state.achievements).toContain('first_sale');
  });

  it('moves the next milestone up the ladder', () => {
    const sim = newSim();
    sim.state.economy.totalEarned = 12_000;
    checkAchievements(sim);
    expect(sim.state.achievements).toContain('earn_1k');
    expect(sim.state.achievements).toContain('earn_10k');
    expect(nextMilestone(sim)?.id).toBe('earn_100k');
  });

  it('needs every machine busy for Perfectly Balanced', () => {
    const balanced = ACHIEVEMENTS.find((a) => a.id === 'balanced')!;
    const sim = newSim();
    // Five miners selling straight into sellers are never idle.
    for (let i = 0; i < 5; i++) {
      sim.placeMachine('miner', 0, i * 2, 0);
      sim.placeMachine('seller', 2, i * 2, 0);
    }
    run(sim, 10);
    expect(balanced.progress(sim).current).toBeLessThan(5);
    run(sim, 30);
    expect(balanced.progress(sim)).toEqual({ current: 5, target: 5 });

    // One more miner with nowhere to send its ore spoils it.
    sim.placeMachine('miner', 6, 0, 0);
    run(sim, 40);
    expect(balanced.progress(sim).current).toBeLessThan(5);
  });
});

describe('achievements and saves', () => {
  it('round-trips what has been earned', () => {
    const sim = newSim();
    sim.state.achievements = ['first_sale', 'earn_1k'];
    const restored = restoreGame(JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS))));
    expect(restored.achievements).toEqual(['first_sale', 'earn_1k']);
  });

  it('starts a version 6 save with none, then credits what it has already done', () => {
    const sim = newSim();
    sim.state.economy.totalEarned = 150_000;
    sim.state.stats.sold = { gear: 4000 };
    const v6 = JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS)));
    v6.version = 6;
    delete v6.achievements;

    const restored = restoreGame(v6);
    expect(restored.achievements).toEqual([]);
    const resumed = new Simulation(restored);
    const earned = ids(checkAchievements(resumed));
    expect(earned).toEqual(expect.arrayContaining(['earn_1k', 'earn_10k', 'earn_100k', 'first_sale', 'sell_1000', 'gears_100']));
  });

  it('drops ids it does not know', () => {
    const sim = newSim();
    const saved = JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS)));
    saved.achievements = ['first_sale', 'won_the_lottery', 'first_sale', 7];
    expect(restoreGame(saved).achievements).toEqual(['first_sale']);
  });
});
