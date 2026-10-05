import { el } from './dom';

export interface MainMenuActions {
  onContinue: () => void;
  onNewFactory: () => void;
  onSettings: () => void;
}

/** Title screen. Shows Continue only when a save exists, and reports a save that failed to load. */
export class MainMenu {
  private readonly overlay: HTMLElement;
  private readonly buttons: HTMLElement;
  private readonly message: HTMLElement;

  constructor(
    root: HTMLElement,
    private readonly actions: MainMenuActions,
  ) {
    this.buttons = el('div', { class: 'menu-buttons' });
    this.message = el('p', { class: 'menu-message hidden' });
    this.overlay = el('div', { class: 'menu' }, [
      el('div', { class: 'menu-card' }, [
        el('h1', { class: 'menu-title' }, ['One More', el('br'), 'Machine']),
        el('p', { class: 'menu-tagline', text: 'Build it. Optimize it. Watch it work.' }),
        this.message,
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
    this.message.classList.add('hidden');
    const newFactory = this.button('New Factory', !hasSave, () => {
      if (hasSave) this.confirmOverwrite();
      else this.actions.onNewFactory();
    });
    this.buttons.replaceChildren(
      ...(hasSave ? [this.button('Continue', true, this.actions.onContinue)] : []),
      newFactory,
      this.button('Settings', false, this.actions.onSettings),
    );
    this.overlay.classList.remove('hidden');
  }

  private confirmOverwrite(): void {
    this.message.textContent = 'Starting a new factory replaces your saved one.';
    this.message.classList.remove('hidden');
    this.buttons.replaceChildren(
      this.button('Start New Factory', true, this.actions.onNewFactory),
      this.button('Back', false, () => this.show(true)),
    );
  }

  /** Shown instead of crashing when the stored save is unreadable. */
  showLoadError(): void {
    this.message.textContent = 'Could not load save.';
    this.message.classList.remove('hidden');
    this.buttons.replaceChildren(this.button('Start New Factory', true, this.actions.onNewFactory));
    this.overlay.classList.remove('hidden');
  }

  hide(): void {
    this.overlay.classList.add('hidden');
  }
}
