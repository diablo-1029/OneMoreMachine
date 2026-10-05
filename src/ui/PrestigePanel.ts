import { formatMoney } from '../core/economy/Currency';
import { earningsForStars, saleMultiplier, starsForEarnings, startingMoney } from '../core/game/Prestige';
import type { Simulation } from '../core/game/Simulation';
import { ENVIRONMENTS } from '../data/environments';
import { el, setText } from './dom';
import { conceal, isRevealed, reveal } from './reveal';

const percent = (multiplier: number) => `+${Math.round((multiplier - 1) * 100)}%`;

/**
 * Modal for selling up: what the current run is worth in stars, what stars do, what is
 * kept and lost, and where to found the next factory. Asks twice before going through.
 */
export class PrestigePanel {
  private readonly overlay: HTMLElement;
  private readonly held: HTMLElement;
  private readonly worth: HTMLElement;
  private readonly fill: HTMLElement;
  private readonly next: HTMLElement;
  private readonly after: HTMLElement;
  private readonly sites: HTMLButtonElement[] = [];
  private readonly confirm: HTMLButtonElement;
  private siteId = ENVIRONMENTS[0].id;
  /** Set after the first press of the button; the second press goes through. */
  private armed = false;

  constructor(
    root: HTMLElement,
    private readonly sim: Simulation,
    onPrestige: (environmentId: string) => void,
    private readonly onOpenChange: (open: boolean) => void,
  ) {
    this.held = el('span');
    this.worth = el('span');
    this.next = el('span', { class: 'muted' });
    this.after = el('p', { class: 'panel-description' });
    this.fill = el('div', { class: 'progress-fill' });

    const siteRow = el('div', { class: 'prestige-sites' });
    for (const environment of ENVIRONMENTS) {
      const button = el('button', {
        class: 'recipe-choice',
        text: environment.name,
        title: environment.effects.join(' · ') || 'No special rules',
        attrs: { type: 'button' },
        onClick: () => {
          this.siteId = environment.id;
          this.armed = false;
          this.update();
        },
      });
      button.dataset.site = environment.id;
      this.sites.push(button);
      siteRow.append(button);
    }

    this.confirm = el('button', {
      class: 'button primary',
      attrs: { type: 'button' },
      onClick: () => {
        if (this.confirm.disabled) return;
        if (!this.armed) {
          this.armed = true;
          this.update();
          return;
        }
        onPrestige(this.siteId);
      },
    });

    const dialog = el('div', { class: 'modal prestige-modal', attrs: { role: 'dialog', 'aria-label': 'Sell up' } }, [
      el('div', { class: 'panel-header' }, [
        el('h2', { class: 'panel-title', text: 'Sell up and start again' }),
        el('button', {
          class: 'panel-close',
          text: '×',
          title: 'Close (Esc)',
          attrs: { type: 'button', 'aria-label': 'Close' },
          onClick: () => this.close(),
        }),
      ]),
      el('p', {
        class: 'panel-description',
        text: 'Sell this factory for stars and found a new one. Each star raises every sale price by 10% and adds $100 to your starting money, for good.',
      }),
      el('div', { class: 'row' }, [el('span', { class: 'row-label', text: 'Stars held' }), this.held]),
      el('div', { class: 'row' }, [el('span', { class: 'row-label', text: 'This factory is worth' }), this.worth]),
      el('div', { class: 'progress prestige-progress' }, [this.fill]),
      this.next,
      el('h3', { class: 'modal-subtitle', text: 'What happens' }),
      el('ul', { class: 'prestige-list' }, [
        el('li', { text: 'Lost: this factory, your money, research, contracts and upgrades.' }),
        el('li', { text: 'Kept: stars, achievements and saved blueprints.' }),
      ]),
      el('h3', { class: 'modal-subtitle', text: 'Found the next factory on' }),
      siteRow,
      this.after,
      this.confirm,
    ]);

    this.overlay = el('div', { class: 'overlay hidden' }, [dialog]);
    this.overlay.addEventListener('click', (event) => {
      if (event.target === this.overlay) this.close();
    });
    window.addEventListener('keydown', (event) => {
      if (this.isOpen && event.code === 'Escape') {
        event.stopPropagation();
        this.close();
      }
    });
    root.append(this.overlay);
  }

  get isOpen(): boolean {
    return isRevealed(this.overlay);
  }

  open(anchor?: HTMLElement | null): void {
    this.armed = false;
    this.siteId = this.sim.state.environment;
    reveal(this.overlay, anchor);
    this.update();
    this.onOpenChange(true);
  }

  close(): void {
    conceal(this.overlay);
    this.onOpenChange(false);
  }

  update(): void {
    if (!this.isOpen) return;
    const { economy, prestige } = this.sim.state;
    const earned = starsForEarnings(economy.totalEarned);
    const total = prestige.stars + earned;

    setText(this.held, prestige.stars === 0 ? 'None yet' : `${prestige.stars} ★ · sales ${percent(saleMultiplier(prestige.stars))}`);
    setText(this.worth, earned === 0 ? 'Nothing yet' : `${earned} ★`);

    // Progress from the star already reached towards the next one.
    const from = earningsForStars(earned);
    const to = earningsForStars(earned + 1);
    this.fill.style.width = `${Math.round(Math.min((economy.totalEarned - from) / (to - from), 1) * 100)}%`;
    setText(this.next, `${formatMoney(economy.totalEarned)} earned here · next star at ${formatMoney(to)}`);

    for (const button of this.sites) button.classList.toggle('active', button.dataset.site === this.siteId);

    this.confirm.disabled = earned < 1;
    if (earned < 1) {
      setText(this.after, `Earn ${formatMoney(to)} in this factory before selling it.`);
      setText(this.confirm, 'Not worth a star yet');
    } else {
      setText(
        this.after,
        `Your next factory would sell everything at ${percent(saleMultiplier(total))} and start with ${formatMoney(startingMoney(total))}.`,
      );
      setText(this.confirm, this.armed ? 'This cannot be undone — sell the factory' : `Sell for ${earned} ★`);
    }
    this.confirm.classList.toggle('danger-armed', this.armed);
  }
}
