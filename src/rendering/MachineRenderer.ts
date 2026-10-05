import * as THREE from 'three';
import type { FactoryState } from '../core/factory/FactoryState';
import { getMachineDef, rotatedSize } from '../core/factory/MachineRegistry';
import type { MachineState } from '../core/factory/MachineState';
import { createMachineVisual } from '../machines/MachineVisualFactory';
import type { MachineVisual } from '../machines/MachineVisual';
import type { Effects } from './effects/Effects';
import { cellCenterX, cellCenterZ, dirAngle } from './WorldMapping';

/** World-space centre of a machine's footprint. */
export function machineCenter(machine: MachineState, out: THREE.Vector3): THREE.Vector3 {
  const { w, h } = rotatedSize(getMachineDef(machine.type), machine.rotation);
  return out.set(cellCenterX(machine.gridX) + (w - 1) / 2, 0, cellCenterZ(machine.gridY) + (h - 1) / 2);
}

/**
 * Keeps one visual per placed machine. Visuals are created and destroyed in response to
 * simulation events, never by rescanning the factory; each frame only animates them.
 */
export class MachineRenderer {
  private readonly group = new THREE.Group();
  private readonly visuals = new Map<string, MachineVisual>();
  private readonly center = new THREE.Vector3();

  constructor(
    scene: THREE.Scene,
    private readonly effects: Effects,
  ) {
    scene.add(this.group);
  }

  add(machine: MachineState, animate: boolean): void {
    const visual = createMachineVisual(machine.type);
    visual.root.userData.machineId = machine.id;
    this.visuals.set(machine.id, visual);
    this.group.add(visual.root);
    this.updateTransform(machine);
    if (animate) visual.playPlacement();
  }

  remove(machine: MachineState): void {
    const visual = this.visuals.get(machine.id);
    if (!visual) return;
    this.group.remove(visual.root);
    visual.dispose();
    this.visuals.delete(machine.id);
  }

  updateTransform(machine: MachineState): void {
    const visual = this.visuals.get(machine.id);
    if (!visual) return;
    machineCenter(machine, this.center);
    visual.root.position.set(this.center.x, 0, this.center.z);
    visual.root.rotation.y = dirAngle(machine.rotation);
  }

  notify(machineId: string): void {
    this.visuals.get(machineId)?.notify(this.effects);
  }

  /**
   * `animDt` follows game speed (0 when paused); `realDt` drives UI-style motion like the placement pop.
   * `powerRatio` slows the animation of crafting machines during a power shortage, as it slows their work.
   */
  update(factory: FactoryState, animDt: number, realDt: number, time: number, powerRatio: number): void {
    for (const [id, visual] of this.visuals) {
      const machine = factory.machines.get(id);
      if (!machine) continue;
      const crafting = getMachineDef(machine.type).behavior === 'crafter';
      visual.update(machine, crafting ? animDt * powerRatio : animDt, realDt, time, this.effects);
    }
  }

  /** The machine under a ray, so clicking a tall machine's body selects it rather than the tile behind. */
  pick(raycaster: THREE.Raycaster): string | null {
    const hit = raycaster.intersectObjects(this.group.children, true)[0];
    let object: THREE.Object3D | null = hit?.object ?? null;
    while (object) {
      if (typeof object.userData.machineId === 'string') return object.userData.machineId;
      object = object.parent;
    }
    return null;
  }

  get count(): number {
    return this.visuals.size;
  }
}
