import { TICK_DT } from './Constants';

export type GameSpeed = 0 | 1 | 2;

/**
 * Fixed-timestep accumulator. Game speed scales how much simulated time each real
 * second buys; the tick size itself never changes, so the simulation stays deterministic.
 */
export class TickSystem {
  speed: GameSpeed = 1;
  private accumulator = 0;

  /**
   * Feeds real elapsed seconds and runs however many ticks are due.
   * `maxTicks` bounds the catch-up after a stall so one slow frame cannot snowball.
   */
  advance(realDt: number, maxTicks: number, tick: () => void): number {
    if (this.speed === 0) return 0;
    this.accumulator += realDt * this.speed;
    let ticks = 0;
    while (this.accumulator >= TICK_DT && ticks < maxTicks) {
      tick();
      this.accumulator -= TICK_DT;
      ticks++;
    }
    if (this.accumulator >= TICK_DT) this.accumulator = 0;
    return ticks;
  }

  /** Fraction of a tick elapsed since the last one; used to interpolate rendering. */
  get alpha(): number {
    return this.speed === 0 ? 1 : Math.min(this.accumulator / TICK_DT, 1);
  }
}
