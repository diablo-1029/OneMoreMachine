import * as THREE from 'three';
import { getMachineDef, rotatedSize, worldPorts } from '../core/factory/MachineRegistry';
import type { Direction } from '../core/grid/GridPosition';
import { createMachineVisual } from '../machines/MachineVisualFactory';
import { straightBodyGeometry } from './ConveyorRenderer';
import { cellCenterX, cellCenterZ, dirAngle } from './WorldMapping';

const VALID = 0x4ade80;
const INVALID = 0xf87171;
const INPUT = 0x59c36a;
const OUTPUT = 0xff9d3c;

/** Flat arrow in the XZ plane pointing along +X. */
function arrowGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([0.2, 0, 0, -0.14, 0, -0.2, -0.14, 0, 0.2], 3),
  );
  return geometry;
}

/**
 * Everything drawn under the cursor: the translucent build ghost with its footprint and
 * port arrows, and the hover highlight used by the select and delete tools.
 */
export class PlacementRenderer {
  private readonly group = new THREE.Group();
  private readonly ghostMaterial = new THREE.MeshBasicMaterial({
    color: VALID,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });
  private readonly footprintMaterial = new THREE.MeshBasicMaterial({
    color: VALID,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  });
  private readonly footprint: THREE.Mesh;
  private readonly machineGhosts = new Map<string, THREE.Group>();
  private readonly conveyorGhost: THREE.Group;
  private readonly arrows: THREE.Mesh[] = [];
  private readonly arrowGeometry = arrowGeometry();
  private readonly inputMaterial = new THREE.MeshBasicMaterial({ color: INPUT, side: THREE.DoubleSide });
  private readonly outputMaterial = new THREE.MeshBasicMaterial({ color: OUTPUT, side: THREE.DoubleSide });
  // Faded versions for ports that would not connect to anything where the ghost is now.
  private readonly inputIdleMaterial = new THREE.MeshBasicMaterial({
    color: INPUT,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.4,
  });
  private readonly outputIdleMaterial = new THREE.MeshBasicMaterial({
    color: OUTPUT,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.4,
  });
  private activeGhost: THREE.Object3D | null = null;

  constructor(scene: THREE.Scene) {
    this.footprint = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), this.footprintMaterial);
    this.footprint.renderOrder = 5;
    this.group.add(this.footprint);

    this.conveyorGhost = new THREE.Group();
    this.conveyorGhost.add(new THREE.Mesh(straightBodyGeometry(), this.ghostMaterial));
    const arrow = new THREE.Mesh(this.arrowGeometry, this.outputMaterial);
    arrow.position.y = 0.2;
    arrow.scale.setScalar(1.3);
    this.conveyorGhost.add(arrow);
    this.conveyorGhost.visible = false;
    this.group.add(this.conveyorGhost);

    this.group.visible = false;
    scene.add(this.group);
  }

  private machineGhost(type: string): THREE.Group {
    let ghost = this.machineGhosts.get(type);
    if (!ghost) {
      // Reuse the real model so the ghost always matches what will be built.
      ghost = createMachineVisual(type).root;
      ghost.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.material = this.ghostMaterial;
          object.castShadow = false;
          object.receiveShadow = false;
        }
      });
      ghost.visible = false;
      this.machineGhosts.set(type, ghost);
      this.group.add(ghost);
    }
    return ghost;
  }

  private setFootprint(gridX: number, gridY: number, w: number, h: number, color: number, opacity: number): void {
    this.footprint.position.set(cellCenterX(gridX) + (w - 1) / 2, 0.012, cellCenterZ(gridY) + (h - 1) / 2);
    this.footprint.scale.set(w, 1, h);
    this.footprintMaterial.color.setHex(color);
    this.footprintMaterial.opacity = opacity;
    this.footprint.visible = true;
  }

  private activate(ghost: THREE.Object3D | null): void {
    if (this.activeGhost && this.activeGhost !== ghost) this.activeGhost.visible = false;
    this.activeGhost = ghost;
    if (ghost) ghost.visible = true;
    this.group.visible = true;
  }

  private hideArrows(from: number): void {
    for (let i = from; i < this.arrows.length; i++) this.arrows[i].visible = false;
  }

  /**
   * `connected[i]` says whether port i would link up with a belt or machine at this position;
   * linked ports get a larger, solid arrow so a correct orientation is obvious before clicking.
   */
  showMachine(
    type: string,
    gridX: number,
    gridY: number,
    rotation: Direction,
    valid: boolean,
    connected: boolean[] = [],
  ): void {
    const def = getMachineDef(type);
    const { w, h } = rotatedSize(def, rotation);
    const ghost = this.machineGhost(type);
    ghost.position.set(cellCenterX(gridX) + (w - 1) / 2, 0, cellCenterZ(gridY) + (h - 1) / 2);
    ghost.rotation.y = dirAngle(rotation);
    this.activate(ghost);

    const color = valid ? VALID : INVALID;
    this.ghostMaterial.color.setHex(color);
    this.setFootprint(gridX, gridY, w, h, color, 0.28);

    // Arrows just outside each port: green pointing in for inputs, orange pointing out for outputs.
    const ports = worldPorts(def, gridX, gridY, rotation);
    ports.forEach((port, i) => {
      let arrow = this.arrows[i];
      if (!arrow) {
        arrow = new THREE.Mesh(this.arrowGeometry, this.inputMaterial);
        arrow.renderOrder = 6;
        this.arrows.push(arrow);
        this.group.add(arrow);
      }
      const linked = connected[i] === true;
      if (port.type === 'input') arrow.material = linked ? this.inputMaterial : this.inputIdleMaterial;
      else arrow.material = linked ? this.outputMaterial : this.outputIdleMaterial;
      arrow.scale.setScalar(linked ? 1.5 : 1);
      arrow.position.set(cellCenterX(port.outerX), 0.03, cellCenterZ(port.outerY));
      // Input arrows point back into the machine.
      arrow.rotation.y = dirAngle(port.side) + (port.type === 'input' ? Math.PI : 0);
      arrow.visible = true;
    });
    this.hideArrows(ports.length);
  }

  showConveyor(gridX: number, gridY: number, direction: Direction, valid: boolean): void {
    this.conveyorGhost.position.set(cellCenterX(gridX), 0, cellCenterZ(gridY));
    this.conveyorGhost.rotation.y = dirAngle(direction);
    this.activate(this.conveyorGhost);
    const color = valid ? VALID : INVALID;
    this.ghostMaterial.color.setHex(color);
    this.setFootprint(gridX, gridY, 1, 1, color, 0.28);
    this.hideArrows(0);
  }

  /** Tints a block of cells without a ghost; used for hover in select and delete modes. */
  showHighlight(gridX: number, gridY: number, w: number, h: number, kind: 'hover' | 'delete'): void {
    this.activate(null);
    this.setFootprint(gridX, gridY, w, h, kind === 'delete' ? INVALID : 0xffffff, kind === 'delete' ? 0.5 : 0.22);
    this.hideArrows(0);
  }

  hide(): void {
    this.group.visible = false;
  }
}
