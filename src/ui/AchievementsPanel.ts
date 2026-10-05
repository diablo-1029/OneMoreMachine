import { formatMoney } from '../core/economy/Currency';
import type { Simulation } from '../core/game/Simulation';
import { ACHIEVEMENTS, type AchievementDefinition } from '../data/achievements';
import { el, setText } from './dom';

interface Card {
  achievement: AchievementDefinition;
  root: HTMLElement;
  fill: HTMLElement;
  status: HTMLElement;
}

/** Whole numbers, with money goals shown as money. */
function formatProgress(achievement: AchievementDefinition, current: number, target: number): string {
  const shown = Math.min(Math.floor(current), target);
  return achievement.kind === 'milestone'
    ? `${formatMoney(shown)} / ${formatMoney(target)}`
    : `${shown.toLocaleString('en-US')} / ${target.toLocaleString('en-US')}`;
}

/** Modal listing the earnings milestones in order, then every other achievement. */
export class AchievementsPanel {
  private readonly overlay: HTMLElement;
  private readonly count: HTMLElement;
  private readonly cards: Card[] = [];

  constructor(
    root: HTMLElement,
    private readonly sim: Simulation,
    private readonly onOpenChange: (open: boolean) => void,
  ) {
    const section = (title: string, kind: AchievementDefinition['kind']) => {
      const grid = el('div', { class: 'achievement-grid' });
      for (const achievement of ACHIEVEMENTS.filter((a) => a.kind === kind)) {
        const fill = el('div', { class: 'progress-fill' });
        const status = el('span', { class: 'achievement-status' });
        const card = el('div', { class: 'achievement' }, [
          el('div', { class: 'achievement-head' }, [
            el('h3', { class: 'achievement-name', text: achievement.name }),
            el('span', { class: 'achievement-reward', text: `+${formatMoney(achievement.reward)}` }),
          ]),
          el('p', { class: 'achievement-description', text: achievement.description }),
          el('div', { class: 'progress' }, [fill]),
          status,
        ]);
        grid.append(card);
        this.cards.push({ achievement, root: card, fill, status });
      }
      return [el('h3', { class: 'modal-subtitle', text: title }), grid];
    };

    this.count = el('span', { class: 'muted' });
    const dialog = el('div', { class: 'modal achievements-modal', attrs: { role: 'dialog', 'aria-label': 'Achievements' } }, [
      el('div', { class: 'panel-header' }, [
        el('h2', { class: 'panel-title', text: 'Achievements' }),
        this.count,
        el('button', {
          class: 'panel-close',
          text: '×',
          title: 'Close (Esc)',
          attrs: { type: 'button', 'aria-label': 'Close' },
          onClick: () => this.close(),
        }),
      ]),
      ...section('Milestones', 'milestone'),
      ...section('Achievements', 'achievement'),
    ]);

    this.overlay = el('div', { class: 'overlay hidden' }, [dialog]);
    this.overlay.addEventListener('click', (event) => {
      if (event.target === this.overlay) this.close();
    });
    window.addEventListener('keydown', (event) => {
      if (!this.isOpen || this.justOpened) return;
      if (event.code === 'Escape' || event.code === 'KeyG') {
        event.stopPropagation();
        this.close();
      }
    });
    root.append(this.overlay);
  }

  /** True for the rest of the key event that opened the panel, so the same press cannot close it. */
  private justOpened = false;

  get isOpen(): boolean {
    return !this.overlay.classList.contains('hidden');
  }

  toggle(): void {
    if (this.isOpen) this.close();
    else this.open();
  }

  open(): void {
    this.overlay.classList.remove('hidden');
    this.justOpened = true;
    window.setTimeout(() => (this.justOpened = false), 0);
    this.update();
    this.onOpenChange(true);
  }

  close(): void {
    this.overlay.classList.add('hidden');
    this.onOpenChange(false);
  }

  update(): void {
    if (!this.isOpen) return;
    const unlocked = this.sim.state.achievements;
    setText(this.count, `${unlocked.length} / ${ACHIEVEMENTS.length}`);
    for (const card of this.cards) {
      const done = unlocked.includes(card.achievement.id);
      card.root.dataset.done = String(done);
      if (done) {
        card.fill.style.width = '100%';
        setText(card.status, 'Unlocked');
        continue;
      }
      const { current, target } = card.achievement.progress(this.sim);
      card.fill.style.width = `${Math.round(Math.min(current / target, 1) * 100)}%`;
      // A bare "0 / 1" says nothing for goals that are simply done or not.
      setText(card.status, target === 1 ? 'Not yet' : formatProgress(card.achievement, current, target));
    }
  }
}
