import * as THREE from 'three';
import { getMachineDef } from '../core/factory/MachineRegistry';
import type { MachineState } from '../core/factory/MachineState';
import { DIR_VECTORS } from '../core/grid/GridPosition';
import { BELT_SURFACE_Y } from '../rendering/ConveyorRenderer';
import { box, cylinder, merge } from '../rendering/GeometryUtils';
import { PALETTE } from '../rendering/Materials';
import { MachineVisual } from './MachineVisual';

const staticCache = new Map<string, THREE.BufferGeometry>();
let pointerGeometry: THREE.BufferGeometry | null = null;

/**
 * A one-tile junction at belt height, so items visibly ride straight across it. Corner
 * pylons carry the machine's colour, and a strip on each open edge marks it as an input
 * (green) or output (orange), generated from the definition's ports.
 */
function buildStatic(type: string, accent: number): THREE.BufferGeometry {
  const def = getMachineDef(type);
  const parts = [
    box(1, 0.11, 1, 0, 0.055, 0, PALETTE.slate),
    box(0.84, 0.012, 0.84, 0, BELT_SURFACE_Y - 0.004, 0, 0x262a31),
  ];
  for (const x of [-0.41, 0.41]) {
    for (const z of [-0.41, 0.41]) {
      parts.push(box(0.18, 0.34, 0.18, x, 0.17, z, accent));
      parts.push(box(0.2, 0.04, 0.2, x, 0.36, z, PALETTE.slateDark));
    }
  }
  for (const port of def.ports) {
    const side = DIR_VECTORS[port.side];
    const color = port.type === 'input' ? PALETTE.inputGreen : PALETTE.outputOrange;
    const alongX = side.x !== 0;
    parts.push(box(alongX ? 0.07 : 0.62, 0.02, alongX ? 0.62 : 0.07, side.x * 0.46, BELT_SURFACE_Y + 0.004, side.y * 0.46, color));
  }
  return merge(parts);
}

/** A flat pointer inset in the deck. Modelled pointing along +X. */
function buildPointer(): THREE.BufferGeometry {
  return merge([
    cylinder(0.2, 0.2, 0.01, 16, 0, 0, 0, PALETTE.slateLight),
    box(0.26, 0.012, 0.07, 0.02, 0.004, 0, PALETTE.yellow),
    box(0.1, 0.012, 0.16, 0.13, 0.004, 0, PALETTE.yellow),
  ]);
}

/** Shared visual for splitters and mergers. */
export class RouterVisual extends MachineVisual {
  private readonly pointer: THREE.Mesh;
  private readonly outputSides: number[];
  private angle = 0;

  constructor(type: string, accent: number) {
    let geometry = staticCache.get(type);
    if (!geometry) {
      geometry = buildStatic(type, accent);
      staticCache.set(type, geometry);
    }
    pointerGeometry ??= buildPointer();
    super(geometry);

    this.pointer = this.addPart(pointerGeometry);
    this.pointer.castShadow = false;
    this.pointer.position.y = BELT_SURFACE_Y + 0.003;
    this.outputSides = getMachineDef(type)
      .ports.filter((p) => p.type === 'output')
      .map((p) => p.side);
  }

  protected animate(state: MachineState, dt: number): void {
    // Point at the output that was served last. For a merger that is always its one exit.
    const count = this.outputSides.length;
    const last = this.outputSides[(state.routeIndex - 1 + count) % count] ?? 0;
    const target = -last * (Math.PI / 2);
    // Turn the short way round.
    const diff = Math.atan2(Math.sin(target - this.angle), Math.cos(target - this.angle));
    this.angle += diff * Math.min(1, dt * 14);
    this.pointer.rotation.y = this.angle;
  }
}
