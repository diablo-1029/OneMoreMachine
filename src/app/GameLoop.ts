/** Longest frame step fed to the game; anything longer is treated as a stall, not as elapsed play time. */
const MAX_FRAME_DT = 0.25;
const WATCHDOG_INTERVAL_MS = 500;

/**
 * Drives the game from requestAnimationFrame. Browsers stop delivering frames to hidden
 * tabs, so a timer watches for that and keeps the simulation (not the renderer) moving,
 * which lets the factory keep working while the tab is in the background.
 */
export class GameLoop {
  private lastTime = 0;
  /** Wall-clock time of the last frame or catch-up. Unlike performance.now(), it keeps counting while the computer sleeps. */
  private lastWall = 0;

  constructor(
    /** Called once per rendered frame with real seconds since the previous one. */
    private readonly frame: (realDt: number) => void,
    /** Called instead of `frame` while frames are not being delivered. */
    private readonly background: (realDt: number) => void,
  ) {}

  start(): void {
    this.lastTime = performance.now();
    this.lastWall = Date.now();
    requestAnimationFrame(this.onFrame);
    window.setInterval(() => {
      const wall = Date.now();
      const elapsed = (wall - this.lastWall) / 1000;
      if (elapsed < WATCHDOG_INTERVAL_MS / 1000) return;
      this.lastWall = wall;
      this.lastTime = performance.now();
      // The full gap is passed on; the game decides how to catch up on a long one.
      this.background(elapsed);
    }, WATCHDOG_INTERVAL_MS);
  }

  private readonly onFrame = (now: number): void => {
    const dt = Math.max(0, (now - this.lastTime) / 1000);
    this.lastTime = now;
    this.lastWall = Date.now();
    this.frame(Math.min(dt, MAX_FRAME_DT));
    requestAnimationFrame(this.onFrame);
  };
}
