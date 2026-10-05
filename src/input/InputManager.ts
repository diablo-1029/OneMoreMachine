import type { CameraController } from '../rendering/CameraController';
import { KeyboardController, type KeyboardActions } from './KeyboardController';
import type { PlacementController } from './PlacementController';
import { PointerController } from './PointerController';

/** Owns the pointer and keyboard controllers and lets the app switch all input on or off at once. */
export class InputManager {
  private readonly pointer: PointerController;
  private readonly keyboard: KeyboardController;

  constructor(
    canvas: HTMLCanvasElement,
    camera: CameraController,
    placement: PlacementController,
    actions: KeyboardActions,
  ) {
    this.pointer = new PointerController(canvas, camera, placement);
    this.keyboard = new KeyboardController(camera, placement, actions);
  }

  /** Disabled while a modal (settings, menu) is open. */
  setEnabled(enabled: boolean): void {
    this.pointer.enabled = enabled;
    this.keyboard.enabled = enabled;
  }

  update(dt: number): void {
    this.keyboard.update(dt);
  }
}
