import * as THREE from 'three';
import { getMachineDef } from '../core/factory/MachineRegistry';
import type { MachineState } from '../core/factory/MachineState';
import type { Effects } from '../rendering/effects/Effects';
import { box, cylinder, merge } from '../rendering/GeometryUtils';
import { PALETTE } from '../rendering/Materials';
import { baseParts, MachineVisual } from './MachineVisual';

const CHIMNEY_X = -0.34;
const CHIMNEY_Z = 0.3;
const CHIMNEY_TOP = 2.0;

const COLD = new THREE.Color(0x3a1a10);
const HOT = new THREE.Color(0xffb347);

let staticGeometry: THREE.BufferGeometry | null = null;
let glowGeometry: THREE.BufferGeometry | null = null;

function buildStatic(): THREE.BufferGeometry {
  const parts = baseParts(getMachineDef('furnace'));
  parts.push(box(1.34, 0.96, 1.34, 0, 0.58, 0, PALETTE.brick));
  parts.push(box(1.4, 0.1, 1.4, 0, 0.72, 0, PALETTE.brickDark));
  parts.push(box(1.44, 0.12, 1.44, 0, 1.12, 0, PALETTE.slate));
  // Chamber door frames on the two faces most often turned towards the camera.
  parts.push(box(0.74, 0.5, 0.08, 0.1, 0.42, 0.69, PALETTE.slateDark));
  parts.push(box(0.08, 0.5, 0.6, 0.69, 0.42, 0.28, PALETTE.slateDark));
  parts.push(cylinder(0.19, 0.23, 0.8, 10, CHIMNEY_X, 1.58, CHIMNEY_Z, PALETTE.slateLight));
  parts.push(cylinder(0.25, 0.25, 0.08, 10, CHIMNEY_X, CHIMNEY_TOP - 0.04, CHIMNEY_Z, PALETTE.slateDark));
  // Pipework over the top, running from the intake side to the chimney.
  parts.push(cylinder(0.07, 0.07, 0.34, 8, 0.42, 1.35, -0.4, PALETTE.steel));
  parts.push(box(0.9, 0.12, 0.12, 0.03, 1.5, -0.4, PALETTE.steel));
  parts.push(box(0.12, 0.12, 0.58, CHIMNEY_X, 1.5, -0.1, PALETTE.steel));
  return merge(parts);
}

function buildGlow(): THREE.BufferGeometry {
  return merge([box(0.6, 0.36, 0.04, 0.1, 0.42, 0.735, 0xffffff), box(0.04, 0.36, 0.46, 0.735, 0.42, 0.28, 0xffffff)]);
}

export class FurnaceVisual extends MachineVisual {
  /** Per-instance so each furnace glows according to its own state. */
  private readonly glowMaterial = new THREE.MeshBasicMaterial({ color: COLD });
  private smokeTimer = 0;

  constructor() {
    staticGeometry ??= buildStatic();
    glowGeometry ??= buildGlow();
    super(staticGeometry);
    const glow = this.addPart(glowGeometry, this.glowMaterial);
    glow.castShadow = false;
  }

  protected animate(_state: MachineState, dt: number, time: number, effects: Effects): void {
    const flicker = 0.82 + Math.sin(time * 7) * 0.1 + Math.sin(time * 17) * 0.05;
    const heat = Math.min(1, this.activity * flicker + this.pulse * 0.3);
    this.glowMaterial.color.lerpColors(COLD, HOT, heat);

    if (this.activity > 0.4) {
      this.smokeTimer += dt;
      if (this.smokeTimer > 0.22) {
        this.smokeTimer = 0;
        const p = this.toWorld(CHIMNEY_X, CHIMNEY_TOP, CHIMNEY_Z);
        effects.smoke(p.x, p.y, p.z);
      }
    }
  }

  override dispose(): void {
    this.glowMaterial.dispose();
  }
}
