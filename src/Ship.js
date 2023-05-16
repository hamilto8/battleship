function Ship(length, type) {
  let numHits = 0;
  let shipIsSunk = false;
  let hitLocations = [];
  function hit() {
    numHits += 1;
  }
  function isSunk() {
    return length === numHits;
  }
  return { length, type, numHits, shipIsSunk, hitLocations, hit, isSunk };
}

export default Ship;
