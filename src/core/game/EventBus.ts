type Listener<T> = (payload: T) => void;

/** Minimal typed event emitter. The simulation publishes; renderers, UI and audio subscribe. */
export class EventBus<Events extends object> {
  private listeners: { [K in keyof Events]?: Listener<Events[K]>[] } = {};

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    (this.listeners[event] ??= []).push(listener);
    return () => this.off(event, listener);
  }

  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    const list = this.listeners[event];
    if (!list) return;
    const index = list.indexOf(listener);
    if (index >= 0) list.splice(index, 1);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const list = this.listeners[event];
    if (!list) return;
    for (const listener of list.slice()) listener(payload);
  }
}
