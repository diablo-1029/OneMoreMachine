import * as THREE from 'three';
import type { AudioManager } from '../audio/AudioManager';
import {
  blueprintCost,
  captureBlueprint,
  isBlueprintEmpty,
  rotateBlueprint,
  type Blueprint,
} from '../core/blueprints/Blueprint';
import { buildCost } from '../core/economy/Pricing';
import { isFedAt, resolveTarget } from '../core/factory/ConveyorSystem';
import { getMachineDef, rotatedSize, worldPorts } from '../core/factory/MachineRegistry';
import type { BuildableType } from '../core/factory/MachineTypes';
import { EventBus } from '../core/game/EventBus';
import type { CommandFailure, Simulation } from '../core/game/Simulation';
import { oppositeDir, rotateDir, type Direction } from '../core/grid/GridPosition';
import type { CameraController } from '../rendering/CameraController';
import type { Effects } from '../rendering/effects/Effects';
import type { SelectionEffect } from '../rendering/effects/SelectionEffect';
import type { MachineRenderer } from '../rendering/MachineRenderer';
import type { PlacementRenderer } from '../rendering/PlacementRenderer';
import { cellCenterX, cellCenterZ, worldToGridX, worldToGridY } from '../rendering/WorldMapping';

export type Tool =
  | { mode: 'select' }
  | { mode: 'build'; type: BuildableType; rotation: Direction; recipeId?: string }
  | { mode: 'delete' }
  /** Drag out a rectangle to copy what is inside it. */
  | { mode: 'copy' }
  /** Stamp down a copied or saved layout. */
  | { mode: 'paste'; blueprint: Blueprint };

export type Selection = { kind: 'machine' | 'conveyor'; id: string } | null;

export interface PlacementEvents {
  toolChanged: Tool;
  selectionChanged: Selection;
  message: string;
}

/** Where the build ghost is and what it would cost; drives the price tag next to the cursor. */
export interface BuildHover {
  x: number;
  z: number;
  cost: number;
  affordable: boolean;
}

/** An entity under the cursor together with the block of cells it covers. */
interface Target {
  kind: 'machine' | 'conveyor';
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const FAILURE_MESSAGES: Record<CommandFailure, string> = {
  cannot_afford: 'Not enough money',
  occupied: 'Something is in the way',
  out_of_bounds: 'Outside the factory floor',
  blocked: 'Can’t build there',
  not_found: 'Nothing there',
  invalid_recipe: 'That machine can’t make that',
  not_researched: 'Not researched yet',
  already_researched: 'Already researched',
  max_size: 'The factory is as large as it can get',
  max_level: 'Already fully upgraded',
  not_upgradable: 'That can’t be upgraded',
  empty: 'Nothing to place',
};

/**
 * Turns pointer positions and tool actions into simulation commands, and drives the
 * ghost preview and selection outline. Knows nothing about DOM events.
 */
export class PlacementController {
  readonly events = new EventBus<PlacementEvents>();
  private tool: Tool = { mode: 'select' };
  private selection: Selection = null;
  private readonly ground = new THREE.Vector3();
  private lastNdc: { x: number; y: number } | null = null;
  /** Last cell touched by the current conveyor or delete drag. */
  private dragCell: { x: number; y: number } | null = null;
  private buildHover: BuildHover | null = null;
  /** What the cursor is resting on while the select tool is active. */
  private hovered: Selection = null;
  /** The recipe last chosen for each machine type, so the next one built makes the same thing. */
  private readonly lastRecipe = new Map<string, string>();
  /** Where the current copy drag started. */
  private copyStart: { x: number; y: number } | null = null;
  /** The most recently copied layout, for Ctrl+V and for saving as a blueprint. */
  private clipboardBlueprint: Blueprint | null = null;

  constructor(
    private readonly sim: Simulation,
    private readonly camera: CameraController,
    private readonly machines: MachineRenderer,
    private readonly preview: PlacementRenderer,
    private readonly selectionEffect: SelectionEffect,
    private readonly effects: Effects,
    private readonly audio: AudioManager,
  ) {
    // Keep the outline honest when the selected thing changes or disappears.
    sim.events.on('machineRemoved', (m) => this.dropSelectionIf(m.id));
    sim.events.on('conveyorRemoved', (c) => this.dropSelectionIf(c.id));
    sim.events.on('topologyChanged', () => this.refreshSelectionOutline());
  }

  get currentTool(): Tool {
    return this.tool;
  }

  get currentSelection(): Selection {
    return this.selection;
  }

  /** The machine or belt under the cursor with the select tool; drives the hover card. */
  get currentHover(): Selection {
    return this.hovered;
  }

  /** Set while a build ghost is showing. */
  get currentBuildHover(): BuildHover | null {
    return this.buildHover;
  }

  // ------------------------------------------------------------- tools

  /** The layout last copied, if any. */
  get clipboard(): Blueprint | null {
    return this.clipboardBlueprint;
  }

  /** Starts (or leaves) the copy tool: drag a rectangle over what you want. */
  toggleCopy(): void {
    this.setTool(this.tool.mode === 'copy' ? { mode: 'select' } : { mode: 'copy' });
  }

  /** Picks up a layout to stamp down: the clipboard, or a saved blueprint. */
  startPaste(blueprint: Blueprint | null = this.clipboardBlueprint): void {
    if (!blueprint || isBlueprintEmpty(blueprint)) {
      this.events.emit('message', 'Nothing copied yet — use Copy and drag over part of the factory');
      return;
    }
    this.setTool({ mode: 'paste', blueprint });
  }

  setTool(tool: Tool): void {
    this.tool = tool;
    this.dragCell = null;
    this.copyStart = null;
    if (tool.mode !== 'select') this.select(null);
    this.events.emit('toolChanged', tool);
    this.refreshHover();
  }

  /** Picks a build tool, or drops back to select if it is already active. */
  toggleBuild(type: BuildableType): void {
    // Hotkeys can name a tool the toolbar is still hiding.
    if (!this.sim.isMachineUnlocked(type)) return this.fail('not_researched');
    if (this.tool.mode === 'build' && this.tool.type === type) {
      this.setTool({ mode: 'select' });
      return;
    }
    const rotation = this.tool.mode === 'build' ? this.tool.rotation : 0;
    this.setTool({ mode: 'build', type, rotation, recipeId: this.lastRecipe.get(type) });
  }

  toggleDelete(): void {
    this.setTool(this.tool.mode === 'delete' ? { mode: 'select' } : { mode: 'delete' });
  }

  /** Escape / right click: leave the current tool, or clear the selection if already selecting. */
  cancel(): void {
    if (this.tool.mode !== 'select') this.setTool({ mode: 'select' });
    else this.select(null);
  }

  /** Picks the build tool for whatever is under the cursor, keeping its orientation. */
  pipette(): void {
    if (!this.lastNdc) return;
    const target = this.targetAt(this.lastNdc.x, this.lastNdc.y);
    if (!target) return;
    const { factory } = this.sim.state;
    if (target.kind === 'machine') {
      const machine = factory.machines.get(target.id)!;
      if (machine.recipeId) this.lastRecipe.set(machine.type, machine.recipeId);
      this.setTool({
        mode: 'build',
        type: machine.type,
        rotation: machine.rotation,
        recipeId: machine.recipeId ?? undefined,
      });
    } else {
      this.setTool({ mode: 'build', type: 'conveyor', rotation: factory.conveyors.get(target.id)!.direction });
    }
    this.audio.play('click');
  }

  rotate(): void {
    if (this.tool.mode === 'paste') {
      this.tool = { mode: 'paste', blueprint: rotateBlueprint(this.tool.blueprint) };
      this.audio.play('rotate');
      this.refreshHover();
      return;
    }
    if (this.tool.mode === 'build') {
      this.tool = { ...this.tool, rotation: rotateDir(this.tool.rotation, 1) };
      this.audio.play('rotate');
      this.refreshHover();
      return;
    }
    if (!this.selection) return;
    if (this.selection.kind === 'machine') {
      const result = this.sim.rotateMachine(this.selection.id);
      this.audio.play(result.ok ? 'rotate' : 'error');
      if (!result.ok) this.events.emit('message', FAILURE_MESSAGES[result.reason]);
    } else {
      const conveyor = this.sim.state.factory.conveyors.get(this.selection.id);
      if (conveyor) {
        this.sim.setConveyorDirection(conveyor.id, rotateDir(conveyor.direction, 1));
        this.audio.play('rotate');
      }
    }
  }

  // ----------------------------------------------------------- pointer

  pointerMove(ndcX: number, ndcY: number): void {
    this.lastNdc = { x: ndcX, y: ndcY };
    this.refreshHover();
  }

  pointerLeave(): void {
    this.lastNdc = null;
    this.buildHover = null;
    this.hovered = null;
    this.preview.hide();
  }

  /** Left button pressed with a build or delete tool active. */
  primaryDown(ndcX: number, ndcY: number): void {
    this.lastNdc = { x: ndcX, y: ndcY };
    if (this.tool.mode === 'build') {
      if (this.tool.type === 'conveyor') {
        const cell = this.cellAt(ndcX, ndcY);
        if (!cell) return;
        this.dragCell = cell;
        this.layConveyor(cell.x, cell.y, this.tool.rotation, true);
      } else {
        this.placeMachine(ndcX, ndcY);
      }
    } else if (this.tool.mode === 'delete') {
      const target = this.targetAt(ndcX, ndcY);
      this.dragCell = this.cellAt(ndcX, ndcY);
      if (target) this.remove(target);
    } else if (this.tool.mode === 'copy') {
      this.copyStart = this.cellAt(ndcX, ndcY);
    } else if (this.tool.mode === 'paste') {
      this.pasteBlueprint(ndcX, ndcY);
    }
    this.refreshHover();
  }

  /** Pointer moved while the left button is held with a build or delete tool. */
  primaryDrag(ndcX: number, ndcY: number): void {
    this.lastNdc = { x: ndcX, y: ndcY };
    const cell = this.cellAt(ndcX, ndcY);
    if (!cell || !this.dragCell) return;

    if (this.tool.mode === 'build' && this.tool.type === 'conveyor') {
      // Walk cell by cell so a fast drag still lays an unbroken belt, pointing each
      // piece the way the stroke is heading.
      let guard = 0;
      while ((this.dragCell.x !== cell.x || this.dragCell.y !== cell.y) && guard++ < 64) {
        const dx: number = cell.x - this.dragCell.x;
        const dy: number = cell.y - this.dragCell.y;
        const stepX: number = Math.abs(dx) >= Math.abs(dy) ? Math.sign(dx) : 0;
        const stepY: number = stepX === 0 ? Math.sign(dy) : 0;
        const direction: Direction = stepX > 0 ? 0 : stepX < 0 ? 2 : stepY > 0 ? 1 : 3;
        this.tool = { ...this.tool, rotation: direction };
        const previous = this.sim.state.factory.conveyorAt(this.dragCell.x, this.dragCell.y);
        if (previous) this.sim.setConveyorDirection(previous.id, direction);
        this.dragCell = { x: this.dragCell.x + stepX, y: this.dragCell.y + stepY };
        this.layConveyor(this.dragCell.x, this.dragCell.y, direction, false);
      }
    } else if (this.tool.mode === 'delete') {
      if (cell.x !== this.dragCell.x || cell.y !== this.dragCell.y) {
        this.dragCell = cell;
        // Sweeping only clears belts; machines need a deliberate click.
        const conveyor = this.sim.state.factory.conveyorAt(cell.x, cell.y);
        if (conveyor) this.remove({ kind: 'conveyor', id: conveyor.id, x: cell.x, y: cell.y, w: 1, h: 1 });
      }
    }
    this.refreshHover();
  }

  primaryUp(): void {
    this.dragCell = null;
    if (this.tool.mode !== 'copy' || !this.copyStart || !this.lastNdc) return;
    const start = this.copyStart;
    const end = this.cellAt(this.lastNdc.x, this.lastNdc.y) ?? start;
    this.copyStart = null;
    const blueprint = captureBlueprint(this.sim.state.factory, start.x, start.y, end.x, end.y);
    if (isBlueprintEmpty(blueprint)) {
      this.events.emit('message', 'Nothing to copy there — drag right across the machines you want');
      this.refreshHover();
      return;
    }
    this.clipboardBlueprint = blueprint;
    this.audio.play('click');
    // Go straight to placing it; that is nearly always what comes next.
    this.setTool({ mode: 'paste', blueprint });
  }

  /** Top-left cell for a blueprint centred on the cursor. */
  private blueprintAnchor(ndcX: number, ndcY: number, blueprint: Blueprint): { x: number; y: number } | null {
    if (!this.camera.groundPoint(ndcX, ndcY, this.ground)) return null;
    return {
      x: Math.round(worldToGridX(this.ground.x) - blueprint.width / 2),
      y: Math.round(worldToGridY(this.ground.z) - blueprint.height / 2),
    };
  }

  private pasteBlueprint(ndcX: number, ndcY: number): void {
    if (this.tool.mode !== 'paste') return;
    const { blueprint } = this.tool;
    const anchor = this.blueprintAnchor(ndcX, ndcY, blueprint);
    if (!anchor) return;
    const result = this.sim.placeBlueprint(blueprint, anchor.x, anchor.y);
    if (!result.ok) return this.fail(result.reason);
    this.audio.play('place');
    this.effects.dust(
      cellCenterX(anchor.x) + (blueprint.width - 1) / 2,
      0,
      cellCenterZ(anchor.y) + (blueprint.height - 1) / 2,
      Math.max(blueprint.width, blueprint.height) / 2,
      18,
    );
  }

  /** A click (press and release without dragging) with the select tool. */
  click(ndcX: number, ndcY: number): void {
    const target = this.targetAt(ndcX, ndcY);
    this.select(target ? { kind: target.kind, id: target.id } : null);
    if (target) this.audio.play('click');
  }

  // ---------------------------------------------------------- selection

  select(selection: Selection): void {
    if (selection?.id === this.selection?.id) return;
    this.selection = selection;
    this.refreshSelectionOutline();
    this.events.emit('selectionChanged', selection);
  }

  /** Buys the next upgrade level for a machine, with a puff of sparks to mark it. */
  upgrade(machineId: string): void {
    const result = this.sim.upgradeMachine(machineId);
    if (!result.ok) return this.fail(result.reason);
    const machine = result.value;
    const { w, h } = rotatedSize(getMachineDef(machine.type), machine.rotation);
    const x = cellCenterX(machine.gridX) + (w - 1) / 2;
    const z = cellCenterZ(machine.gridY) + (h - 1) / 2;
    this.audio.play('upgrade');
    this.effects.sparks(x, 1.2, z, 16);
    this.effects.dust(x, 0, z, 0.95, 10);
  }

  /** Changes what a machine makes and remembers the choice for the next one of its type. */
  setRecipe(machineId: string, recipeId: string): void {
    const result = this.sim.setRecipe(machineId, recipeId);
    if (!result.ok) return this.fail(result.reason);
    this.lastRecipe.set(result.value.type, recipeId);
    this.audio.play('click');
  }

  deleteSelected(): void {
    const target = this.selectionTarget();
    if (target) this.remove(target);
  }

  private dropSelectionIf(id: string): void {
    if (this.selection?.id === id) this.select(null);
  }

  private selectionTarget(): Target | null {
    if (!this.selection) return null;
    const { factory } = this.sim.state;
    if (this.selection.kind === 'machine') {
      const machine = factory.machines.get(this.selection.id);
      if (!machine) return null;
      const { w, h } = rotatedSize(getMachineDef(machine.type), machine.rotation);
      return { kind: 'machine', id: machine.id, x: machine.gridX, y: machine.gridY, w, h };
    }
    const conveyor = factory.conveyors.get(this.selection.id);
    return conveyor ? { kind: 'conveyor', id: conveyor.id, x: conveyor.gridX, y: conveyor.gridY, w: 1, h: 1 } : null;
  }

  private refreshSelectionOutline(): void {
    const target = this.selectionTarget();
    if (target) this.selectionEffect.show(target.x, target.y, target.w, target.h);
    else this.selectionEffect.hide();
  }

  // ------------------------------------------------------------ actions

  private placeMachine(ndcX: number, ndcY: number): void {
    if (this.tool.mode !== 'build') return;
    const anchor = this.machineAnchor(ndcX, ndcY, this.tool.type, this.tool.rotation);
    if (!anchor) return;
    const result = this.sim.placeMachine(this.tool.type, anchor.x, anchor.y, this.tool.rotation, this.tool.recipeId);
    if (!result.ok) {
      this.fail(result.reason);
      return;
    }
    const { w, h } = rotatedSize(getMachineDef(this.tool.type), this.tool.rotation);
    this.audio.play('place');
    this.effects.dust(cellCenterX(anchor.x) + (w - 1) / 2, 0, cellCenterZ(anchor.y) + (h - 1) / 2, 0.95, 14);
  }

  /** Places a belt, or re-aims one that is already there. `announce` reports failures to the player. */
  private layConveyor(x: number, y: number, direction: Direction, announce: boolean): void {
    const existing = this.sim.state.factory.conveyorAt(x, y);
    if (existing) {
      if (this.sim.setConveyorDirection(existing.id, direction)) this.audio.play('rotate');
      return;
    }
    const result = this.sim.placeConveyor(x, y, direction);
    if (result.ok) {
      this.audio.play('place');
      this.effects.dust(cellCenterX(x), 0, cellCenterZ(y), 0.3, 5);
    } else if (announce || result.reason === 'cannot_afford') {
      this.fail(result.reason);
    }
  }

  private remove(target: Target): void {
    const result = this.sim.removeAt(target.x, target.y);
    if (!result.ok) return;
    this.audio.play('remove');
    this.effects.dust(
      cellCenterX(target.x) + (target.w - 1) / 2,
      0,
      cellCenterZ(target.y) + (target.h - 1) / 2,
      target.w * 0.4,
      target.kind === 'machine' ? 14 : 5,
    );
  }

  private fail(reason: CommandFailure): void {
    this.audio.play('error');
    this.events.emit('message', FAILURE_MESSAGES[reason]);
  }

  // ------------------------------------------------------------ picking

  /** The grid cell under the cursor, whether or not it is inside the factory. */
  private cellAt(ndcX: number, ndcY: number): { x: number; y: number } | null {
    if (!this.camera.groundPoint(ndcX, ndcY, this.ground)) return null;
    return { x: Math.floor(worldToGridX(this.ground.x)), y: Math.floor(worldToGridY(this.ground.z)) };
  }

  /** Top-left cell for a footprint centred as closely as possible on the cursor. */
  private machineAnchor(ndcX: number, ndcY: number, type: string, rotation: Direction): { x: number; y: number } | null {
    if (!this.camera.groundPoint(ndcX, ndcY, this.ground)) return null;
    const { w, h } = rotatedSize(getMachineDef(type), rotation);
    return {
      x: Math.round(worldToGridX(this.ground.x) - w / 2),
      y: Math.round(worldToGridY(this.ground.z) - h / 2),
    };
  }

  /** Machines are picked by their 3D body first, then anything by the ground cell. */
  private targetAt(ndcX: number, ndcY: number): Target | null {
    const { factory } = this.sim.state;
    const pickedId = this.machines.pick(this.camera.rayFrom(ndcX, ndcY));
    let machine = pickedId ? factory.machines.get(pickedId) : undefined;
    const cell = this.cellAt(ndcX, ndcY);
    if (!machine && cell) machine = factory.machineAt(cell.x, cell.y);
    if (machine) {
      const { w, h } = rotatedSize(getMachineDef(machine.type), machine.rotation);
      return { kind: 'machine', id: machine.id, x: machine.gridX, y: machine.gridY, w, h };
    }
    const conveyor = cell ? factory.conveyorAt(cell.x, cell.y) : undefined;
    return conveyor ? { kind: 'conveyor', id: conveyor.id, x: conveyor.gridX, y: conveyor.gridY, w: 1, h: 1 } : null;
  }

  /** Redraws whatever belongs under the cursor for the current tool. */
  refreshHover(): void {
    const ndc = this.lastNdc;
    this.buildHover = null;
    this.hovered = null;
    if (!ndc) {
      this.preview.hide();
      return;
    }
    const tool = this.tool;
    const { factory, economy } = this.sim.state;

    if (tool.mode === 'build' && tool.type === 'conveyor') {
      const cell = this.cellAt(ndc.x, ndc.y);
      if (!cell) return this.preview.hide();
      const existing = factory.conveyorAt(cell.x, cell.y) !== undefined;
      const valid = existing || this.sim.canPlaceConveyor(cell.x, cell.y).ok;
      this.preview.showConveyor(cell.x, cell.y, tool.rotation, valid);
      const cost = buildCost('conveyor');
      // Re-aiming an existing belt is free, so no price tag there.
      if (!existing) {
        this.buildHover = { x: cellCenterX(cell.x), z: cellCenterZ(cell.y), cost, affordable: economy.canAfford(cost) };
      }
      return;
    }

    if (tool.mode === 'build') {
      const anchor = this.machineAnchor(ndc.x, ndc.y, tool.type, tool.rotation);
      if (!anchor) return this.preview.hide();
      const def = getMachineDef(tool.type);
      const valid = this.sim.canPlaceMachine(tool.type, anchor.x, anchor.y, tool.rotation).ok;
      // Would each port meet a belt or machine here? Outputs need a taker, inputs a feeder.
      const connected = worldPorts(def, anchor.x, anchor.y, tool.rotation).map((port) =>
        port.type === 'output'
          ? resolveTarget(factory, port.x, port.y, port.side) !== null
          : isFedAt(factory, port.x, port.y, oppositeDir(port.side)),
      );
      this.preview.showMachine(tool.type, anchor.x, anchor.y, tool.rotation, valid, connected);
      const { w, h } = rotatedSize(def, tool.rotation);
      const cost = buildCost(tool.type);
      this.buildHover = {
        x: cellCenterX(anchor.x) + (w - 1) / 2,
        z: cellCenterZ(anchor.y) + (h - 1) / 2,
        cost,
        affordable: economy.canAfford(cost),
      };
      return;
    }

    if (tool.mode === 'paste') {
      const anchor = this.blueprintAnchor(ndc.x, ndc.y, tool.blueprint);
      if (!anchor) return this.preview.hide();
      const valid = this.sim.canPlaceBlueprint(tool.blueprint, anchor.x, anchor.y).ok;
      this.preview.showBlueprint(tool.blueprint, anchor.x, anchor.y, valid);
      const cost = blueprintCost(tool.blueprint);
      this.buildHover = {
        x: cellCenterX(anchor.x) + (tool.blueprint.width - 1) / 2,
        z: cellCenterZ(anchor.y) + (tool.blueprint.height - 1) / 2,
        cost,
        affordable: economy.canAfford(cost),
      };
      return;
    }

    if (tool.mode === 'copy') {
      const cell = this.cellAt(ndc.x, ndc.y);
      if (!cell) return this.preview.hide();
      // While dragging, show the rectangle so far; before that, just the cell under the cursor.
      const start = this.copyStart ?? cell;
      this.preview.showHighlight(
        Math.min(start.x, cell.x),
        Math.min(start.y, cell.y),
        Math.abs(cell.x - start.x) + 1,
        Math.abs(cell.y - start.y) + 1,
        'area',
      );
      return;
    }

    const target = this.targetAt(ndc.x, ndc.y);
    if (target && tool.mode === 'select') this.hovered = { kind: target.kind, id: target.id };
    if (!target || (tool.mode === 'select' && target.id === this.selection?.id)) return this.preview.hide();
    this.preview.showHighlight(target.x, target.y, target.w, target.h, tool.mode === 'delete' ? 'delete' : 'hover');
  }
}
