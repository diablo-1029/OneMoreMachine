import { describeContract, type Contract } from '../core/contracts/Contracts';
import { formatMoney } from '../core/economy/Currency';
import type { GameState } from '../core/game/GameState';
import type { FactoryMetrics } from '../core/stats/FactoryMetrics';
import { getResource } from '../data/resources';
import { el, setText } from './dom';

interface Card {
  id: number;
  root: HTMLElement;
  fill: HTMLElement;
  progress: HTMLElement;
}

/**
 * Drop-down listing the contracts on offer: bonus orders that are filled simply by selling.
 * Each shows live progress; "Swap" trades one for a different order at no cost.
 */
export class ContractsPanel {
  private readonly panel: HTMLElement;
  private readonly list: HTMLElement;
  private readonly completed: HTMLElement;
  private cards: Card[] = [];

  constructor(
    root: HTMLElement,
    private readonly onSwap: (contractId: number) => void,
  ) {
    this.list = el('div', { class: 'contracts' });
    this.completed = el('span', { class: 'muted' });
    this.panel = el('div', { class: 'contracts-panel hidden' }, [
      el('div', { class: 'panel-header' }, [el('h2', { class: 'panel-title', text: 'Contracts' }), this.completed]),
      el('p', {
        class: 'panel-description',
        text: 'Bonus orders. Anything your Sellers sell counts, and you keep the sale money too. No deadlines.',
      }),
      this.list,
    ]);
    root.append(this.panel);
  }

  toggle(): void {
    this.panel.classList.toggle('hidden');
  }

  hide(): void {
    this.panel.classList.add('hidden');
  }

  get visible(): boolean {
    return !this.panel.classList.contains('hidden');
  }

  private build(contracts: Contract[]): void {
    this.cards = contracts.map((contract) => {
      const resource = getResource(contract.resourceId);
      const dot = el('span', { class: `resource-dot resource-${resource.icon}` });
      dot.style.background = resource.color;
      const fill = el('div', { class: 'progress-fill' });
      const progress = el('span', { class: 'contract-progress' });
      const root = el('div', { class: 'contract' }, [
        el('div', { class: 'contract-title' }, [dot, describeContract(contract)]),
        el('div', { class: 'progress' }, [fill]),
        el('div', { class: 'contract-footer' }, [
          progress,
          el('span', { class: 'contract-reward', text: `+${formatMoney(contract.reward)}` }),
          el('button', {
            class: 'contract-swap',
            text: 'Swap',
            title: 'Trade this for a different order',
            attrs: { type: 'button' },
            onClick: () => this.onSwap(contract.id),
          }),
        ]),
      ]);
      return { id: contract.id, root, fill, progress };
    });
    this.list.replaceChildren(...this.cards.map((card) => card.root));
  }

  update(state: GameState, metrics: FactoryMetrics): void {
    if (!this.visible) return;
    const { active, completed } = state.contracts;
    // Rebuild only when the set of contracts changed; otherwise just move the bars.
    if (active.length !== this.cards.length || active.some((c, i) => c.id !== this.cards[i].id)) this.build(active);
    setText(this.completed, completed === 1 ? '1 completed' : `${completed} completed`);

    active.forEach((contract, i) => {
      const card = this.cards[i];
      const current =
        contract.kind === 'deliver' ? contract.progress : Math.round(metrics.windowTotal('sold', contract.resourceId));
      const shown = Math.min(current, contract.target);
      card.fill.style.width = `${Math.round((shown / contract.target) * 100)}%`;
      setText(
        card.progress,
        contract.kind === 'deliver' ? `${shown} / ${contract.target}` : `${shown} / ${contract.target} in the last minute`,
      );
    });
  }
}
