import Ship from "./Ship";
function Gameboard() {
  let missedAttacks = [];
  let ships = [];
  let board = [[], [], [], [], [], [], [], [], [], []];

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      board[i][j] = { isShip: false, isAttacked: false };
    }
  }

  const shipTypes = {
    carrier: 5,
    battleship: 4,
    cruiser: 3,
    submarine: 3,
    destroyer: 2,
  };

  function isValidPlacement(x, y, length, orientation) {
    if (orientation === "horizontal") {
      if (x + length > board.length) return false;
      for (let i = x; i < x + length; i++) {
        if (board[i][y].isShip) {
          return false;
        }
      }
    } else if (orientation === "vertical") {
      if (y + length > board.length) return false;
      for (let i = y; i < y + length; i++) {
        if (board[x][i].isShip) {
          return false;
        }
      }
    }
    return true;
  }

  function placeShips() {
    // create a ship object using createShip
    // add it to the ships array
    for (const [type, length] of Object.entries(shipTypes)) {
      // prompt player to place ship of given type
      // call placeShip function with given length, coordinates, and orientation
      const ship = Ship(length);
      ships.push(ship);
      let x = parseInt(prompt(`Enter x coordinate for ${type}`));
      let y = parseInt(prompt(`Enter y coordinate for ${type}`));
      let orientation = prompt(`Enter orientation for ${type}`);
      while (!isValidPlacement(x, y, length, orientation)) {
        alert("Invalid placement. Please enter new coordinates.");
        x = parseInt(prompt(`Enter x coordinate for ${type}`));
        y = parseInt(prompt(`Enter y coordinate for ${type}`));
        orientation = prompt(`Enter orientation for ${type}`);
      }
      if (orientation === "horizontal") {
        for (let i = x; i < x + length; i++) {
          board[i][y].isShip = true;
          board[i][y].ship = ship;
        }
      } else if (orientation === "vertical") {
        for (let i = y; i < y + length; i++) {
          board[x][i].isShip = true;
          board[x][i].ship = ship;
        }
      }
    }

    // check if the placement is valid within the board and not overlapping with another ship
  }

  function receiveAttack(x, y) {
    board[x][y].isAttacked = true;
    if (board[x][y].isShip) {
      board[x][y].ship.hit();
    } else {
      missedAttacks.push({ x, y });
    }
  }

  function allSunk() {
    // loop through the ships array
    // check if all ships are sunk
    // return true or false
    return ships.every((ship) => ship.isSunk());
  }
  return { missedAttacks, ships, placeShips, receiveAttack, allSunk };
}
export default Gameboard;
