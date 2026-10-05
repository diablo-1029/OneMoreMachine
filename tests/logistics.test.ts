import { describe, expect, it } from 'vitest';
import { insertItem } from '../src/core/factory/ConveyorSystem';
import { TICK_RATE } from '../src/core/game/Constants';
import { createNewGame } from '../src/core/game/GameState';
import { Simulation } from '../src/core/game/Simulation';
import { allResearchIds } from '../src/core/research/Research';
import { restoreGame, serializeGame } from '../src/core/save/Serializer';
import { DEFAULT_SETTINGS } from '../src/core/save/SaveSchema';
import { analyzeBottlenecks } from '../src/core/stats/Bottlenecks';

function newSim(): Simulation {
  const state = createNewGame();
  state.research = allResearchIds();
  state.economy.money = 5000;
  const sim = new Simulation(state);
  // These tests check exact money, so contract bonuses are kept out of the way.
  state.contracts.active = [];
  return sim;
}

function run(sim: Simulation, seconds: number): void {
  for (let i = 0; i < seconds * TICK_RATE; i++) sim.tick();
}

function place(sim: Simulation, type: string, x: number, y: number, rotation: 0 | 1 | 2 | 3 = 0) {
  const result = sim.placeMachine(type, x, y, rotation);
  if (!result.ok) throw new Error('Could not place ' + type + ' at ' + x + ',' + y + ': ' + result.reason);
  return result.value;
}

function belt(sim: Simulation, x: number, y: number, direction: 0 | 1 | 2 | 3) {
  const result = sim.placeConveyor(x, y, direction);
  if (!result.ok) throw new Error('Could not place belt at ' + x + ',' + y + ': ' + result.reason);
  return result.value;
}

/** Records which seller sold what, in order. */
function recordSales(sim: Simulation): { machineId: string; resourceId: string }[] {
  const sales: { machineId: string; resourceId: string }[] = [];
  sim.events.on('itemSold', ({ machine, resourceId }) => sales.push({ machineId: machine.id, resourceId }));
  return sales;
}

/** Fills a belt tile with two items so a line starts out saturated. */
function saturate(sim: Simulation, x: number, y: number, resourceId: string): void {
  const conveyor = sim.state.factory.conveyorAt(x, y)!;
  for (const progress of [0.75, 0.25]) {
    insertItem(sim.state.factory, conveyor, resourceId, conveyor.direction);
    conveyor.items[conveyor.items.length - 1].progress = progress;
  }
}

describe('splitter', () => {
  /** Miner → belt → splitter, with one belt on to a seller east and another south. */
  function build(withSouthSeller: boolean) {
    const sim = newSim();
    place(sim, 'miner', 0, 0);
    belt(sim, 2, 0, 0);
    place(sim, 'splitter', 3, 0);
    belt(sim, 4, 0, 0);
    const east = place(sim, 'seller', 5, 0);
    belt(sim, 3, 1, 1);
    belt(sim, 3, 2, 1);
    const south = withSouthSeller ? place(sim, 'seller', 3, 3, 1) : null;
    return { sim, east, south };
  }

  it('shares items evenly between connected outputs', () => {
    const { sim, east, south } = build(true);
    const sales = recordSales(sim);
    run(sim, 120);
    const toEast = sales.filter((s) => s.machineId === east.id).length;
    const toSouth = sales.filter((s) => s.machineId === south!.id).length;
    expect(toEast + toSouth).toBeGreaterThan(50);
    expect(Math.abs(toEast - toSouth)).toBeLessThanOrEqual(1);
  });

  it('sends everything the other way once an output is jammed', () => {
    const { sim } = build(false);
    const sales = recordSales(sim);
    run(sim, 120);
    // The dead-end south branch holds 5 items; the rest of the miner's 60 reach the seller.
    expect(sales.length).toBeGreaterThanOrEqual(50);
    const miner = [...sim.state.factory.machines.values()].find((m) => m.type === 'miner')!;
    expect(sim.metrics.shares(miner.id).blocked).toBeLessThan(0.05);
  });

  it('is as fast as a plain belt', () => {
    const throughput = (withSplitter: boolean): number => {
      const sim = newSim();
      const storage = place(sim, 'storage', 0, 0);
      storage.stored = Array.from({ length: 200 }, () => 'iron_ore');
      belt(sim, 2, 0, 0);
      if (withSplitter) place(sim, 'splitter', 3, 0);
      else belt(sim, 3, 0, 0);
      belt(sim, 4, 0, 0);
      place(sim, 'seller', 5, 0);
      const sales = recordSales(sim);
      run(sim, 30);
      return sales.length;
    };
    const plain = throughput(false);
    expect(plain).toBeGreaterThanOrEqual(52);
    expect(Math.abs(throughput(true) - plain)).toBeLessThanOrEqual(2);
  });
});

describe('merger', () => {
  it('takes turns when both inputs are queued', () => {
    const sim = newSim();
    for (let x = 0; x < 3; x++) belt(sim, x, 0, 0);
    for (let y = 3; y > 0; y--) belt(sim, 3, y, 3);
    place(sim, 'merger', 3, 0);
    belt(sim, 4, 0, 0);
    place(sim, 'seller', 5, 0);
    for (let x = 0; x < 3; x++) saturate(sim, x, 0, 'gear');
    for (let y = 1; y <= 3; y++) saturate(sim, 3, y, 'iron_plate');

    const sales = recordSales(sim);
    run(sim, 20);
    expect(sales.length).toBe(12);
    // While both belts still have items waiting, the output strictly alternates.
    const contested = sales.slice(0, 10).map((s) => s.resourceId);
    for (let i = 1; i < contested.length; i++) expect(contested[i]).not.toBe(contested[i - 1]);
  });

  it('carries the combined output of two miners', () => {
    const sim = newSim();
    place(sim, 'miner', 0, 0);
    belt(sim, 2, 0, 0);
    place(sim, 'merger', 3, 0);
    place(sim, 'miner', 3, 2, 3);
    belt(sim, 3, 1, 3);
    belt(sim, 4, 0, 0);
    place(sim, 'seller', 5, 0);
    const sales = recordSales(sim);
    run(sim, 60);
    expect(sales.length).toBeGreaterThanOrEqual(54);
  });
});

describe('storage', () => {
  it('fills to capacity and then stalls its supplier', () => {
    const sim = newSim();
    const miner = place(sim, 'miner', 0, 0);
    const storage = place(sim, 'storage', 2, 0);
    storage.stored = Array.from({ length: 198 }, () => 'iron_ore');
    run(sim, 30);
    expect(storage.stored.length).toBe(200);
    expect(miner.active).toBe(false);
    expect(miner.outputInventory['iron_ore']).toBe(2);
  });

  it('releases the oldest item first', () => {
    const sim = newSim();
    const storage = place(sim, 'storage', 0, 0);
    storage.stored = ['gear', 'iron_ore', 'iron_plate', 'gear'];
    place(sim, 'seller', 2, 0);
    const sales = recordSales(sim);
    run(sim, 2);
    expect(sales.map((s) => s.resourceId)).toEqual(['gear', 'iron_ore', 'iron_plate', 'gear']);
    expect(storage.stored.length).toBe(0);
  });
});

describe('save format v2', () => {
  function buildBusyFactory(): Simulation {
    const sim = newSim();
    place(sim, 'miner', 0, 0);
    belt(sim, 2, 0, 0);
    place(sim, 'splitter', 3, 0);
    belt(sim, 4, 0, 0);
    place(sim, 'storage', 5, 0);
    belt(sim, 7, 0, 0);
    place(sim, 'seller', 8, 0);
    belt(sim, 3, 1, 1);
    place(sim, 'seller', 3, 2, 1);
    return sim;
  }

  it('round-trips items inside routers and storage', () => {
    const sim = buildBusyFactory();
    const storage = [...sim.state.factory.machines.values()].find((m) => m.type === 'storage')!;
    storage.stored = ['gear', 'gear', 'iron_plate'];
    // Stop mid-tick-cycle so something is caught crossing the splitter.
    let inTransit = 0;
    for (let i = 0; i < 400 && inTransit === 0; i++) {
      sim.tick();
      inTransit = [...sim.state.factory.machines.values()].reduce((n, m) => n + m.transit.length, 0);
    }
    expect(inTransit).toBeGreaterThan(0);

    const saved = JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS)));
    const restored = restoreGame(JSON.parse(JSON.stringify(saved)));
    const again = JSON.parse(JSON.stringify(serializeGame(restored, DEFAULT_SETTINGS)));
    expect({ ...again, timestamp: 0 }).toEqual({ ...saved, timestamp: 0 });

    const resumed = new Simulation(restored);
    run(sim, 40);
    run(resumed, 40);
    expect(resumed.state.economy.money).toBe(sim.state.economy.money);
    expect(resumed.state.stats.sold).toEqual(sim.state.stats.sold);
  });

  it('migrates a version 1 save', () => {
    const sim = newSim();
    place(sim, 'miner', 0, 0);
    belt(sim, 2, 0, 0);
    place(sim, 'seller', 3, 0);
    run(sim, 10);
    const v1 = JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS)));
    v1.version = 1;
    for (const machine of v1.factory.machines) {
      delete machine.transit;
      delete machine.routeIndex;
      delete machine.lastInput;
      delete machine.stored;
    }
    const restored = restoreGame(v1);
    expect(restored.factory.machines.size).toBe(2);
    for (const machine of restored.factory.machines.values()) {
      expect(machine.transit).toEqual([]);
      expect(machine.stored).toEqual([]);
    }
    expect(restored.economy.money).toBe(sim.state.economy.money);
  });
});

describe('bottleneck analysis', () => {
  it('measures a starved assembler and suggests one more furnace', () => {
    const sim = newSim();
    place(sim, 'miner', 0, 0);
    belt(sim, 2, 0, 0);
    place(sim, 'furnace', 3, 0);
    belt(sim, 5, 0, 0);
    const assembler = place(sim, 'assembler', 6, 0);
    belt(sim, 8, 0, 0);
    place(sim, 'seller', 9, 0);
    run(sim, 90);

    // One furnace makes 30 plates/min; the assembler could use 40.
    const shares = sim.metrics.shares(assembler.id);
    expect(shares.waiting).toBeGreaterThan(0.2);
    expect(shares.waiting).toBeLessThan(0.3);
    expect(sim.metrics.rate('produced', 'iron_plate')).toBeCloseTo(30, 0);
    expect(sim.metrics.rate('sold', 'gear')).toBeCloseTo(15, 0);

    const findings = analyzeBottlenecks(sim.state, sim.metrics);
    expect(findings[0]).toMatchObject({ machineId: assembler.id, kind: 'starved' });
    expect(findings[0].problem).toContain('Iron Plate');
    expect(findings[0].fix).toBe('One more Furnace making Iron Plate would keep it fed.');
  });

  it('reports nothing for a balanced line', () => {
    const sim = newSim();
    place(sim, 'miner', 0, 0);
    belt(sim, 2, 0, 0);
    place(sim, 'furnace', 3, 0);
    belt(sim, 5, 0, 0);
    place(sim, 'seller', 6, 0);
    run(sim, 90);
    expect(analyzeBottlenecks(sim.state, sim.metrics)).toEqual([]);
  });

  it('flags a machine whose output has nowhere to go', () => {
    const sim = newSim();
    const miner = place(sim, 'miner', 0, 0);
    belt(sim, 2, 0, 0);
    run(sim, 60);
    const [finding] = analyzeBottlenecks(sim.state, sim.metrics);
    expect(finding).toMatchObject({ machineId: miner.id, kind: 'blocked' });
    expect(finding.fix).toBe('One more Furnace making Iron Plate could use the spare Iron Ore.');
  });

  it('points downstream when a whole line is backed up', () => {
    const sim = newSim();
    const miner = place(sim, 'miner', 0, 0);
    belt(sim, 2, 0, 0);
    const furnace = place(sim, 'furnace', 3, 0);
    belt(sim, 5, 0, 0);
    run(sim, 90);
    const findings = analyzeBottlenecks(sim.state, sim.metrics);
    // The furnace is the real cause; the miner behind it is only a symptom.
    expect(findings[0]).toMatchObject({ machineId: furnace.id, kind: 'blocked' });
    const minerFinding = findings.find((f) => f.machineId === miner.id)!;
    expect(minerFinding.fix).toBe('The jam starts further down the line.');
  });
});
