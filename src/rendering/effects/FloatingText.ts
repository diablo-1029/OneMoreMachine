import * as THREE from 'three';

const LIFETIME = 1.1;
const POOL_SIZE = 24;

interface Label {
  element: HTMLDivElement;
  position: THREE.Vector3;
  age: number;
  active: boolean;
}

/** Small "+$12" style labels that rise from a world position. DOM elements are pooled. */
export class FloatingText {
  private readonly labels: Label[] = [];
  private readonly projected = new THREE.Vector3();
  private next = 0;

  constructor(container: HTMLElement) {
    for (let i = 0; i < POOL_SIZE; i++) {
      const element = document.createElement('div');
      element.className = 'floating-text';
      element.style.display = 'none';
      container.appendChild(element);
      this.labels.push({ element, position: new THREE.Vector3(), age: 0, active: false });
    }
  }

  spawn(x: number, y: number, z: number, text: string): void {
    const label = this.labels[this.next];
    this.next = (this.next + 1) % POOL_SIZE;
    label.position.set(x, y, z);
    label.age = 0;
    label.active = true;
    label.element.textContent = text;
    label.element.style.display = 'block';
  }

  update(dt: number, camera: THREE.Camera, width: number, height: number, rise = true): void {
    for (const label of this.labels) {
      if (!label.active) continue;
      label.age += dt;
      if (label.age >= LIFETIME) {
        label.active = false;
        label.element.style.display = 'none';
        continue;
      }
      const t = label.age / LIFETIME;
      this.projected.copy(label.position);
      if (rise) this.projected.y += t * 0.9;
      this.projected.project(camera);
      const sx = (this.projected.x * 0.5 + 0.5) * width;
      const sy = (-this.projected.y * 0.5 + 0.5) * height;
      label.element.style.transform = `translate(-50%, -50%) translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px)`;
      label.element.style.opacity = String(t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3);
    }
  }
}
