import { formatMoney } from '../core/economy/Currency';
import type { GameState } from '../core/game/GameState';
import { getEnvironment } from '../data/environments';
import type { ExpansionStep } from '../data/expansion';
import { el, setText } from './dom';
import { conceal, isRevealed, reveal } from './reveal';

/** Drop-down for buying a larger factory floor. */
export class ExpansionPanel {
  private readonly panel: HTMLElement;
  private readonly current: HTMLElement;
  private readonly next: HTMLElement;
  private readonly note: HTMLElement;
  private readonly site: HTMLElement;
  private readonly effects: HTMLElement;
  private readonly button: HTMLButtonElement;

  constructor(root: HTMLElement, onExpand: () => void) {
    this.current = el('span');
    this.next = el('span');
    this.note = el('p', { class: 'panel-description' });
    this.site = el('span');
    this.effects = el('ul', { class: 'site-effects' });
    this.button = el('button', { class: 'button primary', attrs: { type: 'button' }, onClick: onExpand });
    this.panel = el('div', { class: 'expansion-panel hidden' }, [
      el('h2', { class: 'panel-title', text: 'Factory floor' }),
      el('div', { class: 'row' }, [el('span', { class: 'row-label', text: 'Site' }), this.site]),
      this.effects,
      el('div', { class: 'row' }, [el('span', { class: 'row-label', text: 'Now' }), this.current]),
      el('div', { class: 'row' }, [el('span', { class: 'row-label', text: 'Next' }), this.next]),
      this.note,
      this.button,
    ]);
    root.append(this.panel);
  }

  toggle(anchor?: HTMLElement | null): void {
    if (this.visible) this.hide();
    else reveal(this.panel, anchor);
  }

  hide(): void {
    conceal(this.panel);
  }

  get visible(): boolean {
    return isRevealed(this.panel);
  }

  update(state: GameState, step: ExpansionStep | null): void {
    if (!this.visible) return;
    const { width, height } = state.factory.grid;
    const environment = getEnvironment(state.environment);
    if (this.site.textContent !== environment.name) {
      setText(this.site, environment.name);
      this.effects.replaceChildren(...environment.effects.map((effect) => el('li', { text: effect })));
      this.effects.classList.toggle('hidden', environment.effects.length === 0);
    }
    setText(this.current, `${width} × ${height}`);
    this.button.classList.toggle('hidden', step === null);
    if (!step) {
      setText(this.next, '—');
      setText(this.note, 'This is the largest floor there is.');
      return;
    }
    const affordable = state.economy.canAfford(step.cost);
    setText(this.next, `${step.size} × ${step.size}`);
    setText(
      this.note,
      affordable
        ? 'The floor grows on every side. Everything you have built stays where it is.'
        : `${formatMoney(step.cost - Math.floor(state.economy.money))} short. Everything you have built stays where it is.`,
    );
    setText(this.button, `Expand for ${formatMoney(step.cost)}`);
    this.button.disabled = !affordable;
  }
}
