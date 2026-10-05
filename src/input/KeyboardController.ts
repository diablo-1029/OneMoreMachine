import { BUILD_ORDER } from '../data/machines';
import type { CameraController } from '../rendering/CameraController';
import type { PlacementController } from './PlacementController';

/** World units per second of keyboard panning at default zoom. */
const PAN_SPEED = 11;

export interface KeyboardActions {
  togglePause: () => void;
  toggleDebug: () => void;
  toggleBottleneckView: () => void;
  toggleResearch: () => void;
  toggleContracts: () => void;
}

/**
 *   WASD / arrows  pan          Q / E   rotate view       Home    centre factory
 *   R              rotate       Esc     cancel            Delete  remove selection
 *   1-8            build tools  X       delete tool       Space   pause
 *   F              pick tool from what is under the cursor  B       bottleneck view
 *   T              research     C       contracts
 */
export class KeyboardController {
  enabled = true;
  private readonly held = new Set<string>();

  constructor(
    private readonly camera: CameraController,
    private readonly placement: PlacementController,
    private readonly actions: KeyboardActions,
  ) {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', (event) => this.held.delete(event.code));
    window.addEventListener('blur', () => this.held.clear());
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (!this.enabled || event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;

    this.held.add(event.code);
    if (event.repeat) return;

    const digit = /^Digit([1-9])$/.exec(event.code);
    if (digit) {
      const type = BUILD_ORDER[Number(digit[1]) - 1];
      if (type) this.placement.toggleBuild(type);
      return;
    }

    switch (event.code) {
      case 'KeyQ':
        this.camera.rotate(1);
        break;
      case 'KeyE':
        this.camera.rotate(-1);
        break;
      case 'KeyR':
        this.placement.rotate();
        break;
      case 'KeyX':
        this.placement.toggleDelete();
        break;
      case 'KeyF':
        this.placement.pipette();
        break;
      case 'KeyB':
        this.actions.toggleBottleneckView();
        break;
      case 'KeyT':
        this.actions.toggleResearch();
        break;
      case 'KeyC':
        this.actions.toggleContracts();
        break;
      case 'Escape':
        this.placement.cancel();
        break;
      case 'Delete':
      case 'Backspace':
        this.placement.deleteSelected();
        break;
      case 'Home':
        this.camera.center();
        break;
      case 'Space':
        event.preventDefault();
        this.actions.togglePause();
        break;
      case 'F3':
        event.preventDefault();
        this.actions.toggleDebug();
        break;
    }
  };

  update(dt: number): void {
    if (!this.enabled) return;
    let right = 0;
    let up = 0;
    if (this.held.has('KeyD') || this.held.has('ArrowRight')) right += 1;
    if (this.held.has('KeyA') || this.held.has('ArrowLeft')) right -= 1;
    if (this.held.has('KeyW') || this.held.has('ArrowUp')) up += 1;
    if (this.held.has('KeyS') || this.held.has('ArrowDown')) up -= 1;
    if (right === 0 && up === 0) return;
    const speed = PAN_SPEED * this.camera.zoomScale * dt;
    this.camera.panScreen(right * speed, up * speed);
    this.placement.refreshHover();
  }
}
