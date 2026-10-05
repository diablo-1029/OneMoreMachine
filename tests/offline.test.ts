import { describe, expect, it } from 'vitest';
import { TICK_RATE } from '../src/core/game/Constants';
import { allAchievementIds } from '../src/core/achievements/Achievements';
import { createNewGame } from '../src/core/game/GameState';
import { applyOfflineProgress, formatDuration, OFFLINE } from '../src/core/game/OfflineProgress';
import { Simulation } from '../src/core/game/Simulation';
import { allResearchIds } from '../src/core/research/Research';

/** Miner → furnace → assembler → seller: 30 plates and 15 gears a minute, $180 a minute. */
function gearLine(): Simulation {
  const state = createNewGame();
  state.research = allResearchIds();
  state.economy.money = 10_000;
  const sim = new Simulation(state);
  state.contracts.active = [];
  state.achievements = allAchievementIds();
  sim.placeMachine('miner', 0, 0, 0);
  sim.placeConveyor(2, 0, 0);
  sim.placeMachine('furnace', 3, 0, 0);
  sim.placeConveyor(5, 0, 0);
  sim.placeMachine('assembler', 6, 0, 0);
  sim.placeConveyor(8, 0, 0);
  sim.placeMachine('seller', 9, 0, 0);
  return sim;
}

function run(sim: Simulation, seconds: number): void {
  for (let i = 0; i < seconds * TICK_RATE; i++) sim.tick();
}

describe('offline progress', () => {
  it('ignores a short absence', () => {
    const sim = gearLine();
    const money = sim.state.economy.money;
    expect(applyOfflineProgress(sim, 30)).toBeNull();
    expect(applyOfflineProgress(sim, -500)).toBeNull();
    expect(applyOfflineProgress(sim, Number.NaN)).toBeNull();
    expect(sim.state.economy.money).toBe(money);
    expect(sim.state.simTime).toBe(0);
  });

  it('plays a few minutes out exactly', () => {
    const away = gearLine();
    const played = gearLine();
    // Time away counts at half pace, so 400 seconds away is 200 seconds of production.
    const report = applyOfflineProgress(away, 400)!;
    run(played, 200);
    expect(away.state.economy.money).toBe(played.state.economy.money);
    expect(away.state.stats).toEqual(played.state.stats);
    expect(report).toMatchObject({ awaySeconds: 400, countedSeconds: 400, capped: false });
    expect(report.sold).toEqual({ gear: played.state.stats.sold['gear'] });
    expect(report.earned).toBe(played.state.stats.sold['gear'] * 12);
  });

  it('matches really playing half the time away to within a couple of percent', () => {
    const away = gearLine();
    const played = gearLine();
    const before = away.state.economy.money;
    const report = applyOfflineProgress(away, 4 * 60 * 60)!;
    run(played, 2 * 60 * 60);

    const offlineGain = away.state.economy.money - before;
    const playedGain = played.state.economy.money - before;
    expect(Math.abs(offlineGain - playedGain) / playedGain).toBeLessThan(0.02);
    expect(report.earned).toBe(offlineGain);
    // 15 gears a minute for two hours.
    expect(report.sold['gear']).toBeGreaterThan(1750);
    expect(report.sold['gear']).toBeLessThanOrEqual(1800);
    expect(away.state.stats.produced['iron_plate']).toBeGreaterThan(3500);
    expect(away.state.simTime).toBeCloseTo(2 * 60 * 60, 3);
  });

  it('stops counting at the cap', () => {
    const capped = gearLine();
    const exact = gearLine();
    const report = applyOfflineProgress(capped, 3 * 24 * 60 * 60)!;
    applyOfflineProgress(exact, OFFLINE.capSeconds);
    expect(report.capped).toBe(true);
    expect(report.countedSeconds).toBe(OFFLINE.capSeconds);
    expect(report.awaySeconds).toBe(3 * 24 * 60 * 60);
    expect(capped.state.economy.money).toBe(exact.state.economy.money);
  });

  it('earns nothing for a factory that sells nothing', () => {
    const state = createNewGame();
    const sim = new Simulation(state);
    sim.placeMachine('miner', 0, 0, 0);
    const money = state.economy.money;
    const report = applyOfflineProgress(sim, 60 * 60)!;
    expect(report.earned).toBe(0);
    expect(report.sold).toEqual({});
    expect(state.economy.money).toBe(money);
  });

  it('counts sales towards delivery contracts and pays their bonus', () => {
    const sim = gearLine();
    sim.state.contracts.active = [
      { id: 9000, kind: 'deliver', resourceId: 'gear', target: 500, progress: 0, reward: 2500 },
      { id: 9001, kind: 'deliver', resourceId: 'gear', target: 100_000, progress: 0, reward: 1 },
    ];
    const before = sim.state.economy.money;
    // Two hours away at half pace is an hour of production: 900 gears.
    const report = applyOfflineProgress(sim, 2 * 60 * 60)!;

    expect(report.contractsCompleted).toBeGreaterThanOrEqual(1);
    expect(sim.state.contracts.active.some((c) => c.id === 9000)).toBe(false);
    // The unfinished one has been credited with everything sold while away.
    expect(sim.state.contracts.active.find((c) => c.id === 9001)?.progress).toBe(report.sold['gear']);
    expect(report.earned).toBeGreaterThanOrEqual(report.sold['gear'] * 12 + 2500);
    expect(sim.state.economy.money - before).toBe(report.earned);
  });
});

describe('formatDuration', () => {
  it('reads naturally', () => {
    expect(formatDuration(45)).toBe('45 s');
    expect(formatDuration(12 * 60)).toBe('12 min');
    expect(formatDuration(3 * 3600)).toBe('3 h');
    expect(formatDuration(3 * 3600 + 5 * 60)).toBe('3 h 5 min');
  });
});
