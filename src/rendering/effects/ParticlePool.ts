import * as THREE from 'three';

export interface ParticleConfig {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  capacity: number;
  /** Downward acceleration in units/s²; negative values make particles rise faster. */
  gravity: number;
  /** Velocity kept per second (1 = no drag). */
  drag: number;
  /** Size multiplier over the particle's life, t in 0..1. */
  scaleOverLife: (t: number) => number;
  /** Radians per second of tumble. */
  spin: number;
}

/**
 * Fixed-capacity particle system drawn as one InstancedMesh. Particles live in flat
 * arrays and dead ones are swap-removed, so spawning never allocates.
 */
export class ParticlePool {
  private readonly mesh: THREE.InstancedMesh;
  private readonly data: Float32Array;
  private count = 0;
  private readonly dummy = new THREE.Object3D();

  // Per-particle layout: x y z vx vy vz age life size phase
  private static readonly STRIDE = 10;

  constructor(
    scene: THREE.Scene,
    private readonly config: ParticleConfig,
  ) {
    this.data = new Float32Array(config.capacity * ParticlePool.STRIDE);
    this.mesh = new THREE.InstancedMesh(config.geometry, config.material, config.capacity);
    this.mesh.count = 0;
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);
  }

  spawn(x: number, y: number, z: number, vx: number, vy: number, vz: number, life: number, size: number): void {
    if (this.count >= this.config.capacity) return;
    const o = this.count++ * ParticlePool.STRIDE;
    const d = this.data;
    d[o] = x;
    d[o + 1] = y;
    d[o + 2] = z;
    d[o + 3] = vx;
    d[o + 4] = vy;
    d[o + 5] = vz;
    d[o + 6] = 0;
    d[o + 7] = life;
    d[o + 8] = size;
    d[o + 9] = Math.random() * Math.PI * 2;
  }

  update(dt: number): void {
    const { STRIDE } = ParticlePool;
    const { gravity, drag, scaleOverLife, spin } = this.config;
    const d = this.data;
    const damping = Math.pow(drag, dt);

    let i = 0;
    while (i < this.count) {
      const o = i * STRIDE;
      d[o + 6] += dt;
      if (d[o + 6] >= d[o + 7]) {
        // Swap the last live particle into this slot and re-process it.
        this.count--;
        d.copyWithin(o, this.count * STRIDE, (this.count + 1) * STRIDE);
        continue;
      }
      d[o + 4] -= gravity * dt;
      d[o + 3] *= damping;
      d[o + 4] *= damping;
      d[o + 5] *= damping;
      d[o] += d[o + 3] * dt;
      d[o + 1] += d[o + 4] * dt;
      d[o + 2] += d[o + 5] * dt;

      const t = d[o + 6] / d[o + 7];
      this.dummy.position.set(d[o], d[o + 1], d[o + 2]);
      this.dummy.scale.setScalar(Math.max(d[o + 8] * scaleOverLife(t), 0.0001));
      const angle = d[o + 9] + d[o + 6] * spin;
      this.dummy.rotation.set(angle, angle * 0.7, 0);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
      i++;
    }

    this.mesh.count = this.count;
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
