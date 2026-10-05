import * as THREE from 'three';
import type { AudioManager, SoundId } from '../audio/AudioManager';
import { BlueprintLibrary } from '../core/blueprints/BlueprintLibrary';
import { describeContract } from '../core/contracts/Contracts';
import { formatMoney } from '../core/economy/Currency';
import { getMachineDef } from '../core/factory/MachineRegistry';
import { AUTOSAVE_INTERVAL, DEFAULT_GRID_SIZE, TICK_RATE } from '../core/game/Constants';
import { applyOfflineProgress, mergeReports, OFFLINE, type OfflineReport } from '../core/game/OfflineProgress';
import type { GameState } from '../core/game/GameState';
import { createPrestigeGame } from '../core/game/Prestige';
import { Simulation } from '../core/game/Simulation';
import { TickSystem, type GameSpeed } from '../core/game/TickSystem';
import { currentHint } from '../core/game/Tutorial';
import type { SaveManager } from '../core/save/SaveManager';
import type { GameSettings } from '../core/save/SaveSchema';
import { restoreGame, serializeGame } from '../core/save/Serializer';
import type { BeltStyle, CosmeticProgress } from '../data/cosmetics';
import { EXPANSION_STEPS } from '../data/expansion';
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
import { AchievementsPanel } from '../ui/AchievementsPanel';
import { BlueprintsPanel } from '../ui/BlueprintsPanel';
import { BuildToolbar } from '../ui/BuildToolbar';
import { ContractsPanel } from '../ui/ContractsPanel';
import { DebugPanel } from '../ui/DebugPanel';
import { EfficiencyLabels } from '../ui/EfficiencyLabels';
import { ExpansionPanel } from '../ui/ExpansionPanel';
import { el } from '../ui/dom';
import { HoverCard } from '../ui/HoverCard';
import { HUD, type HudPanel } from '../ui/HUD';
import { hudVisibility } from '../ui/hudVisibility';
import { KeyHints } from '../ui/KeyHints';
import { MachinePanel } from '../ui/MachinePanel';
import { downloadText, saveFileName } from '../ui/Notice';
import { NotificationSystem } from '../ui/NotificationSystem';
import { OfflineReportPanel } from '../ui/OfflineReportPanel';
import { uiScale } from '../ui/preferences';
import { PrestigePanel } from '../ui/PrestigePanel';
import { ResearchPanel } from '../ui/ResearchPanel';
import { SettingsPanel } from '../ui/SettingsPanel';
import { StatsPanel } from '../ui/StatsPanel';
import { TouchControls } from '../ui/TouchControls';

/** Machine types that make a sound when they finish a craft. */
const PRODUCE_SOUNDS = new Set<string>(['miner', 'furnace', 'assembler']);
/** Ticks allowed per rendered frame before the backlog is dropped. */
const MAX_TICKS_PER_FRAME = 12;
const UI_INTERVAL = 0.1;
/** Background catch-up shorter than this in total is not worth a "welcome back" message. */
const REPORT_AFTER_SECONDS = 300;
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
  /** Seconds since the loaded save was written; 0 for a new factory. */
  awaySeconds: number;
  /** Asks for a save file and, if the player goes through with it, replaces this factory. */
  onLoadSaveFile: () => void;
  /** Replaces this factory with a newly founded one and restarts the game on it. */
  onPrestige: (next: GameState) => void;
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
  private readonly offlinePanel: OfflineReportPanel;
  private readonly achievementsPanel: AchievementsPanel;
  private readonly blueprintsPanel: BlueprintsPanel;
  private readonly blueprints: BlueprintLibrary;
  private readonly hoverCard: HoverCard;
  private readonly efficiencyLabels: EfficiencyLabels;
  private readonly prestigePanel: PrestigePanel;
  /** True once this factory has been sold; from then on it must never be saved again. */
  private retired = false;
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
  /** Catch-up done while no frames were being drawn, to be reported when the player is back. */
  private pendingReport: OfflineReport | null = null;
  private fps = 60;
  private readonly center = new THREE.Vector3();

  constructor(
    state: GameState,
    private readonly ctx: SessionContext,
  ) {
    const { scene } = ctx.sceneManager;
    const { factory } = state;
    this.sim = new Simulation(state);
    // Catch up on time away before anything is listening, so thousands of sales do not
    // each fire a sound and a popup.
    const offlineReport = applyOfflineProgress(this.sim, ctx.awaySeconds);

    this.effects = new Effects(scene);
    this.conveyors = new ConveyorRenderer(scene);
    this.items = new ItemRenderer(scene);
    this.machines = new MachineRenderer(scene, this.effects);
    this.selection = new SelectionEffect(scene);
    this.badges = new StatusBadgeRenderer(scene);
    this.markers = new RecipeMarkerRenderer(scene);
    this.overlay = new BottleneckOverlay(scene);
    this.costLabel = el('div', { class: 'ghost-cost hidden' });
    this.efficiencyLabels = new EfficiencyLabels(ctx.uiRoot);
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
      toggleResearch: () => this.researchPanel.toggle(this.hud.anchor('research')),
      toggleContracts: () => this.toggleDropdown(this.contractsPanel, 'contracts'),
      toggleAchievements: () => this.achievementsPanel.toggle(this.hud.anchor('achievements')),
      toggleBlueprints: () => this.toggleDropdown(this.blueprintsPanel, 'blueprints'),
      pickTool: (index) => this.toolbar.pick(index),
      cycleToolGroup: () => this.toolbar.cycleGroup(),
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
        this.settingsPanel.open(this.hud.anchor('settings'));
      },
      toggleStats: () => {
        click();
        this.toggleDropdown(this.stats, 'production');
      },
      toggleBottleneckView: () => {
        click();
        this.toggleBottleneckView();
      },
      openResearch: () => {
        click();
        this.researchPanel.toggle(this.hud.anchor('research'));
      },
      toggleExpansion: () => {
        click();
        this.toggleDropdown(this.expansionPanel, 'floor');
      },
      toggleContracts: () => {
        click();
        this.toggleDropdown(this.contractsPanel, 'contracts');
      },
      toggleAchievements: () => {
        click();
        this.achievementsPanel.toggle(this.hud.anchor('achievements'));
      },
      toggleBlueprints: () => {
        click();
        this.toggleDropdown(this.blueprintsPanel, 'blueprints');
      },
      openPrestige: () => {
        click();
        this.prestigePanel.open(this.hud.anchor('prestige'));
      },
    });
    this.prestigePanel = new PrestigePanel(
      ctx.uiRoot,
      this.sim,
      (environmentId) => this.prestige(environmentId),
      (open) => this.input.setEnabled(!open),
    );
    let storage: Storage | null = null;
    try {
      storage = window.localStorage;
    } catch {
      // Storage blocked: blueprints still work, they just will not outlive the page.
    }
    this.blueprints = new BlueprintLibrary(storage);
    this.blueprintsPanel = new BlueprintsPanel(ctx.uiRoot, this.blueprints, this.placement, click);
    this.achievementsPanel = new AchievementsPanel(ctx.uiRoot, this.sim, (open) => this.input.setEnabled(!open));
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
    new KeyHints(ctx.uiRoot, this.placement);
    new TouchControls(ctx.uiRoot, this.placement, ctx.camera, click);
    this.hoverCard = new HoverCard(ctx.uiRoot, this.sim);
    this.machinePanel = new MachinePanel(ctx.uiRoot, this.sim, this.placement, click);
    this.settingsPanel = new SettingsPanel(ctx.uiRoot, ctx.settings, {
      onChange: (settings) => {
        ctx.onSettingsChanged(settings);
        this.requestSave();
      },
      onOpenChange: (open) => this.input.setEnabled(!open),
      getProgress: () => this.cosmeticProgress(),
      onSaveNow: () => {
        this.save();
        this.notifications.toast('Factory saved');
      },
      onMainMenu: () => {
        this.save();
        window.location.reload();
      },
      onDownloadSave: () => {
        this.save();
        downloadText(saveFileName(), JSON.stringify(serializeGame(this.sim.state, ctx.settings)));
      },
      onLoadSave: ctx.onLoadSaveFile,
    });
    // Told once; a toast every half minute would only be noise.
    let warned = false;
    ctx.saveManager.onFailure = () => {
      if (warned) return;
      warned = true;
      this.notifications.toast('Could not save — browser storage is full or blocked. Download a save from Settings.', 8);
    };

    if (import.meta.env.DEV) {
      const debugRenderer = new DebugRenderer(scene);
      this.debugRenderer = debugRenderer;
      this.debugPanel = new DebugPanel(ctx.uiRoot, (toggles) => {
        debugRenderer.setCoordinatesVisible(toggles.coordinates, factory.grid.width, factory.grid.height);
        debugRenderer.setFootprintsVisible(toggles.footprints);
        debugRenderer.refresh(factory);
      });
    }

    this.offlinePanel = new OfflineReportPanel(ctx.uiRoot, (open) => this.input.setEnabled(!open));
    this.wireEvents();

    // Bring the visuals in line with a loaded save.
    for (const machine of factory.machines.values()) this.machines.add(machine, false);
    this.conveyors.invalidate();
    this.items.resetTracks(factory);
    this.notifications.setHint(currentHint(state));
    this.hud.setSpeed(this.ticks.speed);
    this.updateUi();
    if (offlineReport) {
      this.offlinePanel.show(offlineReport);
      this.save();
    }

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
    events.on('achievementsUnlocked', (unlocked) => {
      audio.play('achievement');
      const reward = unlocked.reduce((sum, a) => sum + a.reward, 0);
      // An old save can earn a dozen at once; one line is enough for that.
      this.notifications.toast(
        unlocked.length === 1
          ? `Achievement: ${unlocked[0].name} · +${formatMoney(reward)}`
          : `${unlocked.length} achievements unlocked · +${formatMoney(reward)}`,
      );
      this.requestSave();
      this.achievementsPanel.update();
      // A chosen cosmetic may just have become available.
      this.ctx.onSettingsChanged(this.ctx.settings);
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
  private toggleDropdown(panel: { toggle: (anchor?: HTMLElement | null) => void; hide: () => void }, name: HudPanel): void {
    for (const other of [this.stats, this.expansionPanel, this.contractsPanel, this.blueprintsPanel]) {
      if (other !== panel) other.hide();
    }
    panel.toggle(this.hud.anchor(name));
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

  // ----------------------------------------------------------- cosmetics

  /** What this factory has earned towards unlocking cosmetics. */
  cosmeticProgress(): CosmeticProgress {
    return { achievements: this.sim.state.achievements.length, stars: this.sim.state.prestige.stars };
  }

  setBeltStyle(style: BeltStyle): void {
    this.conveyors.setBeltStyle(style);
  }

  // ------------------------------------------------------------ prestige

  private prestige(environmentId: string): void {
    const next = createPrestigeGame(this.sim.state, environmentId);
    if (!next) return;
    this.retired = true;
    this.ctx.onPrestige(next);
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
  private focusMachine(machineId: string | null): void {
    // Factory-wide findings (a power shortage) have no single machine to jump to.
    const machine = machineId ? this.sim.state.factory.machines.get(machineId) : undefined;
    if (!machine) return;
    machineCenter(machine, this.center);
    this.ctx.camera.focus(this.center.x, this.center.z);
    this.placement.setTool({ mode: 'select' });
    this.placement.select({ kind: 'machine', id: machine.id });
  }

  /** Keeps the price tag beside the build ghost, red when the build is unaffordable. */
  private updateCostLabel(): void {
    const hover = this.placement.currentBuildHover;
    this.costLabel.classList.toggle('hidden', hover === null);
    if (!hover) return;
    const { renderer, camera } = this.ctx;
    this.center.set(hover.x, 0, hover.z).project(camera.camera);
    // Positions inside the UI layer are in its own pixels, which a scaled interface stretches.
    const x = ((this.center.x * 0.5 + 0.5) * renderer.width) / uiScale();
    const y = ((-this.center.y * 0.5 + 0.5) * renderer.height) / uiScale();
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
    // A sold factory must not overwrite the new one, e.g. from the page-unload handler.
    if (this.retired) return;
    this.ctx.saveManager.save(this.sim.state, this.ctx.settings);
    this.autosaveTimer = 0;
    this.saveCountdown = -1;
  }

  /**
   * Saves only if what would be written can be loaded again. Used after something has gone
   * wrong, when a damaged factory must not replace the last good save.
   */
  saveIfSound(): void {
    if (this.retired) return;
    try {
      restoreGame(JSON.parse(JSON.stringify(serializeGame(this.sim.state, this.ctx.settings))));
    } catch {
      return;
    }
    this.save();
  }

  /** Stops this session from saving or taking input, for good: another copy of the factory has taken over. */
  retire(): void {
    this.retired = true;
    this.input.setEnabled(false);
    this.setSpeed(0);
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
    if (this.pendingReport) {
      const report = this.pendingReport;
      this.pendingReport = null;
      if (report.awaySeconds >= REPORT_AFTER_SECONDS && !this.offlinePanel.isOpen) this.offlinePanel.show(report);
    }
    this.fps += (1 / Math.max(realDt, 0.001) - this.fps) * 0.05;

    this.input.update(realDt);

    this.ticks.advance(realDt, MAX_TICKS_PER_FRAME, () => {
      this.sim.tick();
      this.items.snapshot(factory);
    });

    const animDt = realDt * this.ticks.speed;
    this.animTime += animDt;
    this.conveyors.update(factory, animDt);
    this.machines.update(factory, animDt, realDt, this.animTime, this.sim.power.ratio);
    this.items.update(this.ticks.alpha, this.animTime, animDt);
    this.effects.update(realDt);
    this.selection.update(this.realTime);
    this.badges.update(factory, this.sim.metrics, this.ctx.camera.camera, this.realTime);
    this.markers.update(factory, this.realTime);
    this.overlay.update(factory, this.sim.metrics, realDt);
    this.updateCostLabel();
    const { renderer, camera } = this.ctx;
    this.floatingText.update(realDt, camera.camera, renderer.width / uiScale(), renderer.height / uiScale());
    this.hoverCard.update(
      realDt,
      this.placement.currentHover,
      this.placement.currentSelection,
      camera.camera,
      renderer.width,
      renderer.height,
    );
    this.efficiencyLabels.update(
      this.overlay.isEnabled,
      factory,
      this.sim.metrics,
      camera.camera,
      camera.zoomScale,
      renderer.width,
      renderer.height,
    );
    this.hud.animate(realDt);
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
    if (this.retired) return;
    const { factory } = this.sim.state;
    if (realDt >= OFFLINE.minSeconds) {
      // A long gap with the page still open (the computer slept, or the browser froze the
      // tab) is treated like time away. A paused game stays paused.
      if (this.ticks.speed === 0) return;
      const report = applyOfflineProgress(this.sim, realDt * this.ticks.speed);
      this.items.resetTracks(factory);
      // A throttled background tab catches up in many chunks; they are reported as one
      // when the player is looking again (see frame).
      if (report) this.pendingReport = mergeReports(this.pendingReport, report);
      this.save();
      return;
    }
    const ran = this.ticks.advance(realDt, Math.ceil(realDt * TICK_RATE * 2) + 1, () => this.sim.tick());
    if (ran > 0) this.items.resetTracks(factory);
    this.updateSaving(realDt);
  }

  /** The gauge around the selected machine reads the share of its time it has spent working. */
  private updateGauge(): void {
    const selection = this.placement.currentSelection;
    const machine = selection?.kind === 'machine' ? this.sim.state.factory.machines.get(selection.id) : undefined;
    if (!machine || getMachineDef(machine.type).behavior !== 'crafter') return this.selection.setEfficiency(null);
    const shares = this.sim.metrics.shares(machine.id);
    this.selection.setEfficiency(shares.observed >= 3 ? shares.working : null);
  }

  /** Lets the top bar bring in whatever the factory has grown into, and mark the open panel. */
  private updateHud(): void {
    const { state } = this.sim;
    let turbines = 0;
    for (const machine of state.factory.machines.values()) {
      if (getMachineDef(machine.type).behavior === 'generator') turbines++;
    }
    this.hud.setVisibility(
      hudVisibility({
        machines: state.factory.machines.size,
        totalEarned: state.economy.totalEarned,
        itemsSold: Object.values(state.stats.sold).reduce((sum, count) => sum + count, 0),
        contractsCompleted: state.contracts.completed,
        research: state.research,
        gridSize: state.factory.grid.width,
        startingGridSize: DEFAULT_GRID_SIZE,
        firstExpansionCost: EXPANSION_STEPS[0].cost,
        hasClipboard: this.placement.clipboard !== null,
        savedBlueprints: this.blueprints.all.length,
        achievements: state.achievements.length,
        powerDemand: this.sim.power.demand,
        powerSupply: this.sim.power.supply,
        turbines,
        stars: state.prestige.stars,
        timesSold: state.prestige.count,
      }),
    );
    this.hud.setOpenPanel(
      this.stats.visible
        ? 'production'
        : this.contractsPanel.visible
          ? 'contracts'
          : this.expansionPanel.visible
            ? 'floor'
            : this.blueprintsPanel.visible
              ? 'blueprints'
              : this.researchPanel.isOpen
                ? 'research'
                : this.achievementsPanel.isOpen
                  ? 'achievements'
                  : null,
    );
  }

  private updateUi(): void {
    const { state } = this.sim;
    this.updateHud();
    this.updateGauge();
    this.hud.update(state);
    this.hud.setPower(this.sim.power.demand, this.sim.power.supply);
    this.toolbar.update(state);
    this.machinePanel.update();
    this.stats.update(state, this.sim.metrics);
    this.researchPanel.update();
    this.contractsPanel.update(state, this.sim.metrics);
    this.achievementsPanel.update();
    this.blueprintsPanel.update(state);
    this.prestigePanel.update();
    this.hud.setStars(state.prestige.stars);
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
