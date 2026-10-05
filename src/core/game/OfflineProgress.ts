import { TICK_RATE } from './Constants';
import type { Simulation } from './Simulation';

/** Tuning for progress made while the game was not running. */
export const OFFLINE = {
  /** Shorter absences are simply ignored. */
  minSeconds: 60,
  /** Share of normal output earned while away; being present is worth twice as much. */
  efficiency: 0.5,
  /** Time away beyond this is not counted. */
  capSeconds: 8 * 60 * 60,
  /** How much of the absence is played out tick by tick before the rest is extrapolated. */
  simulateSeconds: 300,
  /** Length of the window, at the end of the simulated stretch, used to measure steady rates. */
  measureSeconds: 120,
};

export interface OfflineReport {
  /** How long the player was actually away. */
  awaySeconds: number;
  /** How much of that was counted (the absence, up to the cap), before the reduced pace is applied. */
  countedSeconds: number;
  capped: boolean;
  /** Money gained: sales plus any contract bonuses. */
  earned: number;
  /** Items sold while away, by resource. */
  sold: Record<string, number>;
  contractsCompleted: number;
}

/**
 * Brings a factory forward by the time its owner was away.
 *
 * Simulating hours tick by tick would freeze the page, so the first few minutes are played
 * for real — which lets belts fill and buffers settle — and the factory's steady output
 * over the end of that stretch is then projected across the remainder.
 *
 * Returns null when the absence is too short to bother with.
 */
export function applyOfflineProgress(sim: Simulation, awaySeconds: number): OfflineReport | null {
  if (!(awaySeconds >= OFFLINE.minSeconds)) return null;
  const { state } = sim;
  const span = Math.min(awaySeconds, OFFLINE.capSeconds);
  // An unattended factory runs at reduced pace, which is the same as running for less time.
  const counted = span * OFFLINE.efficiency;
  const simulated = Math.min(counted, OFFLINE.simulateSeconds);
  const measured = Math.min(simulated, OFFLINE.measureSeconds);

  const earnedBefore = state.economy.totalEarned;
  const soldBefore = { ...state.stats.sold };
  const completedBefore = state.contracts.completed;

  const runTicks = (seconds: number) => {
    for (let i = Math.round(seconds * TICK_RATE); i > 0; i--) sim.tick();
  };
  runTicks(simulated - measured);
  const soldAtMeasure = { ...state.stats.sold };
  const producedAtMeasure = { ...state.stats.produced };
  runTicks(measured);

  const remaining = counted - simulated;
  if (remaining > 0) {
    // Project the measured rates. Whole items only, so nothing fractional is ever credited.
    const project = (now: number | undefined, then: number | undefined) =>
      Math.floor((((now ?? 0) - (then ?? 0)) / measured) * remaining);
    for (const resourceId of Object.keys(state.stats.produced)) {
      const made = project(state.stats.produced[resourceId], producedAtMeasure[resourceId]);
      if (made > 0) state.stats.produced[resourceId] += made;
    }
    for (const resourceId of Object.keys(state.stats.sold)) {
      sim.creditSales(resourceId, project(state.stats.sold[resourceId], soldAtMeasure[resourceId]));
    }
    state.simTime += remaining;
  }

  const sold: Record<string, number> = {};
  for (const [resourceId, total] of Object.entries(state.stats.sold)) {
    const gained = total - (soldBefore[resourceId] ?? 0);
    if (gained > 0) sold[resourceId] = gained;
  }
  return {
    awaySeconds,
    countedSeconds: span,
    capped: awaySeconds > OFFLINE.capSeconds,
    earned: state.economy.totalEarned - earnedBefore,
    sold,
    contractsCompleted: state.contracts.completed - completedBefore,
  };
}

/** Combines two stretches of catch-up into one report, e.g. several gaps while a tab sat in the background. */
export function mergeReports(a: OfflineReport | null, b: OfflineReport): OfflineReport {
  if (!a) return b;
  const sold = { ...a.sold };
  for (const [resourceId, count] of Object.entries(b.sold)) sold[resourceId] = (sold[resourceId] ?? 0) + count;
  return {
    awaySeconds: a.awaySeconds + b.awaySeconds,
    countedSeconds: a.countedSeconds + b.countedSeconds,
    capped: a.capped || b.capped,
    earned: a.earned + b.earned,
    sold,
    contractsCompleted: a.contractsCompleted + b.contractsCompleted,
  };
}

/** "45 s", "12 min", "3 h 5 min". */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}
