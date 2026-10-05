import * as THREE from 'three';
import { conveyorShape } from '../core/factory/ConveyorSystem';
import type { FactoryState } from '../core/factory/FactoryState';
import { CONVEYOR_SPEED } from '../core/game/Constants';
import { rotateDir } from '../core/grid/GridPosition';
import { box, merge, paint, sectorSlab } from './GeometryUtils';
import { PALETTE, VERTEX_MATERIAL, VERTEX_MATERIAL_DOUBLE } from './Materials';
import { cellCenterX, cellCenterZ, dirAngle } from './WorldMapping';

const MAX_CONVEYORS = 1024;
export const BELT_SURFACE_Y = 0.115;
const BELT_HALF_WIDTH = 0.29;
const RAIL_WIDTH = 0.07;

type ShapeKey = 'straight' | 'cornerA' | 'cornerB';

/** All geometry is modelled with the belt leaving through the +X edge of the tile. */
export function straightBodyGeometry(): THREE.BufferGeometry {
  const railZ = BELT_HALF_WIDTH + RAIL_WIDTH / 2;
  return merge([
    box(1, 0.11, 0.72, 0, 0.055, 0, PALETTE.slate),
    box(1, 0.16, RAIL_WIDTH, 0, 0.08, railZ, PALETTE.slateLight),
    box(1, 0.16, RAIL_WIDTH, 0, 0.08, -railZ, PALETTE.slateLight),
  ]);
}

function straightBeltGeometry(): THREE.BufferGeometry {
  return new THREE.PlaneGeometry(1, BELT_HALF_WIDTH * 2).rotateX(-Math.PI / 2).translate(0, BELT_SURFACE_Y, 0);
}

/**
 * Quarter-circle belt around a tile corner. Variant A is entered through the -Z edge,
 * variant B through the +Z edge; both leave through +X.
 */
function cornerGeometry(variant: 'A' | 'B'): { body: THREE.BufferGeometry; belt: THREE.BufferGeometry } {
  const cz = variant === 'A' ? -0.5 : 0.5;
  const start = Math.PI;
  const end = variant === 'A' ? Math.PI / 2 : Math.PI * 1.5;
  const inner = 0.5 - BELT_HALF_WIDTH;
  const outer = 0.5 + BELT_HALF_WIDTH;
  return {
    body: merge([
      paint(sectorSlab(0.5, cz, inner - RAIL_WIDTH, outer + RAIL_WIDTH, start, end, 0, 0.11, 8), PALETTE.slate),
      paint(sectorSlab(0.5, cz, inner - RAIL_WIDTH, inner, start, end, 0, 0.16, 8), PALETTE.slateLight),
      paint(sectorSlab(0.5, cz, outer, outer + RAIL_WIDTH, start, end, 0, 0.16, 8), PALETTE.slateLight),
    ]),
    belt: sectorSlab(0.5, cz, inner, outer, start, end, 0, BELT_SURFACE_Y, 10, true),
  };
}

/** Dark rubber with chevrons pointing along +U. Scrolling the texture animates every belt at once. */
function createBeltTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#262a31';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = '#59616f';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const offset of [0, size / 2]) {
    ctx.beginPath();
    ctx.moveTo(offset + 16, 30);
    ctx.lineTo(offset + 40, size / 2);
    ctx.lineTo(offset + 16, size - 30);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/**
 * Draws every conveyor with six instanced meshes (body + belt for each of three shapes).
 * Instance matrices are rewritten only when the factory layout changes.
 */
export class ConveyorRenderer {
  private readonly bodies: Record<ShapeKey, THREE.InstancedMesh>;
  private readonly belts: Record<ShapeKey, THREE.InstancedMesh>;
  private readonly beltTexture = createBeltTexture();
  private readonly dummy = new THREE.Object3D();
  private scroll = 0;
  private dirty = true;

  constructor(scene: THREE.Scene) {
    const beltMaterial = new THREE.MeshLambertMaterial({ map: this.beltTexture, side: THREE.DoubleSide });
    const cornerA = cornerGeometry('A');
    const cornerB = cornerGeometry('B');

    const make = (geometry: THREE.BufferGeometry, material: THREE.Material, castShadow: boolean) => {
      const mesh = new THREE.InstancedMesh(geometry, material, MAX_CONVEYORS);
      mesh.count = 0;
      mesh.castShadow = castShadow;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;
      scene.add(mesh);
      return mesh;
    };

    this.bodies = {
      straight: make(straightBodyGeometry(), VERTEX_MATERIAL, true),
      cornerA: make(cornerA.body, VERTEX_MATERIAL_DOUBLE, true),
      cornerB: make(cornerB.body, VERTEX_MATERIAL_DOUBLE, true),
    };
    this.belts = {
      straight: make(straightBeltGeometry(), beltMaterial, false),
      cornerA: make(cornerA.belt, beltMaterial, false),
      cornerB: make(cornerB.belt, beltMaterial, false),
    };
  }

  /** Marks the layout stale; the next update rewrites the instance buffers. */
  invalidate(): void {
    this.dirty = true;
  }

  /** `animDt` is frame time scaled by game speed, so belts stop when the game is paused. */
  update(factory: FactoryState, animDt: number): void {
    this.scroll = (this.scroll + animDt * CONVEYOR_SPEED) % 1;
    // Two chevrons per tile, so the texture repeats every half tile of travel.
    this.beltTexture.offset.x = -this.scroll;
    if (this.dirty) this.rebuild(factory);
  }

  private rebuild(factory: FactoryState): void {
    this.dirty = false;
    const counts: Record<ShapeKey, number> = { straight: 0, cornerA: 0, cornerB: 0 };

    for (const conveyor of factory.conveyors.values()) {
      const shape = conveyorShape(factory, conveyor);
      let key: ShapeKey = 'straight';
      if (shape.kind === 'corner') {
        // Travelling "clockwise-next" on entry means the item came in through the tile's -Z side
        // once the tile is rotated so its exit faces +X.
        key = shape.from === rotateDir(conveyor.direction, 1) ? 'cornerA' : 'cornerB';
      }
      const index = counts[key]++;
      if (index >= MAX_CONVEYORS) continue;
      this.dummy.position.set(cellCenterX(conveyor.gridX), 0, cellCenterZ(conveyor.gridY));
      this.dummy.rotation.set(0, dirAngle(conveyor.direction), 0);
      this.dummy.updateMatrix();
      this.bodies[key].setMatrixAt(index, this.dummy.matrix);
      this.belts[key].setMatrixAt(index, this.dummy.matrix);
    }

    for (const key of Object.keys(counts) as ShapeKey[]) {
      const count = Math.min(counts[key], MAX_CONVEYORS);
      this.bodies[key].count = count;
      this.belts[key].count = count;
      this.bodies[key].instanceMatrix.needsUpdate = true;
      this.belts[key].instanceMatrix.needsUpdate = true;
    }
  }
}
