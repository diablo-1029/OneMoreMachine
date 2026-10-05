/** Colours and scenery choices for one environment. Plain numbers, so the simulation can import this file too. */
export interface EnvironmentTheme {
  /** Ground colour; also the scene background, so the land seems to run to the horizon. */
  ground: number;
  groundLight: number;
  groundDark: number;
  /** Worn earth around the platform and the track leading away from it. */
  track: number;
  water: number;
  waterLight: number;
  shore: number;
  /** Colour of light bounced up from the ground. */
  bounce: number;
  sun: number;
  /** Which family of plants and rocks to scatter. */
  scenery: 'meadow' | 'dunes' | 'tundra';
}

export interface EnvironmentDefinition {
  id: string;
  name: string;
  tagline: string;
  /** How this site differs, in the player's words. Empty for the standard site. */
  effects: string[];
  /** Crafting speed multiplier by machine type; anything not listed runs at normal speed. */
  speed: Record<string, number>;
  /** Multiplier on what generators supply. */
  turbineOutput: number;
  /** Multiplier on what machines draw. */
  powerDraw: number;
  theme: EnvironmentTheme;
}

export const ENVIRONMENTS: EnvironmentDefinition[] = [
  {
    id: 'meadow',
    name: 'Meadow',
    tagline: 'Green, calm and even-handed. The place to learn the ropes.',
    effects: [],
    speed: {},
    turbineOutput: 1,
    powerDraw: 1,
    theme: {
      ground: 0x86b86a,
      groundLight: 0x93c474,
      groundDark: 0x7aad60,
      track: 0xa58f6c,
      water: 0x5fb0d6,
      waterLight: 0x7cc4e4,
      shore: 0xd9c895,
      bounce: 0xb7c79a,
      sun: 0xfff4e0,
      scenery: 'meadow',
    },
  },
  {
    id: 'dunes',
    name: 'Dunes',
    tagline: 'Open desert with a steady wind and stubborn rock.',
    effects: ['Wind Turbines supply 40% more power', 'Miners work 20% slower'],
    speed: { miner: 0.8 },
    turbineOutput: 1.4,
    powerDraw: 1,
    theme: {
      ground: 0xe2c48a,
      groundLight: 0xecd29d,
      groundDark: 0xd4b377,
      track: 0xc49f6a,
      water: 0x4fb7c4,
      waterLight: 0x7fd3d8,
      shore: 0x9fbf6a,
      bounce: 0xf0d9a8,
      sun: 0xffecc8,
      scenery: 'dunes',
    },
  },
  {
    id: 'tundra',
    name: 'Tundra',
    tagline: 'Rich seams under the snow, and a heating bill to match.',
    effects: ['Miners work 25% faster', 'Machines draw 25% more power'],
    speed: { miner: 1.25 },
    turbineOutput: 1,
    powerDraw: 1.25,
    theme: {
      ground: 0xe6edf2,
      groundLight: 0xf4f8fb,
      groundDark: 0xd3dde6,
      track: 0xb9c0c8,
      water: 0xa9d8ee,
      waterLight: 0xd4eefa,
      shore: 0xc9d6e0,
      bounce: 0xdfe9f2,
      sun: 0xf2f6ff,
      scenery: 'tundra',
    },
  },
];

export const DEFAULT_ENVIRONMENT = 'meadow';

const byId = new Map(ENVIRONMENTS.map((e) => [e.id, e]));

export function isEnvironmentId(id: string): boolean {
  return byId.has(id);
}

/** Falls back to the standard site for an id this version does not know. */
export function getEnvironment(id: string): EnvironmentDefinition {
  return byId.get(id) ?? byId.get(DEFAULT_ENVIRONMENT)!;
}
