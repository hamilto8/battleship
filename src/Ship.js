function Ship(length) {
  let numHits = 0;
  let shipIsSunk = false;
  function hit() {
    numHits += 1;
  }
  function isSunk() {
    return length === numHits;
  }
  return { length, numHits, shipIsSunk, hit, isSunk };
}

export default Ship;
