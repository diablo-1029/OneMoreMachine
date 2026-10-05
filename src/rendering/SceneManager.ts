import * as THREE from 'three';
import { Lighting } from './Lighting';

/** The scene graph root and its lighting. */
export class SceneManager {
  readonly scene = new THREE.Scene();
  readonly lighting: Lighting;

  constructor() {
    // Matches the far grass so the ground appears to run to the horizon.
    this.scene.background = new THREE.Color(0x86b86a);
    this.lighting = new Lighting(this.scene);
  }
}
