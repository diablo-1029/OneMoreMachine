import * as THREE from 'three';
import { getMachineDef } from '../core/factory/MachineRegistry';
import type { MachineState } from '../core/factory/MachineState';
import type { Effects } from '../rendering/effects/Effects';
import { box, cylinder, gearGeometry, merge, paint } from '../rendering/GeometryUtils';
import { PALETTE } from '../rendering/Materials';
import { baseParts, MachineVisual } from './MachineVisual';

const PRESS_Z = -0.08;
const PRESS_UP = 1.2;
const PRESS_DOWN = 0.84;
/** Press strokes per craft. */
const STROKES = 3;

let staticGeometry: THREE.BufferGeometry | null = null;
let pressGeometry: THREE.BufferGeometry | null = null;
let bigGearGeometry: THREE.BufferGeometry | null = null;
let smallGearGeometry: THREE.BufferGeometry | null = null;

function buildStatic(): THREE.BufferGeometry {
  const parts = baseParts(getMachineDef('assembler'));
  parts.push(box(1.36, 0.52, 1.36, 0, 0.36, 0, PALETTE.teal));
  parts.push(box(1.44, 0.08, 1.44, 0, 0.66, 0, PALETTE.tealDark));
  // Anvil the press comes down on.
  parts.push(box(0.56, 0.1, 0.56, 0, 0.75, PRESS_Z, PALETTE.slateDark));
  // Gantry holding the press.
  parts.push(box(0.14, 1.0, 0.14, 0, 1.2, PRESS_Z - 0.56, PALETTE.yellow));
  parts.push(box(0.14, 1.0, 0.14, 0, 1.2, PRESS_Z + 0.56, PALETTE.yellow));
  parts.push(box(0.26, 0.18, 1.34, 0, 1.76, PRESS_Z, PALETTE.yellowDark));
  parts.push(cylinder(0.16, 0.16, 0.2, 8, 0, 1.92, PRESS_Z, PALETTE.slateLight));
  // Axles for the gear train on the two camera-facing sides.
  parts.push(box(0.1, 0.1, 0.1, -0.26, 0.4, 0.7, PALETTE.slateDark));
  parts.push(box(0.1, 0.1, 0.1, 0.24, 0.3, 0.7, PALETTE.slateDark));
  return merge(parts);
}

function buildPress(): THREE.BufferGeometry {
  return merge([
    cylinder(0.08, 0.08, 0.6, 8, 0, 0.36, 0, PALETTE.steel),
    box(0.42, 0.12, 0.42, 0, 0, 0, PALETTE.steelLight),
  ]);
}

export class AssemblerVisual extends MachineVisual {
  private readonly press: THREE.Mesh;
  private readonly bigGear: THREE.Mesh;
  private readonly smallGear: THREE.Mesh;
  private lastStroke = 0;

  constructor() {
    staticGeometry ??= buildStatic();
    pressGeometry ??= buildPress();
    bigGearGeometry ??= paint(gearGeometry(0.32, 10, 0.08), PALETTE.brass);
    smallGearGeometry ??= paint(gearGeometry(0.2, 6, 0.08), PALETTE.steelLight);
    super(staticGeometry);

    this.press = this.addPart(pressGeometry);
    this.press.position.set(0, PRESS_UP, PRESS_Z);

    // The gears are modelled in the XY plane, which is exactly how they mount on the +Z face.
    this.bigGear = this.addPart(bigGearGeometry);
    this.bigGear.position.set(-0.26, 0.4, 0.74);
    this.smallGear = this.addPart(smallGearGeometry);
    this.smallGear.position.set(0.24, 0.3, 0.74);
  }

  protected animate(state: MachineState, dt: number, _time: number, effects: Effects): void {
    this.bigGear.rotation.z += dt * 2.2 * this.activity;
    // Meshed gears turn opposite ways, faster in proportion to the tooth ratio (10:6).
    this.smallGear.rotation.z -= dt * 2.2 * (10 / 6) * this.activity;

    // The press hammers down a fixed number of times across one craft.
    const stroke = state.active ? Math.abs(Math.sin(state.progress * Math.PI * STROKES)) : 0;
    const down = stroke ** 6;
    const y = PRESS_UP - (PRESS_UP - PRESS_DOWN) * down;
    this.press.position.y += (y - this.press.position.y) * Math.min(1, dt * 30);

    // A few sparks at the bottom of each stroke.
    if (down > 0.9 && this.lastStroke <= 0.9) {
      const p = this.toWorld(0, 0.84, PRESS_Z);
      effects.sparks(p.x, p.y, p.z, 4);
    }
    this.lastStroke = down;
  }

  protected override onNotify(effects: Effects): void {
    const p = this.toWorld(0, 0.84, PRESS_Z);
    effects.sparks(p.x, p.y, p.z, 8);
  }
}
