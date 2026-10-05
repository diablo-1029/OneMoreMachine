import { RESEARCH_NODES, STARTING_MACHINES, STARTING_RECIPES, type ResearchNode } from '../../data/research';

export type ResearchStatus = 'done' | 'available' | 'locked';

const byId = new Map(RESEARCH_NODES.map((node) => [node.id, node]));

export function getResearchNode(id: string): ResearchNode | undefined {
  return byId.get(id);
}

export function isResearchId(id: string): boolean {
  return byId.has(id);
}

/** Prerequisites of `node` that have not been researched yet. */
export function missingRequirements(completed: readonly string[], node: ResearchNode): ResearchNode[] {
  return node.requires.filter((id) => !completed.includes(id)).map((id) => byId.get(id)!);
}

export function researchStatus(completed: readonly string[], node: ResearchNode): ResearchStatus {
  if (completed.includes(node.id)) return 'done';
  return missingRequirements(completed, node).length === 0 ? 'available' : 'locked';
}

function unlockedBy(completed: readonly string[], kind: 'machines' | 'recipes', starting: string[]): string[] {
  const unlocked = [...starting];
  for (const node of RESEARCH_NODES) {
    if (completed.includes(node.id)) unlocked.push(...node.unlocks[kind]);
  }
  return unlocked;
}

/** Machine types the player may build, in no particular order. */
export function unlockedMachines(completed: readonly string[]): string[] {
  return unlockedBy(completed, 'machines', STARTING_MACHINES);
}

export function unlockedRecipes(completed: readonly string[]): string[] {
  return unlockedBy(completed, 'recipes', STARTING_RECIPES);
}

/**
 * How many prerequisite steps lie before a node; nodes with none are at depth 0.
 * Used to lay the tree out in columns.
 */
export function researchDepth(node: ResearchNode): number {
  return node.requires.reduce((depth, id) => Math.max(depth, researchDepth(byId.get(id)!) + 1), 0);
}

/** Every node id; handy for tests and for sandbox play. */
export function allResearchIds(): string[] {
  return RESEARCH_NODES.map((node) => node.id);
}
