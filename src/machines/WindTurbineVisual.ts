import * as THREE from 'three';
import { getMachineDef } from '../core/factory/MachineRegistry';
import type { MachineState } from '../core/factory/MachineState';
import { box, cylinder, merge } from '../rendering/GeometryUtils';
import { PALETTE } from '../rendering/Materials';
import { baseParts, MachineVisual } from './MachineVisual';

const HUB_HEIGHT = 2.7;
const BLADE_LENGTH = 1.15;
const WHITE = 0xeef1f5;

let staticGeometry: THREE.BufferGeometry | null = null;
let rotorGeometry: THREE.BufferGeometry | null = null;

function buildStatic(): THREE.BufferGeometry {
  const parts = baseParts(getMachineDef('wind_turbine'));
  // Concrete plinth, a small switchgear cabinet, and the tapering tower.
  parts.push(cylinder(0.5, 0.58, 0.16, 12, 0, 0.18, 0, 0x8d939c));
  parts.push(box(0.42, 0.42, 0.34, 0.52, 0.31, 0.5, PALETTE.slateLight));
  parts.push(box(0.44, 0.05, 0.36, 0.52, 0.54, 0.5, PALETTE.yellow));
  parts.push(cylinder(0.1, 0.2, HUB_HEIGHT - 0.2, 10, 0, 0.26 + (HUB_HEIGHT - 0.2) / 2, 0, WHITE));
  // Nacelle: the housing at the top that the rotor is mounted on.
  parts.push(box(0.6, 0.26, 0.28, -0.08, HUB_HEIGHT + 0.06, 0, WHITE));
  parts.push(box(0.14, 0.2, 0.22, -0.42, HUB_HEIGHT + 0.06, 0, PALETTE.red));
  return merge(parts);
}

/** Hub and three blades in the YZ plane, so the rotor spins about its X axis. */
function buildRotor(): THREE.BufferGeometry {
  const parts = [cylinder(0.13, 0.13, 0.16, 10, 0, 0, 0, PALETTE.slateLight).rotateZ(Math.PI / 2)];
  for (let i = 0; i < 3; i++) {
    const blade = box(0.05, BLADE_LENGTH, 0.16, 0.02, BLADE_LENGTH / 2 + 0.08, 0, WHITE);
    blade.rotateX((i * Math.PI * 2) / 3);
    parts.push(blade);
  }
  return merge(parts);
}

export class WindTurbineVisual extends MachineVisual {
  private readonly rotor: THREE.Mesh;
  /** Eased towards full speed or a standstill, so switching it off lets the blades coast down. */
  private spin = 0;

  constructor() {
    staticGeometry ??= buildStatic();
    rotorGeometry ??= buildRotor();
    super(staticGeometry);
    this.rotor = this.addPart(rotorGeometry);
    this.rotor.position.set(0.3, HUB_HEIGHT + 0.06, 0);
  }

  protected animate(state: MachineState, dt: number): void {
    this.spin += ((state.enabled ? 1 : 0) - this.spin) * Math.min(1, dt * 1.5);
    this.rotor.rotation.x += dt * 2.4 * this.spin;
  }
}
