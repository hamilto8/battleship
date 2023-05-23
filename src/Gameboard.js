import Ship from "./Ship";

function Gameboard() {
  let missedAttacks = [];
  let ships = [];
  let board = new Array(10);

  for (let i = 0; i < board.length; i++) {
    board[i] = new Array(10);
  }

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
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

  function getOrientation() {
    const type = Object.keys(shipTypes)[ships.length];
    let direction = prompt(`Enter orientation for ${type}`);
    if (direction !== "horizontal" && direction !== "vertical") {
      alert("Invalid orientation. Please enter horizontal or vertical.");
      return getOrientation();
    } else {
      return direction;
    }
  }

  // let orientation = getOrientation();

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

  function placeShips(isComputerPlayer) {
    // const shipTypes = {
    //   carrier: 5,
    //   battleship: 4,
    //   cruiser: 3,
    //   submarine: 3,
    //   destroyer: 2,
    // };

    for (const [type, length] of Object.entries(shipTypes)) {
      let x, y, orientation;
      if (isComputerPlayer) {
        do {
          x = Math.floor(Math.random() * 10);
          y = Math.floor(Math.random() * 10);
          orientation = Math.random() < 0.5 ? "horizontal" : "vertical";
        } while (!isValidPlacement(x, y, length, orientation));
      } else {
        x = parseInt(prompt(`Enter x coordinate for ${type}`));
        y = parseInt(prompt(`Enter y coordinate for ${type}`));
        orientation = getOrientation();
        while (!isValidPlacement(x, y, length, orientation)) {
          alert("Invalid placement. Please enter new coordinates.");
          x = parseInt(prompt(`Enter x coordinate for ${type}`));
          y = parseInt(prompt(`Enter y coordinate for ${type}`));
          orientation = getOrientation();
        }
      }

      const ship = Ship(length, type);
      ships.push(ship);

      // ...

      if (orientation === "horizontal") {
        for (let i = x; i < x + length; i++) {
          ship.hitLocations[i - x] = { x: i, y, isHit: false };
          board[i][y].isShip = true;
          board[i][y].ship = ship;
        }
      } else if (orientation === "vertical") {
        for (let i = y; i < y + length; i++) {
          ship.hitLocations[i - y] = { x, y: i, isHit: false };
          board[x][i].isShip = true;
          board[x][i].ship = ship;
        }
      }

      // ...
    }
  }

  // ...

  function receiveAttack(x, y) {
    board[x][y].isAttacked = true;
    if (board[x][y].isShip) {
      // Get the location on the ship that was hit
      const hitLocation = board[x][y].ship.hitLocations.find(
        (location) => location.x === x && location.y === y
      );
      // Call hit() on the Ship object with the hit location
      board[x][y].ship.hit(hitLocation);

      // Check if the ship was sunk
      if (board[x][y].ship.isSunk()) {
        console.log(`A ${board[x][y].ship.type} was sunk!`);
      }
    } else {
      missedAttacks.push({ x, y });
    }
  }

  // ...

  function allSunk() {
    // loop through the ships array
    // check if all ships are sunk
    // return true or false
    return ships.every((ship) => ship.isSunk());
  }
  return { missedAttacks, ships, board, placeShips, receiveAttack, allSunk };
}
export default Gameboard;
