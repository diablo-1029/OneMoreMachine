import { describe, expect, it } from 'vitest';
import { buildCost } from '../src/core/economy/Pricing';
import { TICK_DT } from '../src/core/game/Constants';
import { createNewGame } from '../src/core/game/GameState';
import { starsForEarnings } from '../src/core/game/Prestige';
import { Simulation } from '../src/core/game/Simulation';
import { getResearchNode } from '../src/core/research/Research';
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

  constructor() {
    this.sim = new Simulation(createNewGame('meadow'));
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

  /** Lets the factory settle for a minute, then records where the player stands. */
  mark(label: string): void {
    this.play(75);
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
   * The whole robot chain on a 24 × 24 floor, built the way a first-timer would: one supply
   * line per ingredient, nothing shared, so no belt ever has to cross another.
   */
  robotFactory(): void {
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
    player.research('robotics');
    player.clear();
    player.robotFactory();
    player.motorModule(18);
    player.turbines([[20, 12], [22, 12], [20, 14], [22, 14]]);
    player.mark('robots');

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
    // The one machine short of supply is the spare motor module's gear assembler, which could use
    // 40 plates a minute from a furnace that makes 30. The advice names exactly that, and is not
    // thrown off by the backed-up furnaces elsewhere on the floor.
    const starved = analyzeBottlenecks(sim.state, sim.metrics).filter((f) => f.kind === 'starved');
    expect(starved.length).toBeGreaterThan(0);
    for (const finding of starved) {
      expect(finding.problem).toContain('waits for Iron Plate');
      expect(finding.fix).toBe('One more Furnace making Iron Plate would keep it fed.');
    }
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
