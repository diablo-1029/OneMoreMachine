import * as THREE from 'three';
import { getMachineDef } from '../core/factory/MachineRegistry';
import type { MachineState } from '../core/factory/MachineState';
import type { Effects } from '../rendering/effects/Effects';
import { box, cylinder, merge } from '../rendering/GeometryUtils';
import { PALETTE } from '../rendering/Materials';
import { baseParts, MachineVisual } from './MachineVisual';

const SHOP_X = 0.14;
const COIN_Y = 1.86;

let staticGeometry: THREE.BufferGeometry | null = null;
let coinGeometry: THREE.BufferGeometry | null = null;
let shutterGeometry: THREE.BufferGeometry | null = null;

function buildStatic(): THREE.BufferGeometry {
  const parts = baseParts(getMachineDef('seller'));
  // A little depot: cream walls, stepped red roof, door and window on the front.
  parts.push(box(1.2, 0.8, 1.4, SHOP_X, 0.5, 0, PALETTE.cream));
  parts.push(box(0.05, 0.5, 0.36, SHOP_X + 0.61, 0.35, 0.34, PALETTE.wood));
  parts.push(box(0.05, 0.28, 0.4, SHOP_X + 0.61, 0.56, -0.28, PALETTE.glass));
  parts.push(box(0.36, 0.28, 0.05, SHOP_X + 0.1, 0.56, 0.71, PALETTE.glass));
  parts.push(box(1.46, 0.1, 1.66, SHOP_X, 0.95, 0, PALETTE.red));
  parts.push(box(1.06, 0.1, 1.66, SHOP_X, 1.05, 0, PALETTE.redDark));
  parts.push(box(0.6, 0.1, 1.66, SHOP_X, 1.15, 0, PALETTE.red));
  parts.push(cylinder(0.05, 0.05, 0.42, 6, SHOP_X, 1.4, 0, PALETTE.slateLight));
  // Intake housing bridging both input hatches on the west side.
  parts.push(box(0.2, 0.5, 1.2, -0.56, 0.6, 0, PALETTE.slate));
  return merge(parts);
}

function buildCoin(): THREE.BufferGeometry {
  // Disc standing on edge, facing ±Z, so spinning about Y shows both faces.
  return merge([
    cylinder(0.28, 0.28, 0.07, 16, 0, 0, 0, PALETTE.gold).rotateX(Math.PI / 2),
    cylinder(0.19, 0.19, 0.09, 16, 0, 0, 0, PALETTE.brass).rotateX(Math.PI / 2),
  ]);
}

export class SellerVisual extends MachineVisual {
  private readonly coin: THREE.Mesh;
  private readonly shutter: THREE.Mesh;
  private spin = 0;

  constructor() {
    staticGeometry ??= buildStatic();
    coinGeometry ??= buildCoin();
    shutterGeometry ??= box(0.06, 0.2, 1.16, 0, -0.1, 0, PALETTE.yellow);
    super(staticGeometry);

    this.coin = this.addPart(coinGeometry);
    this.coin.position.set(SHOP_X, COIN_Y, 0);

    // Flap over the intake, hinged along its top edge.
    this.shutter = this.addPart(shutterGeometry);
    this.shutter.position.set(-0.68, 0.84, 0);
  }

  protected animate(state: MachineState, dt: number, time: number): void {
    // Idle drift, with a burst of speed and a hop whenever something sells.
    this.spin += dt * (state.enabled ? 1.2 : 0) + dt * this.pulse * 14;
    this.coin.rotation.y = this.spin;
    this.coin.position.y = COIN_Y + Math.sin(time * 2) * 0.03 + Math.sin(this.pulse * Math.PI) * 0.22;
    this.shutter.rotation.z = -Math.sin(this.pulse * Math.PI) * 0.9;
  }

  protected override onNotify(effects: Effects): void {
    const p = this.toWorld(SHOP_X, COIN_Y, 0);
    effects.coin(p.x, p.y, p.z);
  }
}
