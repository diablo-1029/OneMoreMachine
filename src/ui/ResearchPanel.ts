import { formatMoney } from '../core/economy/Currency';
import { getMachineDef } from '../core/factory/MachineRegistry';
import type { GameState } from '../core/game/GameState';
import { getRecipe } from '../core/recipes/RecipeRegistry';
import { missingRequirements, researchDepth, researchStatus } from '../core/research/Research';
import { RESEARCH_NODES, type ResearchNode } from '../data/research';
import { getResource } from '../data/resources';
import { getUpgradeLevel } from '../data/upgrades';
import { el, setText } from './dom';

interface Card {
  node: ResearchNode;
  root: HTMLElement;
  state: HTMLElement;
  button: HTMLButtonElement;
}

/** What a node gives the player, in words: machine names and the products of its recipes. */
function unlockNames(node: ResearchNode): string[] {
  return [
    ...node.unlocks.machines.map((type) => getMachineDef(type).name),
    ...node.unlocks.recipes.map((id) => getResource(getRecipe(id).outputs[0].resourceId).name),
    ...(node.unlocks.upgrades ?? []).map((level) => `${getUpgradeLevel(level).name} upgrades`),
  ];
}

/**
 * The research tree as a modal: one column per depth, one card per node. Research is paid
 * for with money and completes at once.
 */
export class ResearchPanel {
  private readonly overlay: HTMLElement;
  private readonly cards: Card[] = [];
  /** True for the rest of the key event that opened the panel, so the same press cannot close it. */
  private justOpened = false;

  constructor(
    root: HTMLElement,
    private readonly getState: () => GameState,
    onResearch: (id: string) => void,
    private readonly onOpenChange: (open: boolean) => void,
  ) {
    const columns: HTMLElement[] = [];
    for (const node of RESEARCH_NODES) {
      const depth = researchDepth(node);
      columns[depth] ??= el('div', { class: 'research-column' });

      const state = el('span', { class: 'research-state' });
      const button = el('button', {
        class: 'button primary research-button',
        attrs: { type: 'button' },
        onClick: () => onResearch(node.id),
      });
      const card = el('div', { class: 'research-card' }, [
        el('h3', { class: 'research-name', text: node.name }),
        el('p', { class: 'research-description', text: node.description }),
        el('p', { class: 'research-unlocks' }, [el('span', { class: 'muted', text: 'Unlocks ' }), unlockNames(node).join(' · ')]),
        el('div', { class: 'research-footer' }, [state, button]),
      ]);
      columns[depth].append(card);
      this.cards.push({ node, root: card, state, button });
    }

    const dialog = el('div', { class: 'modal research-modal', attrs: { role: 'dialog', 'aria-label': 'Research' } }, [
      el('div', { class: 'panel-header' }, [
        el('h2', { class: 'panel-title', text: 'Research' }),
        el('button', {
          class: 'panel-close',
          text: '×',
          title: 'Close (Esc)',
          attrs: { type: 'button', 'aria-label': 'Close' },
          onClick: () => this.close(),
        }),
      ]),
      el('p', { class: 'panel-description', text: 'Spend money to unlock new machines and products. Nothing is ever taken away.' }),
      el('div', { class: 'research-tree' }, columns),
    ]);

    this.overlay = el('div', { class: 'overlay hidden' }, [dialog]);
    this.overlay.addEventListener('click', (event) => {
      if (event.target === this.overlay) this.close();
    });
    window.addEventListener('keydown', (event) => {
      if (!this.isOpen || this.justOpened) return;
      if (event.code === 'Escape' || event.code === 'KeyT') {
        // The game's own key handling is switched off while the panel is open.
        event.stopPropagation();
        this.close();
      }
    });
    root.append(this.overlay);
  }

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

  /** Whether anything could be researched right now; drives the dot on the HUD button. */
  hasAffordable(): boolean {
    const { research, economy } = this.getState();
    return RESEARCH_NODES.some(
      (node) => researchStatus(research, node) === 'available' && economy.canAfford(node.cost),
    );
  }

  /** Refreshes card states. Called while open, and after each purchase. */
  update(): void {
    if (!this.isOpen) return;
    const { research, economy } = this.getState();
    for (const card of this.cards) {
      const status = researchStatus(research, card.node);
      card.root.dataset.status = status;
      card.button.classList.toggle('hidden', status !== 'available');
      if (status === 'done') {
        setText(card.state, 'Researched');
      } else if (status === 'locked') {
        const missing = missingRequirements(research, card.node).map((n) => n.name);
        setText(card.state, `Needs ${missing.join(' and ')} · ${formatMoney(card.node.cost)}`);
      } else {
        const affordable = economy.canAfford(card.node.cost);
        setText(card.state, affordable ? '' : `${formatMoney(card.node.cost - Math.floor(economy.money))} short`);
        setText(card.button, `Research ${formatMoney(card.node.cost)}`);
        card.button.disabled = !affordable;
      }
    }
  }
}
