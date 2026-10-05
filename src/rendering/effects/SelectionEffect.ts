import * as THREE from 'three';
import { cellCenterX, cellCenterZ } from '../WorldMapping';

const THICKNESS = 0.07;

/** A pulsing outline around the selected entity's footprint, drawn over everything else. */
export class SelectionEffect {
  private readonly group = new THREE.Group();
  private readonly edges: THREE.Mesh[] = [];
  private readonly material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    depthTest: false,
  });

  constructor(scene: THREE.Scene) {
    const geometry = new THREE.BoxGeometry(1, 0.04, 1);
    for (let i = 0; i < 4; i++) {
      const edge = new THREE.Mesh(geometry, this.material);
      edge.renderOrder = 10;
      this.edges.push(edge);
      this.group.add(edge);
    }
    this.group.visible = false;
    scene.add(this.group);
  }

  /** Outlines the w×h block of cells whose top-left cell is (gridX, gridY). */
  show(gridX: number, gridY: number, w: number, h: number): void {
    this.group.visible = true;
    this.group.position.set(cellCenterX(gridX) + (w - 1) / 2, 0.03, cellCenterZ(gridY) + (h - 1) / 2);
    const [north, south, west, east] = this.edges;
    north.scale.set(w + THICKNESS, 1, THICKNESS);
    north.position.set(0, 0, -h / 2);
    south.scale.set(w + THICKNESS, 1, THICKNESS);
    south.position.set(0, 0, h / 2);
    west.scale.set(THICKNESS, 1, h + THICKNESS);
    west.position.set(-w / 2, 0, 0);
    east.scale.set(THICKNESS, 1, h + THICKNESS);
    east.position.set(w / 2, 0, 0);
  }

  hide(): void {
    this.group.visible = false;
  }

  update(time: number): void {
    if (!this.group.visible) return;
    this.material.opacity = 0.65 + Math.sin(time * 5) * 0.3;
  }
}
