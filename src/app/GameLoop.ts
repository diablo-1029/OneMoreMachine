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
    /** Called once if either callback throws. The loop stops rather than failing every frame. */
    private readonly onError: (error: unknown) => void,
  ) {}

  private stopped = false;
  private watchdog = 0;

  /** Ends the loop for good. */
  stop(): void {
    this.stopped = true;
    window.clearInterval(this.watchdog);
  }

  private fail(error: unknown): void {
    if (this.stopped) return;
    this.stop();
    this.onError(error);
  }

  start(): void {
    this.lastTime = performance.now();
    this.lastWall = Date.now();
    requestAnimationFrame(this.onFrame);
    this.watchdog = window.setInterval(() => {
      const wall = Date.now();
      const elapsed = (wall - this.lastWall) / 1000;
      if (elapsed < WATCHDOG_INTERVAL_MS / 1000) return;
      this.lastWall = wall;
      this.lastTime = performance.now();
      // The full gap is passed on; the game decides how to catch up on a long one.
      try {
        this.background(elapsed);
      } catch (error) {
        this.fail(error);
      }
    }, WATCHDOG_INTERVAL_MS);
  }

  private readonly onFrame = (now: number): void => {
    const dt = Math.max(0, (now - this.lastTime) / 1000);
    this.lastTime = now;
    this.lastWall = Date.now();
    if (this.stopped) return;
    try {
      this.frame(Math.min(dt, MAX_FRAME_DT));
    } catch (error) {
      return this.fail(error);
    }
    requestAnimationFrame(this.onFrame);
  };
}
