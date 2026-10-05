/** World units per grid cell. */
export const TILE_SIZE = 1;

/** Simulation updates per second. Rendering runs independently of this. */
export const TICK_RATE = 20;
export const TICK_DT = 1 / TICK_RATE;

/** Conveyor speed in tiles per second. */
export const CONVEYOR_SPEED = 1;

/** Minimum distance between two items on a belt, in tiles. Sets belt throughput. */
export const ITEM_SPACING = 0.5;

export const DEFAULT_GRID_SIZE = 12;

/** Seconds between autosaves. */
export const AUTOSAVE_INTERVAL = 30;

export const SAVE_VERSION = 4;
