import { describe, expect, it } from 'vitest';
import { FactoryState } from '../src/core/factory/FactoryState';
import { TICK_RATE } from '../src/core/game/Constants';
import { createNewGame } from '../src/core/game/GameState';
import { Simulation } from '../src/core/game/Simulation';
import { restoreGame, serializeGame } from '../src/core/save/Serializer';
import { DEFAULT_SETTINGS } from '../src/core/save/SaveSchema';
import { analyzeBottlenecks } from '../src/core/stats/Bottlenecks';

/** A wider floor than the game starts with, so a whole motor chain fits in a straight layout. */
function newSim(): Simulation {
  const state = createNewGame();
  state.factory = new FactoryState(20, 12);
  state.economy.money = 10000;
  return new Simulation(state);
}

function run(sim: Simulation, seconds: number): void {
  for (let i = 0; i < seconds * TICK_RATE; i++) sim.tick();
}

function place(sim: Simulation, type: string, x: number, y: number, recipeId?: string) {
  const result = sim.placeMachine(type, x, y, 0, recipeId);
  if (!result.ok) throw new Error(`Could not place ${type} at ${x},${y}: ${result.reason}`);
  return result.value;
}

function belt(sim: Simulation, x: number, y: number, direction: 0 | 1 | 2 | 3): void {
  const result = sim.placeConveyor(x, y, direction);
  if (!result.ok) throw new Error(`Could not place belt at ${x},${y}: ${result.reason}`);
}

/** Iron line making gears along row 0, copper line making wire along row 3. */
function buildFeeders(sim: Simulation): void {
  place(sim, 'miner', 0, 0);
  belt(sim, 2, 0, 0);
  place(sim, 'furnace', 3, 0);
  belt(sim, 5, 0, 0);
  place(sim, 'assembler', 6, 0, 'craft_gear');
  belt(sim, 8, 0, 0);

  place(sim, 'miner', 0, 3, 'mine_copper_ore');
  belt(sim, 2, 3, 0);
  place(sim, 'furnace', 3, 3, 'smelt_copper_plate');
  belt(sim, 5, 3, 0);
  place(sim, 'assembler', 6, 3, 'draw_copper_wire');
  belt(sim, 8, 3, 0);
}

describe('copper chain', () => {
  it('builds motors from gears and wire arriving on separate belts', () => {
    const sim = newSim();
    buildFeeders(sim);
    // Gears turn down into the top hatch, wire turns up into the bottom one.
    belt(sim, 9, 0, 1);
    belt(sim, 9, 1, 0);
    belt(sim, 9, 3, 3);
    belt(sim, 9, 2, 0);
    const motors = place(sim, 'assembler', 10, 1, 'craft_motor');
    belt(sim, 12, 1, 0);
    place(sim, 'seller', 13, 1);
    run(sim, 180);

    const { produced, sold } = sim.state.stats;
    // Wire is made twice as fast as motors use it, so the copper line backs up to match.
    expect(produced['copper_plate']).toBeGreaterThan(40);
    expect(produced['copper_wire']).toBeGreaterThan(80);
    expect(sold['motor']).toBeGreaterThan(30);
    expect(sold['gear'] ?? 0).toBe(0);
    // One gear assembler on one furnace makes 15 gears/min, which is exactly what one motor line uses.
    expect(sim.metrics.rate('produced', 'motor')).toBeCloseTo(15, 0);
    expect(sim.metrics.shares(motors.id).working).toBeGreaterThan(0.9);
  });

  it('explains the jam when mixed ingredients share one belt', () => {
    const sim = newSim();
    buildFeeders(sim);
    // Both lines run into a merger whose single output feeds one hatch.
    belt(sim, 9, 0, 1);
    belt(sim, 9, 1, 1);
    belt(sim, 9, 3, 3);
    place(sim, 'merger', 9, 2);
    const motors = place(sim, 'assembler', 10, 2, 'craft_motor');
    belt(sim, 12, 2, 0);
    place(sim, 'seller', 13, 2);
    run(sim, 240);

    // Wire arrives four times faster than gears, fills its share of the buffer and blocks the hatch.
    expect(motors.active).toBe(false);
    const finding = analyzeBottlenecks(sim.state, sim.metrics).find((f) => f.machineId === motors.id)!;
    expect(finding.kind).toBe('starved');
    expect(finding.problem).toContain('waits for Gear');
    expect(finding.fix).toBe(
      'Its hatch is blocked by Copper Wire it has no room for — give each ingredient its own belt.',
    );
  });
});

describe('recipe selection', () => {
  it('switches what a machine makes and drops what no longer fits', () => {
    const sim = newSim();
    const furnace = place(sim, 'furnace', 3, 0);
    furnace.inputInventory = { iron_ore: 2 };
    furnace.active = true;
    furnace.progress = 0.5;
    furnace.outputInventory = { iron_plate: 1 };

    expect(sim.setRecipe(furnace.id, 'smelt_copper_plate').ok).toBe(true);
    expect(furnace.recipeId).toBe('smelt_copper_plate');
    expect(furnace.inputInventory).toEqual({});
    expect(furnace.active).toBe(false);
    expect(furnace.progress).toBe(0);
    // Finished plates are kept and still leave through the output.
    expect(furnace.outputInventory).toEqual({ iron_plate: 1 });
  });

  it('keeps ingredients the new recipe also uses', () => {
    const sim = newSim();
    const assembler = place(sim, 'assembler', 0, 0, 'draw_copper_wire');
    assembler.inputInventory = { copper_plate: 2 };
    sim.setRecipe(assembler.id, 'craft_motor');
    expect(assembler.inputInventory).toEqual({});
    assembler.inputInventory = { gear: 1, copper_wire: 3 };
    sim.setRecipe(assembler.id, 'craft_gear');
    expect(assembler.inputInventory).toEqual({});
    assembler.inputInventory = { iron_plate: 3 };
    sim.setRecipe(assembler.id, 'craft_gear');
    expect(assembler.inputInventory).toEqual({ iron_plate: 3 });
  });

  it('refuses a recipe that belongs to another machine', () => {
    const sim = newSim();
    const furnace = place(sim, 'furnace', 0, 0);
    expect(sim.setRecipe(furnace.id, 'craft_gear')).toEqual({ ok: false, reason: 'invalid_recipe' });
    expect(sim.setRecipe(furnace.id, 'no_such_recipe')).toEqual({ ok: false, reason: 'invalid_recipe' });
    expect(sim.placeMachine('miner', 4, 4, 0, 'smelt_iron_plate')).toEqual({ ok: false, reason: 'invalid_recipe' });
    expect(furnace.recipeId).toBe('smelt_iron_plate');
  });

  it('survives a save and reload', () => {
    const sim = newSim();
    place(sim, 'miner', 0, 0, 'mine_copper_ore');
    place(sim, 'furnace', 2, 0, 'smelt_copper_plate');
    run(sim, 20);
    const restored = restoreGame(JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS))));
    const recipes = [...restored.factory.machines.values()].map((m) => m.recipeId);
    expect(recipes).toEqual(['mine_copper_ore', 'smelt_copper_plate']);
    expect(restored.stats.produced['copper_plate']).toBe(sim.state.stats.produced['copper_plate']);
  });
});

describe('bottleneck advice with several recipes per machine', () => {
  it('names the recipe that is short, not just the machine', () => {
    const sim = newSim();
    // One copper furnace (30 plates/min) feeding two wire assemblers that could use 60.
    place(sim, 'miner', 0, 0, 'mine_copper_ore');
    belt(sim, 2, 0, 0);
    place(sim, 'furnace', 3, 0, 'smelt_copper_plate');
    belt(sim, 5, 0, 0);
    place(sim, 'splitter', 6, 0);
    belt(sim, 7, 0, 0);
    const first = place(sim, 'assembler', 8, 0, 'draw_copper_wire');
    belt(sim, 10, 0, 0);
    place(sim, 'seller', 11, 0);
    belt(sim, 6, 1, 1);
    belt(sim, 6, 2, 1);
    belt(sim, 6, 3, 0);
    belt(sim, 7, 3, 0);
    place(sim, 'assembler', 8, 3, 'draw_copper_wire');
    belt(sim, 10, 3, 0);
    place(sim, 'seller', 11, 3);
    run(sim, 120);

    const finding = analyzeBottlenecks(sim.state, sim.metrics).find((f) => f.machineId === first.id)!;
    expect(finding.problem).toContain('waits for Copper Plate');
    expect(finding.fix).toBe('One more Furnace making Copper Plate would keep it fed.');
  });
});
