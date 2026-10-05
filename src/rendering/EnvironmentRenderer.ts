import * as THREE from 'three';
import type { EnvironmentTheme } from '../data/environments';
import { MAX_GRID_SIZE } from '../data/expansion';
import { box, cylinder, merge, paint, seededRandom } from './GeometryUtils';
import { VERTEX_MATERIAL } from './Materials';

const GROUND_Y = -0.56;

interface Prop {
  x: number;
  z: number;
  scale: number;
  rotation: number;
}

/** The five kinds of scattered scenery, from tallest to smallest. Each environment supplies its own. */
interface SceneryKit {
  tall: THREE.BufferGeometry;
  medium: THREE.BufferGeometry;
  low: THREE.BufferGeometry;
  rock: THREE.BufferGeometry;
  tuft: THREE.BufferGeometry;
}

/**
 * Decorative terrain around the buildable platform: ground, a pond, a worn track, and
 * instanced plants and rocks, all coloured and chosen by the environment's theme.
 * Purely visual; nothing here is simulated.
 */
export class EnvironmentRenderer {
  private readonly group = new THREE.Group();

  constructor(scene: THREE.Scene) {
    scene.add(this.group);
  }

  build(gridWidth: number, gridHeight: number, theme: EnvironmentTheme): void {
    for (const child of [...this.group.children]) {
      this.group.remove(child);
      if (child instanceof THREE.Mesh) child.geometry.dispose();
    }

    const random = seededRandom(20240607);
    const halfW = gridWidth / 2;
    const halfH = gridHeight / 2;
    const pond = { x: -halfW - 5.5, z: halfH + 1.5, radius: 3.1 };

    this.addGround(pond, halfW, halfH, theme);

    const clear = (x: number, z: number, margin: number): boolean => {
      if (Math.abs(x) < halfW + margin && Math.abs(z) < halfH + margin) return false;
      if (Math.hypot(x - pond.x, z - pond.z) < pond.radius + margin) return false;
      // Keep the track that leads off the east side clear.
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

    const kit = SCENERY[theme.scenery]();
    // Deserts and tundra are sparser than a meadow; the same candidates are simply thinned out.
    const density = theme.scenery === 'meadow' ? 1 : 0.55;
    const thin = (props: Prop[]) => props.filter((_, i) => (i * 0.618) % 1 < density);
    this.addInstanced(kit.tall, thin(scatter(120, 1.6, 0.8, 1.35)), true);
    this.addInstanced(kit.medium, thin(scatter(70, 1.6, 0.8, 1.3)), true);
    this.addInstanced(kit.low, thin(scatter(105, 1.0, 0.6, 1.2)), true);
    this.addInstanced(kit.rock, scatter(80, 0.9, 0.5, 1.5), true);
    this.addInstanced(kit.tuft, thin(scatter(240, 0.7, 0.7, 1.3)), false);
  }

  private addGround(
    pond: { x: number; z: number; radius: number },
    halfW: number,
    halfH: number,
    theme: EnvironmentTheme,
  ): void {
    const random = seededRandom(77);
    const parts: THREE.BufferGeometry[] = [];
    const disc = (x: number, z: number, radius: number, lift: number, color: number, segments = 28) => {
      const g = new THREE.CircleGeometry(radius, segments).rotateX(-Math.PI / 2).translate(x, GROUND_Y + lift, z);
      parts.push(paint(g, color));
    };

    disc(0, 0, 90, 0, theme.ground, 48);
    // Mottled lighter and darker patches so the ground is not one flat colour.
    for (let i = 0; i < 26; i++) {
      const angle = random() * Math.PI * 2;
      const distance = 5 + random() * 20;
      disc(
        Math.cos(angle) * distance,
        Math.sin(angle) * distance,
        1.5 + random() * 3,
        0.004 + i * 0.0002,
        random() > 0.5 ? theme.groundLight : theme.groundDark,
        14,
      );
    }
    // Worn earth around the platform and a track leading away from it.
    parts.push(
      paint(
        new THREE.PlaneGeometry(halfW * 2 + 2.6, halfH * 2 + 2.6)
          .rotateX(-Math.PI / 2)
          .translate(0, GROUND_Y + 0.012, 0),
        theme.track,
      ),
    );
    parts.push(
      paint(
        new THREE.PlaneGeometry(22, 2.2).rotateX(-Math.PI / 2).translate(halfW + 11, GROUND_Y + 0.012, 1),
        theme.track,
      ),
    );
    disc(pond.x, pond.z, pond.radius + 0.55, 0.014, theme.shore);
    disc(pond.x, pond.z, pond.radius, 0.02, theme.water);
    disc(pond.x - 0.5, pond.z - 0.4, pond.radius * 0.55, 0.024, theme.waterLight);

    const ground = new THREE.Mesh(merge(parts), VERTEX_MATERIAL);
    ground.receiveShadow = true;
    this.group.add(ground);
  }

  private addInstanced(geometry: THREE.BufferGeometry, props: Prop[], castShadow: boolean): void {
    const mesh = new THREE.InstancedMesh(geometry, VERTEX_MATERIAL, Math.max(props.length, 1));
    mesh.count = props.length;
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

const ico = (radius: number, sx: number, sy: number, sz: number, x: number, y: number, z: number, color: number) =>
  paint(new THREE.IcosahedronGeometry(radius, 0).scale(sx, sy, sz).translate(x, y, z), color);

const cone = (radius: number, height: number, segments: number, x: number, y: number, z: number, color: number) =>
  paint(new THREE.ConeGeometry(radius, height, segments).translate(x, y, z), color);

const boulder = (color: number, colorDark: number) =>
  merge([
    paint(new THREE.DodecahedronGeometry(0.42, 0).scale(1.2, 0.7, 1).translate(0, 0.2, 0), color),
    paint(new THREE.DodecahedronGeometry(0.24, 0).scale(1, 0.8, 1.1).translate(0.42, 0.12, 0.2), colorDark),
  ]);

const SCENERY: Record<EnvironmentTheme['scenery'], () => SceneryKit> = {
  meadow: () => ({
    // Round-crowned tree.
    tall: merge([
      cylinder(0.13, 0.18, 0.9, 6, 0, 0.45, 0, 0x7a5236),
      ico(0.75, 1, 0.9, 1, 0, 1.35, 0, 0x4f9a4a),
      ico(0.5, 1, 1, 1, 0.3, 1.85, 0.1, 0x5fab55),
    ]),
    // Pine.
    medium: merge([
      cylinder(0.1, 0.14, 0.6, 6, 0, 0.3, 0, 0x6b4a32),
      cone(0.7, 1.0, 7, 0, 0.95, 0, 0x3d7f4a),
      cone(0.52, 0.9, 7, 0, 1.5, 0, 0x47904f),
      cone(0.34, 0.75, 7, 0, 2.0, 0, 0x52a05a),
    ]),
    low: merge([ico(0.42, 1, 0.75, 1, 0, 0.26, 0, 0x5da552), ico(0.3, 1, 0.8, 1, 0.32, 0.2, 0.12, 0x6cb55e)]),
    rock: boulder(0x9a9da3, 0x878a91),
    tuft: merge([
      cone(0.07, 0.3, 4, 0, 0.15, 0, 0x6aa851),
      cone(0.06, 0.22, 4, 0.11, 0.11, 0.04, 0x74b35a),
      cone(0.06, 0.24, 4, -0.08, 0.12, 0.08, 0x64a04c),
    ]),
  }),

  dunes: () => ({
    // Saguaro cactus: a trunk with two raised arms.
    tall: merge([
      cylinder(0.17, 0.19, 1.7, 8, 0, 0.85, 0, 0x5f9a58),
      ico(0.17, 1, 1, 1, 0, 1.7, 0, 0x5f9a58),
      box(0.42, 0.14, 0.14, 0.26, 0.8, 0, 0x568f50),
      cylinder(0.1, 0.1, 0.6, 6, 0.44, 1.1, 0, 0x568f50),
      box(0.36, 0.14, 0.14, -0.24, 1.05, 0, 0x568f50),
      cylinder(0.1, 0.1, 0.45, 6, -0.4, 1.28, 0, 0x568f50),
    ]),
    // Palm: a leaning trunk with a spray of fronds.
    medium: merge([
      cylinder(0.09, 0.14, 1.5, 6, 0, 0.75, 0, 0x8a6a44),
      ...[0, 1, 2, 3, 4].map((i) =>
        paint(
          new THREE.BoxGeometry(0.9, 0.05, 0.24)
            .translate(0.42, 0, 0)
            .rotateZ(-0.35)
            .rotateY((i * Math.PI * 2) / 5)
            .translate(0, 1.5, 0),
          i % 2 === 0 ? 0x6fa64d : 0x7db458,
        ),
      ),
    ]),
    // Dry scrub.
    low: merge([ico(0.36, 1, 0.6, 1, 0, 0.2, 0, 0xa9a05a), ico(0.24, 1, 0.65, 1, 0.3, 0.15, 0.1, 0xb9ad66)]),
    rock: boulder(0xc98f5e, 0xb57a4c),
    tuft: merge([
      cone(0.05, 0.26, 4, 0, 0.13, 0, 0xb9a45c),
      cone(0.045, 0.2, 4, 0.1, 0.1, 0.04, 0xc9b56a),
    ]),
  }),

  tundra: () => ({
    // Snow-laden pine.
    tall: merge([
      cylinder(0.1, 0.14, 0.6, 6, 0, 0.3, 0, 0x5a4232),
      cone(0.7, 1.0, 7, 0, 0.95, 0, 0x2f6b55),
      cone(0.52, 0.9, 7, 0, 1.5, 0, 0x377a60),
      cone(0.36, 0.6, 7, 0, 1.98, 0, 0xf2f6fa),
      cone(0.56, 0.22, 7, 0, 1.38, 0, 0xf2f6fa),
    ]),
    // Smaller fir, mostly white.
    medium: merge([
      cylinder(0.08, 0.1, 0.4, 6, 0, 0.2, 0, 0x5a4232),
      cone(0.5, 0.8, 6, 0, 0.7, 0, 0x377a60),
      cone(0.34, 0.6, 6, 0, 1.15, 0, 0xeaf1f6),
    ]),
    // Snow drift.
    low: merge([ico(0.5, 1.3, 0.4, 1, 0, 0.08, 0, 0xf4f8fb), ico(0.3, 1.2, 0.4, 1, 0.42, 0.05, 0.14, 0xe2eaf1)]),
    // Dark rock with a cap of snow.
    rock: merge([
      boulder(0x6d7480, 0x5d646f),
      paint(new THREE.DodecahedronGeometry(0.34, 0).scale(1.15, 0.3, 0.95).translate(0, 0.42, 0), 0xf4f8fb),
    ]),
    // Frozen reeds.
    tuft: merge([
      cone(0.04, 0.24, 4, 0, 0.12, 0, 0x9fb4c2),
      cone(0.035, 0.18, 4, 0.09, 0.09, 0.04, 0xb3c6d2),
    ]),
  }),
};
