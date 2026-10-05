import { formatMoney } from '../core/economy/Currency';
import type { GameState } from '../core/game/GameState';
import { analyzeBottlenecks, type BottleneckFinding } from '../core/stats/Bottlenecks';
import type { FactoryMetrics } from '../core/stats/FactoryMetrics';
import { RESOURCE_DEFINITIONS } from '../data/resources';
import { el, setText } from './dom';

const MAX_FINDINGS = 3;

interface RateCells {
  made: HTMLElement;
  used: HTMLElement;
  sold: HTMLElement;
}

/**
 * The Production panel under the income readout: what the factory makes, uses and sells
 * per minute, and the bottlenecks most worth fixing. Clicking a bottleneck jumps to it.
 */
export class StatsPanel {
  private readonly panel: HTMLElement;
  private readonly cells = new Map<string, RateCells>();
  private readonly total: HTMLElement;
  private readonly findings: HTMLElement;
  private findingsKey = '';

  constructor(
    root: HTMLElement,
    private readonly onFocusMachine: (machineId: string | null) => void,
  ) {
    const table = el('div', { class: 'stats-grid' }, [
      el('span', { class: 'muted', text: 'per minute' }),
      el('span', { class: 'muted', text: 'Made' }),
      el('span', { class: 'muted', text: 'Used' }),
      el('span', { class: 'muted', text: 'Sold' }),
    ]);
    for (const resource of RESOURCE_DEFINITIONS) {
      const dot = el('span', { class: `resource-dot resource-${resource.icon}` });
      dot.style.background = resource.color;
      const cells = { made: el('span', { text: '0' }), used: el('span', { text: '0' }), sold: el('span', { text: '0' }) };
      this.cells.set(resource.id, cells);
      table.append(el('span', { class: 'chip' }, [dot, resource.name]), cells.made, cells.used, cells.sold);
    }
    this.total = el('span', { text: '$0' });
    this.findings = el('div', { class: 'findings' });
    this.panel = el('div', { class: 'stats-panel hidden' }, [
      el('h2', { class: 'panel-title', text: 'Production' }),
      table,
      el('div', { class: 'row' }, [el('span', { class: 'row-label', text: 'Total earned' }), this.total]),
      el('h3', { class: 'modal-subtitle', text: 'Bottlenecks' }),
      this.findings,
    ]);
    root.append(this.panel);
  }

  toggle(): void {
    this.panel.classList.toggle('hidden');
    this.findingsKey = '';
  }

  hide(): void {
    this.panel.classList.add('hidden');
  }

  get visible(): boolean {
    return !this.panel.classList.contains('hidden');
  }

  update(state: GameState, metrics: FactoryMetrics): void {
    if (!this.visible) return;
    for (const [id, cells] of this.cells) {
      setText(cells.made, String(Math.round(metrics.rate('produced', id))));
      setText(cells.used, String(Math.round(metrics.rate('consumed', id))));
      setText(cells.sold, String(Math.round(metrics.rate('sold', id))));
    }
    setText(this.total, formatMoney(state.economy.totalEarned));
    this.showFindings(analyzeBottlenecks(state, metrics).slice(0, MAX_FINDINGS), state.factory.machines.size);
  }

  private showFindings(findings: BottleneckFinding[], machineCount: number): void {
    // Percentages wobble from tick to tick; only rebuild when the wording actually changes.
    const key = findings.map((f) => `${f.machineId}|${f.problem}|${f.fix}`).join('\n') + `#${machineCount > 0}`;
    if (key === this.findingsKey) return;
    this.findingsKey = key;

    if (findings.length === 0) {
      this.findings.replaceChildren(
        el('p', {
          class: 'muted finding-empty',
          text: machineCount > 0 ? 'Nothing is holding the factory back right now.' : 'Build something and it will be measured here.',
        }),
      );
      return;
    }
    this.findings.replaceChildren(
      ...findings.map((finding) =>
        el(
          'button',
          {
            class: `finding finding-${finding.kind}`,
            title: 'Show this machine',
            attrs: { type: 'button' },
            onClick: () => this.onFocusMachine(finding.machineId),
          },
          [el('span', { class: 'finding-problem', text: finding.problem }), el('span', { class: 'finding-fix', text: finding.fix })],
        ),
      ),
    );
  }
}
