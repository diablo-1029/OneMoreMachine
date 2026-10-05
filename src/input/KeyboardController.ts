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
  toggleAchievements: () => void;
  toggleBlueprints: () => void;
  /** Picks the tool in this position on the toolbar, counting from 0. */
  pickTool: (index: number) => void;
  cycleToolGroup: () => void;
}

/**
 *   WASD / arrows  pan          Q / E   rotate view       Home    centre factory
 *   R              rotate       Esc     cancel            Delete  remove selection
 *   1-9, 0         build tools  X       delete tool       Space   pause
 *   `              next group of build tools
 *   F              pick tool from what is under the cursor  B       bottleneck view
 *   T              research     C       contracts         G       achievements
 *   Ctrl+C         copy an area Ctrl+V  paste it          P       blueprints
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
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
    if (!this.enabled || event.altKey) return;
    if (event.ctrlKey || event.metaKey) {
      // Copy and paste are the only shortcuts that use a modifier.
      if (event.repeat) return;
      if (event.code === 'KeyC') {
        event.preventDefault();
        this.placement.toggleCopy();
      } else if (event.code === 'KeyV') {
        event.preventDefault();
        this.placement.startPaste();
      }
      return;
    }

    this.held.add(event.code);
    if (event.repeat) return;

    const digit = /^Digit([0-9])$/.exec(event.code);
    if (digit) {
      // 1-9 pick the first nine tools on the bar; 0 picks the tenth.
      this.actions.pickTool((Number(digit[1]) + 9) % 10);
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
      case 'KeyG':
        this.actions.toggleAchievements();
        break;
      case 'Backquote':
        this.actions.cycleToolGroup();
        break;
      case 'KeyP':
        this.actions.toggleBlueprints();
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
