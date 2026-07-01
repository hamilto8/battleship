import { describe, expect, it } from "vitest";
import { Ship } from "../src/core/Ship";

describe("Ship", () => {
  it("starts undamaged and afloat", () => {
    const ship = new Ship("destroyer", 2);
    expect(ship.hits).toBe(0);
    expect(ship.isSunk()).toBe(false);
  });

  it("counts hits and sinks at full length", () => {
    const ship = new Ship("cruiser", 3);
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(false);
    ship.hit();
    expect(ship.hits).toBe(3);
    expect(ship.isSunk()).toBe(true);
  });

  it("never counts more hits than its length", () => {
    const ship = new Ship("destroyer", 2);
    ship.hit();
    ship.hit();
    ship.hit();
    expect(ship.hits).toBe(2);
    expect(ship.isSunk()).toBe(true);
  });
});
