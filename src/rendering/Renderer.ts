import * as THREE from 'three';

/** Thrown when the browser cannot provide a WebGL context. */
export class WebGLUnavailableError extends Error {}

/** Owns the WebGL renderer and keeps the canvas matched to its container. */
export class Renderer {
  readonly webgl: THREE.WebGLRenderer;
  private readonly resizeListeners: ((width: number, height: number) => void)[] = [];

  constructor(private readonly container: HTMLElement) {
    try {
      this.webgl = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      throw new WebGLUnavailableError();
    }
    this.webgl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.webgl.shadowMap.enabled = true;
    this.webgl.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.webgl.domElement);

    new ResizeObserver(() => this.resize()).observe(container);
    this.resize();

    // Browsers take the graphics context away now and then (a driver reset, too many tabs).
    // Asking to keep the canvas lets them hand it back, and three.js rebuilds what it needs.
    this.canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      for (const listener of this.contextListeners) listener(true);
    });
    this.canvas.addEventListener('webglcontextrestored', () => {
      for (const listener of this.contextListeners) listener(false);
    });
  }

  private readonly contextListeners: ((lost: boolean) => void)[] = [];

  /** Reports the graphics context being lost (true) and coming back (false). */
  onContextChange(listener: (lost: boolean) => void): void {
    this.contextListeners.push(listener);
  }

  get canvas(): HTMLCanvasElement {
    return this.webgl.domElement;
  }

  get width(): number {
    return Math.max(this.container.clientWidth, 1);
  }

  get height(): number {
    return Math.max(this.container.clientHeight, 1);
  }

  onResize(listener: (width: number, height: number) => void): void {
    this.resizeListeners.push(listener);
    listener(this.width, this.height);
  }

  private resize(): void {
    this.webgl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.webgl.setSize(this.width, this.height);
    for (const listener of this.resizeListeners) listener(this.width, this.height);
  }

  render(scene: THREE.Scene, camera: THREE.Camera): void {
    this.webgl.render(scene, camera);
  }
}
