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

export default Ship;
