import { describe, expect, it } from 'vitest';
import { FactoryState } from '../src/core/factory/FactoryState';
import { createNewGame } from '../src/core/game/GameState';
import { Simulation } from '../src/core/game/Simulation';
import { allResearchIds } from '../src/core/research/Research';
import { PlacementController } from '../src/input/PlacementController';

/** A controller wired to a real simulation, with the rendering and sound it drives stubbed out. */
function setup() {
  const state = createNewGame();
  state.factory = new FactoryState(16, 16);
  state.research = allResearchIds();
  state.economy.money = 100_000;
  const sim = new Simulation(state);
  const messages: string[] = [];
  const silent = new Proxy({}, { get: () => () => null });
  const placement = new PlacementController(sim, silent as never, silent as never, silent as never, silent as never, silent as never, silent as never);
  placement.events.on('message', (message) => messages.push(message));
  const removeMachine = (id: string) => {
    placement.select({ kind: 'machine', id });
    placement.deleteSelected();
  };
  const removeBelt = (id: string) => {
    placement.select({ kind: 'conveyor', id });
    placement.deleteSelected();
  };
  return { sim, placement, messages, removeMachine, removeBelt };
}

describe('putting back what was removed', () => {
  it('rebuilds a machine as it was, upgrades and all, for what removing it refunded', () => {
    const { sim, placement, removeMachine } = setup();
    const placed = sim.placeMachine('furnace', 4, 6, 1, 'smelt_steel');
    if (!placed.ok) throw new Error(placed.reason);
    expect(sim.upgradeMachine(placed.value.id).ok).toBe(true);
    const level = placed.value.level;
    const moneyBuilt = sim.state.economy.money;

    removeMachine(placed.value.id);
    expect(sim.state.factory.machines.size).toBe(0);
    expect(placement.canUndo).toBe(true);

    placement.undoDelete();
    const [machine] = [...sim.state.factory.machines.values()];
    expect(machine).toMatchObject({ type: 'furnace', gridX: 4, gridY: 6, rotation: 1, recipeId: 'smelt_steel', level });
    expect(sim.state.economy.money).toBe(moneyBuilt);
    expect(placement.canUndo).toBe(false);
  });

  it('rebuilds a belt pointing the way it was', () => {
    const { sim, placement, removeBelt } = setup();
    const belt = sim.placeConveyor(3, 3, 2);
    if (!belt.ok) throw new Error(belt.reason);
    removeBelt(belt.value.id);
    expect(sim.state.factory.conveyors.size).toBe(0);
    placement.undoDelete();
    expect(sim.state.factory.conveyorAt(3, 3)?.direction).toBe(2);
  });

  it('works back through removals, most recent first', () => {
    const { sim, placement, removeMachine } = setup();
    const miner = sim.placeMachine('miner', 0, 0, 0);
    const seller = sim.placeMachine('seller', 6, 0, 0);
    if (!miner.ok || !seller.ok) throw new Error('could not build');
    removeMachine(miner.value.id);
    removeMachine(seller.value.id);

    placement.undoDelete();
    expect([...sim.state.factory.machines.values()].map((m) => m.type)).toEqual(['seller']);
    placement.undoDelete();
    expect([...sim.state.factory.machines.values()].map((m) => m.type).sort()).toEqual(['miner', 'seller']);
  });

  it('says so when there is nothing to put back', () => {
    const { placement, messages } = setup();
    placement.undoDelete();
    expect(messages).toEqual(['Nothing to put back']);
  });

  it('says so when the space has been built over since', () => {
    const { sim, placement, messages, removeMachine } = setup();
    const miner = sim.placeMachine('miner', 2, 2, 0);
    if (!miner.ok) throw new Error(miner.reason);
    removeMachine(miner.value.id);
    sim.placeConveyor(2, 2, 0);

    placement.undoDelete();
    expect(sim.state.factory.machines.size).toBe(0);
    expect(messages.at(-1)).toMatch(/^Could not put everything back/);
  });

  it('forgets old removals when the floor is expanded, since positions shift', () => {
    const { sim, placement, removeMachine } = setup();
    const miner = sim.placeMachine('miner', 2, 2, 0);
    if (!miner.ok) throw new Error(miner.reason);
    removeMachine(miner.value.id);
    expect(sim.expandFactory().ok).toBe(true);
    expect(placement.canUndo).toBe(false);
  });
});
