import { formatMoney } from '../core/economy/Currency';
import type { GameState } from '../core/game/GameState';
import type { GameSpeed } from '../core/game/TickSystem';
import { el, setText } from './dom';
import { ICONS } from './Icons';

export interface HudActions {
  setSpeed: (speed: GameSpeed) => void;
  openSettings: () => void;
  toggleStats: () => void;
  toggleBottleneckView: () => void;
  openResearch: () => void;
  toggleExpansion: () => void;
  toggleContracts: () => void;
  toggleAchievements: () => void;
}

/** Top bar: money, income rate, pause / speed and settings. */
export class HUD {
  private readonly money: HTMLElement;
  private readonly income: HTMLElement;
  private readonly speedButtons = new Map<GameSpeed, HTMLButtonElement>();
  private readonly bottleneckButton: HTMLButtonElement;
  private readonly power: HTMLElement;
  private readonly powerValue: HTMLElement;
  private readonly researchButton: HTMLButtonElement;
  private shownMoney = -1;

  constructor(root: HTMLElement, actions: HudActions) {
    this.money = el('span', { class: 'money-value', text: '$0' });
    this.income = el('span', { class: 'income-value', text: '+$0/min' });

    const speed = (value: GameSpeed, label: string, title: string) => {
      const button = el('button', {
        class: 'speed-button',
        title,
        onClick: () => actions.setSpeed(value),
        attrs: { type: 'button' },
      });
      if (value === 0) button.innerHTML = ICONS.pause;
      else button.textContent = label;
      this.speedButtons.set(value, button);
      return button;
    };

    this.bottleneckButton = el('button', {
      class: 'pill icon-button',
      title: 'Bottleneck view (B) — colour machines by how busy they are and mark jammed belts',
      html: ICONS.bottleneck,
      onClick: actions.toggleBottleneckView,
      attrs: { type: 'button', 'aria-label': 'Bottleneck view', 'aria-pressed': 'false' },
    });

    this.researchButton = el('button', {
      class: 'pill icon-button',
      title: 'Research (T)',
      html: ICONS.research,
      onClick: actions.openResearch,
      attrs: { type: 'button', 'aria-label': 'Research' },
    });

    this.powerValue = el('span', { text: '0 / 0' });
    this.power = el('div', { class: 'pill power' }, [el('span', { class: 'power-icon', html: ICONS.power }), this.powerValue]);

    const expandButton = el('button', {
      class: 'pill icon-button',
      title: 'Factory floor — buy more space',
      html: ICONS.expand,
      onClick: actions.toggleExpansion,
      attrs: { type: 'button', 'aria-label': 'Factory floor' },
    });

    const contractsButton = el('button', {
      class: 'pill icon-button',
      title: 'Contracts (C) — bonus orders',
      html: ICONS.contracts,
      onClick: actions.toggleContracts,
      attrs: { type: 'button', 'aria-label': 'Contracts' },
    });

    const achievementsButton = el('button', {
      class: 'pill icon-button',
      title: 'Achievements (G)',
      html: ICONS.achievements,
      onClick: actions.toggleAchievements,
      attrs: { type: 'button', 'aria-label': 'Achievements' },
    });

    root.append(
      el('div', { class: 'topbar' }, [
        el('div', { class: 'topbar-group' }, [
          el('div', { class: 'pill money', title: 'Money' }, [el('span', { class: 'coin' }), this.money]),
          el(
            'button',
            {
              class: 'pill income',
              title: 'Factory income — click for production stats',
              onClick: actions.toggleStats,
              attrs: { type: 'button' },
            },
            [this.income],
          ),
          this.power,
          this.bottleneckButton,
          contractsButton,
          this.researchButton,
          expandButton,
          achievementsButton,
        ]),
        el('div', { class: 'topbar-group' }, [
          el('div', { class: 'pill speed' }, [
            speed(0, '', 'Pause (Space)'),
            speed(1, '1×', 'Normal speed'),
            speed(2, '2×', 'Double speed'),
          ]),
          el('button', {
            class: 'pill icon-button',
            title: 'Settings',
            html: ICONS.settings,
            onClick: actions.openSettings,
            attrs: { type: 'button', 'aria-label': 'Settings' },
          }),
        ]),
      ]),
    );
  }

  /** Shows a dot on the Research button when something can be bought. */
  setResearchAvailable(available: boolean): void {
    this.researchButton.classList.toggle('has-dot', available);
  }

  /** Power used out of power available; turns red when the factory is short. */
  setPower(demand: number, supply: number): void {
    setText(this.powerValue, `${Math.round(demand)} / ${Math.round(supply)}`);
    const short = demand > supply;
    this.power.classList.toggle('short', short);
    this.power.title = short
      ? `Power: machines want ${Math.round(demand)} but only ${Math.round(supply)} is available, so they all run at ${Math.round((supply / demand) * 100)}% speed.`
      : `Power: ${Math.round(demand)} in use of ${Math.round(supply)} available.`;
  }

  setBottleneckView(active: boolean): void {
    this.bottleneckButton.classList.toggle('active', active);
    this.bottleneckButton.setAttribute('aria-pressed', String(active));
  }

  setSpeed(speed: GameSpeed): void {
    for (const [value, button] of this.speedButtons) button.classList.toggle('active', value === speed);
  }

  update(state: GameState): void {
    const money = Math.floor(state.economy.money);
    if (money !== this.shownMoney) {
      // A quick bump draws the eye whenever income arrives.
      if (this.shownMoney >= 0 && money > this.shownMoney) {
        this.money.classList.remove('bump');
        void this.money.offsetWidth;
        this.money.classList.add('bump');
      }
      this.shownMoney = money;
      setText(this.money, formatMoney(money));
    }
    setText(this.income, `+${formatMoney(state.economy.incomePerMinute())}/min`);
  }
}
