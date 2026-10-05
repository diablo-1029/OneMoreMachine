import { formatMoney } from '../core/economy/Currency';
import { formatDuration, type OfflineReport } from '../core/game/OfflineProgress';
import { getResource, RESOURCE_DEFINITIONS } from '../data/resources';
import { el } from './dom';
import { conceal, isRevealed, reveal } from './reveal';

/** "Welcome back" summary of what the factory did while the game was closed or asleep. */
export class OfflineReportPanel {
  private readonly overlay: HTMLElement;
  private readonly body: HTMLElement;

  constructor(
    root: HTMLElement,
    private readonly onOpenChange: (open: boolean) => void,
  ) {
    this.body = el('div', { class: 'offline-body' });
    const dialog = el('div', { class: 'modal offline-modal', attrs: { role: 'dialog', 'aria-label': 'Welcome back' } }, [
      el('h2', { class: 'panel-title', text: 'Welcome back' }),
      this.body,
      el('button', {
        class: 'button primary',
        text: 'Back to work',
        attrs: { type: 'button' },
        onClick: () => this.close(),
      }),
    ]);
    this.overlay = el('div', { class: 'overlay hidden' }, [dialog]);
    this.overlay.addEventListener('click', (event) => {
      if (event.target === this.overlay) this.close();
    });
    window.addEventListener('keydown', (event) => {
      if (this.isOpen && (event.code === 'Escape' || event.code === 'Enter')) this.close();
    });
    root.append(this.overlay);
  }

  get isOpen(): boolean {
    return isRevealed(this.overlay);
  }

  show(report: OfflineReport): void {
    const sold = RESOURCE_DEFINITIONS.filter((r) => (report.sold[r.id] ?? 0) > 0).map((resource) => {
      const dot = el('span', { class: `resource-dot resource-${resource.icon}` });
      dot.style.background = getResource(resource.id).color;
      return el('div', { class: 'row' }, [
        el('span', { class: 'chip' }, [dot, resource.name]),
        el('span', { text: `${report.sold[resource.id].toLocaleString('en-US')} sold` }),
      ]);
    });

    const parts: (HTMLElement | null)[] = [
      el('p', {
        class: 'panel-description',
        text: report.capped
          ? `You were away for ${formatDuration(report.awaySeconds)}. The factory kept going at half pace for the first ${formatDuration(report.countedSeconds)}.`
          : `You were away for ${formatDuration(report.awaySeconds)}, and the factory kept going at half pace.`,
      }),
      el('div', { class: 'offline-earned' }, [
        el('span', { class: 'coin' }),
        el('span', { text: `+${formatMoney(report.earned)}` }),
      ]),
      ...(sold.length > 0 ? sold : [el('p', { class: 'muted', text: 'Nothing was sold — is anything reaching a Seller?' })]),
      report.contractsCompleted > 0
        ? el('div', { class: 'row' }, [
            el('span', { class: 'row-label', text: 'Contracts completed' }),
            el('span', { text: String(report.contractsCompleted) }),
          ])
        : null,
    ];
    this.body.replaceChildren(...parts.filter((part): part is HTMLElement => part !== null));
    reveal(this.overlay);
    this.onOpenChange(true);
  }

  close(): void {
    if (!this.isOpen) return;
    conceal(this.overlay);
    this.onOpenChange(false);
  }
}
