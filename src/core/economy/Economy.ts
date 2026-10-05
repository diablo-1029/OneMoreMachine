import { RollingWindow } from '../stats/RollingWindow';

/** Money plus a rolling income window for the "$/min" readout. */
export class Economy {
  totalEarned = 0;
  private readonly income = new RollingWindow(30);

  constructor(public money: number) {}

  canAfford(amount: number): boolean {
    return this.money >= amount;
  }

  spend(amount: number): boolean {
    if (!this.canAfford(amount)) return false;
    this.money -= amount;
    return true;
  }

  refund(amount: number): void {
    this.money += amount;
  }

  earn(amount: number): void {
    this.money += amount;
    this.totalEarned += amount;
    this.income.add(amount);
  }

  /** A one-off payment such as a contract bonus. Counts as earnings but not as running income. */
  award(amount: number): void {
    this.money += amount;
    this.totalEarned += amount;
  }

  advance(dt: number): void {
    this.income.advance(dt);
  }

  /** Sales income extrapolated to a minute from the recent window. */
  incomePerMinute(): number {
    return this.income.perMinute();
  }
}
