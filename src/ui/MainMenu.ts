import { ENVIRONMENTS } from '../data/environments';
import { el } from './dom';

export interface MainMenuActions {
  onContinue: () => void;
  /** Starts a fresh factory on the chosen site. */
  onNewFactory: (environmentId: string) => void;
  /** Asks for the scenery behind the menu to show a site, while the player is choosing. */
  onPreviewEnvironment: (environmentId: string) => void;
  onSettings: () => void;
  /** Brings in a factory from a save file. */
  onLoadFile: () => void;
}

/** Title screen. Shows Continue only when a save exists, and reports a save that failed to load. */
export class MainMenu {
  private readonly overlay: HTMLElement;
  private readonly buttons: HTMLElement;
  private readonly message: HTMLElement;
  private readonly heading: HTMLElement;
  private hasSave = false;

  constructor(
    root: HTMLElement,
    private readonly actions: MainMenuActions,
  ) {
    this.buttons = el('div', { class: 'menu-buttons' });
    this.message = el('p', { class: 'menu-message hidden' });
    this.heading = el('p', { class: 'menu-heading hidden' });
    this.overlay = el('div', { class: 'menu' }, [
      el('div', { class: 'menu-card' }, [
        el('h1', { class: 'menu-title' }, ['One More', el('br'), 'Machine']),
        el('p', { class: 'menu-tagline', text: 'Build it. Optimize it. Watch it work.' }),
        this.message,
        this.heading,
        this.buttons,
      ]),
    ]);
    root.append(this.overlay);
  }

  private button(label: string, primary: boolean, onClick: () => void): HTMLElement {
    return el('button', {
      class: primary ? 'button menu-button primary' : 'button menu-button',
      text: label,
      attrs: { type: 'button' },
      onClick,
    });
  }

  /** The normal menu. Starting a new factory over an existing save asks for confirmation first. */
  show(hasSave: boolean): void {
    this.hasSave = hasSave;
    this.message.classList.add('hidden');
    this.heading.classList.add('hidden');
    const newFactory = this.button('New Factory', !hasSave, () => {
      if (hasSave) this.confirmOverwrite();
      else this.chooseEnvironment();
    });
    this.buttons.replaceChildren(
      ...(hasSave ? [this.button('Continue', true, this.actions.onContinue)] : []),
      newFactory,
      this.button('Load save file', false, this.actions.onLoadFile),
      this.button('Settings', false, this.actions.onSettings),
    );
    this.overlay.classList.remove('hidden');
  }

  private confirmOverwrite(): void {
    this.message.textContent = 'Starting a new factory replaces your saved one.';
    this.message.classList.remove('hidden');
    this.buttons.replaceChildren(
      this.button('Start New Factory', true, () => this.chooseEnvironment()),
      this.button('Back', false, () => this.show(true)),
    );
  }

  /** One card per site. Hovering or focusing a card redraws the scenery behind the menu to match. */
  private chooseEnvironment(): void {
    this.message.classList.add('hidden');
    this.heading.textContent = 'Where will you build?';
    this.heading.classList.remove('hidden');

    const cards = ENVIRONMENTS.map((environment) => {
      const card = el(
        'button',
        {
          class: 'button menu-button environment-card',
          attrs: { type: 'button' },
          onClick: () => this.actions.onNewFactory(environment.id),
        },
        [
          el('span', { class: 'environment-name', text: environment.name }),
          el('span', { class: 'environment-tagline', text: environment.tagline }),
          el('span', {
            class: 'environment-effects',
            text: environment.effects.length > 0 ? environment.effects.join(' · ') : 'No special rules',
          }),
        ],
      );
      const preview = () => this.actions.onPreviewEnvironment(environment.id);
      card.addEventListener('pointerenter', preview);
      card.addEventListener('focus', preview);
      return card;
    });

    this.buttons.replaceChildren(
      ...cards,
      this.button('Back', false, () => {
        this.actions.onPreviewEnvironment(ENVIRONMENTS[0].id);
        this.show(this.hasSave);
      }),
    );
  }

  /** Shown instead of crashing when the stored save is unreadable. */
  showLoadError(): void {
    this.heading.classList.add('hidden');
    this.message.textContent = 'Could not load save.';
    this.message.classList.remove('hidden');
    this.buttons.replaceChildren(
      this.button('Start New Factory', true, () => this.chooseEnvironment()),
      this.button('Load save file', false, this.actions.onLoadFile),
    );
    this.overlay.classList.remove('hidden');
  }

  hide(): void {
    this.overlay.classList.add('hidden');
  }
}
