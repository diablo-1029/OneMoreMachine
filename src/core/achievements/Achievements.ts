import { ACHIEVEMENTS, type AchievementDefinition } from '../../data/achievements';
import type { Simulation } from '../game/Simulation';

const byId = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));

export function isAchievementId(id: string): boolean {
  return byId.has(id);
}

/**
 * Unlocks every achievement whose goal has been reached, paying its reward once.
 * Returns the ones newly unlocked, in definition order.
 */
export function checkAchievements(sim: Simulation): AchievementDefinition[] {
  const { state } = sim;
  const unlocked: AchievementDefinition[] = [];
  for (const achievement of ACHIEVEMENTS) {
    if (state.achievements.includes(achievement.id)) continue;
    const { current, target } = achievement.progress(sim);
    if (current < target) continue;
    state.achievements.push(achievement.id);
    state.economy.grant(achievement.reward);
    unlocked.push(achievement);
  }
  return unlocked;
}

/** Every achievement id; handy for tests that want rewards out of the way. */
export function allAchievementIds(): string[] {
  return ACHIEVEMENTS.map((a) => a.id);
}

/** The lowest rung of the earnings ladder not yet reached, or null once all are. */
export function nextMilestone(sim: Simulation): AchievementDefinition | null {
  return (
    ACHIEVEMENTS.find((a) => a.kind === 'milestone' && !sim.state.achievements.includes(a.id)) ?? null
  );
}
