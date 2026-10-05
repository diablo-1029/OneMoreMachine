import * as THREE from 'three';
import type { FactoryState } from '../core/factory/FactoryState';
import { getMachineDef } from '../core/factory/MachineRegistry';
import type { FactoryMetrics } from '../core/stats/FactoryMetrics';
import { machineCenter } from '../rendering/MachineRenderer';
import { uiScale } from './preferences';

const MAX_LABELS = 48;
/** Labels are only shown when zoomed in at least this far; further out they would overlap. */
const MAX_ZOOM_SCALE = 1.5;

/**
 * Numbers for the bottleneck view. The view colours each machine by how busy it is; these
 * put the percentage next to it, so the reading never depends on telling colours apart.
 */
export class EfficiencyLabels {
  private readonly layer: HTMLElement;
  private readonly labels: HTMLElement[] = [];
  private readonly point = new THREE.Vector3();
  private used = 0;

  constructor(root: HTMLElement) {
    this.layer = document.createElement('div');
    this.layer.className = 'efficiency-labels';
    this.layer.setAttribute('aria-hidden', 'true');
    root.append(this.layer);
  }

  private label(index: number): HTMLElement {
    let label = this.labels[index];
    if (!label) {
      label = document.createElement('div');
      label.className = 'efficiency-label';
      this.layer.append(label);
      this.labels[index] = label;
    }
    return label;
  }

  update(
    enabled: boolean,
    factory: FactoryState,
    metrics: FactoryMetrics,
    camera: THREE.Camera,
    zoomScale: number,
    width: number,
    height: number,
  ): void {
    let count = 0;
    if (enabled && zoomScale <= MAX_ZOOM_SCALE) {
      const scale = uiScale();
      for (const machine of factory.machines.values()) {
        if (count >= MAX_LABELS) break;
        if (getMachineDef(machine.type).behavior !== 'crafter' || !machine.enabled) continue;
        const shares = metrics.shares(machine.id);
        if (shares.observed < 3) continue;
        machineCenter(machine, this.point);
        this.point.y = 0.05;
        this.point.project(camera);
        // Off-screen machines need no label.
        if (Math.abs(this.point.x) > 1.05 || Math.abs(this.point.y) > 1.05) continue;

        const label = this.label(count++);
        const text = `${Math.round(shares.working * 100)}%`;
        if (label.textContent !== text) label.textContent = text;
        label.dataset.level = shares.working >= 0.9 ? 'good' : shares.working >= 0.6 ? 'fair' : 'poor';
        const x = ((this.point.x * 0.5 + 0.5) * width) / scale;
        const y = ((-this.point.y * 0.5 + 0.5) * height) / scale;
        label.style.transform = `translate(-50%, 0) translate(${x.toFixed(1)}px, ${(y + 16).toFixed(1)}px)`;
        label.style.display = 'block';
      }
    }
    for (let i = count; i < this.used; i++) this.labels[i].style.display = 'none';
    this.used = count;
  }
}
