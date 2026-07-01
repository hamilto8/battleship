# Battleship

A modern, browser-based game of Battleship built with **Vite + TypeScript** (no
UI framework). Play against the computer or a friend on the same device.

## Features

- 🎯 **Two modes** — Player vs Computer, or local **pass-and-play** Player vs Player
  (with a "pass the device" screen so opponents can't see each other's boards).
- 🖱️ **Drag-and-drop fleet placement** — drag ships onto the grid with a live
  green/red validity highlight. Rotate with the **R** key or the Rotate button,
  or hit **Randomize** to auto-deploy.
- 🤖 **Smart computer opponent** — a hunt/target AI that chases a ship once it
  lands a hit and extends along the line until it sinks.
- 🔊 **Sound effects** — retro SFX synthesised at runtime with the Web Audio API
  (no audio files), with a global mute toggle.
- 🎨 **Light & dark naval themes** plus hit/miss/sink animations. Respects
  `prefers-reduced-motion` and `prefers-color-scheme`.
- ✅ **Unit-tested game core** — the game logic is fully separated from the DOM
  and covered by Vitest.

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the Vite dev server
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build
npm test         # run the Vitest unit tests
```

## Project structure

```
src/
├── core/     # DOM-free game logic (fully unit-tested)
│   ├── Ship.ts            # ship + damage tracking
│   ├── Gameboard.ts       # grid, placement, receiveAttack (single source of truth)
│   ├── ComputerAI.ts      # hunt/target opponent
│   ├── Player.ts          # player + optional AI
│   ├── GameController.ts   # turn order, win detection, event API
│   └── types.ts
├── ui/       # DOM layer, subscribes to controller events
│   ├── BoardView.ts        # renders/updates a board grid
│   ├── PlacementView.ts     # pointer-events drag-and-drop placement
│   ├── screens.ts          # menu / pass-device / battle / game-over
│   ├── controls.ts         # top bar: theme + mute toggles
│   └── dom.ts
├── audio/
│   └── SoundManager.ts     # Web Audio SFX
├── styles/main.css
└── main.ts    # screen router: menu → placement → battle → game over

tests/         # Vitest specs for Ship, Gameboard, ComputerAI
```

## How to play

1. Choose **vs Computer** or **vs Player** and enter name(s).
2. Deploy your fleet: drag each ship onto your grid (rotate with **R**), or
   click **Randomize**. Press **Ready** when all five ships are placed.
3. Click cells on the enemy's waters to fire. First to sink the opponent's
   entire fleet (carrier, battleship, cruiser, submarine, destroyer) wins.
