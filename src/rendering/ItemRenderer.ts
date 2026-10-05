import * as THREE from 'three';
import type { FactoryState } from '../core/factory/FactoryState';
import type { ItemState } from '../core/factory/ItemState';
import { DIR_VECTORS, type Direction } from '../core/grid/GridPosition';
import { RESOURCE_DEFINITIONS } from '../data/resources';
import { getMachineDef } from '../core/factory/MachineRegistry';
import { bridgeHeight } from '../machines/BridgeVisual';
import { BELT_SURFACE_Y } from './ConveyorRenderer';
import { gearGeometry, merge, paint } from './GeometryUtils';
import { PALETTE, VERTEX_MATERIAL } from './Materials';
import { cellCenterX, cellCenterZ } from './WorldMapping';

/** Two items per tile on the largest floor. */
const MAX_ITEMS_PER_RESOURCE = 2048;
/** Seconds an item takes to grow in when it appears and to shrink away when it is consumed. */
const APPEAR_SECONDS = 0.16;
const VANISH_SECONDS = 0.14;

export interface ItemVisualSpec {
  geometry: THREE.BufferGeometry;
  /** Height of the item's centre above the belt surface. */
  lift: number;
  /** Radians per second of idle spin about the vertical axis. */
  spin: number;
  /** Whether the item turns to face its direction of travel. */
  alignToTravel: boolean;
}

/** Visuals keyed by ResourceDefinition.icon; new resources only need an entry here. */
export function createItemVisuals(): Record<string, ItemVisualSpec> {
  return {
    ore: {
      geometry: merge([
        paint(new THREE.DodecahedronGeometry(0.14, 0).scale(1.1, 0.85, 1), PALETTE.ore),
        paint(new THREE.DodecahedronGeometry(0.07, 0).translate(0.08, 0.06, 0.05), 0x8b858f),
      ]),
      lift: 0.11,
      spin: 0,
      alignToTravel: false,
    },
    plate: {
      geometry: merge([
        paint(new THREE.BoxGeometry(0.32, 0.05, 0.22), 0xc3ccd8),
        paint(new THREE.BoxGeometry(0.27, 0.02, 0.17).translate(0, 0.035, 0), 0xdde3ea),
      ]),
      lift: 0.03,
      spin: 0,
      alignToTravel: true,
    },
    gear: {
      geometry: paint(gearGeometry(0.15, 8, 0.07).rotateX(Math.PI / 2), PALETTE.brass),
      lift: 0.04,
      spin: 1.6,
      alignToTravel: false,
    },
    copper_ore: {
      geometry: merge([
        paint(new THREE.DodecahedronGeometry(0.14, 0).scale(1, 0.85, 1.1), 0xa8623c),
        paint(new THREE.DodecahedronGeometry(0.07, 0).translate(-0.07, 0.06, 0.06), 0x5fae96),
      ]),
      lift: 0.11,
      spin: 0,
      alignToTravel: false,
    },
    copper_plate: {
      geometry: merge([
        paint(new THREE.BoxGeometry(0.32, 0.05, 0.22), 0xd98452),
        paint(new THREE.BoxGeometry(0.27, 0.02, 0.17).translate(0, 0.035, 0), 0xeea272),
      ]),
      lift: 0.03,
      spin: 0,
      alignToTravel: true,
    },
    wire: {
      // A coil: a fat ring lying flat with a darker core.
      geometry: merge([
        paint(new THREE.TorusGeometry(0.1, 0.045, 6, 12).rotateX(Math.PI / 2), 0xf0a060),
        paint(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8), 0x7a5236),
      ]),
      lift: 0.05,
      spin: 0,
      alignToTravel: false,
    },
    motor: {
      // A drum lying along the direction of travel, with a shaft and a mounting foot.
      geometry: merge([
        paint(new THREE.CylinderGeometry(0.11, 0.11, 0.22, 10).rotateZ(Math.PI / 2), 0x4aa3b5),
        paint(new THREE.CylinderGeometry(0.115, 0.115, 0.05, 10).rotateZ(Math.PI / 2).translate(-0.06, 0, 0), 0x2c6a75),
        paint(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 6).rotateZ(Math.PI / 2).translate(0.17, 0, 0), 0xcdd3dc),
        paint(new THREE.BoxGeometry(0.2, 0.04, 0.24).translate(0, -0.11, 0), 0x3b4252),
      ]),
      lift: 0.13,
      spin: 0,
      alignToTravel: true,
    },
    steel: {
      // An I-beam lying along the direction of travel.
      geometry: merge([
        paint(new THREE.BoxGeometry(0.34, 0.035, 0.2).translate(0, -0.06, 0), 0x5d6f8c),
        paint(new THREE.BoxGeometry(0.34, 0.1, 0.05), 0x4c5c76),
        paint(new THREE.BoxGeometry(0.34, 0.035, 0.2).translate(0, 0.06, 0), 0x6f83a2),
      ]),
      lift: 0.08,
      spin: 0,
      alignToTravel: true,
    },
    circuit: {
      // A green board with a chip and two smaller parts.
      geometry: merge([
        paint(new THREE.BoxGeometry(0.3, 0.03, 0.24), 0x3fa66a),
        paint(new THREE.BoxGeometry(0.12, 0.04, 0.12).translate(-0.03, 0.035, 0), 0x2e3440),
        paint(new THREE.BoxGeometry(0.05, 0.035, 0.08).translate(0.1, 0.03, 0.05), 0xe0a83c),
        paint(new THREE.BoxGeometry(0.05, 0.035, 0.05).translate(0.1, 0.03, -0.07), 0xcdd3dc),
      ]),
      lift: 0.02,
      spin: 0,
      alignToTravel: true,
    },
    computer: {
      // A beige tower with a dark screen on its leading face.
      geometry: merge([
        paint(new THREE.BoxGeometry(0.26, 0.26, 0.24), 0xd9cdb4),
        paint(new THREE.BoxGeometry(0.02, 0.15, 0.17).translate(0.135, 0.02, 0), 0x25303c),
        paint(new THREE.BoxGeometry(0.02, 0.02, 0.06).translate(0.135, -0.09, 0.06), 0x6ad17d),
      ]),
      lift: 0.13,
      spin: 0,
      alignToTravel: true,
    },
    robot: {
      // A squat little robot: body, head with an eye strip, two arms and an antenna.
      geometry: merge([
        paint(new THREE.BoxGeometry(0.2, 0.2, 0.22).translate(0, 0.1, 0), 0xe2733d),
        paint(new THREE.BoxGeometry(0.16, 0.13, 0.17).translate(0, 0.27, 0), 0xf0ead8),
        paint(new THREE.BoxGeometry(0.02, 0.04, 0.12).translate(0.085, 0.28, 0), 0x25303c),
        paint(new THREE.BoxGeometry(0.06, 0.16, 0.05).translate(0, 0.11, 0.14), 0x8a8f99),
        paint(new THREE.BoxGeometry(0.06, 0.16, 0.05).translate(0, 0.11, -0.14), 0x8a8f99),
        paint(new THREE.CylinderGeometry(0.012, 0.012, 0.09, 5).translate(0, 0.38, 0), 0x3b4252),
        paint(new THREE.SphereGeometry(0.025, 6, 5).translate(0, 0.43, 0), 0xf87171),
      ]),
      lift: 0.0,
      spin: 0,
      alignToTravel: true,
    },
  };
}

/** Last two simulated positions of an item, interpolated between for smooth motion. */
interface ItemTrack {
  resourceId: string;
  x: number;
  z: number;
  prevX: number;
  prevZ: number;
  /** Height above the normal belt surface; non-zero only on the raised lane of a bridge. */
  y: number;
  prevY: number;
  yaw: number;
  /** Seconds since the item first appeared; drives the grow-in. */
  age: number;
  seenAt: number;
}

/** An item that has just been consumed: it keeps drifting forward while shrinking to nothing. */
interface Vanishing {
  id: number;
  resourceId: string;
  x: number;
  z: number;
  vx: number;
  vz: number;
  yaw: number;
  time: number;
}

interface ResourceBatch {
  mesh: THREE.InstancedMesh;
  spec: ItemVisualSpec;
  count: number;
}

/**
 * Renders every item on every belt and router using one InstancedMesh per resource. Instance
 * slots are simply refilled each frame, so items appear and disappear without allocating anything.
 */
export class ItemRenderer {
  private readonly batches = new Map<string, ResourceBatch>();
  private readonly tracks = new Map<number, ItemTrack>();
  private readonly vanishing: Vanishing[] = [];
  private readonly dummy = new THREE.Object3D();
  private snapshotIndex = 0;

  constructor(scene: THREE.Scene) {
    const visuals = createItemVisuals();
    for (const resource of RESOURCE_DEFINITIONS) {
      const spec = visuals[resource.icon];
      if (!spec) throw new Error(`No item visual for icon "${resource.icon}"`);
      const mesh = new THREE.InstancedMesh(spec.geometry, VERTEX_MATERIAL, MAX_ITEMS_PER_RESOURCE);
      mesh.count = 0;
      mesh.castShadow = true;
      mesh.frustumCulled = false;
      scene.add(mesh);
      this.batches.set(resource.id, { mesh, spec, count: 0 });
    }
  }

  /**
   * Records where each item is after a simulation tick. Call once per tick.
   * Items glide between the previous and current snapshot during rendering.
   */
  snapshot(factory: FactoryState, animate = true): void {
    this.snapshotIndex++;
    for (const conveyor of factory.conveyors.values()) {
      for (const item of conveyor.items) {
        beltPosition(item, conveyor.direction);
        this.record(item, scratch.x, scratch.z, conveyor.direction, animate);
      }
    }
    for (const machine of factory.machines.values()) {
      if (machine.transit.length === 0) continue;
      const bridge = getMachineDef(machine.type).behavior === 'bridge';
      for (const item of machine.transit) {
        if (bridge) {
          // Straight across. The lane running along the machine's own Z axis is the raised one.
          const out = DIR_VECTORS[item.from];
          scratch.x = cellCenterX(item.tileX) + out.x * (item.progress - 0.5);
          scratch.z = cellCenterZ(item.tileY) + out.y * (item.progress - 0.5);
          const raised = (item.from + machine.rotation) % 2 === 1;
          this.record(item, scratch.x, scratch.z, item.from, animate, raised ? bridgeHeight(item.progress) : 0);
        } else {
          routerPosition(item);
          this.record(item, scratch.x, scratch.z, item.to ?? item.from, animate);
        }
      }
    }

    for (const [id, track] of this.tracks) {
      if (track.seenAt === this.snapshotIndex) continue;
      this.tracks.delete(id);
      if (animate && this.vanishing.length < 256) {
        this.vanishing.push({
          id,
          resourceId: track.resourceId,
          x: track.x,
          z: track.z,
          vx: track.x - track.prevX,
          vz: track.z - track.prevZ,
          yaw: track.yaw,
          time: 0,
        });
      }
    }
  }

  private record(item: ItemState, x: number, z: number, heading: Direction, animate: boolean, y = 0): void {
    let track = this.tracks.get(item.id);
    if (!track) {
      track = {
        resourceId: item.resourceId,
        x,
        z,
        prevX: x,
        prevZ: z,
        y,
        prevY: y,
        yaw: -heading * (Math.PI / 2),
        age: animate ? 0 : APPEAR_SECONDS,
        seenAt: 0,
      };
      this.tracks.set(item.id, track);
    } else {
      track.prevX = track.x;
      track.prevZ = track.z;
      track.prevY = track.y;
      track.x = x;
      track.z = z;
      track.y = y;
      const dx = x - track.prevX;
      const dz = z - track.prevZ;
      if (dx * dx + dz * dz > 1e-8) track.yaw = Math.atan2(-dz, dx);
    }
    track.seenAt = this.snapshotIndex;
  }

  /** Drops interpolation history, e.g. on load or after the simulation ran ahead while the tab was hidden. */
  resetTracks(factory: FactoryState): void {
    this.tracks.clear();
    this.vanishing.length = 0;
    this.snapshot(factory, false);
  }

  /**
   * `alpha` is how far the frame sits between the last two ticks (0..1); `animDt` is frame
   * time scaled by game speed, so appear/vanish animations pause with the game.
   */
  update(alpha: number, time: number, animDt: number): void {
    for (const batch of this.batches.values()) batch.count = 0;

    for (const [id, track] of this.tracks) {
      track.age += animDt;
      const grow = Math.min(track.age / APPEAR_SECONDS, 1);
      this.place(
        track.resourceId,
        id,
        track.prevX + (track.x - track.prevX) * alpha,
        track.prevZ + (track.z - track.prevZ) * alpha,
        track.yaw,
        time,
        track.prevY + (track.y - track.prevY) * alpha,
        // Ease out so the item pops up quickly and settles.
        1 - (1 - grow) * (1 - grow),
      );
    }

    for (let i = this.vanishing.length - 1; i >= 0; i--) {
      const ghost = this.vanishing[i];
      ghost.time += animDt;
      const t = ghost.time / VANISH_SECONDS;
      if (t >= 1) {
        this.vanishing[i] = this.vanishing[this.vanishing.length - 1];
        this.vanishing.pop();
        continue;
      }
      // Velocity is per tick; carry the item a little further in, as if swallowed by the hatch.
      const drift = 1 + t * 2.5;
      this.place(ghost.resourceId, ghost.id, ghost.x + ghost.vx * drift, ghost.z + ghost.vz * drift, ghost.yaw, time, 0, 1 - t);
    }

    for (const batch of this.batches.values()) {
      batch.mesh.count = batch.count;
      batch.mesh.instanceMatrix.needsUpdate = true;
    }
  }

  private place(
    resourceId: string,
    id: number,
    x: number,
    z: number,
    travelYaw: number,
    time: number,
    y: number,
    scale: number,
  ): void {
    const batch = this.batches.get(resourceId);
    if (!batch || batch.count >= MAX_ITEMS_PER_RESOURCE) return;
    const { spec } = batch;
    this.dummy.position.set(x, BELT_SURFACE_Y + y + spec.lift * scale, z);
    // Ore gets a fixed pseudo-random heading so a line of it does not look stamped out.
    const yaw = spec.alignToTravel ? travelYaw : spec.spin !== 0 ? time * spec.spin + id : id * 2.4;
    this.dummy.rotation.set(0, yaw, 0);
    this.dummy.scale.setScalar(Math.max(scale, 0.001));
    this.dummy.updateMatrix();
    batch.mesh.setMatrixAt(batch.count++, this.dummy.matrix);
  }

  get visibleCount(): number {
    return this.tracks.size;
  }
}

const scratch = { x: 0, z: 0 };

/**
 * World position of an item on a belt tile. The path is a quadratic curve from the edge the
 * item entered through, via the tile centre, to the exit edge: a straight line on straight
 * belts and a smooth arc round corners and side-merges.
 */
function beltPosition(item: ItemState, exit: Direction): void {
  const entry = DIR_VECTORS[item.from];
  const out = DIR_VECTORS[exit];
  const t = item.progress;
  const a = (1 - t) * (1 - t);
  const c = t * t;
  // Bezier with P0 = centre - entry/2, P1 = centre, P2 = centre + exit/2.
  scratch.x = cellCenterX(item.tileX) + (-a * entry.x + c * out.x) * 0.5;
  scratch.z = cellCenterZ(item.tileY) + (-a * entry.y + c * out.y) * 0.5;
}

/**
 * World position of an item crossing a router: straight in to the centre, then straight out
 * through whichever side it has been given. Until an exit is chosen it waits at the centre.
 */
function routerPosition(item: ItemState): void {
  const t = item.progress;
  const cx = cellCenterX(item.tileX);
  const cz = cellCenterZ(item.tileY);
  if (t < 0.5 || item.to === undefined) {
    const entry = DIR_VECTORS[item.from];
    const back = 0.5 - Math.min(t, 0.5);
    scratch.x = cx - entry.x * back;
    scratch.z = cz - entry.y * back;
  } else {
    const out = DIR_VECTORS[item.to];
    scratch.x = cx + out.x * (t - 0.5);
    scratch.z = cz + out.y * (t - 0.5);
  }
}
