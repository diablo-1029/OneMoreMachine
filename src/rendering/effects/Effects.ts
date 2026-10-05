import * as THREE from 'three';
import { ParticlePool } from './ParticlePool';

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** Swell quickly, then shrink away. */
const puff = (t: number) => (t < 0.25 ? 0.4 + (t / 0.25) * 0.6 : 1 - ((t - 0.25) / 0.75) ** 2);
const shrink = (t: number) => 1 - t * t;

/** Pooled particle effects: chimney smoke, placement dust, sparks and sale coins. */
export class Effects {
  private readonly smokePool: ParticlePool;
  private readonly dustPool: ParticlePool;
  private readonly sparkPool: ParticlePool;
  private readonly coinPool: ParticlePool;

  constructor(scene: THREE.Scene) {
    const blob = new THREE.IcosahedronGeometry(0.5, 0);
    this.smokePool = new ParticlePool(scene, {
      geometry: blob,
      material: new THREE.MeshBasicMaterial({ color: 0xe8e4de, transparent: true, opacity: 0.55, depthWrite: false }),
      capacity: 400,
      gravity: -0.15,
      drag: 0.6,
      scaleOverLife: puff,
      spin: 0.4,
    });
    this.dustPool = new ParticlePool(scene, {
      geometry: blob,
      material: new THREE.MeshBasicMaterial({ color: 0xd8cfbf, transparent: true, opacity: 0.6, depthWrite: false }),
      capacity: 300,
      gravity: 0.2,
      drag: 0.08,
      scaleOverLife: puff,
      spin: 0.6,
    });
    this.sparkPool = new ParticlePool(scene, {
      geometry: new THREE.BoxGeometry(0.5, 0.5, 1.4),
      material: new THREE.MeshBasicMaterial({ color: 0xffc04a }),
      capacity: 300,
      gravity: 6,
      drag: 0.5,
      scaleOverLife: shrink,
      spin: 9,
    });
    this.coinPool = new ParticlePool(scene, {
      geometry: new THREE.CylinderGeometry(0.5, 0.5, 0.16, 12).rotateX(Math.PI / 2),
      material: new THREE.MeshLambertMaterial({ color: 0xffcf40, emissive: 0x6b4a00 }),
      capacity: 120,
      gravity: 5,
      drag: 0.9,
      scaleOverLife: (t) => (t < 0.8 ? 1 : 1 - (t - 0.8) / 0.2),
      spin: 7,
    });
  }

  smoke(x: number, y: number, z: number): void {
    this.smokePool.spawn(x + rand(-0.04, 0.04), y, z + rand(-0.04, 0.04), rand(0.05, 0.25), rand(0.5, 0.8), rand(-0.1, 0.1), rand(1.4, 2.1), rand(0.22, 0.36));
  }

  /** Ring of dust kicked out along the ground, e.g. when something is placed or removed. */
  dust(x: number, y: number, z: number, radius: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + rand(-0.3, 0.3);
      const speed = rand(1.2, 2.2);
      this.dustPool.spawn(
        x + Math.cos(angle) * radius,
        y + 0.08,
        z + Math.sin(angle) * radius,
        Math.cos(angle) * speed,
        rand(0.2, 0.7),
        Math.sin(angle) * speed,
        rand(0.35, 0.6),
        rand(0.16, 0.28),
      );
    }
  }

  sparks(x: number, y: number, z: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = rand(0.8, 1.9);
      this.sparkPool.spawn(x, y, z, Math.cos(angle) * speed, rand(1.2, 2.4), Math.sin(angle) * speed, rand(0.3, 0.5), rand(0.035, 0.06));
    }
  }

  coin(x: number, y: number, z: number): void {
    this.coinPool.spawn(x, y, z, rand(-0.25, 0.25), rand(2.6, 3.2), rand(-0.25, 0.25), 0.75, 0.2);
  }

  update(dt: number): void {
    this.smokePool.update(dt);
    this.dustPool.update(dt);
    this.sparkPool.update(dt);
    this.coinPool.update(dt);
  }
}
