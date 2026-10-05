import { describe, expect, it } from 'vitest';
import { starsForEarnings } from '../src/core/game/Prestige';
import { DEFAULT_SETTINGS, UI_SCALES } from '../src/core/save/SaveSchema';
import { parseSettings } from '../src/core/save/Serializer';
import { EXPANSION_STEPS } from '../src/data/expansion';
import { BUILD_ORDER, TOOL_GROUPS, UNGROUPED_TOOL_LIMIT } from '../src/data/machines';
import { RESEARCH_NODES } from '../src/data/research';
import { HUD_CONTROLS, hudVisibility, type HudFacts } from '../src/ui/hudVisibility';
import { parseTooltip } from '../src/ui/Tooltip';

/** A factory that has just been founded and has done nothing yet. */
const NEW_FACTORY: HudFacts = {
  machines: 0,
  totalEarned: 0,
  itemsSold: 0,
  contractsCompleted: 0,
  research: [],
  gridSize: 12,
  startingGridSize: 12,
  firstExpansionCost: EXPANSION_STEPS[0].cost,
  hasClipboard: false,
  savedBlueprints: 0,
  achievements: 0,
  powerDemand: 0,
  powerSupply: 40,
  turbines: 0,
  stars: 0,
  timesSold: 0,
};

const shown = (facts: Partial<HudFacts>) => {
  const visible = hudVisibility({ ...NEW_FACTORY, ...facts });
  return HUD_CONTROLS.filter((control) => visible[control]);
};

describe('the top bar grows with the factory', () => {
  it('shows a new factory nothing but Research', () => {
    expect(shown({})).toEqual(['research']);
  });

  it('brings in production figures with the first machine', () => {
    expect(shown({ machines: 1 })).toEqual(['production', 'bottleneck', 'research']);
  });

  it('brings in contracts with the first sale', () => {
    expect(shown({ machines: 4, itemsSold: 1, totalEarned: 4 })).toContain('contracts');
    expect(shown({ machines: 4 })).not.toContain('contracts');
  });

  it('brings in the floor once the factory has earned the first expansion, or has one', () => {
    const cost = EXPANSION_STEPS[0].cost;
    expect(shown({ totalEarned: cost - 1 })).not.toContain('floor');
    expect(shown({ totalEarned: cost })).toContain('floor');
    expect(shown({ gridSize: 16 })).toContain('floor');
  });

  it('brings in power when half is in use, or wind power is in play', () => {
    expect(shown({ powerDemand: 19 })).not.toContain('power');
    expect(shown({ powerDemand: 20 })).toContain('power');
    expect(shown({ turbines: 1 })).toContain('power');
    expect(shown({ research: ['wind_power'] })).toContain('power');
  });

  it('brings in blueprints with Logistics, a copy, or a saved layout', () => {
    expect(shown({ research: ['logistics'] })).toContain('blueprints');
    expect(shown({ hasClipboard: true })).toContain('blueprints');
    expect(shown({ savedBlueprints: 2 })).toContain('blueprints');
  });

  it('brings in stars once the factory is worth one, and keeps them after selling', () => {
    let worthOne = 1;
    while (starsForEarnings(worthOne) < 1) worthOne *= 2;
    expect(shown({ totalEarned: 100 })).not.toContain('prestige');
    expect(shown({ totalEarned: worthOne })).toContain('prestige');
    expect(shown({ stars: 3 })).toContain('prestige');
    expect(shown({ timesSold: 1 })).toContain('prestige');
  });

  it('shows an established factory everything', () => {
    expect(
      shown({
        machines: 30,
        totalEarned: 200_000,
        itemsSold: 5000,
        research: ['logistics', 'wind_power'],
        gridSize: 20,
        achievements: 9,
        powerDemand: 60,
        powerSupply: 70,
        turbines: 2,
      }),
    ).toEqual(HUD_CONTROLS);
  });

  it('depends on research that exists', () => {
    const ids = RESEARCH_NODES.map((node) => node.id);
    expect(ids).toContain('logistics');
    expect(ids).toContain('wind_power');
  });
});

describe('toolbar groups', () => {
  it('put every tool in exactly one group', () => {
    const grouped = TOOL_GROUPS.flatMap((group) => [...group.tools]);
    expect([...grouped].sort()).toEqual([...BUILD_ORDER].sort());
    expect(new Set(grouped).size).toBe(grouped.length);
  });

  it('keep each group short enough to take in at a glance', () => {
    for (const group of TOOL_GROUPS) expect(group.tools.length).toBeLessThanOrEqual(UNGROUPED_TOOL_LIMIT);
  });
});

describe('interface settings', () => {
  it('default to standard size and the system motion setting', () => {
    expect(parseSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(DEFAULT_SETTINGS.uiScale).toBe(1);
    expect(DEFAULT_SETTINGS.reduceMotion).toBe('system');
  });

  it('are read from saved settings', () => {
    const settings = parseSettings({ uiScale: 1.3, reduceMotion: 'on' });
    expect(settings.uiScale).toBe(1.3);
    expect(settings.reduceMotion).toBe('on');
    for (const scale of UI_SCALES) expect(parseSettings({ uiScale: scale }).uiScale).toBe(scale);
  });

  it('fall back to the defaults for anything unrecognised', () => {
    expect(parseSettings({ uiScale: 5, reduceMotion: 'sometimes' })).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings({ uiScale: '1.3', reduceMotion: true })).toEqual(DEFAULT_SETTINGS);
    // Settings saved before these options existed.
    expect(parseSettings({ masterVolume: 0.2, sfx: false })).toMatchObject({ uiScale: 1, reduceMotion: 'system', sfx: false });
  });
});

describe('tooltip text', () => {
  it('is split into a title, a key and an explanation', () => {
    expect(parseTooltip('Research (T) — unlock new machines')).toEqual({ title: 'Research', key: 'T', body: 'Unlock new machines' });
    expect(parseTooltip('Close (Esc)')).toEqual({ title: 'Close', key: 'Esc', body: undefined });
    expect(parseTooltip('Settings')).toEqual({ title: 'Settings', body: undefined });
    expect(parseTooltip('Factory floor — buy more space (a lot)')).toEqual({ title: 'Factory floor', body: 'Buy more space (a lot)' });
  });
});
