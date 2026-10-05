import * as THREE from 'three';
import type { FactoryState } from '../core/factory/FactoryState';
import { getMachineDef, rotatedSize } from '../core/factory/MachineRegistry';
import type { FactoryMetrics } from '../core/stats/FactoryMetrics';
import { machineCenter } from './MachineRenderer';
import { cellCenterX, cellCenterZ } from './WorldMapping';

const MAX_MARKS = 1200;
const REFRESH_SECONDS = 0.25;
const GOOD = new THREE.Color(0x4ade80);
const FAIR = new THREE.Color(0xfbbf24);
const POOR = new THREE.Color(0xf87171);

/**
 * The "bottleneck view": a coloured pad under every working machine (green → amber → red by
 * how much of its time it actually spends working) and a red wash over belts that are backed up.
 * Off by default; one instanced mesh, refreshed a few times a second.
 */
export class BottleneckOverlay {
  private readonly mesh: THREE.InstancedMesh;
  private readonly dummy = new THREE.Object3D();
  private readonly center = new THREE.Vector3();
  private readonly color = new THREE.Color();
  private timer = REFRESH_SECONDS;
  private enabled = false;

  constructor(scene: THREE.Scene) {
    this.mesh = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.6, depthWrite: false }),
      MAX_MARKS,
    );
    this.mesh.count = 0;
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 4;
    this.mesh.visible = false;
    // Allocate the colour buffer up front so the material compiles with instance colours.
    this.mesh.setColorAt(0, GOOD);
    scene.add(this.mesh);
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.mesh.visible = enabled;
    this.timer = REFRESH_SECONDS;
  }

  update(factory: FactoryState, metrics: FactoryMetrics, realDt: number): void {
    if (!this.enabled) return;
    this.timer += realDt;
    if (this.timer < REFRESH_SECONDS) return;
    this.timer = 0;

    let count = 0;
    const mark = (x: number, y: number, z: number, w: number, h: number, color: THREE.Color) => {
      if (count >= MAX_MARKS) return;
      this.dummy.position.set(x, y, z);
      this.dummy.scale.set(w, 1, h);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(count, this.dummy.matrix);
      this.mesh.setColorAt(count, color);
      count++;
    };

    for (const machine of factory.machines.values()) {
      const def = getMachineDef(machine.type);
      if (def.behavior !== 'crafter' || !machine.enabled) continue;
      const shares = metrics.shares(machine.id);
      if (shares.observed < 3) continue;
      // 100% working is green, 75% amber, 50% or less red.
      const t = Math.min(Math.max((shares.working - 0.5) / 0.5, 0), 1);
      if (t >= 0.5) this.color.lerpColors(FAIR, GOOD, (t - 0.5) * 2);
      else this.color.lerpColors(POOR, FAIR, t * 2);
      const { w, h } = rotatedSize(def, machine.rotation);
      machineCenter(machine, this.center);
      // Wider than the footprint so it shows as a glow around the base.
      mark(this.center.x, 0.014, this.center.z, w + 0.5, h + 0.5, this.color);
    }

    for (const conveyor of factory.conveyors.values()) {
      const front = conveyor.items[0];
      // Backed up: the front item is stuck at the end with more queued behind it.
      if (!front || front.progress < 1 - 1e-6 || conveyor.items.length < 2) continue;
      mark(cellCenterX(conveyor.gridX), 0.2, cellCenterZ(conveyor.gridY), 0.9, 0.9, POOR);
    }

    this.mesh.count = count;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }
}
