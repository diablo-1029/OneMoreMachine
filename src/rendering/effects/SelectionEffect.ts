import * as THREE from 'three';
import { cellCenterX, cellCenterZ } from '../WorldMapping';

const THICKNESS = 0.07;
const RING_SEGMENTS = 96;
const GOOD = 0x4ade80;
const FAIR = 0xfbbf24;
const POOR = 0xf87171;

/**
 * A pulsing outline around the selected entity's footprint, drawn over everything else, and
 * for machines that make things a gauge on the ground around it: a ring that fills with the
 * share of its time the machine spends working.
 */
export class SelectionEffect {
  private readonly group = new THREE.Group();
  private readonly edges: THREE.Mesh[] = [];
  private readonly material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    depthTest: false,
  });
  private readonly gauge = new THREE.Group();
  private readonly gaugeFill: THREE.Mesh;
  private readonly gaugeMaterial = new THREE.MeshBasicMaterial({ color: GOOD, transparent: true, opacity: 0.95, depthTest: false });
  /** The share being shown, which eases towards the share last reported. */
  private shownShare = 0;
  private targetShare: number | null = null;

  constructor(scene: THREE.Scene) {
    const geometry = new THREE.BoxGeometry(1, 0.04, 1);
    for (let i = 0; i < 4; i++) {
      const edge = new THREE.Mesh(geometry, this.material);
      edge.renderOrder = 10;
      this.edges.push(edge);
      this.group.add(edge);
    }

    const ring = () => new THREE.RingGeometry(0.93, 1, RING_SEGMENTS).rotateX(-Math.PI / 2);
    const track = new THREE.Mesh(
      ring(),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, depthTest: false }),
    );
    track.renderOrder = 9;
    this.gaugeFill = new THREE.Mesh(ring(), this.gaugeMaterial);
    this.gaugeFill.renderOrder = 10;
    this.gauge.add(track, this.gaugeFill);
    this.gauge.visible = false;
    this.group.add(this.gauge);

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
    // The gauge clears the corners of the footprint.
    const radius = Math.hypot(w, h) / 2 + 0.22;
    this.gauge.scale.set(radius, 1, radius);
  }

  hide(): void {
    this.group.visible = false;
  }

  /**
   * Sets what the gauge reads: the share of time (0–1) the selected machine has been working,
   * or null for things with nothing to measure.
   */
  setEfficiency(share: number | null): void {
    if (share !== null && this.targetShare === null) this.shownShare = share;
    this.targetShare = share;
    this.gauge.visible = share !== null;
  }

  update(time: number): void {
    if (!this.group.visible) return;
    this.material.opacity = 0.65 + Math.sin(time * 5) * 0.3;
    if (this.targetShare === null) return;
    this.shownShare += (this.targetShare - this.shownShare) * 0.12;
    const share = Math.min(Math.max(this.shownShare, 0), 1);
    // Each segment of the ring is two triangles; drawing fewer of them leaves an arc.
    this.gaugeFill.geometry.setDrawRange(0, Math.round(share * RING_SEGMENTS) * 6);
    this.gaugeMaterial.color.setHex(share >= 0.9 ? GOOD : share >= 0.6 ? FAIR : POOR);
  }
}
