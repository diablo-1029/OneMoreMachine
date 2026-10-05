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
import { el } from '../ui/dom';
import { MainMenu } from '../ui/MainMenu';
import { SettingsPanel } from '../ui/SettingsPanel';
import { GameLoop } from './GameLoop';
import { GameSession } from './GameSession';

/**
 * Application shell: creates the renderer and the scenery that exists on the menu,
 * then hands over to a GameSession once the player continues or starts a factory.
 */
export class App {
  private readonly saveManager = new SaveManager(new URLSearchParams(window.location.search).get('slot') ?? '');
  private readonly settings: GameSettings;
  private readonly audio: AudioManager;
  private renderer!: Renderer;
  private sceneManager!: SceneManager;
  private camera!: CameraController;
  private grid!: GridRenderer;
  private environment!: EnvironmentRenderer;
  private menu!: MainMenu;
  private session: GameSession | null = null;
  private starting = false;

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

    // Audio may only start after a user gesture.
    const unlock = () => this.audio.unlock();
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);

    const menuSettings = new SettingsPanel(this.uiRoot, this.settings, {
      onChange: (settings) => this.applySettings(settings),
    });
    this.menu = new MainMenu(this.uiRoot, {
      onContinue: () => void this.continueGame(),
      onNewFactory: () => void this.newGame(),
      onSettings: () => menuSettings.open(),
    });
    this.menu.show(await this.saveManager.hasSave());

    new GameLoop(
      (dt) => this.frame(dt),
      (dt) => this.session?.background(dt),
    ).start();
  }

  private buildWorld(width: number, height: number): void {
    setWorldGrid(width, height);
    this.grid.build(width, height);
    this.environment.build(width, height);
    this.sceneManager.lighting.setCoverage(Math.max(width, height));
    this.camera.setPanLimit(Math.max(width, height) / 2 + 5);
  }

  private applySettings(settings: GameSettings): void {
    this.audio.applySettings(settings);
    this.sceneManager.lighting.setShadows(settings.shadows);
    this.saveManager.saveSettings(settings);
  }

  private async continueGame(): Promise<void> {
    if (this.starting) return;
    this.starting = true;
    try {
      this.startSession(await this.saveManager.load());
    } catch {
      // Any failure to restore ends here rather than in a broken or crashed game.
      this.starting = false;
      this.menu.showLoadError();
    }
  }

  private async newGame(): Promise<void> {
    if (this.starting) return;
    this.starting = true;
    await this.saveManager.clear();
    this.startSession(createNewGame());
  }

  private startSession(state: GameState): void {
    const { width, height } = state.factory.grid;
    if (width !== DEFAULT_GRID_SIZE || height !== DEFAULT_GRID_SIZE) this.buildWorld(width, height);
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
    });
    this.menu.hide();

    if (import.meta.env.DEV) {
      // Console handle for poking at the simulation during development.
      (window as unknown as { __omm: unknown }).__omm = this.session;
    }
  }

  private frame(realDt: number): void {
    if (!this.session) this.camera.drift(realDt);
    this.camera.update(realDt);
    this.session?.frame(realDt);
    this.renderer.render(this.sceneManager.scene, this.camera.camera);
  }

  private showFatal(message: string): void {
    const box = el('div', { class: 'fatal' });
    box.style.whiteSpace = 'pre-line';
    box.textContent = message;
    document.body.append(box);
  }
}
