import Gameboard from "./Gameboard";

function createPlayer(name) {
  let gameboard = Gameboard();

  function attack(enemyGameboard, x, y) {
    // call the receiveAttack method on the enemey Gameboard with the coordinates (x,y)
    // return the result
  }
  return { name, gameboard, attack };
}

function createComputerPlayer() {
  let gameboard = Gameboard();
  function attack(enemyGameboard) {
    // generate random coordinates (x,y) using Math.random()
    // call the receiveAttack method on the enemy gameboard with the random coordinates

    return { name: "Computer", gameboard, attack };
  }
}

export { createPlayer, createComputerPlayer };
