/** What must be true of the current game before a cosmetic can be used. Empty means always available. */
export interface CosmeticRequirement {
  /** Number of achievements unlocked. */
  achievements?: number;
  /** Stars held from selling earlier factories. */
  stars?: number;
}

interface Cosmetic {
  id: string;
  name: string;
  requires: CosmeticRequirement;
}

export interface FloorStyle extends Cosmetic {
  /** The two tile colours of the checkerboard. */
  tiles: [number, number];
  foundation: number;
  trim: number;
}

export interface BeltStyle extends Cosmetic {
  /** CSS colours for the belt surface and the chevrons painted on it. */
  surface: string;
  chevron: string;
}

export interface LightStyle extends Cosmetic {
  sunIntensity: number;
  skyIntensity: number;
  /** Multiplied onto the environment's own sunlight colour. */
  sunTint: number;
  /** Where the sun stands; lower means longer shadows. */
  sunPosition: [number, number, number];
}

export const FLOOR_STYLES: FloorStyle[] = [
  { id: 'concrete', name: 'Concrete', requires: {}, tiles: [0xb9bec6, 0xafb5be], foundation: 0x8d939c, trim: 0x6f7682 },
  { id: 'slate', name: 'Slate', requires: { achievements: 5 }, tiles: [0x5d6675, 0x545c6a], foundation: 0x434a57, trim: 0x353b46 },
  { id: 'sandstone', name: 'Sandstone', requires: { achievements: 10 }, tiles: [0xd9c39a, 0xcfb88c], foundation: 0xb09a72, trim: 0x8e7b59 },
  { id: 'blueprint', name: 'Blueprint', requires: { stars: 1 }, tiles: [0x3f6fb5, 0x386aae], foundation: 0x2b4f86, trim: 0x213d69 },
];

export const BELT_STYLES: BeltStyle[] = [
  { id: 'rubber', name: 'Rubber', requires: {}, surface: '#262a31', chevron: '#59616f' },
  { id: 'hazard', name: 'Hazard', requires: { achievements: 3 }, surface: '#2b2a26', chevron: '#e2b33c' },
  { id: 'cobalt', name: 'Cobalt', requires: { achievements: 8 }, surface: '#1d2f55', chevron: '#6f9be8' },
  { id: 'ember', name: 'Ember', requires: { stars: 2 }, surface: '#3a1d1a', chevron: '#f0774a' },
];

export const LIGHT_STYLES: LightStyle[] = [
  { id: 'day', name: 'Midday', requires: {}, sunIntensity: 2.3, skyIntensity: 1.9, sunTint: 0xffffff, sunPosition: [-11, 20, 9] },
  { id: 'golden', name: 'Golden hour', requires: { achievements: 6 }, sunIntensity: 2.5, skyIntensity: 1.45, sunTint: 0xffc98a, sunPosition: [-17, 11, 8] },
  { id: 'dusk', name: 'Dusk', requires: { stars: 1 }, sunIntensity: 1.7, skyIntensity: 1.15, sunTint: 0xf2a6c0, sunPosition: [-19, 7, 4] },
];

/** The player's chosen look. Stored with the settings, so it follows them between factories. */
export interface CosmeticChoice {
  floor: string;
  belt: string;
  light: string;
}

export const DEFAULT_COSMETICS: CosmeticChoice = { floor: 'concrete', belt: 'rubber', light: 'day' };

/** What the current game has to show for itself, for checking requirements. */
export interface CosmeticProgress {
  achievements: number;
  stars: number;
}

export function isCosmeticUnlocked(requires: CosmeticRequirement, progress: CosmeticProgress | null): boolean {
  if (requires.achievements === undefined && requires.stars === undefined) return true;
  if (!progress) return false;
  return progress.achievements >= (requires.achievements ?? 0) && progress.stars >= (requires.stars ?? 0);
}

/** "5 achievements", "1 star", "5 achievements and 1 star". */
export function describeRequirement(requires: CosmeticRequirement): string {
  const parts: string[] = [];
  if (requires.achievements) parts.push(`${requires.achievements} achievement${requires.achievements === 1 ? '' : 's'}`);
  if (requires.stars) parts.push(`${requires.stars} star${requires.stars === 1 ? '' : 's'}`);
  return parts.join(' and ');
}

function pick<T extends Cosmetic>(styles: T[], id: string, progress: CosmeticProgress | null): T {
  const chosen = styles.find((style) => style.id === id);
  // A choice the current factory has not earned (e.g. after starting afresh) shows as the default.
  return chosen && isCosmeticUnlocked(chosen.requires, progress) ? chosen : styles[0];
}

/** The styles to actually draw: the player's choices, falling back wherever one is not unlocked. */
export function resolveCosmetics(
  choice: CosmeticChoice,
  progress: CosmeticProgress | null,
): { floor: FloorStyle; belt: BeltStyle; light: LightStyle } {
  return {
    floor: pick(FLOOR_STYLES, choice.floor, progress),
    belt: pick(BELT_STYLES, choice.belt, progress),
    light: pick(LIGHT_STYLES, choice.light, progress),
  };
}
