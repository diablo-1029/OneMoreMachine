import * as THREE from 'three';
import { getMachineDef } from '../core/factory/MachineRegistry';
import type { MachineState } from '../core/factory/MachineState';
import type { Effects } from '../rendering/effects/Effects';
import { box, cylinder, merge, paint } from '../rendering/GeometryUtils';
import { LAMP_MATERIAL, PALETTE } from '../rendering/Materials';
import { baseParts, MachineVisual } from './MachineVisual';

// The drill rig stands over a pit in the back-left; the crusher sits by the output port.
const RIG_X = -0.32;
const RIG_Z = 0.3;

let staticGeometry: THREE.BufferGeometry | null = null;
let drillGeometry: THREE.BufferGeometry | null = null;
let lampGeometry: THREE.BufferGeometry | null = null;

function buildStatic(): THREE.BufferGeometry {
  const parts = baseParts(getMachineDef('miner'));
  parts.push(cylinder(0.5, 0.54, 0.07, 10, RIG_X, 0.135, RIG_Z, PALETTE.dirt));
  parts.push(paint(new THREE.DodecahedronGeometry(0.13, 0).translate(RIG_X + 0.36, 0.2, RIG_Z + 0.2), PALETTE.ore));
  parts.push(paint(new THREE.DodecahedronGeometry(0.1, 0).translate(RIG_X - 0.3, 0.19, RIG_Z + 0.3), PALETTE.ore));
  parts.push(paint(new THREE.DodecahedronGeometry(0.09, 0).translate(RIG_X + 0.1, 0.19, RIG_Z - 0.4), 0x8b858f));
  for (const dx of [-0.42, 0.42]) {
    for (const dz of [-0.42, 0.42]) {
      parts.push(box(0.09, 1.3, 0.09, RIG_X + dx, 0.75, RIG_Z + dz, PALETTE.yellow));
    }
  }
  parts.push(box(1.02, 0.1, 1.02, RIG_X, 1.43, RIG_Z, PALETTE.yellowDark));
  parts.push(box(0.93, 0.07, 0.07, RIG_X, 0.8, RIG_Z + 0.42, PALETTE.yellowDark));
  parts.push(box(0.93, 0.07, 0.07, RIG_X, 0.8, RIG_Z - 0.42, PALETTE.yellowDark));
  parts.push(box(0.5, 0.36, 0.5, RIG_X, 1.66, RIG_Z, PALETTE.slateLight));
  // Crusher feeding the output chute.
  parts.push(box(0.7, 0.56, 0.74, 0.3, 0.38, -0.5, PALETTE.yellow));
  parts.push(box(0.76, 0.08, 0.8, 0.3, 0.7, -0.5, PALETTE.slate));
  parts.push(cylinder(0.36, 0.2, 0.26, 4, 0.3, 0.87, -0.5, PALETTE.slateLight).rotateY(0));
  // Feed pipe from the rig to the crusher.
  parts.push(box(0.14, 0.14, 0.7, 0.1, 0.62, -0.05, PALETTE.steel));
  return merge(parts);
}

function buildDrill(): THREE.BufferGeometry {
  return merge([
    cylinder(0.07, 0.07, 1.0, 8, 0, 0.9, 0, PALETTE.steel),
    cylinder(0.16, 0.16, 0.12, 8, 0, 0.66, 0, PALETTE.slateDark),
    paint(new THREE.ConeGeometry(0.27, 0.52, 6).rotateX(Math.PI).translate(0, 0.38, 0), PALETTE.steelLight),
  ]);
}

export class MinerVisual extends MachineVisual {
  private readonly drill: THREE.Mesh;
  private readonly lamps: THREE.Mesh[] = [];
  private dustTimer = 0;

  constructor() {
    staticGeometry ??= buildStatic();
    drillGeometry ??= buildDrill();
    lampGeometry ??= new THREE.SphereGeometry(0.06, 8, 6);
    super(staticGeometry);

    this.drill = this.addPart(drillGeometry);
    this.drill.position.set(RIG_X, 0, RIG_Z);

    for (const [x, z] of [[RIG_X + 0.27, RIG_Z + 0.27], [RIG_X - 0.27, RIG_Z + 0.27]]) {
      const lamp = new THREE.Mesh(lampGeometry, LAMP_MATERIAL);
      lamp.position.set(x, 1.52, z);
      this.root.add(lamp);
      this.lamps.push(lamp);
    }
  }

  protected animate(state: MachineState, dt: number, time: number, effects: Effects): void {
    this.drill.rotation.y -= dt * 9 * this.activity;
    // The bit chews up and down a little, and the whole rig shudders while drilling.
    this.drill.position.y = Math.sin(time * 5) * 0.035 * this.activity;
    this.root.position.y = Math.sin(time * 47) * 0.006 * this.activity;

    const blink = state.enabled && (this.activity < 0.5 || Math.sin(time * 6) > -0.3);
    for (const lamp of this.lamps) lamp.visible = blink;

    if (this.activity > 0.6) {
      this.dustTimer += dt;
      if (this.dustTimer > 0.4) {
        this.dustTimer = 0;
        const p = this.toWorld(RIG_X, 0.15, RIG_Z);
        effects.dust(p.x, p.y, p.z, 0.3, 3);
      }
    }
  }

  protected override onNotify(effects: Effects): void {
    const p = this.toWorld(0.3, 0.95, -0.5);
    effects.dust(p.x, p.y, p.z, 0.12, 4);
  }
}
