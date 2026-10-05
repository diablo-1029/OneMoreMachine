import * as THREE from 'three';
import type { AudioManager, SoundId } from '../audio/AudioManager';
import { describeContract } from '../core/contracts/Contracts';
import { formatMoney } from '../core/economy/Currency';
import { AUTOSAVE_INTERVAL, TICK_RATE } from '../core/game/Constants';
import type { GameState } from '../core/game/GameState';
import { Simulation } from '../core/game/Simulation';
import { TickSystem, type GameSpeed } from '../core/game/TickSystem';
import { currentHint } from '../core/game/Tutorial';
import type { SaveManager } from '../core/save/SaveManager';
import type { GameSettings } from '../core/save/SaveSchema';
import { InputManager } from '../input/InputManager';
import { PlacementController } from '../input/PlacementController';
import { BottleneckOverlay } from '../rendering/BottleneckOverlay';
import type { CameraController } from '../rendering/CameraController';
import { ConveyorRenderer } from '../rendering/ConveyorRenderer';
import { DebugRenderer } from '../rendering/DebugRenderer';
import { Effects } from '../rendering/effects/Effects';
import { FloatingText } from '../rendering/effects/FloatingText';
import { SelectionEffect } from '../rendering/effects/SelectionEffect';
import { ItemRenderer } from '../rendering/ItemRenderer';
import { machineCenter, MachineRenderer } from '../rendering/MachineRenderer';
import { PlacementRenderer } from '../rendering/PlacementRenderer';
import { RecipeMarkerRenderer } from '../rendering/RecipeMarkerRenderer';
import type { Renderer } from '../rendering/Renderer';
import type { SceneManager } from '../rendering/SceneManager';
import { StatusBadgeRenderer } from '../rendering/StatusBadgeRenderer';
import { BuildToolbar } from '../ui/BuildToolbar';
import { ContractsPanel } from '../ui/ContractsPanel';
import { DebugPanel } from '../ui/DebugPanel';
import { ExpansionPanel } from '../ui/ExpansionPanel';
import { el } from '../ui/dom';
import { HUD } from '../ui/HUD';
import { MachinePanel } from '../ui/MachinePanel';
import { NotificationSystem } from '../ui/NotificationSystem';
import { ResearchPanel } from '../ui/ResearchPanel';
import { SettingsPanel } from '../ui/SettingsPanel';
import { StatsPanel } from '../ui/StatsPanel';

/** Machine types that make a sound when they finish a craft. */
const PRODUCE_SOUNDS = new Set<string>(['miner', 'furnace', 'assembler']);
/** Ticks allowed per rendered frame before the backlog is dropped. */
const MAX_TICKS_PER_FRAME = 12;
const UI_INTERVAL = 0.1;
/** Delay between a layout change and the save it triggers, so a belt drag saves once. */
const SAVE_DEBOUNCE = 0.5;

export interface SessionContext {
  renderer: Renderer;
  sceneManager: SceneManager;
  camera: CameraController;
  audio: AudioManager;
  saveManager: SaveManager;
  settings: GameSettings;
  uiRoot: HTMLElement;
  onSettingsChanged: (settings: GameSettings) => void;
  /** Rebuilds the floor, scenery and camera limits for a new grid size. */
  onGridChanged: (width: number, height: number) => void;
}

/**
 * One running factory: the simulation plus everything that shows it and lets the player
 * act on it. This is the only place where simulation events are wired to rendering,
 * audio and UI.
 */
export class GameSession {
  readonly sim: Simulation;
  private readonly ticks = new TickSystem();
  private readonly effects: Effects;
  private readonly machines: MachineRenderer;
  private readonly conveyors: ConveyorRenderer;
  private readonly items: ItemRenderer;
  private readonly selection: SelectionEffect;
  private readonly badges: StatusBadgeRenderer;
  private readonly markers: RecipeMarkerRenderer;
  private readonly overlay: BottleneckOverlay;
  /** Price tag that follows the build ghost. */
  private readonly costLabel: HTMLElement;
  private readonly floatingText: FloatingText;
  private readonly placement: PlacementController;
  private readonly input: InputManager;
  private readonly hud: HUD;
  private readonly toolbar: BuildToolbar;
  private readonly machinePanel: MachinePanel;
  private readonly stats: StatsPanel;
  private readonly settingsPanel: SettingsPanel;
  private readonly researchPanel: ResearchPanel;
  private readonly expansionPanel: ExpansionPanel;
  private readonly contractsPanel: ContractsPanel;
  private readonly notifications: NotificationSystem;
  private readonly debugRenderer: DebugRenderer | null = null;
  private readonly debugPanel: DebugPanel | null = null;

  /** Animation clock; advances with game speed and stops when paused. */
  private animTime = 0;
  private realTime = 0;
  private uiTimer = 0;
  private autosaveTimer = 0;
  private saveCountdown = -1;
  private resumeSpeed: 1 | 2 = 1;
  private fps = 60;
  private readonly center = new THREE.Vector3();

  constructor(
    state: GameState,
    private readonly ctx: SessionContext,
  ) {
    const { scene } = ctx.sceneManager;
    const { factory } = state;
    this.sim = new Simulation(state);

    this.effects = new Effects(scene);
    this.conveyors = new ConveyorRenderer(scene);
    this.items = new ItemRenderer(scene);
    this.machines = new MachineRenderer(scene, this.effects);
    this.selection = new SelectionEffect(scene);
    this.badges = new StatusBadgeRenderer(scene);
    this.markers = new RecipeMarkerRenderer(scene);
    this.overlay = new BottleneckOverlay(scene);
    this.costLabel = el('div', { class: 'ghost-cost hidden' });
    ctx.uiRoot.append(this.costLabel);
    const preview = new PlacementRenderer(scene);
    this.floatingText = new FloatingText(ctx.uiRoot);

    this.placement = new PlacementController(
      this.sim,
      ctx.camera,
      this.machines,
      preview,
      this.selection,
      this.effects,
      ctx.audio,
    );
    this.input = new InputManager(ctx.renderer.canvas, ctx.camera, this.placement, {
      togglePause: () => this.togglePause(),
      toggleDebug: () => this.debugPanel?.toggle(),
      toggleBottleneckView: () => this.toggleBottleneckView(),
      toggleResearch: () => this.researchPanel.toggle(),
      toggleContracts: () => this.toggleDropdown(this.contractsPanel),
    });

    const click = () => ctx.audio.play('click');
    this.notifications = new NotificationSystem(ctx.uiRoot);
    this.hud = new HUD(ctx.uiRoot, {
      setSpeed: (speed) => {
        click();
        this.setSpeed(speed);
      },
      openSettings: () => {
        click();
        this.settingsPanel.open();
      },
      toggleStats: () => {
        click();
        this.toggleDropdown(this.stats);
      },
      toggleBottleneckView: () => {
        click();
        this.toggleBottleneckView();
      },
      openResearch: () => {
        click();
        this.researchPanel.toggle();
      },
      toggleExpansion: () => {
        click();
        this.toggleDropdown(this.expansionPanel);
      },
      toggleContracts: () => {
        click();
        this.toggleDropdown(this.contractsPanel);
      },
    });
    this.contractsPanel = new ContractsPanel(ctx.uiRoot, (id) => {
      click();
      this.sim.swapContract(id);
      this.requestSave();
      this.updateUi();
    });
    this.expansionPanel = new ExpansionPanel(ctx.uiRoot, () => this.expand());
    this.researchPanel = new ResearchPanel(
      ctx.uiRoot,
      () => this.sim.state,
      (id) => this.research(id),
      (open) => this.input.setEnabled(!open),
    );
    this.stats = new StatsPanel(ctx.uiRoot, (machineId) => this.focusMachine(machineId));
    this.toolbar = new BuildToolbar(ctx.uiRoot, this.placement, click);
    this.machinePanel = new MachinePanel(ctx.uiRoot, this.sim, this.placement, click);
    this.settingsPanel = new SettingsPanel(ctx.uiRoot, ctx.settings, {
      onChange: (settings) => {
        ctx.onSettingsChanged(settings);
        this.requestSave();
      },
      onOpenChange: (open) => this.input.setEnabled(!open),
      onSaveNow: () => {
        this.save();
        this.notifications.toast('Factory saved');
      },
      onMainMenu: () => {
        this.save();
        window.location.reload();
      },
    });

    if (import.meta.env.DEV) {
      const debugRenderer = new DebugRenderer(scene);
      this.debugRenderer = debugRenderer;
      this.debugPanel = new DebugPanel(ctx.uiRoot, (toggles) => {
        debugRenderer.setCoordinatesVisible(toggles.coordinates, factory.grid.width, factory.grid.height);
        debugRenderer.setFootprintsVisible(toggles.footprints);
        debugRenderer.refresh(factory);
      });
    }

    this.wireEvents();

    // Bring the visuals in line with a loaded save.
    for (const machine of factory.machines.values()) this.machines.add(machine, false);
    this.conveyors.invalidate();
    this.items.resetTracks(factory);
    this.notifications.setHint(currentHint(state));
    this.hud.setSpeed(this.ticks.speed);
    this.updateUi();

    window.addEventListener('pagehide', () => this.save());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.save();
    });
  }

  private wireEvents(): void {
    const { events } = this.sim;
    const { audio } = this.ctx;

    events.on('machinePlaced', (machine) => this.machines.add(machine, true));
    events.on('machineRemoved', (machine) => this.machines.remove(machine));
    events.on('machineChanged', (machine) => this.machines.updateTransform(machine));
    events.on('machineUpgraded', () => {
      this.requestSave();
      this.updateUi();
    });
    events.on('machineProduced', ({ machine }) => {
      this.machines.notify(machine.id);
      if (PRODUCE_SOUNDS.has(machine.type)) audio.play(machine.type as SoundId);
    });
    events.on('itemEntered', () => audio.play('thunk'));
    events.on('itemSold', ({ machine, value }) => {
      this.machines.notify(machine.id);
      audio.play('coin');
      machineCenter(machine, this.center);
      this.floatingText.spawn(this.center.x, 2.1, this.center.z, `+${formatMoney(value)}`);
    });
    events.on('topologyChanged', () => {
      this.conveyors.invalidate();
      this.debugRenderer?.refresh(this.sim.state.factory);
      this.requestSave();
    });
    events.on('tutorialAdvanced', () => this.notifications.setHint(currentHint(this.sim.state)));
    events.on('factoryExpanded', ({ width, height }) => {
      // Entities keep their place on the ground; only the floor around them grows.
      this.ctx.onGridChanged(width, height);
      for (const machine of this.sim.state.factory.machines.values()) this.machines.updateTransform(machine);
      this.items.resetTracks(this.sim.state.factory);
      this.debugRenderer?.resize(width, height);
      this.placement.refreshHover();
      audio.play('research');
      this.notifications.toast(`Factory floor expanded to ${width} × ${height}`);
      this.updateUi();
    });
    events.on('contractCompleted', (contract) => {
      audio.play('contract');
      this.notifications.toast(`Contract complete: ${describeContract(contract)} · +${formatMoney(contract.reward)}`);
      this.requestSave();
    });
    events.on('researchCompleted', (node) => {
      audio.play('research');
      this.notifications.toast(`Researched: ${node.name}`);
      this.requestSave();
      this.updateUi();
    });

    this.placement.events.on('message', (message) => this.notifications.toast(message));
  }

  /** The top-left drop-downs share one spot, so opening one closes the others. */
  private toggleDropdown(panel: { toggle: () => void; hide: () => void }): void {
    for (const other of [this.stats, this.expansionPanel, this.contractsPanel]) {
      if (other !== panel) other.hide();
    }
    panel.toggle();
    this.updateUi();
  }

  // ----------------------------------------------------------- expansion

  private expand(): void {
    const result = this.sim.expandFactory();
    if (!result.ok) {
      this.ctx.audio.play('error');
      if (result.reason === 'cannot_afford') this.notifications.toast('Not enough money');
    }
  }

  // ------------------------------------------------------------ research

  private research(id: string): void {
    const result = this.sim.research(id);
    if (!result.ok) {
      this.ctx.audio.play('error');
      if (result.reason === 'cannot_afford') this.notifications.toast('Not enough money');
    }
  }

  // ---------------------------------------------------------- bottlenecks

  toggleBottleneckView(): void {
    this.overlay.setEnabled(!this.overlay.isEnabled);
    this.hud.setBottleneckView(this.overlay.isEnabled);
  }

  /** Selects a machine and brings it to the middle of the screen. */
  private focusMachine(machineId: string): void {
    const machine = this.sim.state.factory.machines.get(machineId);
    if (!machine) return;
    machineCenter(machine, this.center);
    this.ctx.camera.focus(this.center.x, this.center.z);
    this.placement.setTool({ mode: 'select' });
    this.placement.select({ kind: 'machine', id: machineId });
  }

  /** Keeps the price tag beside the build ghost, red when the build is unaffordable. */
  private updateCostLabel(): void {
    const hover = this.placement.currentBuildHover;
    this.costLabel.classList.toggle('hidden', hover === null);
    if (!hover) return;
    const { renderer, camera } = this.ctx;
    this.center.set(hover.x, 0, hover.z).project(camera.camera);
    const x = (this.center.x * 0.5 + 0.5) * renderer.width;
    const y = (-this.center.y * 0.5 + 0.5) * renderer.height;
    this.costLabel.style.transform = `translate(-50%, 0) translate(${x.toFixed(1)}px, ${(y + 34).toFixed(1)}px)`;
    this.costLabel.textContent = formatMoney(hover.cost);
    this.costLabel.classList.toggle('unaffordable', !hover.affordable);
  }

  // --------------------------------------------------------------- speed

  setSpeed(speed: GameSpeed): void {
    this.ticks.speed = speed;
    if (speed !== 0) this.resumeSpeed = speed;
    this.hud.setSpeed(speed);
  }

  togglePause(): void {
    this.setSpeed(this.ticks.speed === 0 ? this.resumeSpeed : 0);
  }

  // ---------------------------------------------------------------- save

  save(): void {
    this.ctx.saveManager.save(this.sim.state, this.ctx.settings);
    this.autosaveTimer = 0;
    this.saveCountdown = -1;
  }

  private requestSave(): void {
    this.saveCountdown = SAVE_DEBOUNCE;
  }

  private updateSaving(realDt: number): void {
    this.autosaveTimer += realDt;
    if (this.saveCountdown >= 0) {
      this.saveCountdown -= realDt;
      if (this.saveCountdown < 0) this.save();
    }
    if (this.autosaveTimer >= AUTOSAVE_INTERVAL) this.save();
  }

  // --------------------------------------------------------------- frame

  /** One rendered frame. `realDt` is wall-clock seconds; the simulation gets fixed ticks out of it. */
  frame(realDt: number): void {
    const { factory } = this.sim.state;
    this.realTime += realDt;
    this.fps += (1 / Math.max(realDt, 0.001) - this.fps) * 0.05;

    this.input.update(realDt);

    this.ticks.advance(realDt, MAX_TICKS_PER_FRAME, () => {
      this.sim.tick();
      this.items.snapshot(factory);
    });

    const animDt = realDt * this.ticks.speed;
    this.animTime += animDt;
    this.conveyors.update(factory, animDt);
    this.machines.update(factory, animDt, realDt, this.animTime);
    this.items.update(this.ticks.alpha, this.animTime, animDt);
    this.effects.update(realDt);
    this.selection.update(this.realTime);
    this.badges.update(factory, this.sim.metrics, this.ctx.camera.camera, this.realTime);
    this.markers.update(factory, this.realTime);
    this.overlay.update(factory, this.sim.metrics, realDt);
    this.updateCostLabel();
    this.floatingText.update(realDt, this.ctx.camera.camera, this.ctx.renderer.width, this.ctx.renderer.height);
    this.ctx.audio.update(factory.conveyors.size, this.ticks.speed !== 0);

    this.updateSaving(realDt);
    this.uiTimer += realDt;
    if (this.uiTimer >= UI_INTERVAL) {
      this.uiTimer = 0;
      this.updateUi();
    }
  }

  /**
   * Keeps the factory producing while the tab is hidden and no frames arrive.
   * Simulation only; nothing is drawn.
   */
  background(realDt: number): void {
    const { factory } = this.sim.state;
    const ran = this.ticks.advance(realDt, Math.ceil(realDt * TICK_RATE * 2) + 1, () => this.sim.tick());
    if (ran > 0) this.items.resetTracks(factory);
    this.updateSaving(realDt);
  }

  private updateUi(): void {
    const { state } = this.sim;
    this.hud.update(state);
    this.toolbar.update(state);
    this.machinePanel.update();
    this.stats.update(state, this.sim.metrics);
    this.researchPanel.update();
    this.contractsPanel.update(state, this.sim.metrics);
    this.expansionPanel.update(state, this.sim.nextExpansion());
    this.hud.setResearchAvailable(this.researchPanel.hasAffordable());
    if (this.debugPanel?.visible) {
      const info = this.ctx.renderer.webgl.info.render;
      this.debugPanel.update({
        fps: this.fps,
        drawCalls: info.calls,
        triangles: info.triangles,
        machines: state.factory.machines.size,
        conveyors: state.factory.conveyors.size,
        items: this.items.visibleCount,
        simTime: state.simTime,
      });
    }
  }
}
