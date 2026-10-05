import * as THREE from 'three';
import type { MachineState } from '../core/factory/MachineState';
import { BELT_SURFACE_Y } from '../rendering/ConveyorRenderer';
import { box, merge } from '../rendering/GeometryUtils';
import { PALETTE } from '../rendering/Materials';
import { MachineVisual } from './MachineVisual';

/** How high the upper lane rises above the lower one at the middle of the tile. */
export const BRIDGE_RISE = 0.52;
const BELT = 0x262a31;

/**
 * Height of the upper lane's surface above the normal belt surface, `t` of the way across
 * (0 = one edge, 1 = the other). Shared with the item renderer so items ride the deck exactly.
 */
export function bridgeHeight(t: number): number {
  return BRIDGE_RISE * Math.sin(Math.PI * Math.min(Math.max(t, 0), 1)) ** 0.8;
}

let staticGeometry: THREE.BufferGeometry | null = null;

/**
 * Modelled for rotation 0: the lower lane runs along X at belt height, and the upper lane
 * arches over it along Z. Rotating the machine swaps which direction goes over the top.
 */
function buildStatic(): THREE.BufferGeometry {
  const parts = [
    // Lower lane: an ordinary stretch of belt.
    box(1, 0.11, 0.72, 0, 0.055, 0, PALETTE.slate),
    box(1, 0.012, 0.58, 0, BELT_SURFACE_Y - 0.004, 0, BELT),
  ];

  // Upper lane: short deck sections following the arch, each tilted to the slope beneath it.
  const sections = 8;
  for (let i = 0; i < sections; i++) {
    const t0 = i / sections;
    const t1 = (i + 1) / sections;
    const y0 = BELT_SURFACE_Y + bridgeHeight(t0);
    const y1 = BELT_SURFACE_Y + bridgeHeight(t1);
    const length = Math.hypot(1 / sections, y1 - y0) + 0.02;
    const slope = Math.atan2(y1 - y0, 1 / sections);
    const z = (t0 + t1) / 2 - 0.5;
    const y = (y0 + y1) / 2;
    // Rotating about X by -slope tilts a section lying along Z upwards towards +Z.
    const place = (geometry: THREE.BufferGeometry) => geometry.rotateX(-slope).translate(0, y, z);
    parts.push(place(box(0.58, 0.03, length, 0, -0.02, 0, BELT)));
    parts.push(place(box(0.07, 0.12, length, 0.325, 0.02, 0, PALETTE.yellow)));
    parts.push(place(box(0.07, 0.12, length, -0.325, 0.02, 0, PALETTE.yellow)));
  }
  // Legs under the high part, standing clear of the lower lane's rails.
  for (const x of [-0.42, 0.42]) {
    for (const z of [-0.2, 0.2]) {
      const top = BELT_SURFACE_Y + bridgeHeight(z + 0.5) - 0.03;
      parts.push(box(0.08, top, 0.08, x, top / 2, z, PALETTE.slateLight));
    }
  }
  return merge(parts);
}

export class BridgeVisual extends MachineVisual {
  constructor() {
    staticGeometry ??= buildStatic();
    super(staticGeometry);
  }

  protected animate(_state: MachineState): void {
    // Nothing moves but the items crossing it.
  }
}
