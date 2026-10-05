import * as THREE from 'three';
import type { FactoryState } from '../core/factory/FactoryState';
import { getMachineDef, rotatedSize, worldPorts } from '../core/factory/MachineRegistry';
import { DIR_VECTORS } from '../core/grid/GridPosition';
import { cellCenterX, cellCenterZ } from './WorldMapping';

/** Development overlays: grid coordinates, machine footprints and port markers. */
export class DebugRenderer {
  private readonly group = new THREE.Group();
  private coordinates: THREE.Mesh | null = null;
  private readonly footprints = new THREE.Group();
  private readonly footprintMaterial = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, depthTest: false });
  private readonly inputMaterial = new THREE.MeshBasicMaterial({ color: 0x22c55e, depthTest: false });
  private readonly outputMaterial = new THREE.MeshBasicMaterial({ color: 0xf97316, depthTest: false });
  private readonly plane = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  private readonly marker = new THREE.SphereGeometry(0.1, 8, 6);

  constructor(scene: THREE.Scene) {
    this.footprints.visible = false;
    this.group.add(this.footprints);
    scene.add(this.group);
  }

  setCoordinatesVisible(visible: boolean, width: number, height: number): void {
    if (visible && !this.coordinates) this.coordinates = this.buildCoordinates(width, height);
    if (this.coordinates) this.coordinates.visible = visible;
  }

  /** One textured plane for the whole grid, rather than a label object per cell. */
  private buildCoordinates(width: number, height: number): THREE.Mesh {
    const cell = 64;
    const canvas = document.createElement('canvas');
    canvas.width = width * cell;
    canvas.height = height * cell;
    const ctx = canvas.getContext('2d')!;
    ctx.font = '600 15px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(20, 30, 50, 0.75)';
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) ctx.fillText(`${x},${y}`, x * cell + cell / 2, y * cell + cell / 2);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }),
    );
    mesh.position.y = 0.008;
    this.group.add(mesh);
    return mesh;
  }

  /** Discards the coordinate overlay so it is redrawn for a new floor size. */
  resize(width: number, height: number): void {
    if (!this.coordinates) return;
    const wasVisible = this.coordinates.visible;
    this.group.remove(this.coordinates);
    this.coordinates.geometry.dispose();
    this.coordinates = null;
    this.setCoordinatesVisible(wasVisible, width, height);
  }

  setFootprintsVisible(visible: boolean): void {
    this.footprints.visible = visible;
  }

  /** Rebuilds footprint and port markers. Only does work while the overlay is showing. */
  refresh(factory: FactoryState): void {
    if (!this.footprints.visible) return;
    this.footprints.clear();
    for (const machine of factory.machines.values()) {
      const def = getMachineDef(machine.type);
      const { w, h } = rotatedSize(def, machine.rotation);
      const outline = new THREE.Mesh(this.plane, this.footprintMaterial);
      outline.scale.set(w, 1, h);
      outline.position.set(cellCenterX(machine.gridX) + (w - 1) / 2, 0.02, cellCenterZ(machine.gridY) + (h - 1) / 2);
      this.footprints.add(outline);
      for (const port of worldPorts(def, machine.gridX, machine.gridY, machine.rotation)) {
        const marker = new THREE.Mesh(this.marker, port.type === 'input' ? this.inputMaterial : this.outputMaterial);
        marker.position.set(
          cellCenterX(port.x) + DIR_VECTORS[port.side].x * 0.5,
          0.6,
          cellCenterZ(port.y) + DIR_VECTORS[port.side].y * 0.5,
        );
        this.footprints.add(marker);
      }
    }
  }
}
