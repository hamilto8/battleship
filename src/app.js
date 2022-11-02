class Ship {
  constructor(length, numHits, shipIsSunk) {
    this.length = length;
    this.numHits = numHits;
    this.shipIsSunk = shipIsSunk;
  }
  hit() {
    this.numHits += 1;
  }
  isSunk() {
    if (this.length === this.numHits) {
      this.shipIsSunk = true;
    }
  }
}

class Gameboard {
  constructor(missedAttacks, ships) {
    this.missedAttacks = missedAttacks;
    this.ships = ships;
  }
  receiveAttack(X, Y) {
    // if x, y has a ship, ship.numHits++;
    // else this.missedAttacks += 1;
  }
}

class Player {}
