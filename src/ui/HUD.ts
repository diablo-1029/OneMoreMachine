import { formatMoney } from '../core/economy/Currency';
import type { GameState } from '../core/game/GameState';
import type { GameSpeed } from '../core/game/TickSystem';
import { el, setText } from './dom';
import { HUD_CONTROLS, type HudControl } from './hudVisibility';
import { ICONS } from './Icons';
import { reducedMotion } from './preferences';
import { attachTooltip } from './Tooltip';

export interface HudActions {
  setSpeed: (speed: GameSpeed) => void;
  openSettings: () => void;
  toggleStats: () => void;
  toggleBottleneckView: () => void;
  openResearch: () => void;
  toggleExpansion: () => void;
  toggleContracts: () => void;
  toggleAchievements: () => void;
  toggleBlueprints: () => void;
  openPrestige: () => void;
}

/** The panels that open from the navigation strip. */
export type HudPanel = 'production' | 'contracts' | 'research' | 'floor' | 'blueprints' | 'achievements';

/** Below this width (in the UI layer's own pixels) the navigation strip drops its words. */
const COMPACT_BELOW = 1400;
/** Below this width speed and settings no longer fit beside the status strip and take a row of their own. */
const STACKED_BELOW = 520;
/** How long a newly arrived control stays highlighted. */
const HIGHLIGHT_MS = 2600;
/** Share of the remaining difference the money readout covers per second while counting. */
const COUNT_RATE = 9;

/**
 * Top bar. On the left, what the factory has (money, income, power, stars) and a strip of
 * labelled buttons for its panels; on the right, speed and settings. Controls that a young
 * factory has no use for stay out of sight until it grows into them.
 */
export class HUD {
  private readonly money: HTMLElement;
  private readonly income: HTMLElement;
  private readonly speedButtons = new Map<GameSpeed, HTMLButtonElement>();
  private readonly power: HTMLElement;
  private readonly powerValue: HTMLElement;
  private readonly starCount: HTMLElement;
  private readonly nav: HTMLElement;
  private readonly navDivider: HTMLElement;
  private readonly settingsButton: HTMLButtonElement;
  private readonly controls = new Map<HudControl, HTMLElement>();
  private readonly shown = new Set<HudControl>();
  private firstVisibility = true;
  private powerTip = '';
  /** What the readout says, which runs a little behind what the factory has while it counts. */
  private shownMoney = -1;
  private targetMoney = -1;
  private readonly root: HTMLElement;

  constructor(root: HTMLElement, actions: HudActions) {
    this.root = root;
    this.money = el('span', { class: 'money-value', text: '$0' });
    this.income = el('span', { class: 'income-value', text: '+$0/min' });

    const speed = (value: GameSpeed, label: string, title: string) => {
      const button = el('button', {
        class: 'speed-button',
        title,
        onClick: () => actions.setSpeed(value),
        attrs: { type: 'button', 'aria-label': title.replace(/ \(.*\)$/, '') },
      });
      // The pause button spells itself out while it is on, so a stopped factory explains itself.
      if (value === 0) button.innerHTML = `${ICONS.pause}<span class="paused-label">Paused</span>`;
      else button.textContent = label;
      this.speedButtons.set(value, button);
      return button;
    };

    const navButton = (control: HudControl, label: string, icon: string, title: string, onClick: () => void) => {
      const button = el('button', { class: 'nav-button', title, onClick, attrs: { type: 'button', 'aria-label': label } }, [
        el('span', { class: 'nav-icon', html: icon }),
        el('span', { class: 'nav-label', text: label }),
      ]);
      this.controls.set(control, button);
      return button;
    };

    const bottleneck = navButton(
      'bottleneck',
      'Bottlenecks',
      ICONS.bottleneck,
      'Bottleneck view (B) — colours each machine by how busy it is and marks belts that are backed up',
      actions.toggleBottleneckView,
    );
    bottleneck.setAttribute('aria-pressed', 'false');
    this.navDivider = el('span', { class: 'nav-divider' });

    this.nav = el('nav', { class: 'nav', attrs: { 'aria-label': 'Factory panels' } }, [
      navButton('production', 'Production', ICONS.stats, 'Production — what the factory makes, uses and sells, and what is holding it back', actions.toggleStats),
      navButton('contracts', 'Contracts', ICONS.contracts, 'Contracts (C) — bonus orders filled by selling', actions.toggleContracts),
      navButton('research', 'Research', ICONS.research, 'Research (T) — unlock new machines and products', actions.openResearch),
      navButton('floor', 'Floor', ICONS.expand, 'Factory floor — buy more space', actions.toggleExpansion),
      navButton('blueprints', 'Blueprints', ICONS.blueprints, 'Blueprints (P) — saved layouts you can place again', actions.toggleBlueprints),
      navButton('achievements', 'Achievements', ICONS.achievements, 'Achievements (G) — milestones and their rewards', actions.toggleAchievements),
      this.navDivider,
      bottleneck,
    ]);

    this.powerValue = el('span', { text: '0 / 0' });
    this.power = el('div', { class: 'status-item power' }, [el('span', { class: 'status-icon', html: ICONS.power }), this.powerValue]);
    attachTooltip(this.power, () => ({ title: 'Power', body: this.powerTip }));
    this.controls.set('power', this.power);

    this.starCount = el('span', { class: 'star-count' });
    const prestigeButton = el(
      'button',
      {
        class: 'status-item prestige-button',
        title: 'Stars — sell the factory and start again for permanent bonuses',
        onClick: actions.openPrestige,
        attrs: { type: 'button', 'aria-label': 'Sell up' },
      },
      [el('span', { class: 'status-icon', html: ICONS.prestige }), this.starCount],
    );
    this.controls.set('prestige', prestigeButton);

    const status = el('div', { class: 'statusbar' }, [
      el('div', { class: 'status-item money', title: 'Money' }, [el('span', { class: 'coin' }), this.money]),
      el(
        'button',
        {
          class: 'status-item income',
          title: 'Income — what the factory has earned per minute lately. Click for production figures.',
          onClick: actions.toggleStats,
          attrs: { type: 'button' },
        },
        [this.income],
      ),
      this.power,
      prestigeButton,
    ]);

    this.settingsButton = el('button', {
      class: 'pill icon-button',
      title: 'Settings',
      html: ICONS.settings,
      onClick: actions.openSettings,
      attrs: { type: 'button', 'aria-label': 'Settings' },
    });

    // Until the factory says otherwise, only what every factory needs is on show.
    for (const node of this.controls.values()) node.classList.add('hidden');

    const topbar = el('div', { class: 'topbar' }, [
      el('div', { class: 'topbar-group' }, [status, this.nav]),
      el('div', { class: 'topbar-group' }, [
        el('div', { class: 'pill speed' }, [
          speed(0, '', 'Pause (Space)'),
          speed(1, '1×', 'Normal speed'),
          speed(2, '2×', 'Double speed'),
        ]),
        this.settingsButton,
      ]),
    ]);
    root.append(topbar);
    this.trackSize(topbar);
  }

  /**
   * Publishes where the top bar ends as a CSS variable, since the hint and drop-down panels
   * sit just below it and it wraps on narrow windows. Also drops the navigation labels when
   * there is no room for them.
   */
  private trackSize(topbar: HTMLElement): void {
    const publish = () => {
      topbar.classList.toggle('compact', this.root.clientWidth < COMPACT_BELOW);
      topbar.classList.toggle('stacked', this.root.clientWidth < STACKED_BELOW);
      this.root.style.setProperty('--topbar-bottom', `${topbar.offsetTop + topbar.offsetHeight}px`);
    };
    const observer = new ResizeObserver(publish);
    observer.observe(topbar);
    observer.observe(this.root);
    publish();
  }

  /** The button a panel opens from, so the panel can grow out of it. */
  anchor(panel: HudPanel | 'prestige' | 'settings'): HTMLElement | null {
    return panel === 'settings' ? this.settingsButton : (this.controls.get(panel) ?? null);
  }

  /** Marks which panel is open on the navigation strip. */
  setOpenPanel(panel: HudPanel | null): void {
    for (const [control, node] of this.controls) {
      if (control !== 'bottleneck' && control !== 'power' && control !== 'prestige') {
        node.classList.toggle('active', control === panel);
      }
    }
  }

  /**
   * Brings in the controls the factory has grown into. Once shown, a control stays; one that
   * arrives during play is highlighted briefly so the player sees where it landed.
   */
  setVisibility(visible: Record<HudControl, boolean>): void {
    for (const control of HUD_CONTROLS) {
      if (!visible[control] || this.shown.has(control)) continue;
      this.shown.add(control);
      const node = this.controls.get(control);
      if (!node) continue;
      node.classList.remove('hidden');
      if (!this.firstVisibility) {
        node.classList.add('arrived');
        window.setTimeout(() => node.classList.remove('arrived'), HIGHLIGHT_MS);
      }
    }
    this.firstVisibility = false;
    // The divider only makes sense with a panel button on one side and the toggle on the other.
    this.navDivider.classList.toggle('hidden', !this.shown.has('bottleneck'));
  }

  setStars(stars: number): void {
    setText(this.starCount, String(stars));
  }

  /** Shows a dot on the Research button when something can be bought. */
  setResearchAvailable(available: boolean): void {
    this.controls.get('research')?.classList.toggle('has-dot', available);
  }

  /** Power used out of power available; turns red when the factory is short. */
  setPower(demand: number, supply: number): void {
    setText(this.powerValue, `${Math.round(demand)} / ${Math.round(supply)}`);
    const short = demand > supply;
    this.power.classList.toggle('short', short);
    this.powerTip = short
      ? `Machines want ${Math.round(demand)} but only ${Math.round(supply)} is available, so they all run at ${Math.round((supply / demand) * 100)}% speed.`
      : `${Math.round(demand)} in use of ${Math.round(supply)} available.`;
  }

  setBottleneckView(active: boolean): void {
    const button = this.controls.get('bottleneck');
    button?.classList.toggle('active', active);
    button?.setAttribute('aria-pressed', String(active));
  }

  setSpeed(speed: GameSpeed): void {
    this.root.classList.toggle('paused', speed === 0);
    for (const [value, button] of this.speedButtons) {
      button.classList.toggle('active', value === speed);
      button.setAttribute('aria-pressed', String(value === speed));
    }
  }

  update(state: GameState): void {
    const money = Math.floor(state.economy.money);
    if (money !== this.targetMoney) {
      // A quick bump draws the eye whenever income arrives.
      if (this.targetMoney >= 0 && money > this.targetMoney) {
        this.money.classList.remove('bump');
        void this.money.offsetWidth;
        this.money.classList.add('bump');
      }
      this.targetMoney = money;
      if (this.shownMoney < 0) this.showMoney(money);
    }
    setText(this.income, `+${formatMoney(state.economy.incomePerMinute())}/min`);
  }

  /** Every frame: rolls the money readout towards its real value instead of jumping there. */
  animate(realDt: number): void {
    if (this.shownMoney === this.targetMoney || this.targetMoney < 0) return;
    const gap = this.targetMoney - this.shownMoney;
    if (reducedMotion() || Math.abs(gap) < 1) return this.showMoney(this.targetMoney);
    const step = gap * Math.min(realDt * COUNT_RATE, 1);
    // Always move by at least a dollar, so the count finishes.
    this.showMoney(this.shownMoney + (Math.abs(step) < 1 ? Math.sign(gap) : step));
  }

  private showMoney(value: number): void {
    this.shownMoney = value;
    setText(this.money, formatMoney(Math.round(value)));
  }
}
