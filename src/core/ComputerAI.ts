import type { AttackResult, Gameboard } from "./Gameboard";
import { BOARD_SIZE, coordKey, inBounds, type Coord } from "./types";

/**
 * "Hunt / target" computer opponent.
 *
 *  - Hunt mode: fire at random unshot cells, restricted to a checkerboard
 *    parity (every ship covers at least one parity cell, so this halves the
 *    search space).
 *  - Target mode: after a hit, chase orthogonal neighbours; once two hits line
 *    up, extend along that line until the ship is sunk.
 */
export class ComputerAI {
  private targetQueue: Coord[] = [];
  private currentHits: Coord[] = [];
  private readonly rng: () => number;

  constructor(rng: () => number = Math.random) {
    this.rng = rng;
  }

  /** Choose the next cell to attack on the given enemy board. */
  nextTarget(enemy: Gameboard): Coord {
    while (this.targetQueue.length > 0) {
      const c = this.targetQueue.shift()!;
      if (inBounds(c.row, c.col) && !enemy.isShot(c.row, c.col)) return c;
    }
    return this.randomTarget(enemy);
  }

  /** Feed the outcome of our last shot back in so we can plan the next one. */
  registerResult(coord: Coord, result: AttackResult): void {
    switch (result.outcome) {
      case "sunk":
        // Ship destroyed — abandon this hunt entirely.
        this.currentHits = [];
        this.targetQueue = [];
        break;
      case "hit":
        this.currentHits.push(coord);
        this.planFromHits();
        break;
      default:
        break; // miss / already: keep chasing whatever is queued
    }
  }

  private planFromHits(): void {
    const hits = this.currentHits;
    const last = hits[hits.length - 1];

    if (hits.length >= 2) {
      const sameRow = hits.every((h) => h.row === hits[0].row);
      const sameCol = hits.every((h) => h.col === hits[0].col);
      if (sameRow) {
        const cols = hits.map((h) => h.col);
        const row = hits[0].row;
        this.pushFront({ row, col: Math.min(...cols) - 1 });
        this.pushFront({ row, col: Math.max(...cols) + 1 });
        return;
      }
      if (sameCol) {
        const rows = hits.map((h) => h.row);
        const col = hits[0].col;
        this.pushFront({ row: Math.min(...rows) - 1, col });
        this.pushFront({ row: Math.max(...rows) + 1, col });
        return;
      }
    }

    // Single hit (or a non-colinear cluster): probe the four neighbours.
    for (const n of ComputerAI.neighbours(last)) this.pushBack(n);
  }

  private pushFront(c: Coord): void {
    if (this.isFresh(c)) this.targetQueue.unshift(c);
  }

  private pushBack(c: Coord): void {
    if (this.isFresh(c)) this.targetQueue.push(c);
  }

  private isFresh(c: Coord): boolean {
    if (!inBounds(c.row, c.col)) return false;
    const key = coordKey(c.row, c.col);
    return !this.targetQueue.some((q) => coordKey(q.row, q.col) === key);
  }

  private randomTarget(enemy: Gameboard): Coord {
    const all: Coord[] = [];
    const parity: Coord[] = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (enemy.isShot(row, col)) continue;
        all.push({ row, col });
        if ((row + col) % 2 === 0) parity.push({ row, col });
      }
    }
    const pool = parity.length > 0 ? parity : all;
    if (pool.length === 0) {
      throw new Error("No available cells to attack");
    }
    return pool[Math.floor(this.rng() * pool.length)];
  }

  private static neighbours(c: Coord): Coord[] {
    return [
      { row: c.row - 1, col: c.col },
      { row: c.row + 1, col: c.col },
      { row: c.row, col: c.col - 1 },
      { row: c.row, col: c.col + 1 },
    ];
  }
}
