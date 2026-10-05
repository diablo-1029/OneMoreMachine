import * as THREE from 'three';

/** Soft sky fill plus one shadow-casting sun, angled so shadows fall towards the camera's right. */
export class Lighting {
  readonly sun: THREE.DirectionalLight;

  constructor(scene: THREE.Scene) {
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb7c79a, 1.9));

    this.sun = new THREE.DirectionalLight(0xfff4e0, 2.3);
    this.sun.position.set(-11, 20, 9);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.03;
    scene.add(this.sun);
    scene.add(this.sun.target);
    this.setCoverage(12);
  }

  /** Sizes the shadow frustum to the factory plus a margin of scenery. */
  setCoverage(gridSize: number): void {
    const half = gridSize / 2 + 7;
    const cam = this.sun.shadow.camera;
    cam.left = -half;
    cam.right = half;
    cam.top = half;
    cam.bottom = -half;
    cam.near = 1;
    cam.far = 110;
    cam.updateProjectionMatrix();
  }

  setShadows(enabled: boolean): void {
    this.sun.castShadow = enabled;
  }
}
