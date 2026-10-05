import type { MachineStatus } from '../factory/MachineSystem';
import { RollingWindow } from './RollingWindow';

const UTILISATION_SECONDS = 30;
const RATE_SECONDS = 60;

export type RateKind = 'produced' | 'consumed' | 'sold';

/** Why a machine is not working right now. */
export type StallKind = 'waiting' | 'output_full';

interface MachineRecord {
  working: RollingWindow;
  waiting: RollingWindow;
  blocked: RollingWindow;
  output: RollingWindow;
  stallKind: StallKind | null;
  stalledFor: number;
}

export interface MachineShares {
  /** Fractions of observed time; they sum to 1 once anything has been observed. */
  working: number;
  waiting: number;
  blocked: number;
  /** Seconds of enabled time these fractions are based on. */
  observed: number;
}

/**
 * Live measurements of how the factory is actually running: what flows per minute and how
 * each machine spends its time. Derived data only — rebuilt as the game runs, never saved.
 */
export class FactoryMetrics {
  private readonly rates: Record<RateKind, Map<string, RollingWindow>> = {
    produced: new Map(),
    consumed: new Map(),
    sold: new Map(),
  };
  private readonly machines = new Map<string, MachineRecord>();

  advance(dt: number): void {
    for (const kind of Object.values(this.rates)) {
      for (const window of kind.values()) window.advance(dt);
    }
    for (const record of this.machines.values()) {
      record.working.advance(dt);
      record.waiting.advance(dt);
      record.blocked.advance(dt);
      record.output.advance(dt);
    }
  }

  private record(machineId: string): MachineRecord {
    let record = this.machines.get(machineId);
    if (!record) {
      record = {
        working: new RollingWindow(UTILISATION_SECONDS),
        waiting: new RollingWindow(UTILISATION_SECONDS),
        blocked: new RollingWindow(UTILISATION_SECONDS),
        output: new RollingWindow(RATE_SECONDS),
        stallKind: null,
        stalledFor: 0,
      };
      this.machines.set(machineId, record);
    }
    return record;
  }

  /** Call once per tick for every crafting machine with its status after the tick. */
  sampleMachine(machineId: string, status: MachineStatus, dt: number): void {
    const record = this.record(machineId);
    const stall: StallKind | null = status === 'waiting' || status === 'output_full' ? status : null;
    if (stall !== record.stallKind) {
      record.stallKind = stall;
      record.stalledFor = 0;
    }
    if (stall) record.stalledFor += dt;

    if (status === 'working') record.working.add(dt);
    else if (status === 'waiting') record.waiting.add(dt);
    else if (status === 'output_full') record.blocked.add(dt);
    // Disabled time is deliberately not counted: switching a machine off is not a bottleneck.
  }

  count(kind: RateKind, resourceId: string, amount: number, machineId?: string): void {
    let window = this.rates[kind].get(resourceId);
    if (!window) {
      window = new RollingWindow(RATE_SECONDS);
      this.rates[kind].set(resourceId, window);
    }
    window.add(amount);
    if (machineId && kind === 'produced') this.record(machineId).output.add(amount);
  }

  forgetMachine(machineId: string): void {
    this.machines.delete(machineId);
  }

  /** Items per minute across the whole factory. */
  rate(kind: RateKind, resourceId: string): number {
    return this.rates[kind].get(resourceId)?.perMinute() ?? 0;
  }

  /** Items per minute this machine has actually been producing. */
  machineOutputRate(machineId: string): number {
    return this.machines.get(machineId)?.output.perMinute() ?? 0;
  }

  shares(machineId: string): MachineShares {
    const record = this.machines.get(machineId);
    if (!record) return { working: 0, waiting: 0, blocked: 0, observed: 0 };
    const working = record.working.sum();
    const waiting = record.waiting.sum();
    const blocked = record.blocked.sum();
    const observed = working + waiting + blocked;
    if (observed <= 0) return { working: 0, waiting: 0, blocked: 0, observed: 0 };
    return { working: working / observed, waiting: waiting / observed, blocked: blocked / observed, observed };
  }

  /** The machine's current uninterrupted stall, if any, and how long it has lasted. */
  stall(machineId: string): { kind: StallKind; seconds: number } | null {
    const record = this.machines.get(machineId);
    return record?.stallKind ? { kind: record.stallKind, seconds: record.stalledFor } : null;
  }
}
