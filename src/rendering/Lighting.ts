import * as THREE from 'three';
import { LIGHT_STYLES, type LightStyle } from '../data/cosmetics';

/** Soft sky fill plus one shadow-casting sun, angled so shadows fall towards the camera's right. */
export class Lighting {
  readonly sun: THREE.DirectionalLight;
  private readonly sky: THREE.HemisphereLight;
  /** The environment's sunlight colour, before the lighting style tints it. */
  private readonly themeSun = new THREE.Color(0xfff4e0);
  private style: LightStyle = LIGHT_STYLES[0];
  private readonly tint = new THREE.Color();

  constructor(scene: THREE.Scene) {
    this.sky = new THREE.HemisphereLight(0xffffff, 0xb7c79a, 1.9);
    scene.add(this.sky);

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

  /** Tints the light for an environment: the colour bounced up from its ground, and its sunlight. */
  setColors(bounce: number, sun: number): void {
    this.sky.groundColor.setHex(bounce);
    this.themeSun.setHex(sun);
    this.applyStyle();
  }

  /** Changes the time of day: how strong and warm the sun is, and how low it stands. */
  setStyle(style: LightStyle): void {
    this.style = style;
    this.applyStyle();
  }

  private applyStyle(): void {
    this.sun.color.copy(this.themeSun).multiply(this.tint.setHex(this.style.sunTint));
    this.sun.intensity = this.style.sunIntensity;
    this.sky.intensity = this.style.skyIntensity;
    this.sun.position.set(...this.style.sunPosition);
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
