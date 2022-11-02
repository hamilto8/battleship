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

export default Gameboard;
