# One More Machine

> Build it. Optimize it. Watch it work.

A browser-based 3D factory automation game. Place machines, join them with conveyors, watch
items move, find the bottleneck, and fix it — usually with one more machine.

Built with Vite, TypeScript and Three.js. There are no art or audio assets: every model is
assembled from primitives in code and every sound is synthesised with Web Audio.

## Running it

```bash
npm install
npm run dev
```

The dev server runs on port 5183.

| Script | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Typecheck, then build for production into `dist/` |
| `npm run preview` | Serve the production build |
| `npm test` | Run the unit tests (vitest) |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | ESLint |

Adding `?slot=name` to the URL uses a separate save, which is handy for trying things
without touching your real factory.

## Controls

| Input | Action |
|---|---|
| Left click | Place / select |
| Left drag | Lay belts; pan the view with the select tool |
| Right click | Cancel the current tool |
| Right or middle drag | Pan |
| Wheel | Zoom |
| `W` `A` `S` `D` | Pan |
| `Q` / `E` | Rotate the view |
| `R` | Rotate the piece being placed, or the selection |
| `1`–`9`, `0` | Build tools, in the order shown on the toolbar |
| `` ` `` | Next group of build tools |
| `F` | Pick the tool for whatever is under the cursor |
| `X` | Delete tool |
| `Ctrl+C` / `Ctrl+V` | Copy an area / paste it |
| `Del` | Remove the selection |
| `B` | Bottleneck view |
| `T` `C` `G` `P` | Research, Contracts, Achievements, Blueprints |
| `Space` | Pause |
| `Home` | Centre the view |

## What is in the game

- **Production**: ore → plates → gears, a copper line for wire, then motors, steel, circuits,
  computers and robots.
- **Logistics**: conveyors, splitters, mergers, bridges (so belts can cross) and storage.
- **Bottleneck tools**: per-machine efficiency, a bottleneck view, and plain-language advice
  on what to add.
- **Progression**: research, machine upgrades, power, factory expansion, contracts,
  achievements and prestige.
- **Interface**: a top bar that only shows what the factory has grown into, tooltips and
  key hints for whatever you are doing, a card on any machine you point at, and settings for
  interface size and reduced motion.
- **Quality of life**: copy-paste and saved blueprints, offline progress, three environments
  and unlockable floor, belt and lighting styles.

## How the code is organised

```
src/
  core/        The simulation. No rendering, no DOM; fully unit-tested.
    game/        Simulation, game state, fixed-timestep ticks, tutorial, offline progress, prestige
    factory/     Machines, conveyors, routers, items
    grid/        Grid, occupancy, placement validation
    economy/     Money and pricing
    stats/       Throughput metrics and bottleneck analysis
    save/        Serialisation, validation and version migrations
    research/ contracts/ achievements/ blueprints/ power/ recipes/
  data/        Balance and content: machines, recipes, research, environments, cosmetics…
  rendering/   Three.js scene. Reads simulation state; never changes it.
  machines/    One 3D model per machine type
  input/       Pointer, keyboard and placement logic
  ui/          HUD and panels in plain HTML/CSS
  audio/       Synthesised sound
  app/         Wiring: App, GameSession, GameLoop
tests/         Unit tests for the simulation
```

Two rules hold everything together:

1. **The simulation is the source of truth.** Rendering visualises it and input sends it
   commands. Nothing in `core/` imports Three.js.
2. **Content is data.** A new resource, recipe, machine, research node or achievement is an
   entry in `src/data/`, plus a model if it needs one.

## Saves

The game autosaves to IndexedDB with a mirror in localStorage. Saves carry a version number
and are upgraded step by step on load (`src/core/save/Migration.ts`); every loaded save is
validated, and one that cannot be restored is reported rather than crashing the game.
