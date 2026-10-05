import * as THREE from 'three';
import type { CameraController } from '../rendering/CameraController';
import type { PlacementController } from './PlacementController';

/** Pixels the pointer may move before a press counts as a drag rather than a click. */
const DRAG_THRESHOLD = 5;
/** Fingers wander more than a mouse does. */
const TOUCH_DRAG_THRESHOLD = 10;

/**
 * Translates raw pointer and wheel events on the canvas into camera movement and
 * placement actions.
 *   left      place / select (drag pans when the select tool is active)
 *   middle    pan
 *   right     pan when dragged, cancel when clicked
 *   wheel     zoom towards the cursor
 * By touch, one finger does what the left button does, and two fingers pan and pinch-zoom.
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

  /** Fingers currently on the canvas, by pointer id, in client pixels. */
  private readonly touches = new Map<number, { x: number; y: number }>();
  /** Set while two fingers are down: how far apart they were at the last event. */
  private pinchDistance = 0;
  private pinching = false;
  /** A finger is down with a build tool but has not yet acted; see onDown. */
  private touchPending = false;
  /** After a pinch, the fingers still down do nothing until all have lifted. */
  private touchSpent = false;

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

  private toNdc(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 2 - 1,
      y: -((clientY - rect.top) / rect.height) * 2 + 1,
    };
  }

  private ndc(event: PointerEvent | WheelEvent): { x: number; y: number } {
    return this.toNdc(event.clientX, event.clientY);
  }

  private capture(event: PointerEvent): void {
    try {
      this.canvas.setPointerCapture(event.pointerId);
    } catch {
      // Capture is a nicety; without it a release outside the canvas is caught in onMove.
    }
  }

  private readonly onDown = (event: PointerEvent): void => {
    if (!this.enabled) return;
    if (event.pointerType === 'touch') {
      this.touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
      this.capture(event);
      if (this.touches.size === 2) return this.startPinch();
      if (this.touches.size > 2 || this.touchSpent) return;
    }
    if (this.button !== -1) return;
    this.capture(event);
    this.button = event.button;
    this.downX = event.clientX;
    this.downY = event.clientY;
    this.dragged = false;
    this.panning = false;

    const { x, y } = this.ndc(event);
    this.downNdc = { x, y };
    if (event.button === 0 && this.placement.currentTool.mode !== 'select') {
      // A finger may be the first of two arriving to pan or zoom, so by touch nothing is
      // built until it either moves or lifts. A mouse press acts at once.
      if (event.pointerType === 'touch') this.touchPending = true;
      else this.placement.primaryDown(x, y);
    } else if (event.button === 1) {
      event.preventDefault();
      this.startPan(x, y);
    }
  };

  private startPan(ndcX: number, ndcY: number): void {
    this.panning = this.camera.groundPoint(ndcX, ndcY, this.panAnchor) !== null;
  }

  // ------------------------------------------------------------- two fingers

  /** The point midway between the two fingers (NDC) and the distance between them (pixels). */
  private pinchState(): { x: number; y: number; distance: number } {
    const [a, b] = [...this.touches.values()];
    const mid = this.toNdc((a.x + b.x) / 2, (a.y + b.y) / 2);
    return { ...mid, distance: Math.max(Math.hypot(a.x - b.x, a.y - b.y), 1) };
  }

  private startPinch(): void {
    // Whatever the first finger was doing stops here, without building anything more.
    if (this.button !== -1 && !this.touchPending && this.placement.currentTool.mode !== 'select') {
      this.placement.abortDrag();
    }
    this.button = -1;
    this.touchPending = false;
    this.pinching = true;
    this.touchSpent = true;
    const { x, y, distance } = this.pinchState();
    this.pinchDistance = distance;
    this.startPan(x, y);
  }

  private movePinch(): void {
    const { x, y, distance } = this.pinchState();
    // Fingers moving apart zoom in, keeping the ground between them in place.
    this.camera.zoom(this.pinchDistance / distance, x, y);
    this.pinchDistance = distance;
    if (this.panning) {
      const current = this.camera.groundPoint(x, y, this.scratch);
      if (current) this.camera.panWorld(this.panAnchor.x - current.x, this.panAnchor.z - current.z);
    }
  }

  // -------------------------------------------------------------------- move

  private readonly onMove = (event: PointerEvent): void => {
    if (!this.enabled) return;
    if (event.pointerType === 'touch') {
      const touch = this.touches.get(event.pointerId);
      if (!touch) return;
      touch.x = event.clientX;
      touch.y = event.clientY;
      if (this.pinching) return this.movePinch();
      if (this.touchSpent) return;
    }
    const { x, y } = this.ndc(event);

    // The release was missed (e.g. it happened outside the window): end the gesture here
    // instead of leaving the view glued to the cursor.
    if (this.button !== -1 && event.buttons === 0 && event.pointerType !== 'touch') {
      this.button = -1;
      this.panning = false;
      this.placement.primaryUp();
    }

    if (this.button !== -1 && !this.dragged) {
      const moved = Math.hypot(event.clientX - this.downX, event.clientY - this.downY);
      if (moved > (event.pointerType === 'touch' ? TOUCH_DRAG_THRESHOLD : DRAG_THRESHOLD)) {
        this.dragged = true;
        // Dragging with the right button, or the left button while selecting, pans the view.
        const selecting = this.placement.currentTool.mode === 'select';
        if (this.button === 2 || (this.button === 0 && selecting)) this.startPan(this.downNdc.x, this.downNdc.y);
        if (this.touchPending) {
          // The finger has committed to a stroke: begin it where it first touched.
          this.touchPending = false;
          this.placement.primaryDown(this.downNdc.x, this.downNdc.y);
        }
      }
    }
    if (this.touchPending) return;

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

  // ---------------------------------------------------------------------- up

  private readonly onUp = (event: PointerEvent): void => {
    if (this.canvas.hasPointerCapture(event.pointerId)) this.canvas.releasePointerCapture(event.pointerId);
    if (event.pointerType === 'touch') {
      if (!this.touches.delete(event.pointerId)) return;
      if (this.pinching || this.touchSpent) {
        this.pinching = false;
        this.panning = false;
        if (this.touches.size === 0) {
          this.touchSpent = false;
          // No finger, no cursor: clear the ghost left where the pinch began.
          this.placement.pointerLeave();
        }
        return;
      }
    } else if (event.button !== this.button) {
      return;
    }
    if (this.button === -1) return;

    const { x, y } = this.ndc(event);
    const wasClick = !this.dragged;
    const button = this.button;
    const pending = this.touchPending;
    this.button = -1;
    this.panning = false;
    this.touchPending = false;
    if (!this.enabled || event.type === 'pointercancel') {
      if (button === 0 && !pending) this.placement.abortDrag();
      return;
    }

    if (button === 0) {
      if (this.placement.currentTool.mode === 'select') {
        if (wasClick) this.placement.click(x, y);
      } else {
        // A tap: the press that was held back happens now, where the finger is.
        if (pending) this.placement.primaryDown(x, y);
        this.placement.primaryUp();
      }
    } else if (button === 2 && wasClick) {
      this.placement.cancel();
    }
    if (event.pointerType === 'touch') {
      // A finger that has lifted is not hovering anywhere.
      if (this.placement.currentTool.mode === 'select') this.placement.pointerLeave();
    } else {
      this.placement.pointerMove(x, y);
    }
  };

  private readonly onLeave = (event: PointerEvent): void => {
    if (event.pointerType === 'touch') return;
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
