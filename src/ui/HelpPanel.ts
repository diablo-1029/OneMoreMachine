import { el } from './dom';
import { conceal, isRevealed, reveal } from './reveal';

const STEPS: string[] = [
  'Miners dig ore. Furnaces, Assemblers and the Fabricator turn it into things worth more.',
  'Conveyors carry items from a machine’s orange output to the next machine’s green input.',
  'Sellers turn whatever reaches them into money.',
  'Spend the money on more machines, on Research for new ones, and on a bigger floor.',
  'When something backs up or sits idle, find the bottleneck — and add one more machine.',
];

const PANELS: [string, string][] = [
  ['Production', 'What the factory makes, uses and sells each minute, with advice on what is holding it back.'],
  ['Bottlenecks', 'Colours every machine by how busy it is and marks belts that are backed up.'],
  ['Research', 'Unlocks new machines, products and upgrades. Paid for once, kept for good.'],
  ['Contracts', 'Bonus orders that are filled simply by selling. No deadlines.'],
  ['Floor', 'Buys more room. Everything already built stays where it is.'],
  ['Blueprints', 'Saved layouts. Copy part of the factory, save it, and place it again anywhere.'],
  ['Achievements', 'Milestones that pay a reward and unlock new looks for the factory.'],
  ['Stars', 'Sell the whole factory to start again with a permanent bonus to every sale.'],
];

const MOUSE: [string, string][] = [
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

const TOUCH: [string, string][] = [
  ['Tap', 'Place / select'],
  ['Drag', 'Lay belts · pan'],
  ['Two fingers', 'Pan and pinch to zoom'],
  ['Press and hold', 'What a button does'],
  ['Side buttons', 'Rotate · cancel · turn the view'],
];

const table = (rows: [string, string][]) =>
  el(
    'div',
    { class: 'controls' },
    rows.flatMap(([key, action]) => [el('kbd', { text: key }), el('span', { text: action })]),
  );

/** "How to play": the idea of the game in five lines, what each panel is for, and the controls. */
export class HelpPanel {
  private readonly overlay: HTMLElement;

  constructor(
    root: HTMLElement,
    private readonly onOpenChange: (open: boolean) => void = () => {},
  ) {
    const dialog = el('div', { class: 'modal help-modal', attrs: { role: 'dialog', 'aria-label': 'How to play' } }, [
      el('div', { class: 'panel-header' }, [
        el('h2', { class: 'panel-title', text: 'How to play' }),
        el('button', {
          class: 'panel-close',
          text: '×',
          title: 'Close (Esc)',
          attrs: { type: 'button', 'aria-label': 'Close' },
          onClick: () => this.close(),
        }),
      ]),
      el('ol', { class: 'help-steps' }, STEPS.map((text) => el('li', { text }))),
      el('p', { class: 'panel-description', text: 'The factory keeps working while the tab is in the background, and at half pace while the game is closed. It saves itself as you play.' }),
      el('h3', { class: 'modal-subtitle', text: 'The top bar' }),
      el(
        'dl',
        { class: 'help-panels' },
        PANELS.flatMap(([name, text]) => [el('dt', { text: name }), el('dd', { text })]),
      ),
      el('h3', { class: 'modal-subtitle', text: 'Mouse and keyboard' }),
      table(MOUSE),
      el('h3', { class: 'modal-subtitle', text: 'Touch' }),
      table(TOUCH),
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
    reveal(this.overlay, anchor);
    this.onOpenChange(true);
  }

  close(): void {
    if (!this.isOpen) return;
    conceal(this.overlay);
    this.onOpenChange(false);
  }
}
