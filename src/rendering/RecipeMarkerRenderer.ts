import * as THREE from 'three';
import type { FactoryState } from '../core/factory/FactoryState';
import { getMachineDef } from '../core/factory/MachineRegistry';
import { getRecipe } from '../core/recipes/RecipeRegistry';
import { RESOURCE_DEFINITIONS } from '../data/resources';
import { createItemVisuals } from './ItemRenderer';
import { machineCenter } from './MachineRenderer';
import { VERTEX_MATERIAL } from './Materials';

const MAX_MARKERS = 256;
const MARKER_HEIGHT = 2.45;
const MARKER_SCALE = 1.7;

/**
 * A slowly turning copy of each crafting machine's product, floating above it, so an iron
 * furnace can be told from a copper one at a glance. One instanced mesh per resource,
 * sharing the item meshes.
 */
export class RecipeMarkerRenderer {
  private readonly meshes = new Map<string, THREE.InstancedMesh>();
  private readonly counts = new Map<string, number>();
  private readonly dummy = new THREE.Object3D();
  private readonly center = new THREE.Vector3();

  constructor(scene: THREE.Scene) {
    const visuals = createItemVisuals();
    for (const resource of RESOURCE_DEFINITIONS) {
      const mesh = new THREE.InstancedMesh(visuals[resource.icon].geometry, VERTEX_MATERIAL, MAX_MARKERS);
      mesh.count = 0;
      mesh.frustumCulled = false;
      scene.add(mesh);
      this.meshes.set(resource.id, mesh);
    }
  }

  update(factory: FactoryState, time: number): void {
    for (const id of this.meshes.keys()) this.counts.set(id, 0);

    for (const machine of factory.machines.values()) {
      if (!machine.recipeId || getMachineDef(machine.type).behavior !== 'crafter') continue;
      const resourceId = getRecipe(machine.recipeId).outputs[0]?.resourceId;
      const mesh = resourceId ? this.meshes.get(resourceId) : undefined;
      if (!mesh || !resourceId) continue;
      const index = this.counts.get(resourceId) ?? 0;
      if (index >= MAX_MARKERS) continue;

      machineCenter(machine, this.center);
      // Offset the bob per machine so a row of them does not move in lockstep.
      const phase = this.center.x * 0.7 + this.center.z * 0.4;
      this.dummy.position.set(this.center.x, MARKER_HEIGHT + Math.sin(time * 1.6 + phase) * 0.05, this.center.z);
      this.dummy.rotation.set(0, time * 0.9 + phase, 0);
      // Dimmed machines read as "off": shrink the marker rather than hide it.
      this.dummy.scale.setScalar(machine.enabled ? MARKER_SCALE : MARKER_SCALE * 0.6);
      this.dummy.updateMatrix();
      mesh.setMatrixAt(index, this.dummy.matrix);
      this.counts.set(resourceId, index + 1);
    }

    for (const [id, mesh] of this.meshes) {
      mesh.count = this.counts.get(id) ?? 0;
      mesh.instanceMatrix.needsUpdate = true;
    }
  }
}
