import { UI_SCALES, type GameSettings, type MotionPreference } from '../core/save/SaveSchema';
import {
  BELT_STYLES,
  describeRequirement,
  FLOOR_STYLES,
  isCosmeticUnlocked,
  LIGHT_STYLES,
  type CosmeticChoice,
  type CosmeticProgress,
  type CosmeticRequirement,
} from '../data/cosmetics';
import { el } from './dom';
import { conceal, isRevealed, reveal } from './reveal';
import { attachTooltip } from './Tooltip';

export interface SettingsActions {
  /** Called on every change with the full, updated settings. */
  onChange: (settings: GameSettings) => void;
  onOpenChange?: (open: boolean) => void;
  /** In-game only: these are omitted on the main menu. */
  onSaveNow?: () => void;
  onMainMenu?: () => void;
  /** What the current factory has earned, for unlocking cosmetics. Omitted on the main menu. */
  getProgress?: () => CosmeticProgress;
}

const CONTROLS: [string, string][] = [
  ['Left click', 'Place / select'],
  ['Drag', 'Lay belts · pan'],
  ['Right click', 'Cancel'],
  ['Wheel', 'Zoom'],
  ['W A S D', 'Pan'],
  ['Q / E', 'Rotate view'],
  ['R', 'Rotate piece'],
  ['1 – 9, 0', 'Build tools'],
  ['`', 'Next group of tools'],
  ['F', 'Pick tool under cursor'],
  ['X', 'Delete tool'],
  ['B', 'Bottleneck view'],
  ['T', 'Research'],
  ['C', 'Contracts'],
  ['G', 'Achievements'],
  ['Ctrl C / V', 'Copy area · paste'],
  ['P', 'Blueprints'],
  ['Del', 'Remove selected'],
  ['Space', 'Pause'],
  ['Home', 'Centre view'],
];

/** Modal for audio and graphics options, with a controls reference. */
export class SettingsPanel {
  private readonly overlay: HTMLElement;
  private readonly cosmeticButtons: {
    button: HTMLButtonElement;
    key: keyof CosmeticChoice;
    id: string;
    requires: CosmeticRequirement;
  }[] = [];

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

    // One row of choices per kind of cosmetic. Locked ones stay visible, with what they need.
    const cosmeticRow = (
      label: string,
      key: keyof CosmeticChoice,
      styles: { id: string; name: string; requires: CosmeticRequirement }[],
    ) => {
      const choices = el('div', { class: 'cosmetic-choices' });
      for (const style of styles) {
        const button = el('button', {
          class: 'recipe-choice',
          text: style.name,
          attrs: { type: 'button' },
          onClick: () => {
            this.settings.cosmetics[key] = style.id;
            actions.onChange(this.settings);
            this.refreshCosmetics();
          },
        });
        this.cosmeticButtons.push({ button, key, id: style.id, requires: style.requires });
        choices.append(button);
      }
      return el('div', { class: 'setting cosmetic-setting' }, [el('span', { text: label }), choices]);
    };

    // A row of choices where exactly one is always picked.
    const choiceRow = <T>(label: string, options: { value: T; name: string }[], current: () => T, choose: (value: T) => void) => {
      const choices = el('div', { class: 'cosmetic-choices', attrs: { role: 'radiogroup', 'aria-label': label } });
      const refresh = () => {
        options.forEach((option, index) => {
          const picked = option.value === current();
          choices.children[index].classList.toggle('active', picked);
          choices.children[index].setAttribute('aria-checked', String(picked));
        });
      };
      for (const option of options) {
        choices.append(
          el('button', {
            class: 'recipe-choice',
            text: option.name,
            attrs: { type: 'button', role: 'radio' },
            onClick: () => {
              choose(option.value);
              actions.onChange(this.settings);
              refresh();
            },
          }),
        );
      }
      refresh();
      return el('div', { class: 'setting cosmetic-setting' }, [el('span', { text: label }), choices]);
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
      el('h3', { class: 'modal-subtitle', text: 'Interface' }),
      choiceRow(
        'Size',
        UI_SCALES.map((value) => ({ value: value as number, name: Math.round(value * 100) + '%' })),
        () => this.settings.uiScale,
        (value) => (this.settings.uiScale = value),
      ),
      choiceRow<MotionPreference>(
        'Reduce motion',
        [
          { value: 'system', name: 'Match system' },
          { value: 'on', name: 'On' },
          { value: 'off', name: 'Off' },
        ],
        () => this.settings.reduceMotion,
        (value) => (this.settings.reduceMotion = value),
      ),
      el('h3', { class: 'modal-subtitle', text: 'Look' }),
      cosmeticRow('Floor', 'floor', FLOOR_STYLES),
      cosmeticRow('Belts', 'belt', BELT_STYLES),
      cosmeticRow('Light', 'light', LIGHT_STYLES),
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
    return isRevealed(this.overlay);
  }

  /** Marks the current choices and greys out anything the factory has not unlocked yet. */
  private refreshCosmetics(): void {
    const progress = this.actions.getProgress?.() ?? null;
    for (const { button, key, id, requires } of this.cosmeticButtons) {
      const unlocked = isCosmeticUnlocked(requires, progress);
      button.disabled = !unlocked;
      button.classList.toggle('active', unlocked && this.settings.cosmetics[key] === id);
      attachTooltip(button, () =>
        unlocked ? null : { title: 'Locked', body: 'Unlocks ' + (progress ? '' : 'in play, ') + 'at ' + describeRequirement(requires) + '.' },
      );
    }
  }

  open(anchor?: HTMLElement | null): void {
    this.refreshCosmetics();
    reveal(this.overlay, anchor);
    this.actions.onOpenChange?.(true);
  }

  close(): void {
    if (!this.isOpen) return;
    conceal(this.overlay);
    this.actions.onOpenChange?.(false);
  }
}
