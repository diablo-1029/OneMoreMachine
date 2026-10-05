/** Longest frame step fed to the game; anything longer is treated as a stall, not as elapsed play time. */
const MAX_FRAME_DT = 0.25;
/** Most real time the background path will catch up in one go. */
const MAX_BACKGROUND_DT = 60;
const WATCHDOG_INTERVAL_MS = 500;

/**
 * Drives the game from requestAnimationFrame. Browsers stop delivering frames to hidden
 * tabs, so a timer watches for that and keeps the simulation (not the renderer) moving,
 * which lets the factory keep working while the tab is in the background.
 */
export class GameLoop {
  private lastTime = 0;

  constructor(
    /** Called once per rendered frame with real seconds since the previous one. */
    private readonly frame: (realDt: number) => void,
    /** Called instead of `frame` while frames are not being delivered. */
    private readonly background: (realDt: number) => void,
  ) {}

  start(): void {
    this.lastTime = performance.now();
    requestAnimationFrame(this.onFrame);
    window.setInterval(() => {
      const now = performance.now();
      const elapsed = (now - this.lastTime) / 1000;
      if (elapsed < WATCHDOG_INTERVAL_MS / 1000) return;
      this.lastTime = now;
      this.background(Math.min(elapsed, MAX_BACKGROUND_DT));
    }, WATCHDOG_INTERVAL_MS);
  }

  private readonly onFrame = (now: number): void => {
    const dt = Math.max(0, (now - this.lastTime) / 1000);
    this.lastTime = now;
    this.frame(Math.min(dt, MAX_FRAME_DT));
    requestAnimationFrame(this.onFrame);
  };
}
