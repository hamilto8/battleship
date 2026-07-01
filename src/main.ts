import "./styles/main.css";
import { GameController } from "./core/GameController";
import { Player } from "./core/Player";
import type { GameMode } from "./core/types";
import { createTopBar, initTheme } from "./ui/controls";
import { PlacementView } from "./ui/PlacementView";
import {
  BattleScreen,
  buildGameOver,
  buildMenu,
  buildPassDevice,
} from "./ui/screens";

const GAME_OVER_DELAY_MS = 1400;

interface Disposable {
  destroy(): void;
}

/** Top-level screen router that drives the menu → placement → battle → end flow. */
class App {
  private readonly content: HTMLElement;
  private controller: GameController | null = null;
  private transient: Disposable | null = null;

  constructor(root: HTMLElement) {
    initTheme();
    root.replaceChildren();
    root.appendChild(createTopBar());
    this.content = document.createElement("main");
    this.content.className = "content";
    root.appendChild(this.content);
  }

  start(): void {
    this.showMenu();
  }

  private navigate(view: HTMLElement, transient: Disposable | null = null): void {
    this.transient?.destroy();
    this.transient = transient;
    this.content.replaceChildren(view);
  }

  private showMenu(): void {
    this.controller = null;
    this.navigate(buildMenu((mode, n1, n2) => this.beginPlacement(mode, n1, n2)));
  }

  private beginPlacement(mode: GameMode, name1: string, name2: string): void {
    const p1 = new Player(name1, false);
    const p2 = new Player(name2, mode === "pvc");
    const controller = new GameController(mode, p1, p2);
    controller.setState("placement");
    this.controller = controller;

    if (mode === "pvc") {
      p2.gameboard.placeRandomly();
      this.placeFor(p1, () => this.startBattle());
    } else {
      this.placeFor(p1, () =>
        this.navigate(
          buildPassDevice(p2.name, () =>
            this.placeFor(p2, () =>
              this.navigate(
                buildPassDevice(p1.name, () => this.startBattle())
              )
            )
          )
        )
      );
    }
  }

  private placeFor(player: Player, onReady: () => void): void {
    const view = new PlacementView(player.gameboard, {
      playerName: player.name,
      onReady,
    });
    this.navigate(view.el, view);
  }

  private startBattle(): void {
    const controller = this.controller!;
    controller.startBattle();
    controller.on("gameOver", ({ winner }) => {
      window.setTimeout(() => {
        this.navigate(
          buildGameOver(winner, winner.isComputer, () => this.showMenu())
        );
      }, GAME_OVER_DELAY_MS);
    });
    const battle = new BattleScreen(controller);
    this.navigate(battle.el, battle);
    battle.start();
  }
}

const root = document.getElementById("app");
if (!root) throw new Error("#app root element not found");
new App(root).start();
