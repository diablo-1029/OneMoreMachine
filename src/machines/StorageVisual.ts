import * as THREE from 'three';
import { getMachineDef } from '../core/factory/MachineRegistry';
import type { MachineState } from '../core/factory/MachineState';
import { box, merge } from '../rendering/GeometryUtils';
import { PALETTE } from '../rendering/Materials';
import { baseParts, MachineVisual } from './MachineVisual';

const WALL = 0x7f8ea8;
const WALL_DARK = 0x6a7890;
const GAUGE_HEIGHT = 0.62;
const GAUGE_BOTTOM = 0.24;

let staticGeometry: THREE.BufferGeometry | null = null;
let gaugeGeometry: THREE.BufferGeometry | null = null;
const gaugeMaterial = new THREE.MeshBasicMaterial({ color: 0x6ad17d });

/** A 2×3 warehouse. The port line runs along its north end; the shed fills the rest. */
function buildStatic(): THREE.BufferGeometry {
  const parts = baseParts(getMachineDef('storage'));
  parts.push(box(1.36, 0.92, 2.36, 0, 0.56, 0.16, WALL));
  // Corrugation ribs along the long sides.
  for (let i = 0; i < 6; i++) {
    const z = -0.84 + i * 0.4;
    parts.push(box(1.4, 0.92, 0.06, 0, 0.56, z, WALL_DARK));
  }
  parts.push(box(1.48, 0.1, 2.48, 0, 1.07, 0.16, PALETTE.slate));
  parts.push(box(1.0, 0.1, 2.48, 0, 1.17, 0.16, PALETTE.slateLight));
  // Roller door on the east side and loose crates by the south wall.
  parts.push(box(0.05, 0.62, 0.8, 0.69, 0.41, 0.75, PALETTE.yellowDark));
  parts.push(box(0.06, 0.05, 0.86, 0.7, 0.74, 0.75, PALETTE.slateDark));
  parts.push(box(0.3, 0.3, 0.3, -0.45, 0.25, 1.36, PALETTE.wood));
  parts.push(box(0.24, 0.24, 0.24, -0.1, 0.22, 1.38, 0x8c6240));
  // Housings for the fill gauges on the two camera-facing sides.
  parts.push(box(0.05, GAUGE_HEIGHT + 0.12, 0.26, 0.69, GAUGE_BOTTOM + GAUGE_HEIGHT / 2, -0.3, PALETTE.slateDark));
  parts.push(box(0.26, GAUGE_HEIGHT + 0.12, 0.05, 0.3, GAUGE_BOTTOM + GAUGE_HEIGHT / 2, 1.35, PALETTE.slateDark));
  return merge(parts);
}

/** Two unit-high bars with their origin at the bottom, so scaling Y fills them upwards. */
function buildGauge(): THREE.BufferGeometry {
  return merge([box(0.04, 1, 0.16, 0.705, 0.5, -0.3, 0xffffff), box(0.16, 1, 0.04, 0.3, 0.5, 1.365, 0xffffff)]);
}

export class StorageVisual extends MachineVisual {
  private readonly gauge: THREE.Mesh;
  private readonly capacity: number;
  private shown = 0;

  constructor() {
    staticGeometry ??= buildStatic();
    gaugeGeometry ??= buildGauge();
    super(staticGeometry);
    this.capacity = getMachineDef('storage').storageCapacity ?? 1;
    this.gauge = this.addPart(gaugeGeometry, gaugeMaterial);
    this.gauge.castShadow = false;
    this.gauge.position.y = GAUGE_BOTTOM;
    this.gauge.scale.y = 0.001;
  }

  protected animate(state: MachineState, dt: number): void {
    const fill = state.stored.length / this.capacity;
    this.shown += (fill - this.shown) * Math.min(1, Math.max(dt, 0.016) * 8);
    this.gauge.scale.y = Math.max(this.shown * GAUGE_HEIGHT, 0.001);
  }
}
