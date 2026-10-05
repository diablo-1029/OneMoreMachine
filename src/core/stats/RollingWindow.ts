/**
 * Sum of everything added over the last N seconds of simulated time, in one-second buckets.
 * Used for income, production rates and machine utilisation.
 */
export class RollingWindow {
  private readonly buckets: Float64Array;
  private index = 0;
  private bucketTime = 0;
  private elapsed = 0;

  constructor(readonly seconds: number) {
    this.buckets = new Float64Array(seconds);
  }

  add(amount: number): void {
    this.buckets[this.index] += amount;
  }

  advance(dt: number): void {
    this.elapsed += dt;
    this.bucketTime += dt;
    while (this.bucketTime >= 1) {
      this.bucketTime -= 1;
      this.index = (this.index + 1) % this.seconds;
      this.buckets[this.index] = 0;
    }
  }

  sum(): number {
    let total = 0;
    for (let i = 0; i < this.seconds; i++) total += this.buckets[i];
    return total;
  }

  /**
   * The sum scaled to a per-minute rate. While the window is still filling, the rate is
   * taken over the time observed so far, but never less than `minSeconds` so the first
   * few events do not produce absurd spikes.
   */
  perMinute(minSeconds = 10): number {
    const span = Math.min(Math.max(this.elapsed, minSeconds), this.seconds);
    return (this.sum() / span) * 60;
  }
}
