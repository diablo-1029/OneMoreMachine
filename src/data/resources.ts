export interface ResourceDefinition {
  id: string;
  name: string;
  /** Key used by the UI and item renderer to pick a visual. */
  icon: string;
  /** CSS colour for UI chips. */
  color: string;
  baseValue: number;
  stackLimit: number;
}

export const RESOURCE_DEFINITIONS: ResourceDefinition[] = [
  { id: 'iron_ore', name: 'Iron Ore', icon: 'ore', color: '#6f6a72', baseValue: 1, stackLimit: 50 },
  { id: 'iron_plate', name: 'Iron Plate', icon: 'plate', color: '#c3ccd8', baseValue: 4, stackLimit: 50 },
  { id: 'gear', name: 'Gear', icon: 'gear', color: '#e0a83c', baseValue: 12, stackLimit: 50 },
];

const byId = new Map(RESOURCE_DEFINITIONS.map((r) => [r.id, r]));

export function getResource(id: string): ResourceDefinition {
  const resource = byId.get(id);
  if (!resource) throw new Error(`Unknown resource: ${id}`);
  return resource;
}

export function isResource(id: string): boolean {
  return byId.has(id);
}
