export interface ExpansionStep {
  /** Side length of the square factory floor after buying this step. */
  size: number;
  cost: number;
}

/** Floor sizes that can be bought, in order, after the starting 12 × 12. */
export const EXPANSION_STEPS: ExpansionStep[] = [
  { size: 16, cost: 2000 },
  { size: 20, cost: 8000 },
  { size: 24, cost: 25000 },
  { size: 32, cost: 80000 },
];

/** The largest floor the game supports; scenery and render buffers are sized for it. */
export const MAX_GRID_SIZE = EXPANSION_STEPS[EXPANSION_STEPS.length - 1].size;

/** The next step for a floor of the given size, or null once it is as large as it gets. */
export function nextExpansion(currentSize: number): ExpansionStep | null {
  return EXPANSION_STEPS.find((step) => step.size > currentSize) ?? null;
}
