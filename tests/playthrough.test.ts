import { describe, expect, it } from 'vitest';
import { buildCost } from '../src/core/economy/Pricing';
import { TICK_DT } from '../src/core/game/Constants';
import { FactoryState } from '../src/core/factory/FactoryState';
import { getMachineDef } from '../src/core/factory/MachineRegistry';
import { createNewGame } from '../src/core/game/GameState';
import { starsForEarnings } from '../src/core/game/Prestige';
import { Simulation } from '../src/core/game/Simulation';
import { allResearchIds, getResearchNode } from '../src/core/research/Research';
import { analyzeBottlenecks } from '../src/core/stats/Bottlenecks';

/**
 * A scripted player who plays the real simulation from an empty floor to a robot factory.
 *
 * It follows a fixed, sensible route and never does anything before it can pay for it, so the
 * times it records are how long each stage takes a player who knows what to build and wastes
 * no time placing it. Real players are slower; the point is the shape of the curve: no stage
 * should be over in seconds, and none should take an hour of waiting.
 */
class Player {
  readonly sim: Simulation;
  readonly log: { label: string; minutes: number; money: number; perMinute: number }[] = [];

  /**
   * With no arguments, a new game exactly as a player gets it. Given a floor size, a sandbox
   * instead: everything researched and plenty of money and power, for testing a layout on its own.
   */
  constructor(sandboxSize?: number) {
    const state = createNewGame('meadow');
    if (sandboxSize) {
      state.factory = new FactoryState(sandboxSize, sandboxSize);
      state.research = allResearchIds();
      state.economy.money = 1_000_000;
      state.power.baseSupply = 1000;
    }
    this.sim = new Simulation(state);
    if (sandboxSize) state.contracts.active = [];
  }

  get minutes(): number {
    return this.sim.state.simTime / 60;
  }

  /** Plays on until the player has at least this much money. */
  private saveUp(amount: number): void {
    const { economy } = this.sim.state;
    let guard = 0;
    while (economy.money < amount) {
      this.sim.tick();
      if (++guard > (6 * 60 * 60) / TICK_DT) throw new Error(`Waited six hours for $${amount} — the route is stuck`);
    }
  }

  play(seconds: number): void {
    for (let i = 0; i < seconds / TICK_DT; i++) this.sim.tick();
  }

  machine(type: string, x: number, y: number, recipeId?: string, rotation: 0 | 1 | 2 | 3 = 0): void {
    this.saveUp(buildCost(type));
    const result = this.sim.placeMachine(type, x, y, rotation, recipeId);
    if (!result.ok) throw new Error(`Could not place ${type} at ${x},${y}: ${result.reason}`);
  }

  /** Lays belts through the listed cells, each pointing at the next; the last keeps `finalDirection`. */
  belts(cells: [number, number][], finalDirection: 0 | 1 | 2 | 3): void {
    cells.forEach(([x, y], i) => {
      const next = cells[i + 1];
      const direction = next
        ? ((next[0] > x ? 0 : next[0] < x ? 2 : next[1] > y ? 1 : 3) as 0 | 1 | 2 | 3)
        : finalDirection;
      this.saveUp(buildCost('conveyor'));
      const result = this.sim.placeConveyor(x, y, direction);
      if (!result.ok) throw new Error(`Could not place belt at ${x},${y}: ${result.reason}`);
    });
  }

  research(id: string): void {
    this.saveUp(getResearchNode(id)!.cost);
    const result = this.sim.research(id);
    if (!result.ok) throw new Error(`Could not research ${id}: ${result.reason}`);
  }

  expand(): void {
    this.saveUp(this.sim.nextExpansion()!.cost);
    if (!this.sim.expandFactory().ok) throw new Error('Could not expand');
  }

  /** Sells everything back (refunds are full) to rebuild with a better layout. */
  clear(): void {
    const { grid } = this.sim.state.factory;
    for (let y = 0; y < grid.height; y++) for (let x = 0; x < grid.width; x++) this.sim.removeAt(x, y);
  }

  /** Trades in any contract for something this factory is not currently selling. */
  private tidyContracts(): void {
    for (let pass = 0; pass < 8; pass++) {
      const useless = this.sim.state.contracts.active.find((c) => this.sim.metrics.windowTotal('sold', c.resourceId) === 0);
      if (!useless) return;
      this.sim.swapContract(useless.id);
    }
  }

  /** Lets the factory settle (a minute, or longer for a long chain), then records where the player stands. */
  mark(label: string, settleSeconds = 75): void {
    this.play(settleSeconds);
    this.tidyContracts();
    const { economy } = this.sim.state;
    this.log.push({
      label,
      minutes: Math.round(this.minutes * 10) / 10,
      money: Math.floor(economy.money),
      perMinute: Math.round(economy.incomePerMinute()),
    });
  }

  at(label: string) {
    return this.log.find((entry) => entry.label === label)!;
  }

  // ------------------------------------------------------------ layouts

  /** Miner → Furnace → Seller along one row. 30 plates a minute. */
  plateLine(y: number): void {
    this.machine('miner', 0, y);
    this.belts([[2, y]], 0);
    this.machine('furnace', 3, y);
    this.belts([[5, y]], 0);
    this.machine('seller', 6, y);
  }

  /** Miner → Furnace → Assembler → Seller along one row. 15 gears a minute. */
  gearLine(y: number): void {
    this.machine('miner', 0, y);
    this.belts([[2, y]], 0);
    this.machine('furnace', 3, y);
    this.belts([[5, y]], 0);
    this.machine('assembler', 6, y, 'craft_gear');
    this.belts([[8, y]], 0);
    this.machine('seller', 9, y);
  }

  /**
   * A gear line and a wire line converging on one assembler, five rows tall.
   * The product leaves through (12, y + 1) heading east.
   */
  private twoLineModule(y: number, top: string[], bottom: string[], product: string): void {
    const [topMiner, topFurnace, topAssembler] = top;
    this.machine('miner', 0, y, topMiner);
    this.belts([[2, y]], 0);
    this.machine('furnace', 3, y, topFurnace);
    if (topAssembler) {
      this.belts([[5, y]], 0);
      this.machine('assembler', 6, y, topAssembler);
      this.belts([[8, y], [9, y], [9, y + 1]], 0);
    } else {
      this.belts([[5, y], [6, y], [7, y], [8, y], [9, y], [9, y + 1]], 0);
    }

    const [bottomMiner, bottomFurnace, bottomAssembler] = bottom;
    this.machine('miner', 0, y + 3, bottomMiner);
    this.belts([[2, y + 3]], 0);
    this.machine('furnace', 3, y + 3, bottomFurnace);
    if (bottomAssembler) {
      this.belts([[5, y + 3]], 0);
      this.machine('assembler', 6, y + 3, bottomAssembler);
      this.belts([[8, y + 3], [9, y + 3], [9, y + 2]], 0);
    } else {
      this.belts([[5, y + 3], [6, y + 3], [7, y + 3], [8, y + 3], [9, y + 3], [9, y + 2]], 0);
    }
    this.machine('assembler', 10, y + 1, product);
  }

  /** Gears and wire into motors, sold on the spot. 15 motors a minute. */
  motorModule(y: number): void {
    this.twoLineModule(
      y,
      ['mine_iron_ore', 'smelt_iron_plate', 'craft_gear'],
      ['mine_copper_ore', 'smelt_copper_plate', 'draw_copper_wire'],
      'craft_motor',
    );
    this.belts([[12, y + 1]], 0);
    this.machine('seller', 13, y + 1);
  }

  /** Miner → Furnace → Furnace making steel, ending in a belt heading east from (8, y). */
  private steelLine(y: number): void {
    this.machine('miner', 0, y);
    this.belts([[2, y]], 0);
    this.machine('furnace', 3, y);
    this.belts([[5, y]], 0);
    this.machine('furnace', 6, y, 'smelt_steel');
  }

  /** A steel line sold on the spot. 15 steel a minute. */
  steelSellLine(y: number): void {
    this.steelLine(y);
    this.belts([[8, y]], 0);
    this.machine('seller', 9, y);
  }

  /** Wire and plates into circuits, sold on the spot. 20 circuits a minute. */
  circuitModule(y: number): void {
    this.twoLineModule(
      y,
      ['mine_copper_ore', 'smelt_copper_plate', 'draw_copper_wire'],
      ['mine_iron_ore', 'smelt_iron_plate'],
      'craft_circuit',
    );
    this.belts([[12, y + 1]], 0);
    this.machine('seller', 13, y + 1);
  }

  /**
   * A circuit module with a steel line below it, both feeding a computer assembler.
   * Eight rows tall; computers leave through (16, y + 1) heading east.
   */
  private computerCore(y: number): void {
    this.twoLineModule(
      y,
      ['mine_copper_ore', 'smelt_copper_plate', 'draw_copper_wire'],
      ['mine_iron_ore', 'smelt_iron_plate'],
      'craft_circuit',
    );
    this.steelLine(y + 6);
    const steelRun: [number, number][] = [];
    for (let x = 8; x <= 13; x++) steelRun.push([x, y + 6]);
    for (let row = y + 5; row >= y + 2; row--) steelRun.push([13, row]);
    this.belts(steelRun, 0);
    this.belts([[12, y + 1], [13, y + 1]], 0);
    this.machine('assembler', 14, y + 1, 'craft_computer');
  }

  /** Computers sold on the spot. 10 a minute. */
  computerModule(y: number): void {
    this.computerCore(y);
    this.belts([[16, y + 1]], 0);
    this.machine('seller', 17, y + 1);
  }

  /**
   * The whole robot chain built without bridges: one supply line per ingredient, nothing
   * shared, so no belt ever has to cross another. It needs a 24 × 24 floor.
   */
  robotFactoryWithoutBridges(): void {
    // Motors: rows 0–4, leaving through (12, 1).
    this.twoLineModule(
      0,
      ['mine_iron_ore', 'smelt_iron_plate', 'craft_gear'],
      ['mine_copper_ore', 'smelt_copper_plate', 'draw_copper_wire'],
      'craft_motor',
    );
    // Computers: rows 6–13, leaving through (16, 7).
    this.computerCore(6);
    // Steel for the robots themselves runs along row 16.
    this.steelLine(16);

    // Everything meets at the Fabricator's three hatches.
    this.machine('fabricator', 19, 6);
    this.belts([[12, 1], [13, 1], [14, 1], [15, 1], [16, 1], [17, 1], [18, 1], [18, 2], [18, 3], [18, 4], [18, 5], [18, 6]], 0);
    this.belts([[16, 7], [17, 7], [18, 7]], 0);
    const steelRun: [number, number][] = [];
    for (let x = 8; x <= 18; x++) steelRun.push([x, 16]);
    for (let y = 15; y >= 8; y--) steelRun.push([18, y]);
    this.belts(steelRun, 0);
    this.machine('seller', 22, 7);
  }

  /**
   * The same robot output from shared supply lines, which only works because belts can cross.
   * Three plate lines feed one bus; splitters hand plates to two steel furnaces, the gear
   * assembler and the circuit assembler; one wire line is split between circuits and motors.
   * Five bridges carry one line over another. It fits in 20 columns by 13 rows.
   */
  robotFactory(): void {
    // Iron: three plate lines emptying into a bus that runs down column 5, then east along row 6.
    for (const y of [0, 2, 4]) {
      this.machine('miner', 0, y);
      this.belts([[2, y]], 0);
      this.machine('furnace', 3, y);
    }
    this.belts([[5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5], [5, 6]], 0);

    // First splitter: steel for computers above the bus, steel for the robots below it.
    this.machine('splitter', 6, 6);
    this.machine('furnace', 6, 4, 'smelt_steel', 3);
    this.machine('furnace', 5, 7, 'smelt_steel', 1);
    // The bus crosses the wire coming up column 8, then reaches the second splitter:
    // plates for circuits above, plates for gears below.
    this.belts([[7, 6]], 0);
    this.machine('bridge', 8, 6);
    this.machine('splitter', 9, 6);
    this.machine('assembler', 8, 4, 'craft_circuit', 3);
    this.machine('assembler', 9, 7, 'craft_gear', 1);

    // Computers: steel and circuits both head north into an assembler at the top.
    this.belts([[6, 3], [7, 3]], 3);
    this.belts([[8, 3]], 3);
    this.machine('assembler', 7, 1, 'craft_computer', 3);
    const computerRun: [number, number][] = [];
    for (let x = 7; x <= 13; x++) computerRun.push([x, 0]);
    for (let y = 1; y <= 8; y++) computerRun.push([13, y]);
    this.belts(computerRun, 1);

    // Copper: one line of wire along row 11, split between circuits (north) and motors (east).
    this.machine('miner', 0, 11, 'mine_copper_ore');
    this.belts([[2, 11]], 0);
    this.machine('furnace', 3, 11, 'smelt_copper_plate');
    this.belts([[5, 11]], 0);
    this.machine('assembler', 6, 11, 'draw_copper_wire');
    this.machine('splitter', 8, 11);
    this.belts([[8, 10]], 3);
    this.machine('bridge', 8, 9);
    this.belts([[8, 8], [8, 7]], 3);
    this.machine('bridge', 9, 11);

    // Steel for the robots runs east along row 9, crossing the wire, the gears and the computers.
    this.belts([[6, 9], [7, 9]], 0);
    this.belts([[9, 9]], 0);
    this.machine('bridge', 10, 9);
    this.belts([[11, 9], [12, 9]], 0);
    this.machine('bridge', 13, 9);
    this.belts([[13, 10]], 0);

    // Gears drop through the steel line, double back and cross the wire into the motor assembler.
    this.belts([[10, 10], [9, 10]], 1);
    this.belts([[9, 12]], 0);
    this.machine('assembler', 10, 11, 'craft_motor');
    this.belts([[12, 11], [13, 11]], 0);

    // Steel, computers and motors arrive at the three hatches from top to bottom.
    this.machine('fabricator', 14, 9);
    this.belts([[17, 10]], 0);
    this.machine('seller', 18, 10);
  }

  /** Machines that make things, and the smallest rectangle that holds the whole factory. */
  footprint(): { crafters: number; bridges: number; belts: number; width: number; height: number } {
    const { factory } = this.sim.state;
    let maxX = 0;
    let maxY = 0;
    let crafters = 0;
    let bridges = 0;
    for (const machine of factory.machines.values()) {
      for (const cell of factory.machineCells(machine)) {
        maxX = Math.max(maxX, cell.x);
        maxY = Math.max(maxY, cell.y);
      }
      const behavior = getMachineDef(machine.type).behavior;
      if (behavior === 'crafter') crafters++;
      if (behavior === 'bridge') bridges++;
    }
    for (const conveyor of factory.conveyors.values()) {
      maxX = Math.max(maxX, conveyor.gridX);
      maxY = Math.max(maxY, conveyor.gridY);
    }
    return { crafters, bridges, belts: factory.conveyors.size, width: maxX + 1, height: maxY + 1 };
  }

  turbines(cells: [number, number][]): void {
    for (const [x, y] of cells) this.machine('wind_turbine', x, y);
  }
}

describe('a full playthrough', () => {
  const player = new Player();

  it('goes from an empty floor to a working robot factory', () => {
    // --- Opening: one plate line, then gears.
    player.plateLine(0);
    player.mark('first plate line');

    player.research('gear_assembly');
    player.clear();
    for (const y of [0, 2, 4, 6]) player.gearLine(y);
    player.mark('gear lines');

    // --- Outgrowing the free power and the first floor.
    player.research('wind_power');
    player.expand();
    player.clear();
    for (const y of [0, 2, 4, 6, 8, 10, 12, 14]) player.gearLine(y);
    player.turbines([[12, 0], [14, 0], [12, 2]]);
    player.mark('16×16 floor');

    // --- Copper and motors.
    player.research('copper_mining');
    player.research('wire_drawing');
    player.research('electric_motors');
    player.clear();
    player.motorModule(0);
    player.motorModule(5);
    for (const y of [10, 12, 14]) player.gearLine(y);
    player.turbines([[12, 10], [14, 10], [12, 12], [14, 12]]);
    player.mark('motors');

    player.expand();
    player.clear();
    for (const y of [0, 5, 10]) player.motorModule(y);
    for (const y of [15, 17]) player.gearLine(y);
    player.turbines([[16, 0], [18, 0], [16, 2], [18, 2]]);
    player.mark('20×20 floor');

    // --- Steel, then circuits: each new product is worth building as soon as it is unlocked.
    player.research('steelmaking');
    player.clear();
    for (const y of [0, 5, 10]) player.motorModule(y);
    for (const y of [15, 17]) player.steelSellLine(y);
    player.turbines([[16, 0], [18, 0], [16, 2], [18, 2]]);
    player.mark('steel');

    player.research('electronics');
    player.clear();
    for (const y of [0, 5, 10, 15]) player.circuitModule(y);
    player.turbines([[16, 0], [18, 0], [16, 2]]);
    player.mark('circuits');

    // --- Computers need the room of a 24×24 floor.
    player.research('computing');
    player.expand();
    player.clear();
    for (const y of [0, 8, 16]) player.computerModule(y);
    player.turbines([[20, 0], [22, 0], [20, 2], [22, 2]]);
    player.mark('computers');

    // --- Robots.
    // Splitters and bridges let the whole chain share its supply lines and fit in 13 rows,
    // which leaves room on the same floor for a computer module as well.
    player.research('logistics');
    player.research('robotics');
    player.clear();
    player.robotFactory();
    player.computerModule(14);
    player.turbines([[20, 0], [22, 0], [20, 2], [22, 2]]);
    // The robot chain is long; give it time to fill before measuring.
    player.mark('robots', 240);

    // Run it for a while to confirm it really is a steady robot line.
    player.play(600);
    console.table(player.log);
    const { sim } = player;
    console.log(
      `After ${player.minutes.toFixed(0)} min: earned $${Math.floor(sim.state.economy.totalEarned).toLocaleString('en-US')}, ` +
        `worth ${starsForEarnings(sim.state.economy.totalEarned)} star(s), ` +
        `${sim.state.contracts.completed} contracts, ${sim.state.achievements.length} achievements, ` +
        `contract bonuses ${Math.round((1 - Object.entries(sim.state.stats.sold).reduce((sum, [id, n]) => sum + n * sim.salePrice(id), 0) / sim.state.economy.totalEarned) * 100)}% of earnings`,
    );

    expect(sim.metrics.rate('sold', 'robot')).toBeGreaterThan(6.5);
    expect(sim.power.ratio).toBe(1);
    const fabricator = [...sim.state.factory.machines.values()].find((m) => m.type === 'fabricator')!;
    expect(sim.metrics.shares(fabricator.id).working).toBeGreaterThan(0.9);
    // Several machines in the chain are faster than the Fabricator needs and spend time idle,
    // but nothing downstream could use more, so none of them is reported as a bottleneck.
    expect(analyzeBottlenecks(sim.state, sim.metrics).filter((f) => f.kind === 'starved')).toEqual([]);
  });

  it('is paced so that no stage is over in a moment and none is a long wait', () => {
    const labels = player.log.map((entry) => entry.label);
    // The opening is quick: gears within a few minutes of starting.
    expect(player.at('gear lines').minutes).toBeLessThan(8);
    // From there, each stage takes a player who wastes no time between 3 and 30 minutes.
    for (let i = 2; i < labels.length; i++) {
      const minutes = player.log[i].minutes - player.log[i - 1].minutes;
      expect(minutes, `${labels[i - 1]} → ${labels[i]}`).toBeGreaterThan(3);
      expect(minutes, `${labels[i - 1]} → ${labels[i]}`).toBeLessThan(30);
    }
    // Every stage pays noticeably better than the one before.
    for (let i = 1; i < player.log.length; i++) {
      expect(player.log[i].perMinute, labels[i]).toBeGreaterThan(player.log[i - 1].perMinute * 1.1);
    }
    // Reaching robots takes a perfect player about an hour: not twenty minutes, and not a week.
    expect(player.at('robots').minutes).toBeGreaterThan(45);
    expect(player.at('robots').minutes).toBeLessThan(150);
  });

  it('keeps bonuses a welcome extra rather than the main income', () => {
    const { sim } = player;
    const sales = Object.entries(sim.state.stats.sold).reduce(
      (sum, [resourceId, count]) => sum + count * sim.salePrice(resourceId),
      0,
    );
    // Contract bonuses are part of total earnings; they should be well under a third of it.
    const bonuses = sim.state.economy.totalEarned - sales;
    expect(bonuses).toBeGreaterThan(0);
    expect(bonuses / sim.state.economy.totalEarned).toBeLessThan(0.3);
    // A perfect first run is worth a few stars: enough to matter, not enough to trivialise the next.
    const stars = starsForEarnings(sim.state.economy.totalEarned);
    expect(stars).toBeGreaterThanOrEqual(1);
    expect(stars).toBeLessThanOrEqual(5);
  });
});

describe('the robot factory, with and without bridges', () => {
  /** Builds a layout in a sandbox, runs it until it is steady, and reports how it does. */
  function measure(size: number, build: (player: Player) => void) {
    const player = new Player(size);
    build(player);
    player.play(900);
    const { sim } = player;
    const fabricator = [...sim.state.factory.machines.values()].find((m) => m.type === 'fabricator')!;
    return {
      ...player.footprint(),
      robotsPerMinute: sim.metrics.rate('sold', 'robot'),
      fabricatorBusy: sim.metrics.shares(fabricator.id).working,
      power: sim.power.demand,
      sim,
    };
  }

  const without = measure(24, (player) => player.robotFactoryWithoutBridges());
  const withBridges = measure(20, (player) => player.robotFactory());

  it('makes robots just as fast', () => {
    console.table({
      'without bridges': { ...without, sim: undefined },
      'with bridges': { ...withBridges, sim: undefined },
    });
    // The Fabricator makes one robot every 8 seconds flat out: 7.5 a minute.
    expect(without.robotsPerMinute).toBeGreaterThan(7);
    expect(withBridges.robotsPerMinute).toBeGreaterThan(7);
    expect(withBridges.fabricatorBusy).toBeGreaterThan(0.95);
  });

  it('is much smaller, with fewer machines', () => {
    expect(withBridges.bridges).toBe(5);
    expect(without.bridges).toBe(0);
    // Sixteen crafting machines instead of twenty-one.
    expect(withBridges.crafters).toBe(16);
    expect(without.crafters).toBe(21);
    // It fits a 20×20 floor; without bridges it needs 24×24.
    expect(withBridges.width).toBeLessThanOrEqual(20);
    expect(withBridges.height).toBeLessThanOrEqual(13);
    expect(without.width).toBeGreaterThan(20);
    expect(withBridges.width * withBridges.height).toBeLessThan(without.width * without.height * 0.7);
    expect(withBridges.power).toBeLessThan(without.power);
  });

  it('leaves no machine short of supply', () => {
    // Shared lines are sized to what the Fabricator uses, so nothing is starved; the only
    // findings are suppliers that could make more than is being taken.
    const findings = analyzeBottlenecks(withBridges.sim.state, withBridges.sim.metrics);
    expect(findings.filter((f) => f.kind === 'starved')).toEqual([]);
  });
});
