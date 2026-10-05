import { describe, expect, it } from 'vitest';
import { SAVE_VERSION } from '../src/core/game/Constants';
import { createNewGame } from '../src/core/game/GameState';
import { createPrestigeGame } from '../src/core/game/Prestige';
import { Simulation } from '../src/core/game/Simulation';
import { allTipIds, currentTip, TIPS, TUTORIAL_STEPS, type TipContext } from '../src/core/game/Tutorial';
import { DEFAULT_SETTINGS } from '../src/core/save/SaveSchema';
import { restoreGame, serializeGame } from '../src/core/save/Serializer';
import { RESEARCH_NODES } from '../src/data/research';

/** A factory in which nothing worth a tip is going on. */
const QUIET: TipContext = {
  hasBottleneck: false,
  itemsSold: 0,
  powerShort: false,
  canAffordExpansion: false,
  research: [],
  starsAvailable: 0,
};

/** A game whose opening walkthrough is finished. */
function pastTheWalkthrough() {
  const state = createNewGame();
  state.tutorialStep = TUTORIAL_STEPS.length;
  return state;
}

describe('tips after the walkthrough', () => {
  it('wait until the walkthrough is over', () => {
    const state = createNewGame();
    expect(currentTip(state, { ...QUIET, powerShort: true, itemsSold: 50 })).toBeNull();
    state.tutorialStep = TUTORIAL_STEPS.length;
    expect(currentTip(state, { ...QUIET, powerShort: true })?.id).toBe('power');
  });

  it('say nothing when nothing calls for one', () => {
    expect(currentTip(pastTheWalkthrough(), QUIET)).toBeNull();
  });

  it('each appear for their own reason', () => {
    const reasons: Record<string, Partial<TipContext>> = {
      power: { powerShort: true },
      contracts: { itemsSold: 10 },
      bottlenecks: { hasBottleneck: true },
      expansion: { canAffordExpansion: true },
      upgrades: { research: ['machine_tuning'] },
      blueprints: { research: ['logistics'] },
      prestige: { starsAvailable: 1 },
    };
    expect(Object.keys(reasons).sort()).toEqual(allTipIds().sort());
    for (const [id, reason] of Object.entries(reasons)) {
      expect(currentTip(pastTheWalkthrough(), { ...QUIET, ...reason })?.id).toBe(id);
    }
  });

  it('are shown one at a time, most pressing first, and never twice', () => {
    const sim = new Simulation(pastTheWalkthrough());
    const everything: TipContext = {
      hasBottleneck: true,
      itemsSold: 500,
      powerShort: true,
      canAffordExpansion: true,
      research: ['machine_tuning', 'logistics'],
      starsAvailable: 2,
    };
    const shown: string[] = [];
    for (let tip = currentTip(sim.state, everything); tip; tip = currentTip(sim.state, everything)) {
      shown.push(tip.id);
      sim.dismissTip(tip.id);
    }
    expect(shown).toEqual(TIPS.map((tip) => tip.id));
    expect(shown[0]).toBe('power');
    expect(currentTip(sim.state, everything)).toBeNull();
  });

  it('ignore being asked to dismiss something that is not a tip', () => {
    const sim = new Simulation(pastTheWalkthrough());
    sim.dismissTip('research');
    sim.dismissTip('power');
    sim.dismissTip('power');
    expect(sim.state.seenTips).toEqual(['power']);
  });

  it('refer to research that exists', () => {
    const ids = RESEARCH_NODES.map((node) => node.id);
    expect(ids).toContain('machine_tuning');
    expect(ids).toContain('logistics');
  });
});

describe('tips and saves', () => {
  const saved = () => {
    const sim = new Simulation(pastTheWalkthrough());
    sim.dismissTip('contracts');
    return JSON.parse(JSON.stringify(serializeGame(sim.state, DEFAULT_SETTINGS)));
  };

  it('remember which tips have been put away', () => {
    const save = saved();
    expect(save.version).toBe(SAVE_VERSION);
    expect(restoreGame(save).seenTips).toEqual(['contracts']);
  });

  it('drop tip ids this version does not know', () => {
    const save = saved();
    save.seenTips = ['contracts', 'teleporters', 42, 'contracts'];
    expect(restoreGame(save).seenTips).toEqual(['contracts']);
  });

  it('spare a player who had finished the walkthrough before tips existed', () => {
    const v9 = saved();
    v9.version = 9;
    delete v9.seenTips;
    expect(restoreGame(v9).seenTips.sort()).toEqual(allTipIds().sort());
  });

  it('still guide a player who was part-way through the walkthrough', () => {
    const v9 = saved();
    v9.version = 9;
    delete v9.seenTips;
    v9.tutorialStep = 3;
    expect(restoreGame(v9).seenTips).toEqual([]);
  });

  it('are not repeated in the next factory after selling up', () => {
    const state = pastTheWalkthrough();
    state.economy.totalEarned = 10_000_000;
    state.seenTips = ['contracts', 'power'];
    const next = createPrestigeGame(state, 'meadow');
    expect(next?.seenTips).toEqual(['contracts', 'power']);
  });
});
