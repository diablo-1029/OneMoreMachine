import type { GameSettings } from '../core/save/SaveSchema';
import { el } from './dom';

export interface SettingsActions {
  /** Called on every change with the full, updated settings. */
  onChange: (settings: GameSettings) => void;
  onOpenChange?: (open: boolean) => void;
  /** In-game only: these are omitted on the main menu. */
  onSaveNow?: () => void;
  onMainMenu?: () => void;
}

const CONTROLS: [string, string][] = [
  ['Left click', 'Place / select'],
  ['Drag', 'Lay belts · pan'],
  ['Right click', 'Cancel'],
  ['Wheel', 'Zoom'],
  ['W A S D', 'Pan'],
  ['Q / E', 'Rotate view'],
  ['R', 'Rotate piece'],
  ['1 – 8', 'Build tools'],
  ['F', 'Pick tool under cursor'],
  ['X', 'Delete tool'],
  ['B', 'Bottleneck view'],
  ['T', 'Research'],
  ['C', 'Contracts'],
  ['Del', 'Remove selected'],
  ['Space', 'Pause'],
  ['Home', 'Centre view'],
];

/** Modal for audio and graphics options, with a controls reference. */
export class SettingsPanel {
  private readonly overlay: HTMLElement;

  constructor(
    root: HTMLElement,
    private readonly settings: GameSettings,
    private readonly actions: SettingsActions,
  ) {
    const volume = el('input', {
      attrs: { type: 'range', min: '0', max: '100', value: String(Math.round(settings.masterVolume * 100)), 'aria-label': 'Volume' },
    });
    volume.addEventListener('input', () => {
      this.settings.masterVolume = Number(volume.value) / 100;
      actions.onChange(this.settings);
    });

    const toggle = (label: string, key: 'sfx' | 'music' | 'shadows') => {
      const input = el('input', { attrs: { type: 'checkbox' } });
      input.checked = settings[key];
      input.addEventListener('change', () => {
        this.settings[key] = input.checked;
        actions.onChange(this.settings);
      });
      return el('label', { class: 'setting' }, [el('span', { text: label }), input]);
    };

    const buttons: HTMLElement[] = [];
    if (actions.onSaveNow) {
      buttons.push(el('button', { class: 'button', text: 'Save now', attrs: { type: 'button' }, onClick: actions.onSaveNow }));
    }
    if (actions.onMainMenu) {
      buttons.push(el('button', { class: 'button', text: 'Save & quit to menu', attrs: { type: 'button' }, onClick: actions.onMainMenu }));
    }

    const dialog = el('div', { class: 'modal', attrs: { role: 'dialog', 'aria-label': 'Settings' } }, [
      el('div', { class: 'panel-header' }, [
        el('h2', { class: 'panel-title', text: 'Settings' }),
        el('button', {
          class: 'panel-close',
          text: '×',
          attrs: { type: 'button', 'aria-label': 'Close' },
          onClick: () => this.close(),
        }),
      ]),
      el('label', { class: 'setting' }, [el('span', { text: 'Volume' }), volume]),
      toggle('Sound effects', 'sfx'),
      toggle('Music', 'music'),
      toggle('Shadows', 'shadows'),
      el('h3', { class: 'modal-subtitle', text: 'Controls' }),
      el(
        'div',
        { class: 'controls' },
        CONTROLS.flatMap(([key, action]) => [el('kbd', { text: key }), el('span', { text: action })]),
      ),
      buttons.length > 0 ? el('div', { class: 'panel-actions' }, buttons) : null,
    ]);

    this.overlay = el('div', { class: 'overlay hidden' }, [dialog]);
    this.overlay.addEventListener('click', (event) => {
      if (event.target === this.overlay) this.close();
    });
    window.addEventListener('keydown', (event) => {
      if (event.code === 'Escape' && this.isOpen) this.close();
    });
    root.append(this.overlay);
  }

  get isOpen(): boolean {
    return !this.overlay.classList.contains('hidden');
  }

  open(): void {
    this.overlay.classList.remove('hidden');
    this.actions.onOpenChange?.(true);
  }

  close(): void {
    this.overlay.classList.add('hidden');
    this.actions.onOpenChange?.(false);
  }
}
