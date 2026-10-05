import * as THREE from 'three';
import { MAX_GRID_SIZE } from '../data/expansion';
import { cylinder, merge, paint, seededRandom } from './GeometryUtils';
import { VERTEX_MATERIAL } from './Materials';

const GROUND_Y = -0.56;

interface Prop {
  x: number;
  z: number;
  scale: number;
  rotation: number;
}

/**
 * Decorative terrain around the buildable platform: grass, a pond, a dirt track,
 * and instanced trees, bushes and rocks. Purely visual; nothing here is simulated.
 */
export class EnvironmentRenderer {
  private readonly group = new THREE.Group();

  constructor(scene: THREE.Scene) {
    scene.add(this.group);
  }

  build(gridWidth: number, gridHeight: number): void {
    for (const child of [...this.group.children]) {
      this.group.remove(child);
      if (child instanceof THREE.Mesh) child.geometry.dispose();
    }

    const random = seededRandom(20240607);
    const halfW = gridWidth / 2;
    const halfH = gridHeight / 2;
    const pond = { x: -halfW - 5.5, z: halfH + 1.5, radius: 3.1 };

    this.addGround(pond, halfW, halfH);

    const clear = (x: number, z: number, margin: number): boolean => {
      if (Math.abs(x) < halfW + margin && Math.abs(z) < halfH + margin) return false;
      if (Math.hypot(x - pond.x, z - pond.z) < pond.radius + margin) return false;
      // Keep the dirt track that leads off the east side clear.
      if (x > halfW && Math.abs(z - 1) < 1.3 + margin * 0.5) return false;
      return true;
    };

    // Candidates are spread over the area around the largest possible floor and always drawn
    // in the same order, then filtered. Expanding the factory therefore only removes the
    // scenery it paves over; every other tree and rock stays exactly where it was.
    const scatter = (candidates: number, margin: number, minScale: number, maxScale: number): Prop[] => {
      const props: Prop[] = [];
      const reach = MAX_GRID_SIZE / 2 + 15;
      for (let i = 0; i < candidates; i++) {
        const x = (random() * 2 - 1) * reach;
        const z = (random() * 2 - 1) * reach;
        const scale = minScale + random() * (maxScale - minScale);
        const rotation = random() * Math.PI * 2;
        if (clear(x, z, margin)) props.push({ x, z, scale, rotation });
      }
      return props;
    };

    this.addInstanced(treeGeometry(), scatter(120, 1.6, 0.8, 1.35), true);
    this.addInstanced(pineGeometry(), scatter(70, 1.6, 0.8, 1.3), true);
    this.addInstanced(bushGeometry(), scatter(105, 1.0, 0.6, 1.2), true);
    this.addInstanced(rockGeometry(), scatter(80, 0.9, 0.5, 1.5), true);
    this.addInstanced(tuftGeometry(), scatter(240, 0.7, 0.7, 1.3), false);
  }

  private addGround(pond: { x: number; z: number; radius: number }, halfW: number, halfH: number): void {
    const random = seededRandom(77);
    const parts: THREE.BufferGeometry[] = [];
    const disc = (x: number, z: number, radius: number, lift: number, color: number, segments = 28) => {
      const g = new THREE.CircleGeometry(radius, segments).rotateX(-Math.PI / 2).translate(x, GROUND_Y + lift, z);
      parts.push(paint(g, color));
    };

    disc(0, 0, 90, 0, 0x86b86a, 48);
    // Mottled lighter and darker grass so the lawn is not one flat colour.
    for (let i = 0; i < 26; i++) {
      const angle = random() * Math.PI * 2;
      const distance = 5 + random() * 20;
      disc(
        Math.cos(angle) * distance,
        Math.sin(angle) * distance,
        1.5 + random() * 3,
        0.004 + i * 0.0002,
        random() > 0.5 ? 0x93c474 : 0x7aad60,
        14,
      );
    }
    // Worn earth around the platform and a track leading away from it.
    parts.push(
      paint(
        new THREE.PlaneGeometry(halfW * 2 + 2.6, halfH * 2 + 2.6)
          .rotateX(-Math.PI / 2)
          .translate(0, GROUND_Y + 0.012, 0),
        0xa58f6c,
      ),
    );
    parts.push(
      paint(new THREE.PlaneGeometry(22, 2.2).rotateX(-Math.PI / 2).translate(halfW + 11, GROUND_Y + 0.012, 1), 0xa58f6c),
    );
    disc(pond.x, pond.z, pond.radius + 0.55, 0.014, 0xd9c895);
    disc(pond.x, pond.z, pond.radius, 0.02, 0x5fb0d6);
    disc(pond.x - 0.5, pond.z - 0.4, pond.radius * 0.55, 0.024, 0x7cc4e4);

    const ground = new THREE.Mesh(merge(parts), VERTEX_MATERIAL);
    ground.receiveShadow = true;
    this.group.add(ground);
  }

  private addInstanced(geometry: THREE.BufferGeometry, props: Prop[], castShadow: boolean): void {
    const mesh = new THREE.InstancedMesh(geometry, VERTEX_MATERIAL, props.length);
    const dummy = new THREE.Object3D();
    props.forEach((prop, i) => {
      dummy.position.set(prop.x, GROUND_Y, prop.z);
      dummy.rotation.set(0, prop.rotation, 0);
      dummy.scale.setScalar(prop.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    this.group.add(mesh);
  }
}

function treeGeometry(): THREE.BufferGeometry {
  return merge([
    cylinder(0.13, 0.18, 0.9, 6, 0, 0.45, 0, 0x7a5236),
    paint(new THREE.IcosahedronGeometry(0.75, 0).scale(1, 0.9, 1).translate(0, 1.35, 0), 0x4f9a4a),
    paint(new THREE.IcosahedronGeometry(0.5, 0).translate(0.3, 1.85, 0.1), 0x5fab55),
  ]);
}

function pineGeometry(): THREE.BufferGeometry {
  return merge([
    cylinder(0.1, 0.14, 0.6, 6, 0, 0.3, 0, 0x6b4a32),
    paint(new THREE.ConeGeometry(0.7, 1.0, 7).translate(0, 0.95, 0), 0x3d7f4a),
    paint(new THREE.ConeGeometry(0.52, 0.9, 7).translate(0, 1.5, 0), 0x47904f),
    paint(new THREE.ConeGeometry(0.34, 0.75, 7).translate(0, 2.0, 0), 0x52a05a),
  ]);
}

function bushGeometry(): THREE.BufferGeometry {
  return merge([
    paint(new THREE.IcosahedronGeometry(0.42, 0).scale(1, 0.75, 1).translate(0, 0.26, 0), 0x5da552),
    paint(new THREE.IcosahedronGeometry(0.3, 0).scale(1, 0.8, 1).translate(0.32, 0.2, 0.12), 0x6cb55e),
  ]);
}

function rockGeometry(): THREE.BufferGeometry {
  return merge([
    paint(new THREE.DodecahedronGeometry(0.42, 0).scale(1.2, 0.7, 1).translate(0, 0.2, 0), 0x9a9da3),
    paint(new THREE.DodecahedronGeometry(0.24, 0).scale(1, 0.8, 1.1).translate(0.42, 0.12, 0.2), 0x878a91),
  ]);
}

function tuftGeometry(): THREE.BufferGeometry {
  return merge([
    paint(new THREE.ConeGeometry(0.07, 0.3, 4).translate(0, 0.15, 0), 0x6aa851),
    paint(new THREE.ConeGeometry(0.06, 0.22, 4).translate(0.11, 0.11, 0.04), 0x74b35a),
    paint(new THREE.ConeGeometry(0.06, 0.24, 4).translate(-0.08, 0.12, 0.08), 0x64a04c),
  ]);
}
