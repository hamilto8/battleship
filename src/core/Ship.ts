import type { ShipType } from "./types";

/**
 * A single ship. Damage is tracked purely as a hit count; the Gameboard owns
 * where the ship sits. `hit()` is idempotent-safe from the board's side because
 * the board never reports the same cell twice (see Gameboard.receiveAttack).
 */
export class Ship {
  readonly type: ShipType;
  readonly length: number;
  private _hits = 0;

  constructor(type: ShipType, length: number) {
    this.type = type;
    this.length = length;
  }

  get hits(): number {
    return this._hits;
  }

  hit(): void {
    if (this._hits < this.length) {
      this._hits += 1;
    }
  }

  isSunk(): boolean {
    return this._hits >= this.length;
  }
}
