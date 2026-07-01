import { Ship } from "./Ship";
import {
  BOARD_SIZE,
  FLEET,
  coordKey,
  inBounds,
  type AttackOutcome,
  type Coord,
  type Orientation,
  type ShipType,
} from "./types";

export interface PlacedShip {
  ship: Ship;
  type: ShipType;
  origin: Coord;
  orientation: Orientation;
  cells: Coord[];
}

interface Cell {
  placed: PlacedShip | null;
  attacked: boolean;
}

export interface AttackResult {
  outcome: AttackOutcome;
  ship?: PlacedShip;
}

/** Returns the list of cells a ship of `length` occupies from `origin`. */
export function shipCells(
  origin: Coord,
  orientation: Orientation,
  length: number
): Coord[] {
  const cells: Coord[] = [];
  for (let i = 0; i < length; i++) {
    cells.push(
      orientation === "horizontal"
        ? { row: origin.row, col: origin.col + i }
        : { row: origin.row + i, col: origin.col }
    );
  }
  return cells;
}

/**
 * One player's ocean grid. Owns ship placement and is the single source of
 * truth for attacks — nothing else calls Ship.hit().
 */
export class Gameboard {
  readonly size = BOARD_SIZE;
  private grid: Cell[][];
  private _ships: PlacedShip[] = [];

  constructor() {
    this.grid = Gameboard.emptyGrid();
  }

  private static emptyGrid(): Cell[][] {
    return Array.from({ length: BOARD_SIZE }, () =>
      Array.from({ length: BOARD_SIZE }, () => ({
        placed: null,
        attacked: false,
      }))
    );
  }

  get ships(): ReadonlyArray<PlacedShip> {
    return this._ships;
  }

  cellAt(row: number, col: number): Cell | null {
    return inBounds(row, col) ? this.grid[row][col] : null;
  }

  isShot(row: number, col: number): boolean {
    return this.cellAt(row, col)?.attacked ?? false;
  }

  shipAt(row: number, col: number): PlacedShip | null {
    return this.cellAt(row, col)?.placed ?? null;
  }

  /** True if a ship of `length` fits at `origin` without going out of bounds or overlapping. */
  canPlace(origin: Coord, orientation: Orientation, length: number): boolean {
    return shipCells(origin, orientation, length).every(
      ({ row, col }) => inBounds(row, col) && this.grid[row][col].placed === null
    );
  }

  placeShip(
    type: ShipType,
    length: number,
    origin: Coord,
    orientation: Orientation
  ): PlacedShip {
    if (!this.canPlace(origin, orientation, length)) {
      throw new Error(`Invalid placement for ${type} at ${origin.row},${origin.col}`);
    }
    const cells = shipCells(origin, orientation, length);
    const placed: PlacedShip = {
      ship: new Ship(type, length),
      type,
      origin,
      orientation,
      cells,
    };
    for (const { row, col } of cells) {
      this.grid[row][col].placed = placed;
    }
    this._ships.push(placed);
    return placed;
  }

  removeShip(placed: PlacedShip): void {
    for (const { row, col } of placed.cells) {
      this.grid[row][col].placed = null;
    }
    this._ships = this._ships.filter((s) => s !== placed);
  }

  reset(): void {
    this.grid = Gameboard.emptyGrid();
    this._ships = [];
  }

  /** Clears the board and drops the full standard fleet at random valid spots. */
  placeRandomly(rng: () => number = Math.random): void {
    this.reset();
    for (const { type, length } of FLEET) {
      let placed = false;
      while (!placed) {
        const orientation: Orientation =
          rng() < 0.5 ? "horizontal" : "vertical";
        const origin: Coord = {
          row: Math.floor(rng() * BOARD_SIZE),
          col: Math.floor(rng() * BOARD_SIZE),
        };
        if (this.canPlace(origin, orientation, length)) {
          this.placeShip(type, length, origin, orientation);
          placed = true;
        }
      }
    }
  }

  receiveAttack(row: number, col: number): AttackResult {
    const cell = this.cellAt(row, col);
    if (!cell) return { outcome: "already" };
    if (cell.attacked) return { outcome: "already" };

    cell.attacked = true;

    if (!cell.placed) {
      return { outcome: "miss" };
    }

    cell.placed.ship.hit();
    return {
      outcome: cell.placed.ship.isSunk() ? "sunk" : "hit",
      ship: cell.placed,
    };
  }

  /** All coordinates that were attacked and missed (for rendering / AI). */
  get missedAttacks(): Coord[] {
    return this.eachAttacked((cell) => cell.placed === null);
  }

  /** All coordinates that were attacked and hit a ship. */
  get hitAttacks(): Coord[] {
    return this.eachAttacked((cell) => cell.placed !== null);
  }

  private eachAttacked(predicate: (cell: Cell) => boolean): Coord[] {
    const out: Coord[] = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const cell = this.grid[row][col];
        if (cell.attacked && predicate(cell)) out.push({ row, col });
      }
    }
    return out;
  }

  /** True once a full fleet has been placed and every ship is sunk. */
  allSunk(): boolean {
    return this._ships.length > 0 && this._ships.every((p) => p.ship.isSunk());
  }

  allPlaced(): boolean {
    return this._ships.length === FLEET.length;
  }

  /** Snapshot of remaining (unsunk) ship types — handy for a status panel. */
  remainingShips(): ShipType[] {
    return this._ships.filter((p) => !p.ship.isSunk()).map((p) => p.type);
  }
}

export { coordKey };
