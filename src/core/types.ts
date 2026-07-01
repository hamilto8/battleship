/** Core domain types shared across the game logic. */

export const BOARD_SIZE = 10;

export type Orientation = "horizontal" | "vertical";

export type ShipType =
  | "carrier"
  | "battleship"
  | "cruiser"
  | "submarine"
  | "destroyer";

/** A cell coordinate. `horizontal` ships span columns, `vertical` ships span rows. */
export interface Coord {
  row: number;
  col: number;
}

/** The canonical fleet: one of each classic ship, with its length. */
export const FLEET: ReadonlyArray<{ type: ShipType; length: number }> = [
  { type: "carrier", length: 5 },
  { type: "battleship", length: 4 },
  { type: "cruiser", length: 3 },
  { type: "submarine", length: 3 },
  { type: "destroyer", length: 2 },
];

export type AttackOutcome = "miss" | "hit" | "sunk" | "already";

export type GameMode = "pvc" | "pvp";

export function coordKey(row: number, col: number): string {
  return `${row},${col}`;
}

export function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}
