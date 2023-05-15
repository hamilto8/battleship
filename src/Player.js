import Gameboard from "./Gameboard";

function createPlayer(name) {
  let gameboard = Gameboard();

  function attack(enemyGameboard, x, y) {
    enemyGameboard.receiveAttack(x, y);
  }
  return { name, gameboard, attack };
}

function createComputerPlayer() {
  let gameboard = Gameboard();
  function attack(enemyGameboard) {
    let x = Math.floor(Math.random() * 10);
    let y = Math.floor(Math.random() * 10);
    enemyGameboard.receiveAttack(x, y);
  }

  return { name: "Computer", gameboard, attack };
}

export { createPlayer, createComputerPlayer };
