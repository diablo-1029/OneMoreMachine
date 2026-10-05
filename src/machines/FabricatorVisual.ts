import * as THREE from 'three';
import { getMachineDef } from '../core/factory/MachineRegistry';
import type { MachineState } from '../core/factory/MachineState';
import type { Effects } from '../rendering/effects/Effects';
import { box, cylinder, merge } from '../rendering/GeometryUtils';
import { LAMP_MATERIAL, PALETTE } from '../rendering/Materials';
import { baseParts, MachineVisual } from './MachineVisual';

const BODY = 0x6b5fa8;
const BODY_DARK = 0x51478a;
/** Where the arm's turret stands, and the height of its shoulder joint. */
const ARM_X = -0.35;
const ARM_Z = 0.35;
const SHOULDER_Y = 1.25;
/** The work table the arm reaches over. */
const TABLE_X = 0.5;
const TABLE_Z = -0.2;
const TABLE_Y = 0.92;

let staticGeometry: THREE.BufferGeometry | null = null;
let turretGeometry: THREE.BufferGeometry | null = null;
let armGeometry: THREE.BufferGeometry | null = null;
let lampGeometry: THREE.BufferGeometry | null = null;

/** A 3×3 workshop: a low deck, a work table by the output, and a robot arm standing on a plinth. */
function buildStatic(): THREE.BufferGeometry {
  const parts = baseParts(getMachineDef('fabricator'));
  parts.push(box(2.3, 0.58, 2.3, 0, 0.39, 0, BODY));
  parts.push(box(2.4, 0.08, 2.4, 0, 0.72, 0, BODY_DARK));
  // Intake manifold along the west side, joining the three hatches.
  parts.push(box(0.26, 0.5, 2.2, -1.02, 0.6, 0, PALETTE.slate));
  // Work table and a small parts rack behind it.
  parts.push(box(0.9, 0.16, 0.9, TABLE_X, TABLE_Y - 0.08, TABLE_Z, PALETTE.slateDark));
  parts.push(box(0.7, 0.03, 0.7, TABLE_X, TABLE_Y + 0.015, TABLE_Z, PALETTE.steel));
  parts.push(box(0.5, 0.6, 0.3, 0.6, 1.06, -0.92, PALETTE.slateLight));
  parts.push(box(0.5, 0.05, 0.32, 0.6, 1.38, -0.92, PALETTE.yellow));
  // Plinth for the arm.
  parts.push(cylinder(0.34, 0.4, 0.3, 12, ARM_X, 0.91, ARM_Z, PALETTE.slateDark));
  // Control cabinet on the camera-facing corner.
  parts.push(box(0.5, 0.7, 0.4, 0.75, 1.11, 0.85, PALETTE.slateLight));
  parts.push(box(0.36, 0.26, 0.04, 0.75, 1.2, 1.06, PALETTE.glass));
  return merge(parts);
}

/** The rotating column of the arm, modelled around its own vertical axis. */
function buildTurret(): THREE.BufferGeometry {
  return merge([
    cylinder(0.2, 0.24, 0.24, 10, 0, 0.12, 0, PALETTE.yellow),
    box(0.22, 0.5, 0.22, 0, 0.42, 0, PALETTE.yellowDark),
  ]);
}

/**
 * Upper arm, forearm and tool as one rigid piece reaching along +X from the shoulder,
 * so pitching it about Z swings the tool down onto the table.
 */
function buildArm(): THREE.BufferGeometry {
  return merge([
    cylinder(0.14, 0.14, 0.3, 10, 0, 0, 0, PALETTE.slateDark).rotateX(Math.PI / 2),
    box(0.7, 0.14, 0.16, 0.35, 0, 0, PALETTE.yellow),
    cylinder(0.11, 0.11, 0.24, 10, 0.7, 0, 0, PALETTE.slateDark).rotateX(Math.PI / 2),
    box(0.12, 0.42, 0.12, 0.7, -0.2, 0, PALETTE.yellowDark),
    box(0.2, 0.08, 0.2, 0.7, -0.44, 0, PALETTE.steelLight),
  ]);
}

export class FabricatorVisual extends MachineVisual {
  private readonly turret: THREE.Group;
  private readonly arm: THREE.Mesh;
  private readonly lamp: THREE.Mesh;
  private sparkTimer = 0;

  constructor() {
    staticGeometry ??= buildStatic();
    turretGeometry ??= buildTurret();
    armGeometry ??= buildArm();
    lampGeometry ??= new THREE.SphereGeometry(0.07, 8, 6);
    super(staticGeometry);

    // The turret turns about Y; the arm rides on it and pitches at the shoulder.
    this.turret = new THREE.Group();
    this.turret.position.set(ARM_X, 1.06, ARM_Z);
    this.root.add(this.turret);
    const column = new THREE.Mesh(turretGeometry, staticMaterialOf(this));
    column.castShadow = true;
    this.turret.add(column);
    this.arm = new THREE.Mesh(armGeometry, staticMaterialOf(this));
    this.arm.castShadow = true;
    this.arm.position.y = SHOULDER_Y - 1.06 + 0.5;
    this.turret.add(this.arm);

    this.lamp = new THREE.Mesh(lampGeometry, LAMP_MATERIAL);
    this.lamp.position.set(0.75, 1.52, 0.85);
    this.root.add(this.lamp);
  }

  protected animate(state: MachineState, dt: number, time: number, effects: Effects): void {
    // At rest the arm is parked to one side; working, it swings over the table and dips repeatedly.
    const towardsTable = Math.atan2(-(TABLE_Z - ARM_Z), TABLE_X - ARM_X);
    const parked = towardsTable + 1.3;
    const sweep = Math.sin(time * 1.7) * 0.22 * this.activity;
    const targetYaw = parked + (towardsTable - parked) * this.activity + sweep;
    this.turret.rotation.y += (targetYaw - this.turret.rotation.y) * Math.min(1, dt * 5);

    const dip = Math.max(0, Math.sin(time * 5.2)) * 0.32 * this.activity;
    this.arm.rotation.z = 0.25 - dip;

    this.lamp.visible = state.enabled && (this.activity < 0.5 || Math.sin(time * 8) > 0);

    if (this.activity > 0.6) {
      this.sparkTimer += dt;
      if (this.sparkTimer > 0.6) {
        this.sparkTimer = 0;
        const p = this.toWorld(TABLE_X, TABLE_Y + 0.05, TABLE_Z);
        effects.sparks(p.x, p.y, p.z, 3);
      }
    }
  }

  protected override onNotify(effects: Effects): void {
    const p = this.toWorld(TABLE_X, TABLE_Y + 0.05, TABLE_Z);
    effects.sparks(p.x, p.y, p.z, 10);
  }
}

/** The shared vertex-colour material every machine part uses, taken from the visual's own static mesh. */
function staticMaterialOf(visual: MachineVisual): THREE.Material {
  return (visual.root.children[0] as THREE.Mesh).material as THREE.Material;
}
