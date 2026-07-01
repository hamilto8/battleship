import { describe, expect, it } from "vitest";
import { ComputerAI } from "../src/core/ComputerAI";
import { Gameboard } from "../src/core/Gameboard";
import type { Coord } from "../src/core/types";

const key = (c: Coord) => `${c.row},${c.col}`;

describe("ComputerAI", () => {
  it("hunts an unshot cell", () => {
    const ai = new ComputerAI(() => 0);
    const enemy = new Gameboard();
    const target = ai.nextTarget(enemy);
    expect(enemy.isShot(target.row, target.col)).toBe(false);
  });

  it("targets an orthogonal neighbour after a hit", () => {
    const ai = new ComputerAI(() => 0);
    const enemy = new Gameboard();
    enemy.placeShip("cruiser", 3, { row: 5, col: 5 }, "horizontal");

    const first = { row: 5, col: 5 };
    ai.registerResult(first, enemy.receiveAttack(first.row, first.col));

    const next = ai.nextTarget(enemy);
    const neighbours = ["4,5", "6,5", "5,4", "5,6"];
    expect(neighbours).toContain(key(next));
    expect(enemy.isShot(next.row, next.col)).toBe(false);
  });

  it("never fires on a cell that has already been shot", () => {
    const ai = new ComputerAI(Math.random);
    const enemy = new Gameboard();
    enemy.placeRandomly();

    const seen = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const t = ai.nextTarget(enemy);
      expect(seen.has(key(t))).toBe(false);
      seen.add(key(t));
      ai.registerResult(t, enemy.receiveAttack(t.row, t.col));
    }
  });

  it("abandons the hunt once a ship is sunk", () => {
    const ai = new ComputerAI(() => 0);
    const enemy = new Gameboard();
    enemy.placeShip("destroyer", 2, { row: 5, col: 5 }, "horizontal");

    ai.registerResult({ row: 5, col: 5 }, enemy.receiveAttack(5, 5)); // hit
    ai.registerResult({ row: 5, col: 6 }, enemy.receiveAttack(5, 6)); // sunk

    // Queue cleared -> falls back to the random hunt (first parity cell at 0,0).
    expect(key(ai.nextTarget(enemy))).toBe("0,0");
  });
});
