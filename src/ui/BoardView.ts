import type { Gameboard } from "../core/Gameboard";
import { BOARD_SIZE, type Coord } from "../core/types";

const COLUMN_LETTERS = "ABCDEFGHIJ".split("");

export interface BoardViewOptions {
  /** Show this player's own ships (own board) vs. fog of war (enemy board). */
  revealShips: boolean;
  /** If provided, unshot cells are clickable and fire at this board. */
  onFire?: (coord: Coord) => void;
}

/**
 * Renders one Gameboard as a labelled 10x10 grid and keeps it in sync with the
 * board model. Cells are diffed on refresh so hit/miss animations only fire on
 * the cell that actually changed.
 */
export class BoardView {
  readonly el: HTMLElement;
  private readonly grid: HTMLElement;
  private readonly cells: HTMLElement[][] = [];
  private board: Gameboard;
  private readonly opts: BoardViewOptions;
  private locked = true;

  constructor(board: Gameboard, opts: BoardViewOptions) {
    this.board = board;
    this.opts = opts;

    this.el = document.createElement("div");
    this.el.className = "board" + (opts.onFire ? " board--enemy" : " board--own");

    this.grid = document.createElement("div");
    this.grid.className = "board-grid";
    this.el.appendChild(this.grid);

    this.buildGrid();

    if (opts.onFire) {
      this.grid.addEventListener("click", (e) => this.handleClick(e));
    }

    this.refresh();
  }

  /** Swap in a different board model (used when reusing a view across games). */
  setBoard(board: Gameboard): void {
    this.board = board;
    this.refresh();
  }

  /** Enable/disable firing (enemy board only). */
  setLocked(locked: boolean): void {
    this.locked = locked;
    this.el.classList.toggle("board--locked", locked);
  }

  getCell(row: number, col: number): HTMLElement | undefined {
    return this.cells[row]?.[col];
  }

  /** Pixel size of a single playable cell — used to size the drag ghost. */
  cellSize(): number {
    return this.cells[0]?.[0]?.getBoundingClientRect().width ?? 34;
  }

  previewCells(coords: Coord[], valid: boolean): void {
    this.clearPreview();
    for (const { row, col } of coords) {
      const cell = this.getCell(row, col);
      if (cell) cell.classList.add(valid ? "preview-valid" : "preview-invalid");
    }
  }

  clearPreview(): void {
    this.grid
      .querySelectorAll(".preview-valid, .preview-invalid")
      .forEach((c) => c.classList.remove("preview-valid", "preview-invalid"));
  }

  private buildGrid(): void {
    for (let r = -1; r < BOARD_SIZE; r++) {
      const rowCells: HTMLElement[] = [];
      for (let c = -1; c < BOARD_SIZE; c++) {
        const cell = document.createElement("div");
        if (r === -1 && c === -1) {
          cell.className = "cell label label--corner";
        } else if (r === -1) {
          cell.className = "cell label";
          cell.textContent = COLUMN_LETTERS[c];
        } else if (c === -1) {
          cell.className = "cell label";
          cell.textContent = String(r + 1);
        } else {
          cell.className = "cell";
          cell.dataset.row = String(r);
          cell.dataset.col = String(c);
          rowCells[c] = cell;
        }
        this.grid.appendChild(cell);
      }
      if (r >= 0) this.cells[r] = rowCells;
    }
  }

  private handleClick(e: MouseEvent): void {
    if (this.locked || !this.opts.onFire) return;
    const target = e.target as HTMLElement;
    const { row, col } = target.dataset;
    if (row === undefined || col === undefined) return;
    const r = Number(row);
    const c = Number(col);
    if (this.board.isShot(r, c)) return;
    this.opts.onFire({ row: r, col: c });
  }

  /** Apply current board state to every cell, animating only what changed. */
  refresh(): void {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cell = this.cells[r][c];
        const state = this.stateFor(r, c);
        if (cell.dataset.state === state) continue;
        cell.dataset.state = state;
        cell.classList.remove(
          "is-ship",
          "is-hit",
          "is-miss",
          "is-sunk",
          "is-fireable"
        );
        if (state) cell.classList.add(`is-${state}`);
        if (this.opts.onFire && state === "water") {
          cell.classList.add("is-fireable");
        }
      }
    }
  }

  private stateFor(row: number, col: number): string {
    const shot = this.board.isShot(row, col);
    const ship = this.board.shipAt(row, col);
    if (shot) {
      if (ship) return ship.ship.isSunk() ? "sunk" : "hit";
      return "miss";
    }
    if (this.opts.revealShips && ship) return "ship";
    return "water";
  }
}
