import { el, setText } from './dom';

export interface DebugStats {
  fps: number;
  drawCalls: number;
  triangles: number;
  machines: number;
  conveyors: number;
  items: number;
  simTime: number;
}

export interface DebugToggles {
  coordinates: boolean;
  footprints: boolean;
}

/** Development-only overlay (F3). Never constructed in production builds. */
export class DebugPanel {
  private readonly panel: HTMLElement;
  private readonly stats: HTMLElement;
  readonly toggles: DebugToggles = { coordinates: false, footprints: false };

  constructor(root: HTMLElement, onToggle: (toggles: DebugToggles) => void) {
    this.stats = el('pre', { class: 'debug-stats' });
    const checkbox = (label: string, key: keyof DebugToggles) => {
      const input = el('input', { attrs: { type: 'checkbox' } });
      input.addEventListener('change', () => {
        this.toggles[key] = input.checked;
        onToggle(this.toggles);
      });
      return el('label', { class: 'debug-toggle' }, [input, label]);
    };
    this.panel = el('div', { class: 'debug-panel hidden' }, [
      this.stats,
      checkbox('Grid coordinates', 'coordinates'),
      checkbox('Footprints & ports', 'footprints'),
    ]);
    root.append(this.panel);
  }

  toggle(): void {
    this.panel.classList.toggle('hidden');
  }

  get visible(): boolean {
    return !this.panel.classList.contains('hidden');
  }

  update(stats: DebugStats): void {
    if (!this.visible) return;
    setText(
      this.stats,
      `FPS        ${stats.fps.toFixed(0)}\n` +
        `Draw calls ${stats.drawCalls}\n` +
        `Triangles  ${stats.triangles}\n` +
        `Machines   ${stats.machines}\n` +
        `Conveyors  ${stats.conveyors}\n` +
        `Items      ${stats.items}\n` +
        `Sim time   ${stats.simTime.toFixed(1)}s`,
    );
  }
}
