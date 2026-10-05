import * as THREE from 'three';
import type { CameraController } from '../rendering/CameraController';
import type { PlacementController } from './PlacementController';

/** Pixels the pointer may move before a press counts as a drag rather than a click. */
const DRAG_THRESHOLD = 5;

/**
 * Translates raw pointer and wheel events on the canvas into camera movement and
 * placement actions.
 *   left      place / select (drag pans when the select tool is active)
 *   middle    pan
 *   right     pan when dragged, cancel when clicked
 *   wheel     zoom towards the cursor
 */
export class PointerController {
  enabled = true;
  private button = -1;
  private downX = 0;
  private downY = 0;
  /** Cursor position at press, in NDC; a pan grabs the ground here, not where the drag was detected. */
  private downNdc = { x: 0, y: 0 };
  private dragged = false;
  private panning = false;
  private readonly panAnchor = new THREE.Vector3();
  private readonly scratch = new THREE.Vector3();

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly camera: CameraController,
    private readonly placement: PlacementController,
  ) {
    canvas.addEventListener('pointerdown', this.onDown);
    canvas.addEventListener('pointermove', this.onMove);
    canvas.addEventListener('pointerup', this.onUp);
    canvas.addEventListener('pointercancel', this.onUp);
    canvas.addEventListener('pointerleave', this.onLeave);
    canvas.addEventListener('wheel', this.onWheel, { passive: false });
    canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  }

  private ndc(event: PointerEvent | WheelEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((event.clientY - rect.top) / rect.height) * 2 + 1,
    };
  }

  private readonly onDown = (event: PointerEvent): void => {
    if (!this.enabled || this.button !== -1) return;
    try {
      this.canvas.setPointerCapture(event.pointerId);
    } catch {
      // Capture is a nicety; without it a release outside the canvas is caught in onMove.
    }
    this.button = event.button;
    this.downX = event.clientX;
    this.downY = event.clientY;
    this.dragged = false;
    this.panning = false;

    const { x, y } = this.ndc(event);
    this.downNdc = { x, y };
    if (event.button === 0 && this.placement.currentTool.mode !== 'select') {
      this.placement.primaryDown(x, y);
    } else if (event.button === 1) {
      event.preventDefault();
      this.startPan(x, y);
    }
  };

  private startPan(ndcX: number, ndcY: number): void {
    this.panning = this.camera.groundPoint(ndcX, ndcY, this.panAnchor) !== null;
  }

  private readonly onMove = (event: PointerEvent): void => {
    if (!this.enabled) return;
    const { x, y } = this.ndc(event);

    // The release was missed (e.g. it happened outside the window): end the gesture here
    // instead of leaving the view glued to the cursor.
    if (this.button !== -1 && event.buttons === 0) {
      this.button = -1;
      this.panning = false;
      this.placement.primaryUp();
    }

    if (this.button !== -1 && !this.dragged) {
      const moved = Math.hypot(event.clientX - this.downX, event.clientY - this.downY);
      if (moved > DRAG_THRESHOLD) {
        this.dragged = true;
        // Dragging with the right button, or the left button while selecting, pans the view.
        const selecting = this.placement.currentTool.mode === 'select';
        if (this.button === 2 || (this.button === 0 && selecting)) this.startPan(this.downNdc.x, this.downNdc.y);
      }
    }

    if (this.panning) {
      // Shift the camera so the ground point grabbed at the start stays under the cursor.
      const current = this.camera.groundPoint(x, y, this.scratch);
      if (current) this.camera.panWorld(this.panAnchor.x - current.x, this.panAnchor.z - current.z);
      return;
    }

    if (this.button === 0 && this.placement.currentTool.mode !== 'select') {
      this.placement.primaryDrag(x, y);
    } else {
      this.placement.pointerMove(x, y);
    }
  };

  private readonly onUp = (event: PointerEvent): void => {
    if (event.button !== this.button) return;
    if (this.canvas.hasPointerCapture(event.pointerId)) this.canvas.releasePointerCapture(event.pointerId);
    const { x, y } = this.ndc(event);
    const wasClick = !this.dragged;
    const button = this.button;
    this.button = -1;
    this.panning = false;
    if (!this.enabled) return;

    if (button === 0) {
      if (this.placement.currentTool.mode === 'select') {
        if (wasClick) this.placement.click(x, y);
      } else {
        this.placement.primaryUp();
      }
    } else if (button === 2 && wasClick) {
      this.placement.cancel();
    }
    this.placement.pointerMove(x, y);
  };

  private readonly onLeave = (): void => {
    if (this.button === -1) this.placement.pointerLeave();
  };

  private readonly onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    if (!this.enabled) return;
    const { x, y } = this.ndc(event);
    this.camera.zoom(event.deltaY > 0 ? 1.12 : 1 / 1.12, x, y);
    this.placement.pointerMove(x, y);
  };
}
