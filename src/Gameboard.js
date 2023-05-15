import Ship from "./Ship";
function Gameboard() {
  let missedAttacks = [];
  let ships = [];
  const shipTypes = {
    carrier: 5,
    battleship: 4,
    cruiser: 3,
    submarine: 3,
    destroyer: 2,
  };

  function placeShip(length, x, y, orientation) {
    // create a ship object using createShip
    // add it to the ships array
    for (const [type, length] of Object.entries(shipTypes)) {
      // prompt player to place ship of given type
      // call placeShip function with given length, coordinates, and orientation
      console.log(`${type} has length ${length}`);
    }

    // check if the placement is valid within the board and not overlapping with another ship
  }

  function receiveAttack(x, y) {
    // loop through the ships array
    // check if any ship has the coordinates (x,y)
    // if yes, call the hit method on that ship
    // if no, push the coordinates to the missedAttacks array
  }
  function allSunk() {
    // loop through the ships array
    // check if all ships are sunk
    // return true or false
  }
  return { missedAttacks, ships, placeShip, receiveAttack, allSunk };
}
export default Gameboard;
