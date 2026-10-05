import { describe, expect, it } from 'vitest';
import { parseSettings } from '../src/core/save/Serializer';
import { DEFAULT_SETTINGS } from '../src/core/save/SaveSchema';
import {
  BELT_STYLES,
  DEFAULT_COSMETICS,
  describeRequirement,
  FLOOR_STYLES,
  isCosmeticUnlocked,
  LIGHT_STYLES,
  resolveCosmetics,
} from '../src/data/cosmetics';

describe('cosmetic definitions', () => {
  it('start each kind with a free default and have unique ids', () => {
    for (const styles of [FLOOR_STYLES, BELT_STYLES, LIGHT_STYLES]) {
      expect(styles[0].requires).toEqual({});
      expect(new Set(styles.map((s) => s.id)).size).toBe(styles.length);
    }
    expect(DEFAULT_COSMETICS).toEqual({ floor: FLOOR_STYLES[0].id, belt: BELT_STYLES[0].id, light: LIGHT_STYLES[0].id });
  });
});

describe('unlocking', () => {
  it('needs every stated requirement', () => {
    expect(isCosmeticUnlocked({}, null)).toBe(true);
    expect(isCosmeticUnlocked({ achievements: 5 }, null)).toBe(false);
    expect(isCosmeticUnlocked({ achievements: 5 }, { achievements: 4, stars: 9 })).toBe(false);
    expect(isCosmeticUnlocked({ achievements: 5 }, { achievements: 5, stars: 0 })).toBe(true);
    expect(isCosmeticUnlocked({ stars: 2 }, { achievements: 30, stars: 1 })).toBe(false);
    expect(isCosmeticUnlocked({ achievements: 3, stars: 1 }, { achievements: 3, stars: 1 })).toBe(true);
  });

  it('is described in plain words', () => {
    expect(describeRequirement({ achievements: 5 })).toBe('5 achievements');
    expect(describeRequirement({ stars: 1 })).toBe('1 star');
    expect(describeRequirement({ achievements: 1, stars: 2 })).toBe('1 achievement and 2 stars');
  });
});

describe('resolving the look to draw', () => {
  const choice = { floor: 'blueprint', belt: 'cobalt', light: 'golden' };

  it('uses what has been earned', () => {
    const look = resolveCosmetics(choice, { achievements: 8, stars: 1 });
    expect([look.floor.id, look.belt.id, look.light.id]).toEqual(['blueprint', 'cobalt', 'golden']);
  });

  it('falls back to the default for anything not yet earned, one kind at a time', () => {
    const look = resolveCosmetics(choice, { achievements: 6, stars: 0 });
    expect([look.floor.id, look.belt.id, look.light.id]).toEqual(['concrete', 'rubber', 'golden']);
    const menu = resolveCosmetics(choice, null);
    expect([menu.floor.id, menu.belt.id, menu.light.id]).toEqual(['concrete', 'rubber', 'day']);
  });

  it('falls back for an id that does not exist', () => {
    const look = resolveCosmetics({ floor: 'lava', belt: 'rubber', light: 'day' }, { achievements: 99, stars: 99 });
    expect(look.floor.id).toBe('concrete');
  });
});

describe('cosmetics in settings', () => {
  it('default when missing, so settings saved by an older version still load', () => {
    const settings = parseSettings({ masterVolume: 0.3, sfx: false, music: true, shadows: false });
    expect(settings).toEqual({ masterVolume: 0.3, sfx: false, music: true, shadows: false, cosmetics: DEFAULT_COSMETICS });
  });

  it('keep valid choices and drop unknown ones', () => {
    const settings = parseSettings({ cosmetics: { floor: 'slate', belt: 'plasma', light: 42 } });
    expect(settings.cosmetics).toEqual({ floor: 'slate', belt: 'rubber', light: 'day' });
  });

  it('never share the defaults object', () => {
    const a = parseSettings(undefined);
    a.cosmetics.floor = 'slate';
    expect(parseSettings(undefined).cosmetics.floor).toBe('concrete');
    expect(DEFAULT_SETTINGS.cosmetics.floor).toBe('concrete');
  });
});
