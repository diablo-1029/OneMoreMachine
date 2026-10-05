import { BALANCE } from '../../data/balance';
import { getEnvironment } from '../../data/environments';
import { PRESTIGE } from '../../data/prestige';
import { createNewGame, type GameState } from './GameState';

/** What carries over from one factory to the next. */
export interface PrestigeState {
  /** Stars held; each permanently raises sale prices and starting money. */
  stars: number;
  /** How many times the player has sold up. */
  count: number;
}

/** Stars a run is worth for the money it has earned. */
export function starsForEarnings(totalEarned: number): number {
  return Math.max(0, Math.floor(Math.cbrt(totalEarned / PRESTIGE.earningsScale) + 1e-9));
}

/** Money a run must have earned to be worth this many stars. */
export function earningsForStars(stars: number): number {
  return stars ** 3 * PRESTIGE.earningsScale;
}

/** How many times the base price every sale pays, for a number of stars held. */
export function saleMultiplier(stars: number): number {
  return 1 + stars * PRESTIGE.saleBonusPerStar;
}

export function startingMoney(stars: number): number {
  return BALANCE.startingMoney + stars * PRESTIGE.startingMoneyPerStar;
}

/**
 * Sells the current factory and founds a new one on the chosen site.
 * Gone: the factory, money, research, contracts and production totals.
 * Kept: stars (plus those this run earned) and achievements. Blueprints live outside any
 * one factory, so they carry over too.
 * Returns null when the run has not yet earned a star, in which case nothing changes.
 */
export function createPrestigeGame(current: GameState, environmentId: string): GameState | null {
  const earned = starsForEarnings(current.economy.totalEarned);
  if (earned < 1) return null;
  const stars = current.prestige.stars + earned;
  const next = createNewGame(getEnvironment(environmentId).id);
  next.prestige = { stars, count: current.prestige.count + 1 };
  next.economy.money = startingMoney(stars);
  next.achievements = [...current.achievements];
  // The tutorial has done its job by now.
  next.tutorialStep = current.tutorialStep;
  return next;
}
