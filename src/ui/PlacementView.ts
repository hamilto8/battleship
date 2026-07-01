import type { Gameboard } from "../core/Gameboard";
import { shipCells } from "../core/Gameboard";
import { sound } from "../audio/SoundManager";
import {
  FLEET,
  type Coord,
  type Orientation,
  type ShipType,
} from "../core/types";
import { BoardView } from "./BoardView";
import { button } from "./dom";

interface PlacementOptions {
  playerName: string;
  onReady: () => void;
}

interface DragSession {
  type: ShipType;
  length: number;
  ghost: HTMLElement;
  origin: Coord | null;
  valid: boolean;
}

/**
 * Drag-and-drop fleet placement. Uses Pointer Events (not native HTML5 DnD) so
 * we get a custom ghost, reliable cell hit-testing, and a live green/red
 * validity highlight. Rotate with the button or the "R" key.
 */
export class PlacementView {
  readonly el: HTMLElement;
  private readonly board: Gameboard;
  private readonly boardView: BoardView;
  private readonly tray: HTMLElement;
  private readonly readyBtn: HTMLButtonElement;
  private orientation: Orientation = "horizontal";
  private drag: DragSession | null = null;
  private readonly onReady: () => void;

  private readonly onMove = (e: PointerEvent) => this.handleMove(e);
  private readonly onUp = (e: PointerEvent) => this.handleUp(e);
  private readonly onKey = (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === "r") this.rotate();
  };

  constructor(board: Gameboard, opts: PlacementOptions) {
    this.board = board;
    this.onReady = opts.onReady;

    this.el = document.createElement("div");
    this.el.className = "placement screen";

    const header = document.createElement("div");
    header.className = "placement-header";
    header.innerHTML = `<h2>${opts.playerName}, deploy your fleet</h2>
      <p class="hint">Drag ships onto the grid. Press <kbd>R</kbd> or “Rotate” to turn them.</p>`;
    this.el.appendChild(header);

    const body = document.createElement("div");
    body.className = "placement-body";

    this.boardView = new BoardView(board, { revealShips: true });
    body.appendChild(this.boardView.el);

    const side = document.createElement("div");
    side.className = "placement-side";

    this.tray = document.createElement("div");
    this.tray.className = "ship-tray";
    side.appendChild(this.tray);

    const controls = document.createElement("div");
    controls.className = "placement-controls";
    controls.append(
      button("Rotate", () => this.rotate(), "btn"),
      button("Randomize", () => this.randomize(), "btn"),
      button("Reset", () => this.reset(), "btn btn--ghost")
    );
    side.appendChild(controls);

    body.appendChild(side);
    this.el.appendChild(body);

    const footer = document.createElement("div");
    footer.className = "placement-footer";
    this.readyBtn = button("Ready", () => this.onReady(), "btn btn--primary");
    footer.appendChild(this.readyBtn);
    this.el.appendChild(footer);

    window.addEventListener("keydown", this.onKey);

    this.rebuildTray();
    this.updateReady();
  }

  /** Remove global listeners; call when navigating away. */
  destroy(): void {
    window.removeEventListener("keydown", this.onKey);
    this.endDrag();
  }

  private rebuildTray(): void {
    this.tray.innerHTML = "";
    const placed = new Set(this.board.ships.map((s) => s.type));
    for (const { type, length } of FLEET) {
      if (placed.has(type)) continue;
      this.tray.appendChild(this.createTrayShip(type, length));
    }
    if (this.board.allPlaced()) {
      const done = document.createElement("p");
      done.className = "tray-done";
      done.textContent = "Fleet ready for battle.";
      this.tray.appendChild(done);
    }
  }

  private createTrayShip(type: ShipType, length: number): HTMLElement {
    const ship = document.createElement("div");
    ship.className = `tray-ship tray-ship--${this.orientation}`;
    ship.dataset.type = type;
    ship.title = `${type} (${length})`;
    for (let i = 0; i < length; i++) {
      const seg = document.createElement("span");
      seg.className = "seg";
      ship.appendChild(seg);
    }
    ship.addEventListener("pointerdown", (e) =>
      this.startDrag(e, type, length)
    );
    return ship;
  }

  private startDrag(e: PointerEvent, type: ShipType, length: number): void {
    e.preventDefault();
    sound.resume();
    this.endDrag();

    const ghost = document.createElement("div");
    ghost.className = `drag-ghost tray-ship--${this.orientation}`;
    const size = this.boardView.cellSize();
    ghost.style.setProperty("--cell", `${size}px`);
    for (let i = 0; i < length; i++) {
      const seg = document.createElement("span");
      seg.className = "seg";
      ghost.appendChild(seg);
    }
    document.body.appendChild(ghost);

    this.drag = { type, length, ghost, origin: null, valid: false };
    this.positionGhost(e.clientX, e.clientY);

    window.addEventListener("pointermove", this.onMove);
    window.addEventListener("pointerup", this.onUp);
  }

  private handleMove(e: PointerEvent): void {
    if (!this.drag) return;
    this.positionGhost(e.clientX, e.clientY);

    const origin = this.cellUnderPointer(e.clientX, e.clientY);
    this.drag.origin = origin;
    if (!origin) {
      this.drag.valid = false;
      this.boardView.clearPreview();
      return;
    }
    const cells = shipCells(origin, this.orientation, this.drag.length);
    const valid = this.board.canPlace(origin, this.orientation, this.drag.length);
    this.drag.valid = valid;
    this.boardView.previewCells(cells, valid);
  }

  private handleUp(_e: PointerEvent): void {
    if (!this.drag) return;
    const { origin, valid, type, length } = this.drag;
    if (origin && valid) {
      this.board.placeShip(type, length, origin, this.orientation);
      sound.play("place");
      this.boardView.refresh();
      this.rebuildTray();
      this.updateReady();
    } else if (origin) {
      sound.play("invalid");
    }
    this.endDrag();
  }

  private endDrag(): void {
    window.removeEventListener("pointermove", this.onMove);
    window.removeEventListener("pointerup", this.onUp);
    this.boardView.clearPreview();
    this.drag?.ghost.remove();
    this.drag = null;
  }

  private positionGhost(x: number, y: number): void {
    if (!this.drag) return;
    const half = this.boardView.cellSize() / 2;
    this.drag.ghost.style.left = `${x - half}px`;
    this.drag.ghost.style.top = `${y - half}px`;
  }

  private cellUnderPointer(x: number, y: number): Coord | null {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!el || el.dataset.row === undefined || el.dataset.col === undefined) {
      return null;
    }
    return { row: Number(el.dataset.row), col: Number(el.dataset.col) };
  }

  private rotate(): void {
    this.orientation =
      this.orientation === "horizontal" ? "vertical" : "horizontal";
    sound.play("uiClick");
    if (this.drag) {
      this.drag.ghost.classList.remove(
        "tray-ship--horizontal",
        "tray-ship--vertical"
      );
      this.drag.ghost.classList.add(`tray-ship--${this.orientation}`);
      if (this.drag.origin) {
        const cells = shipCells(this.drag.origin, this.orientation, this.drag.length);
        const valid = this.board.canPlace(
          this.drag.origin,
          this.orientation,
          this.drag.length
        );
        this.drag.valid = valid;
        this.boardView.previewCells(cells, valid);
      }
    }
    this.rebuildTray();
  }

  private randomize(): void {
    this.board.placeRandomly();
    sound.play("place");
    this.boardView.refresh();
    this.rebuildTray();
    this.updateReady();
  }

  private reset(): void {
    this.board.reset();
    sound.play("uiClick");
    this.boardView.refresh();
    this.rebuildTray();
    this.updateReady();
  }

  private updateReady(): void {
    this.readyBtn.disabled = !this.board.allPlaced();
  }
}
