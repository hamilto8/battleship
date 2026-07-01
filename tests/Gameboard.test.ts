import { describe, expect, it } from "vitest";
import { Gameboard } from "../src/core/Gameboard";
import { FLEET } from "../src/core/types";

describe("Gameboard placement", () => {
  it("accepts an in-bounds, non-overlapping placement", () => {
    const board = new Gameboard();
    expect(board.canPlace({ row: 0, col: 0 }, "horizontal", 4)).toBe(true);
    board.placeShip("battleship", 4, { row: 0, col: 0 }, "horizontal");
    expect(board.ships).toHaveLength(1);
    expect(board.shipAt(0, 3)).not.toBeNull();
    expect(board.shipAt(0, 4)).toBeNull();
  });

  it("rejects placements that run off the board", () => {
    const board = new Gameboard();
    expect(board.canPlace({ row: 0, col: 7 }, "horizontal", 5)).toBe(false);
    expect(board.canPlace({ row: 8, col: 0 }, "vertical", 5)).toBe(false);
  });

  it("rejects overlapping placements", () => {
    const board = new Gameboard();
    board.placeShip("cruiser", 3, { row: 2, col: 2 }, "horizontal");
    expect(board.canPlace({ row: 0, col: 3 }, "vertical", 4)).toBe(false);
    expect(() =>
      board.placeShip("submarine", 3, { row: 2, col: 2 }, "vertical")
    ).toThrow();
  });

  it("removes a ship and frees its cells", () => {
    const board = new Gameboard();
    const placed = board.placeShip("destroyer", 2, { row: 5, col: 5 }, "horizontal");
    board.removeShip(placed);
    expect(board.ships).toHaveLength(0);
    expect(board.shipAt(5, 5)).toBeNull();
    expect(board.canPlace({ row: 5, col: 5 }, "horizontal", 2)).toBe(true);
  });
});

describe("Gameboard.receiveAttack", () => {
  it("reports a miss on empty water", () => {
    const board = new Gameboard();
    expect(board.receiveAttack(0, 0).outcome).toBe("miss");
    expect(board.missedAttacks).toEqual([{ row: 0, col: 0 }]);
  });

  it("reports hit, then sunk, exactly once per ship (no double counting)", () => {
    const board = new Gameboard();
    board.placeShip("destroyer", 2, { row: 0, col: 0 }, "horizontal");
    expect(board.receiveAttack(0, 0).outcome).toBe("hit");
    const sunk = board.receiveAttack(0, 1);
    expect(sunk.outcome).toBe("sunk");
    expect(sunk.ship?.type).toBe("destroyer");
  });

  it("reports 'already' for a repeated shot and does not re-damage", () => {
    const board = new Gameboard();
    board.placeShip("destroyer", 2, { row: 0, col: 0 }, "horizontal");
    board.receiveAttack(0, 0);
    const repeat = board.receiveAttack(0, 0);
    expect(repeat.outcome).toBe("already");
    expect(board.shipAt(0, 0)?.ship.hits).toBe(1);
  });

  it("treats out-of-bounds shots as 'already' (no-op)", () => {
    const board = new Gameboard();
    expect(board.receiveAttack(-1, 0).outcome).toBe("already");
    expect(board.receiveAttack(10, 10).outcome).toBe("already");
  });
});

describe("Gameboard win detection", () => {
  it("allSunk is false until every placed ship is sunk", () => {
    const board = new Gameboard();
    board.placeShip("destroyer", 2, { row: 0, col: 0 }, "horizontal");
    board.placeShip("submarine", 3, { row: 2, col: 0 }, "horizontal");
    expect(board.allSunk()).toBe(false);
    board.receiveAttack(0, 0);
    board.receiveAttack(0, 1);
    expect(board.allSunk()).toBe(false);
    board.receiveAttack(2, 0);
    board.receiveAttack(2, 1);
    board.receiveAttack(2, 2);
    expect(board.allSunk()).toBe(true);
  });

  it("empty board is never 'allSunk'", () => {
    expect(new Gameboard().allSunk()).toBe(false);
  });
});

describe("Gameboard.placeRandomly", () => {
  it("places the full fleet without overlap", () => {
    const board = new Gameboard();
    board.placeRandomly();
    expect(board.ships).toHaveLength(FLEET.length);
    expect(board.allPlaced()).toBe(true);

    // No cell is occupied by more than one ship (ships tracked distinctly).
    const occupied = new Set<string>();
    for (const placed of board.ships) {
      for (const { row, col } of placed.cells) {
        const key = `${row},${col}`;
        expect(occupied.has(key)).toBe(false);
        occupied.add(key);
      }
    }
    const totalLength = FLEET.reduce((sum, s) => sum + s.length, 0);
    expect(occupied.size).toBe(totalLength);
  });
});
