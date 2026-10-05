import * as THREE from 'three';
import type { MachineState } from '../core/factory/MachineState';
import type { MachineDefinition } from '../core/factory/MachineTypes';
import { DIR_VECTORS } from '../core/grid/GridPosition';
import type { Effects } from '../rendering/effects/Effects';
import { box } from '../rendering/GeometryUtils';
import { PALETTE, VERTEX_MATERIAL } from '../rendering/Materials';

const POP_DURATION = 0.28;

/**
 * Geometry every machine shares: a base plate covering the footprint and a fitting at each
 * port — green-capped hatches for inputs, orange-capped chutes for outputs — generated from
 * the definition so the visual always agrees with where the simulation moves items.
 * Modelled for rotation 0, centred on the footprint.
 */
export function baseParts(def: MachineDefinition): THREE.BufferGeometry[] {
  const parts = [box(def.width - 0.16, 0.1, def.height - 0.16, 0, 0.05, 0, PALETTE.slate)];
  for (const port of def.ports) {
    const side = DIR_VECTORS[port.side];
    const alongX = side.x !== 0;
    // Centre of the fitting: on the port's edge, pulled 0.15 back inside the footprint.
    const px = port.localX + 0.5 - def.width / 2 + side.x * 0.35;
    const pz = port.localY + 0.5 - def.height / 2 + side.y * 0.35;
    const w = alongX ? 0.3 : 0.56;
    const d = alongX ? 0.56 : 0.3;
    const accent = port.type === 'input' ? PALETTE.inputGreen : PALETTE.outputOrange;
    parts.push(box(w, 0.3, d, px, 0.25, pz, PALETTE.slateDark));
    parts.push(box(w, 0.06, d, px, 0.43, pz, accent));
  }
  return parts;
}

/**
 * Base class for a machine's 3D representation. It reads MachineState and animates;
 * it never changes it. Static parts are one merged mesh per machine type, shared by
 * every instance; only the moving parts are separate meshes.
 */
export abstract class MachineVisual {
  readonly root = new THREE.Group();
  /** Smoothed 0..1 "how busy" value, so animations ease in and out instead of snapping. */
  protected activity = 0;
  /** Jumps to 1 on a notable event (craft finished, item sold) and decays to 0. */
  protected pulse = 0;
  private popTime = POP_DURATION;
  private readonly scratch = new THREE.Vector3();

  constructor(staticGeometry: THREE.BufferGeometry) {
    this.addPart(staticGeometry);
  }

  protected addPart(geometry: THREE.BufferGeometry, material: THREE.Material = VERTEX_MATERIAL): THREE.Mesh {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.root.add(mesh);
    return mesh;
  }

  /** Starts the little bounce played when the machine is placed. */
  playPlacement(): void {
    this.popTime = 0;
  }

  /** Called when the machine finishes a craft or makes a sale. */
  notify(effects: Effects): void {
    this.pulse = 1;
    this.onNotify(effects);
  }

  update(state: MachineState, dt: number, realDt: number, time: number, effects: Effects): void {
    const busy = state.enabled && state.active ? 1 : 0;
    this.activity += (busy - this.activity) * Math.min(1, dt * 6);
    this.pulse = Math.max(0, this.pulse - dt * 2.5);

    if (this.popTime < POP_DURATION) {
      this.popTime = Math.min(this.popTime + realDt, POP_DURATION);
      const t = this.popTime / POP_DURATION;
      // Overshoots slightly past full size before settling.
      const s = Math.max(0.05, 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2);
      this.root.scale.set(s, 0.55 + 0.45 * s, s);
    }

    this.animate(state, dt, time, effects);
  }

  /** Converts a point in the machine's local space to world space. */
  protected toWorld(x: number, y: number, z: number): THREE.Vector3 {
    this.root.updateMatrixWorld();
    return this.root.localToWorld(this.scratch.set(x, y, z));
  }

  protected abstract animate(state: MachineState, dt: number, time: number, effects: Effects): void;

  protected onNotify(_effects: Effects): void {}

  /** Releases per-instance resources. Shared geometry and materials are left alone. */
  dispose(): void {}
}
