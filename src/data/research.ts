export interface ResearchNode {
  id: string;
  name: string;
  description: string;
  cost: number;
  /** Ids of nodes that must be researched first. */
  requires: string[];
  unlocks: {
    /** Build-toolbar entries (machine types). */
    machines: string[];
    recipes: string[];
  };
}

/** Available from the first second, before any research. */
export const STARTING_MACHINES = ['miner', 'conveyor', 'furnace', 'seller'];
export const STARTING_RECIPES = ['mine_iron_ore', 'smelt_iron_plate'];

export const RESEARCH_NODES: ResearchNode[] = [
  {
    id: 'gear_assembly',
    name: 'Gear Assembly',
    description: 'Press plates into gears worth three times as much.',
    cost: 150,
    requires: [],
    unlocks: { machines: ['assembler'], recipes: ['craft_gear'] },
  },
  {
    id: 'logistics',
    name: 'Logistics',
    description: 'Share one belt between several machines, or join several into one.',
    cost: 200,
    requires: [],
    unlocks: { machines: ['splitter', 'merger'], recipes: [] },
  },
  {
    id: 'warehousing',
    name: 'Warehousing',
    description: 'Buffer up to 200 items to smooth out an uneven line.',
    cost: 300,
    requires: ['logistics'],
    unlocks: { machines: ['storage'], recipes: [] },
  },
  {
    id: 'copper_mining',
    name: 'Copper Mining',
    description: 'Miners can dig copper, and furnaces can smelt it.',
    cost: 400,
    requires: [],
    unlocks: { machines: [], recipes: ['mine_copper_ore', 'smelt_copper_plate'] },
  },
  {
    id: 'wire_drawing',
    name: 'Wire Drawing',
    description: 'Assemblers can draw copper plates into wire, two coils per plate.',
    cost: 600,
    requires: ['copper_mining', 'gear_assembly'],
    unlocks: { machines: [], recipes: ['draw_copper_wire'] },
  },
  {
    id: 'electric_motors',
    name: 'Electric Motors',
    description: 'Combine gears and wire into motors, the most valuable product yet.',
    cost: 1500,
    requires: ['wire_drawing'],
    unlocks: { machines: [], recipes: ['craft_motor'] },
  },
];

/**
 * Everything these nodes unlock was freely available before research existed, so saves
 * from that time are granted them on upgrade.
 */
export const LEGACY_RESEARCH = ['gear_assembly', 'logistics', 'warehousing'];
