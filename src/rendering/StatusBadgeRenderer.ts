import * as THREE from 'three';
import type { FactoryState } from '../core/factory/FactoryState';
import type { FactoryMetrics, StallKind } from '../core/stats/FactoryMetrics';
import { machineCenter } from './MachineRenderer';

const MAX_BADGES = 128;
/** A machine must be stalled this long before it gets a badge, so brief gaps do not flicker. */
const STALL_SECONDS = 3;
const BADGE_HEIGHT = 2.35;

/** Draws a round badge with a glyph: amber dots for "waiting", a red bar for "backed up". */
function badgeTexture(kind: StallKind): THREE.CanvasTexture {
  const size = 96;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 5, 0, Math.PI * 2);
  ctx.fillStyle = kind === 'waiting' ? '#ffb547' : '#f2605a';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#1b202a';
  ctx.stroke();

  ctx.fillStyle = '#1b202a';
  if (kind === 'waiting') {
    for (const x of [28, 48, 68]) {
      ctx.beginPath();
      ctx.arc(x, size / 2, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillRect(42, 22, 12, 34);
    ctx.beginPath();
    ctx.arc(48, 70, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Floating badges over machines that have stopped for a while: amber when starved of input,
 * red when their output has nowhere to go. One instanced mesh per badge type.
 */
export class StatusBadgeRenderer {
  private readonly meshes: Record<StallKind, THREE.InstancedMesh>;
  private readonly dummy = new THREE.Object3D();
  private readonly center = new THREE.Vector3();

  constructor(scene: THREE.Scene) {
    const geometry = new THREE.PlaneGeometry(0.62, 0.62);
    const make = (kind: StallKind) => {
      const mesh = new THREE.InstancedMesh(
        geometry,
        new THREE.MeshBasicMaterial({ map: badgeTexture(kind), transparent: true, depthTest: false }),
        MAX_BADGES,
      );
      mesh.count = 0;
      mesh.frustumCulled = false;
      mesh.renderOrder = 8;
      scene.add(mesh);
      return mesh;
    };
    this.meshes = { waiting: make('waiting'), output_full: make('output_full') };
  }

  update(factory: FactoryState, metrics: FactoryMetrics, camera: THREE.Camera, time: number): void {
    const counts: Record<StallKind, number> = { waiting: 0, output_full: 0 };
    for (const machine of factory.machines.values()) {
      if (!machine.enabled) continue;
      const stall = metrics.stall(machine.id);
      if (!stall || stall.seconds < STALL_SECONDS || counts[stall.kind] >= MAX_BADGES) continue;
      machineCenter(machine, this.center);
      // Every badge faces the camera, and pops in as the stall crosses the threshold.
      const pop = Math.min((stall.seconds - STALL_SECONDS) * 5, 1);
      this.dummy.position.set(this.center.x, BADGE_HEIGHT + Math.sin(time * 3 + this.center.x) * 0.06, this.center.z);
      this.dummy.quaternion.copy(camera.quaternion);
      this.dummy.scale.setScalar(pop);
      this.dummy.updateMatrix();
      this.meshes[stall.kind].setMatrixAt(counts[stall.kind]++, this.dummy.matrix);
    }
    for (const kind of Object.keys(counts) as StallKind[]) {
      this.meshes[kind].count = counts[kind];
      this.meshes[kind].instanceMatrix.needsUpdate = true;
    }
  }
}
