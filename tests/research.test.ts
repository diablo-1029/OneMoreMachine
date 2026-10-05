import { describe, expect, it } from 'vitest';
import { SAVE_VERSION, TICK_RATE } from '../src/core/game/Constants';
import { createNewGame } from '../src/core/game/GameState';
import { Simulation } from '../src/core/game/Simulation';
import { currentHint } from '../src/core/game/Tutorial';
import { researchDepth, researchStatus, unlockedMachines, unlockedRecipes } from '../src/core/research/Research';
import { restoreGame, serializeGame } from '../src/core/save/Serializer';
import { DEFAULT_SETTINGS } from '../src/core/save/SaveSchema';
import { RESEARCH_NODES } from '../src/data/research';

const node = (id: string) => RESEARCH_NODES.find((n) => n.id === id)!;

function freshSim(money = 200): Simulation {
  const state = createNewGame();
  state.economy.money = money;
  return new Simulation(state);
}

describe('research rules', () => {
  it('starts with only the basics unlocked', () => {
    expect(unlockedMachines([]).sort()).toEqual(['conveyor', 'furnace', 'miner', 'seller']);
    expect(unlockedRecipes([]).sort()).toEqual(['mine_iron_ore', 'smelt_iron_plate']);
    expect(researchStatus([], node('gear_assembly'))).toBe('available');
    expect(researchStatus([], node('warehousing'))).toBe('locked');
    expect(researchStatus(['logistics'], node('warehousing'))).toBe('available');
    expect(researchStatus(['logistics', 'warehousing'], node('warehousing'))).toBe('done');
  });

  it('requires every prerequisite', () => {
    expect(researchStatus(['copper_mining'], node('wire_drawing'))).toBe('locked');
    expect(researchStatus(['copper_mining', 'gear_assembly'], node('wire_drawing'))).toBe('available');
    expect(researchDepth(node('gear_assembly'))).toBe(0);
    expect(researchDepth(node('wire_drawing'))).toBe(1);
    expect(researchDepth(node('electric_motors'))).toBe(2);
  });

  it('every node unlocks something and refers only to real nodes', () => {
    const ids = new Set(RESEARCH_NODES.map((n) => n.id));
    for (const n of RESEARCH_NODES) {
      expect(n.unlocks.machines.length + n.unlocks.recipes.length + (n.unlocks.upgrades?.length ?? 0)).toBeGreaterThan(0);
      for (const required of n.requires) expect(ids.has(required)).toBe(true);
    }
  });
});

describe('research in the simulation', () => {
  it('charges for a node and unlocks what it promises', () => {
    const sim = freshSim(500);
    expect(sim.placeMachine('assembler', 0, 0, 0)).toEqual({ ok: false, reason: 'not_researched' });
    expect(sim.state.economy.money).toBe(500);

    const completed: string[] = [];
    sim.events.on('researchCompleted', (n) => completed.push(n.id));
    expect(sim.research('gear_assembly').ok).toBe(true);
    expect(sim.state.economy.money).toBe(350);
    expect(completed).toEqual(['gear_assembly']);

    const placed = sim.placeMachine('assembler', 0, 0, 0);
    expect(placed.ok && placed.value.recipeId).toBe('craft_gear');
  });

  it('refuses what cannot be researched yet', () => {
    const sim = freshSim(100);
    expect(sim.research('gear_assembly')).toEqual({ ok: false, reason: 'cannot_afford' });
    expect(sim.research('warehousing')).toEqual({ ok: false, reason: 'not_researched' });
    expect(sim.research('time_travel')).toEqual({ ok: false, reason: 'not_found' });
    sim.state.economy.money = 1000;
    sim.research('logistics');
    expect(sim.research('logistics')).toEqual({ ok: false, reason: 'already_researched' });
    expect(sim.state.economy.money).toBe(800);
    expect(sim.state.research).toEqual(['logistics']);
  });

  it('keeps locked recipes out of reach', () => {
    const sim = freshSim(5000);
    const furnace = sim.placeMachine('furnace', 0, 0, 0);
    if (!furnace.ok) throw new Error('placement failed');
    expect(sim.setRecipe(furnace.value.id, 'smelt_copper_plate')).toEqual({ ok: false, reason: 'invalid_recipe' });
    expect(sim.placeMachine('miner', 4, 0, 0, 'mine_copper_ore')).toEqual({ ok: false, reason: 'invalid_recipe' });

    sim.research('copper_mining');
    expect(sim.setRecipe(furnace.value.id, 'smelt_copper_plate').ok).toBe(true);
    expect(sim.placeMachine('miner', 4, 0, 0, 'mine_copper_ore').ok).toBe(true);
  });

  it('can be bought from a starter line within a few minutes', () => {
    const sim = freshSim();
    sim.placeMachine('miner', 0, 0, 0);
    sim.placeConveyor(2, 0, 0);
    sim.placeMachine('furnace', 3, 0, 0);
    sim.placeConveyor(5, 0, 0);
    sim.placeMachine('seller', 6, 0, 0);
    expect(sim.state.economy.money).toBeGreaterThanOrEqual(0);
    for (let i = 0; i < 120 * TICK_RATE; i++) sim.tick();
    // Two minutes of plates is enough for Gear Assembly and the Assembler itself.
    expect(sim.state.economy.money).toBeGreaterThanOrEqual(150 + 80);
    expect(currentHint(sim.state)).toContain('unlock Gear Assembly');
    sim.research('gear_assembly');
    expect(currentHint(sim.state)).toContain('Add an Assembler');
  });
});

describe('research and saves', () => {
  it('round-trips completed research', () => {
    const sim = freshSim(5000);
    sim.research('logistics');
    sim.research('copper_mining');
    const saved = JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS)));
    expect(saved.version).toBe(SAVE_VERSION);
    expect(restoreGame(saved).research).toEqual(['logistics', 'copper_mining']);
  });

  it('grants the formerly free unlocks to a version 2 save', () => {
    const sim = freshSim(5000);
    sim.state.research = ['gear_assembly', 'logistics', 'warehousing'];
    sim.placeMachine('assembler', 0, 0, 0);
    sim.placeMachine('storage', 3, 0, 0);
    const v2 = JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS)));
    v2.version = 2;
    delete v2.research;
    v2.unlocked = ['miner', 'conveyor', 'furnace', 'assembler', 'seller', 'splitter', 'merger', 'storage'];

    const restored = restoreGame(v2);
    expect(restored.research).toEqual(['gear_assembly', 'logistics', 'warehousing']);
    expect(restored.factory.machines.size).toBe(2);
    // Copper was never available before, so it is still to be earned.
    expect(researchStatus(restored.research, node('copper_mining'))).toBe('available');
    expect(new Simulation(restored).isRecipeAvailable('mine_copper_ore')).toBe(false);
  });

  it('ignores research ids it does not know', () => {
    const sim = freshSim();
    const saved = JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS)));
    saved.research = ['logistics', 'time_travel', 'logistics', 42];
    expect(restoreGame(saved).research).toEqual(['logistics']);
  });
});
