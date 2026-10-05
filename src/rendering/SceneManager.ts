import * as THREE from 'three';
import type { EnvironmentTheme } from '../data/environments';
import { Lighting } from './Lighting';

/** The scene graph root and its lighting. */
export class SceneManager {
  readonly scene = new THREE.Scene();
  readonly lighting: Lighting;

  private readonly background = new THREE.Color(0x86b86a);

  constructor() {
    this.scene.background = this.background;
    this.lighting = new Lighting(this.scene);
  }

  /** Recolours the backdrop and lighting for an environment. */
  setTheme(theme: EnvironmentTheme): void {
    // The background matches the far ground, so the land appears to run to the horizon.
    this.background.setHex(theme.ground);
    this.lighting.setColors(theme.bounce, theme.sun);
  }
}
