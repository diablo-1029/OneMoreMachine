import { AudioManager } from '../audio/AudioManager';
import { DEFAULT_GRID_SIZE } from '../core/game/Constants';
import { createNewGame, type GameState } from '../core/game/GameState';
import { SaveManager } from '../core/save/SaveManager';
import type { GameSettings } from '../core/save/SaveSchema';
import { CameraController } from '../rendering/CameraController';
import { EnvironmentRenderer } from '../rendering/EnvironmentRenderer';
import { GridRenderer } from '../rendering/GridRenderer';
import { Renderer, WebGLUnavailableError } from '../rendering/Renderer';
import { SceneManager } from '../rendering/SceneManager';
import { setWorldGrid } from '../rendering/WorldMapping';
import { resolveCosmetics } from '../data/cosmetics';
import { DEFAULT_ENVIRONMENT, getEnvironment } from '../data/environments';
import { SaveError } from '../core/save/SaveSchema';
import { el } from '../ui/dom';
import { downloadText, pickTextFile, saveFileName, showNotice } from '../ui/Notice';
import { reducedMotion, setMotionPreference, setUiScale } from '../ui/preferences';
import { HelpPanel } from '../ui/HelpPanel';
import { MainMenu } from '../ui/MainMenu';
import { SettingsPanel } from '../ui/SettingsPanel';
import { GameLoop } from './GameLoop';
import { GameSession } from './GameSession';
import { TabGuard } from './TabGuard';

const CONTINUE_FLAG = 'omm.continue';

/**
 * Application shell: creates the renderer and the scenery that exists on the menu,
 * then hands over to a GameSession once the player continues or starts a factory.
 */
export class App {
  private readonly slot = new URLSearchParams(window.location.search).get('slot') ?? '';
  private readonly saveManager = new SaveManager(this.slot);
  private loop: GameLoop | null = null;
  private failed = false;
  private readonly settings: GameSettings;
  private readonly audio: AudioManager;
  private renderer!: Renderer;
  private sceneManager!: SceneManager;
  private camera!: CameraController;
  private grid!: GridRenderer;
  private environment!: EnvironmentRenderer;
  private menu!: MainMenu;
  private help!: HelpPanel;
  private session: GameSession | null = null;
  private starting = false;
  /** The environment currently drawn: the chosen one in play, or the one being previewed on the menu. */
  private environmentId = DEFAULT_ENVIRONMENT;

  constructor(
    private readonly viewport: HTMLElement,
    private readonly uiRoot: HTMLElement,
  ) {
    this.settings = this.saveManager.loadSettings();
    this.audio = new AudioManager(this.settings);
  }

  async start(): Promise<void> {
    try {
      this.renderer = new Renderer(this.viewport);
    } catch (error) {
      if (error instanceof WebGLUnavailableError) {
        this.showFatal('Your browser could not start the 3D renderer.\nPlease update your browser or enable hardware acceleration.');
        return;
      }
      throw error;
    }

    this.sceneManager = new SceneManager();
    this.camera = new CameraController();
    this.grid = new GridRenderer(this.sceneManager.scene);
    this.environment = new EnvironmentRenderer(this.sceneManager.scene);
    this.buildWorld(DEFAULT_GRID_SIZE, DEFAULT_GRID_SIZE);
    this.applySettings(this.settings);
    this.renderer.onResize((width, height) => this.camera.setAspect(width / height));

    // "Match system" follows the operating system setting if it changes while the game is open.
    window.matchMedia?.('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
      setMotionPreference(this.settings.reduceMotion);
    });

    // An error in a button or key handler does not stop the game, but the player should
    // not be left wondering why nothing happened. Said at most once every few seconds.
    let lastReported = -Infinity;
    const report = (message: string) => {
      // Browser housekeeping and other people's scripts are not the game going wrong.
      if (this.failed || /ResizeObserver|Script error/i.test(message)) return;
      if (performance.now() - lastReported < 8000) return;
      lastReported = performance.now();
      this.session?.notify('That did not work — something went wrong. If the game seems off, reload the page.', 6);
    };
    window.addEventListener('error', (event) => report(event.message));
    window.addEventListener('unhandledrejection', (event) => report(String((event.reason as Error | undefined)?.message ?? event.reason)));

    // Audio may only start after a user gesture.
    const unlock = () => this.audio.unlock();
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);

    // One How to play page serves the menu and the game; in play it holds the controls back.
    this.help = new HelpPanel(this.uiRoot, (open) => this.session?.setInputEnabled(!open));
    const menuSettings = new SettingsPanel(this.uiRoot, this.settings, {
      onChange: (settings) => this.applySettings(settings),
      onHelp: () => this.help.open(),
    });
    this.menu = new MainMenu(this.uiRoot, {
      onContinue: () => void this.continueGame(),
      onNewFactory: (environmentId) => void this.newGame(environmentId),
      onPreviewEnvironment: (environmentId) => this.showEnvironment(environmentId),
      onSettings: () => menuSettings.open(),
      onHelp: () => this.help.open(),
      onLoadFile: () => void this.loadSaveFile(),
    });
    this.menu.show(await this.saveManager.hasSave());
    // Straight back into play after selling up, without a stop at the menu.
    if (this.takeFlag(CONTINUE_FLAG)) void this.continueGame();

    this.loop = new GameLoop(
      (dt) => this.frame(dt),
      (dt) => this.session?.background(dt),
      (error) => this.fail(error),
    );
    this.loop.start();

    let graphicsNotice: { close: () => void } | null = null;
    this.renderer.onContextChange((lost) => {
      graphicsNotice?.close();
      graphicsNotice = lost
        ? showNotice(this.uiRoot, {
            title: 'Graphics were reset',
            body: 'The browser took the 3D view away for a moment. Your factory is still running and will reappear when it comes back. If it does not, reload the page.',
            actions: [{ label: 'Reload', primary: true, onClick: () => this.reload() }],
          })
        : null;
    });
  }

  private reload(): void {
    this.session?.saveIfSound();
    window.location.reload();
  }

  /**
   * The end of the line for an error nothing else caught. The factory is saved if it is still
   * sound, everything stops, and the player is told what happened and how to carry on.
   */
  fail(error: unknown): void {
    if (this.failed) return;
    this.failed = true;
    console.error(error);
    this.loop?.stop();
    try {
      this.session?.saveIfSound();
      this.session?.retire();
    } catch {
      // The last good save stands.
    }
    showNotice(this.uiRoot, {
      title: 'Something went wrong',
      body: 'The game hit an error and had to stop. Your factory was saved a moment ago; reloading should bring it back.',
      detail: error instanceof Error ? error.message : String(error),
      actions: [
        { label: 'Reload', primary: true, onClick: () => window.location.reload() },
        { label: 'Download my save', onClick: () => void this.downloadStoredSave() },
      ],
    });
  }

  private async downloadStoredSave(): Promise<void> {
    const text = await this.saveManager.exportText();
    if (text) downloadText(saveFileName(), text);
  }

  /** Brings in a factory from a file, after checking with the player if it would replace one. */
  private async loadSaveFile(): Promise<void> {
    if (this.session || (await this.saveManager.hasSave())) {
      const confirmed = await new Promise<boolean>((resolve) => {
        const notice = showNotice(this.uiRoot, {
          title: 'Replace your factory?',
          body: 'Loading a save file replaces the factory saved in this browser. This cannot be undone.',
          actions: [
            { label: 'Choose a file', primary: true, onClick: () => (notice.close(), resolve(true)) },
            { label: 'Cancel', onClick: () => (notice.close(), resolve(false)) },
          ],
        });
      });
      if (!confirmed) return;
    }
    const text = await pickTextFile('.json,application/json');
    if (text === null) return;
    try {
      this.saveManager.importText(text, this.settings);
    } catch (error) {
      const notice = showNotice(this.uiRoot, {
        title: 'Could not load that file',
        body: 'It is not a One More Machine save, or it is damaged. Nothing was changed.',
        detail: error instanceof SaveError ? error.message : undefined,
        actions: [{ label: 'OK', primary: true, onClick: () => notice.close() }],
      });
      return;
    }
    // The page restarts on the loaded factory; the one being played must not save over it.
    this.session?.retire();
    this.setFlag(CONTINUE_FLAG);
    window.location.reload();
  }

  /** Redraws the scenery for another environment, keeping the floor as it is. */
  private showEnvironment(environmentId: string): void {
    if (this.session || environmentId === this.environmentId) return;
    this.environmentId = environmentId;
    const { theme } = getEnvironment(environmentId);
    this.environment.build(DEFAULT_GRID_SIZE, DEFAULT_GRID_SIZE, theme);
    this.sceneManager.setTheme(theme);
  }

  private buildWorld(width: number, height: number): void {
    const { theme } = getEnvironment(this.environmentId);
    setWorldGrid(width, height);
    this.grid.build(width, height);
    this.environment.build(width, height, theme);
    this.sceneManager.setTheme(theme);
    this.sceneManager.lighting.setCoverage(Math.max(width, height));
    this.camera.setWorldSize(Math.max(width, height));
  }

  private applySettings(settings: GameSettings): void {
    this.audio.applySettings(settings);
    this.sceneManager.lighting.setShadows(settings.shadows);
    // Choices the current factory has not unlocked fall back to the defaults.
    const look = resolveCosmetics(settings.cosmetics, this.session?.cosmeticProgress() ?? null);
    this.grid.setStyle(look.floor);
    this.sceneManager.lighting.setStyle(look.light);
    this.session?.setBeltStyle(look.belt);
    setUiScale(this.uiRoot, settings.uiScale);
    setMotionPreference(settings.reduceMotion);
    this.saveManager.saveSettings(settings);
  }

  private async continueGame(): Promise<void> {
    if (this.starting) return;
    this.starting = true;
    try {
      const { state, savedAt } = await this.saveManager.load();
      // A clock that has gone backwards gives a negative gap, which counts as no time away.
      this.startSession(state, savedAt > 0 ? (Date.now() - savedAt) / 1000 : 0);
    } catch {
      // Any failure to restore ends here rather than in a broken or crashed game.
      this.starting = false;
      this.menu.showLoadError();
    }
  }

  private async newGame(environmentId: string): Promise<void> {
    if (this.starting) return;
    this.starting = true;
    await this.saveManager.clear();
    this.startSession(createNewGame(getEnvironment(environmentId).id), 0);
  }

  private startSession(state: GameState, awaySeconds: number): void {
    const { width, height } = state.factory.grid;
    const sizeChanged = width !== DEFAULT_GRID_SIZE || height !== DEFAULT_GRID_SIZE;
    if (sizeChanged || state.environment !== this.environmentId) {
      this.environmentId = state.environment;
      this.buildWorld(width, height);
    }
    this.camera.settle();
    this.session = new GameSession(state, {
      renderer: this.renderer,
      sceneManager: this.sceneManager,
      camera: this.camera,
      audio: this.audio,
      saveManager: this.saveManager,
      settings: this.settings,
      uiRoot: this.uiRoot,
      onSettingsChanged: (settings) => this.applySettings(settings),
      onGridChanged: (w, h) => this.buildWorld(w, h),
      awaySeconds,
      onLoadSaveFile: () => void this.loadSaveFile(),
      onHelp: () => this.help.open(),
      onPrestige: (next) => {
        // The page is reloaded onto the new factory; a session is only ever built once per page.
        this.saveManager.save(next, this.settings);
        this.setFlag(CONTINUE_FLAG);
        window.location.reload();
      },
    });
    this.menu.hide();
    const session = this.session;
    new TabGuard(this.slot, () => {
      session.retire();
      showNotice(this.uiRoot, {
        title: 'Open in another tab',
        body: 'This factory has been opened in another tab, which has taken over. To play here instead, close that tab and reload this one.',
        actions: [{ label: 'Reload', primary: true, onClick: () => window.location.reload() }],
      });
    });
    // Now that there is a factory, cosmetics it has unlocked can be shown.
    this.applySettings(this.settings);

    if (import.meta.env.DEV) {
      // Console handle for poking at the simulation during development.
      (window as unknown as { __omm: unknown }).__omm = this.session;
    }
  }

  private frame(realDt: number): void {
    // The slow turn behind the menu is decoration, so it is the first thing reduced motion stops.
    if (!this.session && !reducedMotion()) this.camera.drift(realDt);
    this.camera.update(realDt);
    this.session?.frame(realDt);
    this.renderer.render(this.sceneManager.scene, this.camera.camera);
  }

  private setFlag(key: string): void {
    try {
      sessionStorage.setItem(key, '1');
    } catch {
      // Without it the player simply lands on the menu and presses Continue.
    }
  }

  /** Reads and clears a one-shot flag left for the next page load. */
  private takeFlag(key: string): boolean {
    try {
      const set = sessionStorage.getItem(key) === '1';
      sessionStorage.removeItem(key);
      return set;
    } catch {
      return false;
    }
  }

  private showFatal(message: string): void {
    const box = el('div', { class: 'fatal' });
    box.style.whiteSpace = 'pre-line';
    box.textContent = message;
    document.body.append(box);
  }
}
