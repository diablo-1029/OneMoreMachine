import type { PlacementController } from '../input/PlacementController';
import type { CameraController } from '../rendering/CameraController';
import { el } from './dom';
import { ICONS } from './Icons';

/**
 * On-screen buttons for what is otherwise only on the keyboard or the right mouse button:
 * rotating a piece, backing out of a tool, turning and re-centring the view. They appear on
 * devices without a mouse, and on any device the first time the screen is touched.
 */
export class TouchControls {
  private readonly cluster: HTMLElement;
  private readonly rotate: HTMLButtonElement;
  private readonly cancel: HTMLButtonElement;

  constructor(root: HTMLElement, placement: PlacementController, camera: CameraController, onClick: () => void) {
    const button = (label: string, icon: string, action: () => void) =>
      el('button', {
        class: 'touch-button',
        html: icon,
        attrs: { type: 'button', 'aria-label': label },
        onClick: () => {
          onClick();
          action();
        },
      });

    this.rotate = button('Rotate', ICONS.rotate, () => placement.rotate());
    this.cancel = button('Cancel', ICONS.cancel, () => placement.cancel());
    const undo = button('Put back what was removed', ICONS.undo, () => placement.undoDelete());
    undo.disabled = !placement.canUndo;
    placement.events.on('undoChanged', (available) => (undo.disabled = !available));
    this.cluster = el('div', { class: 'touch-controls hidden', attrs: { role: 'group', 'aria-label': 'Touch controls' } }, [
      this.rotate,
      this.cancel,
      undo,
      el('span', { class: 'touch-divider' }),
      button('Turn view left', ICONS.viewLeft, () => camera.rotate(1)),
      button('Turn view right', ICONS.viewRight, () => camera.rotate(-1)),
      button('Centre view', ICONS.center, () => camera.center()),
    ]);
    root.append(this.cluster);

    // Rotate and Cancel only mean something with a tool in hand or something selected.
    const refresh = () => {
      const busy = placement.currentTool.mode !== 'select' || placement.currentSelection !== null;
      const turnable = placement.currentTool.mode === 'build' || placement.currentTool.mode === 'paste' || placement.currentSelection !== null;
      this.cancel.disabled = !busy;
      this.rotate.disabled = !turnable;
    };
    placement.events.on('toolChanged', refresh);
    placement.events.on('selectionChanged', refresh);
    refresh();

    if (window.matchMedia?.('(pointer: coarse)').matches) this.show();
    else {
      const onFirstTouch = (event: PointerEvent) => {
        if (event.pointerType !== 'touch') return;
        this.show();
        window.removeEventListener('pointerdown', onFirstTouch, true);
      };
      window.addEventListener('pointerdown', onFirstTouch, true);
    }
  }

  private show(): void {
    this.cluster.classList.remove('hidden');
    // Lets the stylesheet know keys are not how this player works.
    document.documentElement.dataset.touch = 'true';
  }
}
