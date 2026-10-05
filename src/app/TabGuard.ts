/**
 * Keeps one factory from being played in two tabs at once. Both would autosave to the same
 * place, and whichever saved last would silently undo the other. When a second tab opens the
 * same factory it announces itself, and the tab that was already open stands down.
 */
export class TabGuard {
  private readonly channel: BroadcastChannel | null = null;
  private readonly id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  constructor(slot: string, onSuperseded: () => void) {
    if (typeof BroadcastChannel === 'undefined') return;
    this.channel = new BroadcastChannel(`omm.factory.${slot || 'main'}`);
    this.channel.addEventListener('message', (event: MessageEvent<unknown>) => {
      if (isOpening(event.data, this.id)) {
        this.channel?.close();
        onSuperseded();
      }
    });
    this.channel.postMessage({ type: 'opened', id: this.id });
  }
}

/** True for another tab's announcement that it has opened this factory. */
export function isOpening(message: unknown, ownId: string): boolean {
  if (typeof message !== 'object' || message === null) return false;
  const { type, id } = message as { type?: unknown; id?: unknown };
  return type === 'opened' && typeof id === 'string' && id !== ownId;
}
